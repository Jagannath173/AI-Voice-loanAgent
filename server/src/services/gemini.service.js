import { GoogleGenAI } from "@google/genai";
import { emiAgentPrompt } from "../prompts/emiAgent.prompt.js";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export class GeminiAI {

  createConversation(context) {
    return [
      {
        role: "user",
        parts: [{ text: emiAgentPrompt }],
      },
      {
        role: "model",
        parts: [
          {
            text: `Namaste ${context.user.name} ji, main Fibe se bol raha hoon. Aapke loan EMI ke baare mein baat karni hai.`,
          },
        ],
      },
    ];
  }

  async reply(conversation, userMessage) {
    conversation.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: conversation,
      });

      const replyText = response.text.trim();

      conversation.push({
        role: "model",
        parts: [{ text: replyText }],
      });

      return replyText;

    } catch (err) {
      console.error("Gemini error:", err?.status, err?.message);

      if (err?.status === 429) {
        return "Manoj ji, thoda system issue aa raha hai. Ek minute baad baat continue karte hain.";
      }

      return "Manoj ji, abhi technical issue hai. Thodi der baad call back karungi.";
    }
  }
}
