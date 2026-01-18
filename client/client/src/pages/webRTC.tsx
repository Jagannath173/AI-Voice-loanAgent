import { useEffect, useRef } from "react";

export default function WebRTCTest() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pcRef.current = pc;

    const ws = new WebSocket("ws://localhost:4000/ws/webrtc");
    console.log("");
    
    wsRef.current = ws;

    // 🎤 MIC
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      if (!mountedRef.current || pc.signalingState === "closed") return;

      stream.getTracks().forEach((track) => {
        if (pc.signalingState !== "closed") {
          pc.addTrack(track, stream);
        }
      });

      console.log("🎤 Microphone connected");
    });

    // 🔊 Remote audio
    pc.ontrack = (event) => {
      if (audioRef.current) {
        audioRef.current.srcObject = event.streams[0];
      }
    };

    // ❄ ICE
    pc.onicecandidate = (event) => {
      if (event.candidate && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ candidate: event.candidate }));
      }
    };

    // 📡 Signaling
    ws.onmessage = async (event) => {
      if (pc.signalingState === "closed") return;

      const msg = JSON.parse(event.data);

      if (msg.sdp) {
        await pc.setRemoteDescription(msg.sdp);

        if (msg.sdp.type === "offer") {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ws.send(JSON.stringify({ sdp: pc.localDescription }));
        }
      }

      if (msg.candidate) {
        await pc.addIceCandidate(msg.candidate);
      }
    };

    ws.onopen = async () => {
      if (pc.signalingState === "closed") return;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      ws.send(JSON.stringify({ sdp: offer }));
    };

    ws.onerror = () => console.error("❌ WS error");
    ws.onclose = () => console.log("🔴 WS closed");

    return () => {
      mountedRef.current = false;

      pc.getSenders().forEach((s) => s.track?.stop());
      pc.close();
      ws.close();
    };
  }, []);

  return (
    <div>
      <h2>WebRTC Call Test</h2>
      <audio ref={audioRef} autoPlay />
    </div>
  );
}
