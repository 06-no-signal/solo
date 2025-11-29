"use client";
import { useEffect, useRef } from "react";

export default () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let ws: any;
    let username: any;
    let localStream: any;
    let peerConnection: any;
    const config = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };

    async function setup() {
      username = inputRef.current?.value;
      if (!username) {
        username = crypto.randomUUID();
      }

      ws = new WebSocket(process.env.SIGNALLING_SERVER_URL!);
      ws.onmessage = (message: any) => {
        console.log("WebSocket message received:", message);
        const signal = JSON.parse(message.data);
        if (signal.event === "offer") {
          handleOffer(signal.data, signal.source);
        } else if (signal.event === "answer") {
          handleAnswer(signal.data);
        } else if (signal.event === "ice") {
          handleIce(signal.data);
        }
      };
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
    }

    async function startCall() {
      const target = "TODO";
      if (!target) {
        alert("No target selected.");
        return;
      }

      peerConnection = new RTCPeerConnection(config);
      peerConnection.onicecandidate = (event: any) => {
        console.log("Offerrer ICE candidate");
        if (event.candidate) {
          ws.send(
            JSON.stringify({
              event: "ice",
              data: JSON.stringify(event.candidate),
              target: target,
            })
          );
        }
      };
      peerConnection.ontrack = (event: any) => {
        console.log("Track event:", event);
        if (document?.getElementById("remoteVideo")) {
          (
            document.getElementById("remoteVideo") as HTMLVideoElement
          ).srcObject = event.streams[0];
        }
      };

      localStream.getTracks().forEach((track: any) => {
        peerConnection.addTrack(track, localStream);
      });

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      ws.send(
        JSON.stringify({
          event: "offer",
          data: JSON.stringify(offer),
          target: target,
        })
      );
    }

    async function handleOffer(offer: any, target: any) {
      console.log("Handling offer:", offer);
      peerConnection = new RTCPeerConnection(config);
      peerConnection.onicecandidate = (event: any) => {
        console.log("Accepter ICE candidate");
        if (event.candidate) {
          ws.send(
            JSON.stringify({
              event: "ice",
              data: JSON.stringify(event.candidate),
              target: target,
            })
          );
        }
      };
      peerConnection.ontrack = (event: any) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      localStream.getTracks().forEach((track: any) => {
        peerConnection.addTrack(track, localStream);
      });

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(JSON.parse(offer))
      );
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      console.log("Sending answer:", answer, target);
      ws.send(
        JSON.stringify({
          event: "answer",
          data: JSON.stringify(answer),
          target: target,
        })
      );
    }

    function handleAnswer(answer: any) {
      console.log("Handling answer");
      peerConnection.setRemoteDescription(
        new RTCSessionDescription(JSON.parse(answer))
      );
    }

    function handleIce(candidate: any) {
      console.log("Remote ICE candidate");
      peerConnection.addIceCandidate(
        new RTCIceCandidate(JSON.parse(candidate))
      );
    }
    function endCall() {
      if (localStream) {
        localStream.getTracks().forEach((track: any) => track.stop()); // Stop all tracks (audio & video)
      }

      if (peerConnection) {
        peerConnection.close(); // Close WebRTC connection
        peerConnection = null;
      }

      // document.getElementById("localVideo").srcObject = null; // Remove video feed
      // document.getElementById("remoteVideo").srcObject = null;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    }
    document.getElementById("setup")?.addEventListener("click", setup);
    document.getElementById("startCall")?.addEventListener("click", startCall);
    document.getElementById("endCall")?.addEventListener("click", endCall);
  }, []);
  return (
    <>
      <h1>Solo</h1>
      <div>
        <span>
          Username:{" "}
          <input
            type="text"
            name="username"
            placeholder="(leave blank to stay anonymous)"
          />
        </span>
        <button id="setup">Set up</button>
      </div>

      <div>
        <button id="startCall" disabled>
          Start Call
        </button>
        <button id="endCall" disabled>
          End Call
        </button>
      </div>

      <div className="video-grid">
        <div className="video-container">
          <video id="localVideo" autoPlay muted></video>
        </div>
        <div className="video-container">
          <video id="remoteVideo" autoPlay></video>
        </div>
      </div>
    </>
  );
};
