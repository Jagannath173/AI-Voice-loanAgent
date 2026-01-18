import { createHumeSocket } from "../config/hume.js";
import { emiAgentPrompt } from "../prompts/emiAgent.prompt.js";

export function startHumeSession(callId, session) {
  if (!session || !session.context) {
    session = {
      context: {
        user: { name: "Customer" },
        loan: { bankName: "Our Bank" }
      }
    };
  }

  const ws = createHumeSocket();

  ws.on("open", () => {
    console.log(" Hume session opened:", callId);

    ws.send(JSON.stringify({
      type: "session_settings",
      config: {
        model: "evi",
        language: "en-US"
      },
      system_prompt: emiAgentPrompt,
      conversation_context: session.context
    }));
  });

  return ws;
}
