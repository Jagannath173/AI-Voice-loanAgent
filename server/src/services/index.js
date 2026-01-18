import { GeminiAI } from "./gemini.service.js";
import { startHumeSession } from "./hume.service.js";

const AI_MODE = process.env.AI_PROVIDER || "gemini";

export function getAIProvider() {
  if (AI_MODE === "hume") {
    const ws = startHumeSession();

    return {
      async handleMessage(request) {
        ws.send(request.message);
        return "Message sent to Hume.";
      },
    };
  }

  return new GeminiAI();
}
