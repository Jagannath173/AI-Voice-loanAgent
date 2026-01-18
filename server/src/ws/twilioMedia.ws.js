import { WebSocketServer } from "ws";
import { getSession } from "../services/session.service.js";
import { startHumeSession } from "../services/hume.service.js";

export function startTwilioMediaServer(server) {
  const wss = new WebSocketServer({ noServer: true });

  // 🔁 Manual upgrade (REQUIRED for Twilio)
  server.on("upgrade", (req, socket, head) => {
    if (!req.url.startsWith("/ws/twilio-media")) {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (twilioWs, req) => {

    const callId = req.url.split("/").pop();
    console.log("📞 CallId from WS:", callId);

    let session = getSession(callId);

    if (!session) {
      console.warn("⚠️ No session found for callId:", callId);
      session = null; 
    }

    // Start Hume session (conversation brain)
    const humeWs = startHumeSession(callId, session);

    // 🔴 Buffer until Hume is OPEN
    const audioQueue = [];
    let humeReady = false;

    humeWs.on("open", () => {
      console.log("✅ Hume WS ready for call:", callId);
      humeReady = true;

      // Flush buffered audio
      while (audioQueue.length > 0) {
        humeWs.send(JSON.stringify(audioQueue.shift()));
      }
    });

    // 🎤 Twilio ➜ Hume
    twilioWs.on("message", (msg) => {
      const data = JSON.parse(msg.toString());

      if (data.event === "media") {
        const payload = {
          type: "audio_input",
          data: data.media.payload,
          encoding: "mulaw",
          sample_rate: 8000
        };

        if (!humeReady) {
          audioQueue.push(payload);
        } else {
          humeWs.send(JSON.stringify(payload));
        }
      }
    });

    //  Hume ➜ Twilio (AUDIO ONLY)
    humeWs.on("message", (msg) => {
      const data = JSON.parse(msg.toString());

      console.log(" Hume WS event:", data);
      console.log("The datatype is: ",data.type)

      if (data.type === "audio_output") {
        twilioWs.send(JSON.stringify({
          event: "media",
          media: { payload: data.audio }
        }));
      }
    });

    // 🔌 Cleanup
    twilioWs.on("close", () => {
      console.log("🔌 Twilio WS closed:", callId);
      humeWs.close();
    });

    humeWs.on("close", () => {
      console.log("🔌 Hume WS closed:", callId);
      twilioWs.close();
    });
  });

  console.log("✅ Twilio Media WebSocket server ready");
}
