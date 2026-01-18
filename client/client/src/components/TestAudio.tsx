import { useRef } from "react";

export default function TestAudio() {
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playTimeRef = useRef(0);

  async function start() {
    //  MUST be inside user click
    const ctx = new AudioContext(); 
    await ctx.resume();

    audioCtxRef.current = ctx;
    playTimeRef.current = ctx.currentTime;

    const ws = new WebSocket("ws://localhost:4000/ws/audio-call?callId=test");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "init",
        context: {
          user: { name: "Test User" },
          loan: { emiAmount: "15000" }
        }
      }));
    };

    ws.onmessage = (e) => {
      if (typeof e.data !== "string") return;
      playPCM16(e.data);
    };
  }

  function playPCM16(base64: string) {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // 🔹 base64 → PCM16
    const bin = atob(base64);
    const pcm16 = new Int16Array(bin.length / 2);
    for (let i = 0; i < pcm16.length; i++) {
      pcm16[i] =
        (bin.charCodeAt(i * 2 + 1) << 8) |
        bin.charCodeAt(i * 2);
    }

    if (pcm16.length < 200) return;

    // 🔹 PCM16 → FLOAT32
    const pcm48 = new Float32Array(pcm16.length * 3);
    for (let i = 0; i < pcm16.length; i++) {
      const v = pcm16[i] / 32768;
      pcm48[i * 3] = v;
      pcm48[i * 3 + 1] = v;
      pcm48[i * 3 + 2] = v;
    }

    // 🔹 PLAY WITH SCHEDULING
    const buffer = ctx.createBuffer(1, pcm48.length, ctx.sampleRate);
    buffer.getChannelData(0).set(pcm48);

    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = 2.5;

    src.buffer = buffer;
    src.connect(gain);
    gain.connect(ctx.destination);

    const startAt = Math.max(playTimeRef.current, ctx.currentTime);
    src.start(startAt);
    playTimeRef.current = startAt + buffer.duration;
  }

  return (
    <button
      onClick={start}
      style={{ padding: 20, fontSize: 20 }}
    >
      START AI AUDIO TEST
    </button>
  );
}
