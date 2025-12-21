import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connect, Connection, Channel, ConsumeMessage } from 'amqplib';

@Injectable()
export class MessageBusService implements OnModuleInit, OnModuleDestroy {
  private connection: Connection;
  private channel: Channel;
  private readonly exchange = 'webrtc_exchange';

  async onModuleInit() {
    this.connection = await connect(process.env.RABBITMQ_URL);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(this.exchange, 'topic', { durable: false });
  }

  async publish(routingKey: string, message: any) {
    this.channel.publish(this.exchange, routingKey, Buffer.from(JSON.stringify(message)));
  }

  async subscribe(routingKey: string, callback: (msg: any) => void) {
    const q = await this.channel.assertQueue('', { exclusive: true });
    await this.channel.bindQueue(q.queue, this.exchange, routingKey);

    this.channel.consume(q.queue, (msg: ConsumeMessage | null) => {
      if (msg) {
        callback(JSON.parse(msg.content.toString()));
        this.channel.ack(msg);
      }
    });
  }

  async unsubscribe(routingKey: string) {
    // ...
  }

  async onModuleDestroy() {
    await this.channel.close();
    await this.connection.close();
  }
}
