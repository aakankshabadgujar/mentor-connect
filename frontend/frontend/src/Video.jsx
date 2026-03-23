import { useEffect, useRef, useState } from "react";

export default function Video({ sessionId }) {
  const localVideo = useRef();
  const remoteVideo = useRef();
  const [socket, setSocket] = useState(null);
  const peerRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;

    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/video/${sessionId}`);
    setSocket(ws);

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "offer") {
        await peerRef.current.setRemoteDescription(message.offer);
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);

        ws.send(JSON.stringify({ type: "answer", answer }));
      }

      if (message.type === "answer") {
        await peerRef.current.setRemoteDescription(message.answer);
      }

      if (message.type === "ice") {
        try {
          await peerRef.current.addIceCandidate(message.candidate);
        } catch {}
      }
    };

    return () => ws.close();
  }, [sessionId]);

  const startCall = async () => {
    if (!sessionId) {
      alert("Enter session ID first!");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    localVideo.current.srcObject = stream;

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    peerRef.current = peer;

    stream.getTracks().forEach(track => {
      peer.addTrack(track, stream);
    });

    peer.ontrack = (event) => {
      remoteVideo.current.srcObject = event.streams[0];
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(JSON.stringify({
          type: "ice",
          candidate: event.candidate
        }));
      }
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.send(JSON.stringify({
      type: "offer",
      offer
    }));
  };

  return (
    <div className="mt-10 text-center">
      <h2 className="text-3xl mb-6">Video Call</h2>

      <div className="grid grid-cols-2 gap-6 max-w-5xl mx-auto">
        <video ref={localVideo} autoPlay muted className="bg-black h-72 w-full rounded-xl"/>
        <video ref={remoteVideo} autoPlay className="bg-black h-72 w-full rounded-xl"/>
      </div>

      <button onClick={startCall} className="mt-6 bg-green-600 px-6 py-3 rounded-xl">
        Start Call
      </button>
    </div>
  );
}