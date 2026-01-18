const sessions = new Map();

export function createSession(callId, context) {
  sessions.set(callId, {
    context,
    conversationState: "GREETING",
    messages: []
  });
}

export function getSession(callId) {
  return sessions.get(callId);
}

export function addMessage(callId, role, content) {
  sessions.get(callId).messages.push({ role, content });
}


export function deleteSession(callId) {
  sessions.delete(callId)
}