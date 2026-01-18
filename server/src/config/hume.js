import WebSocket from "ws";
import { env } from "./env.js";

export function createHumeSocket() {
  return new WebSocket(
    "wss://api.hume.ai/v0/evi/chat",
    {
      headers: {
        "X-Hume-Api-Key": env.HUME_API_KEY
      }
    }
  );
}
