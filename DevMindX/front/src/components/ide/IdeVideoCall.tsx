import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, X, Users as UsersIcon } from "lucide-react";
import { type Socket } from "socket.io-client";

export function IdeVideoCall({
  open,
  onClose,
  socket,
  sessionId,
  user,
  chrome,
}: {
  open: boolean;
  onClose: () => void;
  socket: Socket | null;
  sessionId: string;
  user: { id: string; username: string } | null;
  chrome: any;
}) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  
  // Track peers state
  const [peers, setPeers] = useState<Record<string, { username: string; stream: MediaStream | null }>>({});
  
  // Mutable references for WebRTC connections
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  const createPeerConnection = (targetId: string, isInitiator: boolean, stream: MediaStream, targetName: string) => {
    if (!socket || !user) return null;
    if (peerConnections.current.has(targetId)) return peerConnections.current.get(targetId);

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    peerConnections.current.set(targetId, pc);

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.onicecandidate = (event) => {
      if (event.candidate) {
         socket.emit("ice-candidate", { sessionId, targetId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setPeers(prev => ({
        ...prev,
        [targetId]: { ...prev[targetId], username: targetName, stream: event.streams[0] }
      }));
    };

    if (isInitiator) {
      pc.createOffer().then(offer => {
        return pc.setLocalDescription(offer);
      }).then(() => {
        socket.emit("video-offer", { sessionId, targetId, offer: pc.localDescription });
      }).catch(console.error);
    }

    return pc;
  };

  useEffect(() => {
    if (!open || !user || !socket) return;
    
    let activeStream: MediaStream | null = null;

    const initLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        activeStream = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        
        socket.emit("join-video-call", { sessionId, userId: user.id, username: user.username, color: "#fff" });
      } catch (err) {
        console.error("Failed to get local stream", err);
      }
    };
    void initLocalStream();

    const onParticipantJoined = (data: { userId: string; username: string }) => {
      if (data.userId === user.id || !activeStream) return;
      setPeers(prev => ({ ...prev, [data.userId]: { username: data.username, stream: null } }));
      createPeerConnection(data.userId, true, activeStream, data.username);
    };

    const onParticipantLeft = (data: { userId: string }) => {
      setPeers(prev => {
        const next = { ...prev };
        delete next[data.userId];
        return next;
      });
      const pc = peerConnections.current.get(data.userId);
      if (pc) {
        pc.close();
        peerConnections.current.delete(data.userId);
      }
    };

    const onVideoOffer = async (data: { senderId: string; senderName: string; offer: RTCSessionDescriptionInit }) => {
      if (!activeStream) return;
      setPeers(prev => ({ ...prev, [data.senderId]: { username: data.senderName, stream: null } }));
      
      const pc = createPeerConnection(data.senderId, false, activeStream, data.senderName);
      if (!pc) return;

      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("video-answer", { sessionId, targetId: data.senderId, answer: pc.localDescription });

      const cands = pendingCandidates.current.get(data.senderId) || [];
      for (const c of cands) {
         await pc.addIceCandidate(new RTCIceCandidate(c));
      }
      pendingCandidates.current.delete(data.senderId);
    };

    const onVideoAnswer = async (data: { senderId: string; answer: RTCSessionDescriptionInit }) => {
      const pc = peerConnections.current.get(data.senderId);
      if (pc) {
         await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    };

    const onIceCandidate = async (data: { senderId: string; candidate: RTCIceCandidateInit }) => {
      const pc = peerConnections.current.get(data.senderId);
      if (pc && pc.remoteDescription) {
         await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } else {
         const list = pendingCandidates.current.get(data.senderId) || [];
         list.push(data.candidate);
         pendingCandidates.current.set(data.senderId, list);
      }
    };

    socket.on("participant-joined-call", onParticipantJoined);
    socket.on("participant-left-call", onParticipantLeft);
    socket.on("video-offer", onVideoOffer);
    socket.on("video-answer", onVideoAnswer);
    socket.on("ice-candidate", onIceCandidate);

    return () => {
      socket.emit("leave-video-call", { sessionId, userId: user.id });
      socket.off("participant-joined-call", onParticipantJoined);
      socket.off("participant-left-call", onParticipantLeft);
      socket.off("video-offer", onVideoOffer);
      socket.off("video-answer", onVideoAnswer);
      socket.off("ice-candidate", onIceCandidate);
      
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      
      peerConnections.current.forEach(pc => pc.close());
      peerConnections.current.clear();
      setPeers({});
    };
  }, [open]);

  useEffect(() => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((t) => (t.enabled = audioEnabled));
    localStream.getVideoTracks().forEach((t) => (t.enabled = videoEnabled));
  }, [audioEnabled, videoEnabled, localStream]);

  if (!open) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[90] flex w-[320px] flex-col overflow-hidden rounded-xl border shadow-2xl"
      style={{ backgroundColor: chrome.sidebar, borderColor: chrome.border }}
    >
      <div className="flex items-center justify-between border-b px-3 py-2 bg-[#1e1e1e]" style={{ borderColor: chrome.border }}>
        <h3 className="flex items-center gap-1.5 text-[12px] font-semibold text-[#e0e0e0]">
          <Video className="h-3.5 w-3.5 text-rose-400" />
          Meet / Video Call
        </h3>
        <button type="button" onClick={onClose} className="rounded p-1 text-[#888] hover:bg-white/10 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-1 p-1 max-h-[300px] overflow-y-auto">
        <div className="relative aspect-video rounded overflow-hidden bg-black border" style={{ borderColor: chrome.border }}>
          <video ref={localVideoRef} autoPlay muted playsInline className={`h-full w-full object-cover ${!videoEnabled && "hidden"}`} />
          {!videoEnabled && <div className="flex h-full items-center justify-center"><VideoOff className="h-8 w-8 text-[#555]" /></div>}
          <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">You</div>
        </div>

        {Object.entries(peers).map(([pid, p]) => (
           <div key={pid} className="relative aspect-video rounded overflow-hidden bg-black border mt-1" style={{ borderColor: chrome.border }}>
             {p.stream ? (
                <video autoPlay playsInline className="h-full w-full object-cover" ref={el => { if(el) el.srcObject = p.stream; }} />
             ) : (
                <div className="flex h-full items-center justify-center animate-pulse"><UsersIcon className="h-8 w-8 text-[#555]" /></div>
             )}
             <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">{p.username}</div>
           </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 border-t p-2 bg-[#1e1e1e]" style={{ borderColor: chrome.border }}>
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={`flex h-8 w-8 items-center justify-center rounded-full ${audioEnabled ? 'bg-white/10' : 'bg-red-500/80 hover:bg-red-600'}`}
        >
          {audioEnabled ? <Mic className="h-4 w-4 text-white" /> : <MicOff className="h-4 w-4 text-white" />}
        </button>
        <button
          onClick={() => setVideoEnabled(!videoEnabled)}
          className={`flex h-8 w-8 items-center justify-center rounded-full ${videoEnabled ? 'bg-white/10' : 'bg-red-500/80 hover:bg-red-600'}`}
        >
          {videoEnabled ? <Video className="h-4 w-4 text-white" /> : <VideoOff className="h-4 w-4 text-white" />}
        </button>
      </div>
    </div>
  );
}
