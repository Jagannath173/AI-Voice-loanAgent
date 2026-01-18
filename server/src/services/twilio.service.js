import { twilioClient } from "../config/twilio.js";
import { env } from "../config/env.js";

export async function makeOutboundCall(to, callId) {
  return twilioClient.calls.create({
    to,
    from: env.TWILIO_PHONE,
    url: `${env.PUBLIC_BASE_URL}/api/call/connect/${callId}`,
    method: "POST"
  });
}
