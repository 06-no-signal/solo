use std::sync::{Arc, Mutex};
use warp::ws::{Message, WebSocket};
use warp::Filter;
use tokio::sync::mpsc;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio_stream::wrappers::UnboundedReceiverStream;
use futures_util::stream::StreamExt;

type Clients =  Arc<Mutex<HashMap<String, mpsc::UnboundedSender<Message>>>>;

#[derive(Serialize, Deserialize, Debug)]
struct Signal {
    event: String,
    data: String,
    target: Option<String>
}

#[tokio::main]
async fn main() {
    println!("Starting signalling server");
    let clients: Clients = Arc::new(Mutex::new(HashMap::new()));

    let ws_route = warp::path::end()
        .and(warp::ws())
        .and(with_clients(clients.clone()))
        .map(move |ws: warp::ws::Ws, clients| {
            ws.on_upgrade(move |socket| handle_connection(socket, clients))
        });
    // let index_route = warp::path("index.html")
    // .and(warp::fs::file("./static/index.html"));
    let routes = ws_route; //.or(index_route);
    warp::serve(routes).run(([0, 0, 0, 0], 3000)).await;
}

fn with_clients(clients: Clients) -> impl Filter<Extract = (Clients,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || clients.clone())
}

async fn handle_connection(ws: WebSocket, clients: Clients) {
    println!("New WebSocket connection");

    let (user_ws_tx, mut user_ws_rx) = ws.split();
    let (tx, rx) = mpsc::unbounded_channel();

    tokio::task::spawn(async move {
        let rx_stream = UnboundedReceiverStream::new(rx);
        println!("Spawned sender task");
        let result = rx_stream.map(Ok).forward(user_ws_tx).await;
        println!("Sender task completed: {:?}", result);
    });

    let user_id = uuid::Uuid::new_v4().to_string();
    println!("Generated user_id: {}", &user_id);
    clients.lock().unwrap().insert(user_id.clone(), tx);
    println!("Inserted user into clients map");

    while let Some(Ok(message)) = user_ws_rx.next().await {
        println!("Received message");

        if let Ok(msg_text) = message.to_str() {
            println!("Message text: {}", msg_text);

            if let Ok(signal) = serde_json::from_str::<Signal>(msg_text) {
                println!("Parsed signal");

                if let Some(target) = &signal.target {
                    println!("Signal has target: {}", target);

                    if let Some(target_tx) = clients.lock().unwrap().get(target) {
                        let forward = serde_json::json!({
                            "event": signal.event,
                            "data": signal.data,
                            "source": user_id,
                        });
                        let _ = target_tx.send(Message::text(forward.to_string())).unwrap();
                        println!("Sending message {} to target: {}", forward, target);
                    } else {
                        println!("Target not found: {}", target);
                        println!("Available targets: {:?}", clients.lock().unwrap().keys());
                    }
                } else {
                    println!("Signal {} has no target, broadcasting not implemented", signal.event);
                }
            } else {
                println!("Failed to parse signal from message");
            }
        } else {
            println!("Failed to convert message to text");
        }
    }

    clients.lock().unwrap().remove(&user_id);
    println!("Removed user {} from clients map", &user_id);
}
