import crypto from "crypto";
import { makeOutboundCall } from "../services/twilio.service.js";
import { createSession } from "../services/session.service.js";

export async function manualCall(req, res) {
    const callId = crypto.randomUUID();

    createSession(callId, {
        user: req.body.user,
        loan: req.body.loan
    });

    await makeOutboundCall(req.body.user.phone, callId);

    res.json({ success: true, callId });
}

export async function connectCall(req, res) {
  const { callId } = req.params;
  const url = `wss://${req.headers.host}/ws/twilio-media.${callId}`
  console.log("Connecting callId:",callId,"URL: ",url)

  res.status(200);
  res.set("Content-Type", "text/xml");

  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Connecting you to EMI assistant.</Say>
  <Connect>
    <Stream
      url="wss://${req.headers.host}/ws/twilio-media/${callId}"
      track="inbound_track"
    />
  </Connect>
</Response>
`);
}

