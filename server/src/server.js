import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";

import { handleWebRTCUpgrade } from "./webrtc/signaling.ws.js";
import { initAudioCallWS } from "./ws/audioCall.ws.js";

const server = http.createServer(app);

initAudioCallWS(server);

server.on("upgrade", (req, socket, head) => {
  if (req.url.startsWith("/ws/webrtc")) {
    return handleWebRTCUpgrade(req, socket, head);
  }
});

server.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT}`);
});
