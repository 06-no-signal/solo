import { useLocalStream } from "@/components/domain/LocalStreamProvider";
import { useWS } from "@/components/domain/WebsocketProvider";
import { useEffect, useRef, useState } from "react";

export const useRTCCall = (room: string) => {
  // Make sure that the ws client is connected to the room before starting a call

  const ws = useWS();
  const localStream = useLocalStream();
  const peerConnection = useRef<RTCPeerConnection | undefined>(undefined);
  const [remoteVideoStreams, setRemoteVideoStreams] = useState<MediaStream[]>(
    []
  );

  const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    ws.on("RTC-offer", async ({ offer }) => {
      console.debug("[RTC] offer received", offer);
      const pc = getRCTPeer();
      console.log("Got offer");
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      ws.emit("RTC-answer", { answer, room });
    });
    ws.on("RTC-answer", ({ answer }) => {
      console.debug("[RTC] answer received", answer);
      peerConnection.current!.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });
    ws.on("RTC-ice", ({ candidate }) => {
      console.debug("[RTC] ICE candidate received", candidate);
      peerConnection.current!.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      ws.off("RTC-offer");
      ws.off("RTC-answer");
      ws.off("RTC-ice");
    };
  }, [ws]);

  const getRCTPeer = () => {
    if (peerConnection.current) {
      return peerConnection.current;
    }

    if (!localStream) {
      throw new Error("Local stream not available");
    }

    console.debug("[RTC] Creating new RTCPeerConnection");

    const pc = new RTCPeerConnection(config);
    pc.onicecandidate = (event) => {
      const { candidate } = event;
      if (candidate) {
        console.debug("[RTC] Sending ICE candidate", candidate);
        ws.emit("RTC-ice", { candidate, room });
      }
    };
    pc.ontrack = (event) => {
      console.debug("[RTC] Remote track received", event.streams[0]);
      setRemoteVideoStreams((prev) => {
        if (prev.some((s) => s.id === event.streams[0].id)) return prev;
        return [...prev, event.streams[0]];
      });
    };

    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    peerConnection.current = pc;
    return pc;
  };

  const startCall = async () => {
    const pc = getRCTPeer();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    console.debug("[RTC] Sending offer", offer);
    ws.emit("RTC-offer", { offer, room });
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track: any) => track.stop()); // Stop all tracks (audio & video)
    }

    if (peerConnection.current) {
      peerConnection.current.close(); // Close WebRTC connection
      peerConnection.current = undefined;
    }
  };

  return {
    peerConnection: peerConnection.current,
    startCall,
    endCall,
    remoteVideoStreams,
  };
};
