import { WebSocketServer } from "ws";
import { createSession, getSession } from "../services/session.service.js";
import { getAIProvider } from "../services/index.js";
import { createHumeSocket } from "../config/hume.js";

export function initAudioCallWS(server) {
  const wss = new WebSocketServer({ noServer: true });

  console.log("✅ Audio Call WebSocket ready");

  server.on("upgrade", (req, socket, head) => {
    if (!req.url.startsWith("/ws/audio-call")) return;

    wss.handleUpgrade(req, socket, head, ws => {
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (clientWs, req) => {
    console.log("📞 Browser connected");

    const url = new URL(req.url, "http://localhost");
    const callId = url.searchParams.get("callId");

    const ai = getAIProvider();
    const AI_MODE = process.env.AI_PROVIDER || "gemini";

    let humeWs;
    let humeReady = false;

    clientWs.on("message", async raw => {
      const text = raw.toString();

      // ================= INIT =================
      if (text.startsWith("{")) {
        const data = JSON.parse(text);

        if (data.type === "init") {
          createSession(callId, data.context);
          const session = getSession(callId);

          // ===== GEMINI MODE =====
          if (AI_MODE === "gemini") {
            session.conversation = ai.createConversation(session.context);

            const greeting =
              session.conversation[1].parts[0].text;

            clientWs.send(JSON.stringify({
              type: "ai_message",
              text: greeting,
            }));
            return;
          }

          // ===== HUME MODE =====
          humeWs = createHumeSocket();

          humeWs.on("open", () => {
            humeWs.send(JSON.stringify({
              type: "session_settings",
              config: {
                model: "evi",
                language: "hi-IN",
                auto_response: false,
                audio: { encoding: "linear16", sample_rate: 16000 }
              },
              system_prompt: `
You are a polite EMI collection agent.
Speak Hindi/Hinglish.
Be calm and professional.
`,
              conversation_context: session.context
            }));

            humeWs.send(JSON.stringify({
              type: "assistant_input",
              text: `
Namaskar ${session.context.user.name} ji.
Main loan recovery team se bol rahi hoon.
Aapki EMI ₹${session.context.loan.emiAmount} pending hai.
`
            }));

            humeReady = true;
          });

          humeWs.on("message", msg => {
            const event = JSON.parse(msg.toString());

            if (event.type === "audio_output" && event.data?.audio?.base64) {
              clientWs.send(event.data.audio.base64);
            }
          });

          return;
        }
      }

      if (AI_MODE === "gemini") {

        console.log("***Google Gemini is Used");
        
        const data = JSON.parse(text);

        console.log("***The Google Gemini data is: ",data);
        

        if (data.type === "user_message") {
          const session = getSession(callId);

          const reply = await ai.reply(
            session.conversation,
            data.text
          );

          console.log("***The reply from Gemini is: ",reply);

          clientWs.send(JSON.stringify({
            type: "ai_message",
            text: reply,
          }));
          return;
        }
      }

      // ================= HUME AUDIO =================
      if (humeReady && humeWs) {
        humeWs.send(JSON.stringify({
          type: "audio_input",
          data: text,
          encoding: "linear16",
          sample_rate: 16000
        }));
      }
    });

    clientWs.on("close", () => {
      console.log("📴 Call ended");
      humeWs?.close();
    });
  });
}
