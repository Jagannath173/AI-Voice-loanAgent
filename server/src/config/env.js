import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 4000,

  TWILIO_SID: process.env.TWILIO_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE: process.env.TWILIO_PHONE,

  HUME_API_KEY: process.env.HUME_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL,
};
