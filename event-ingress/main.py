import json
import uuid
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
import logging

# TODO: move all this to etcd or something
KAFKA_BOOTSTRAP_SERVERS = "localhost:9092"

# Tuple format: (Kafka topic name, Is user message topic)
KAFKA_TOPICS = {
    "connect": ("CONNECT", False),  # disallow users to send connect/disconnect messages
    "disconnect": ("DISCONNECT", False),
    "list_clients": ("LIST_CLIENTS", True),
    "ice": ("ICE_CANDIDATE", True),
    "offer": ("SDP_OFFER", True),
    "answer": ("SDP_ANSWER", True),
}
CLIENT_TOPIC = "client_{user_id}"

app = FastAPI()
kafka_producer: AIOKafkaProducer = None
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)


@app.on_event("startup")
async def startup():
    global kafka_producer
    kafka_producer = AIOKafkaProducer(bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS)
    await kafka_producer.start()
    logger.info("Kafka producer started")


@app.on_event("shutdown")
async def shutdown():
    global kafka_producer
    await kafka_producer.stop()
    logger.info("Kafka producer stopped")


async def kafka_consumer_task(websocket: WebSocket, topic: str):
    logger.info(f"Starting Kafka consumer for topic: {topic}")
    consumer = AIOKafkaConsumer(
        topic,
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        group_id=f"group_{uuid.uuid4()}",
    )
    await consumer.start()
    try:
        async for msg in consumer:
            # Forward Kafka messages to the WebSocket client
            await websocket.send_text(msg.value.decode("utf-8"))
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected, stopping Kafka consumer")
    finally:
        logger.info(f"Stopping Kafka consumer for topic: {topic}")
        await consumer.stop()


@app.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    if kafka_producer is None:
        # Kafka producer not ready
        logger.error("Received connect request, but Kafka producer is not ready")
        await websocket.close(code=1011)
        return

    await websocket.accept()
    user_id = str(uuid.uuid4())
    logger.info(f"New connection: {user_id}")

    # Start Kafka consumer for this client
    client_topic = CLIENT_TOPIC.format(user_id=user_id)
    consumer_task = asyncio.create_task(kafka_consumer_task(websocket, client_topic))

    # Notify Kafka of new connection
    kafka_message = {"source": user_id, "payload": {}}
    await kafka_producer.send_and_wait(
        KAFKA_TOPICS["connect"][0], json.dumps(kafka_message).encode("utf-8")
    )

    try:
        while True:
            data = await websocket.receive_text()
            logger.debug(f"Received message from {user_id}: {data}")

            # Validate message
            try:
                data = json.loads(data)
                typ = data["type"]
                assert isinstance(typ, str), "Message type must be a string"
                topic = KAFKA_TOPICS[typ]
                assert topic[1], "Users cannot send this type of message"
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON from {user_id}: {data}. Error: {e!r}")
                websocket_text = json.dumps({"error": "Malformed message"})
                await websocket.send_text(websocket_text)
                continue

            # Wrap message with metadata and send to Kafka
            kafka_message = {"source": user_id, "payload": data}
            await kafka_producer.send_and_wait(
                topic[0], json.dumps(kafka_message).encode("utf-8")
            )
            logger.debug(f"Forwarded to Kafka: {kafka_message}")

    except WebSocketDisconnect:
        logger.info(f"Disconnected: {user_id}")
    except Exception as e:
        logger.exception(f"Error with connection {user_id}: {e!r}")
    finally:
        try:
            consumer_task.cancel()
        except Exception:
            logger.info("Kafka consumer task already stopped")

        try:
            await websocket.close()
        except Exception:
            logger.info("WebSocket already closed")

        kafka_message = {"source": user_id, "payload": {}}
        await kafka_producer.send_and_wait(
            KAFKA_TOPICS["disconnect"][0], json.dumps(kafka_message).encode("utf-8")
        )

        logger.info(f"WebSocket closed for {user_id}")
