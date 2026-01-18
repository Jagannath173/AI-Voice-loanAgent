import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ noServer: true });

export function handleWebRTCUpgrade(req, socket, head) {
  wss.handleUpgrade(req, socket, head, ws => {
    wss.emit("connection", ws);
  });
}

wss.on("connection", ws => {
  console.log(" WebRTC client connected");

  ws.on("message", msg => {
    // broadcast signaling messages
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === 1) {
        client.send(msg.toString());
      }
    });
  });

  ws.on("close", () => {
    console.log(" WebRTC client disconnected");
  });
});

console.log(" WebRTC signaling ready");
