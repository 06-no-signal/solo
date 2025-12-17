"use client";
import { useLocalStream } from "@/components/domain/LocalStreamProvider";
import { useWS } from "@/components/domain/WebsocketProvider";
import { Button } from "@/components/ui/button";
import { useRTCCall } from "@/hooks/use-RTC-call";
import { useEffect, useMemo, useRef, useState } from "react";

export default () => {
  const room = "room1";

  const ws = useWS();
  const localStream = useLocalStream();
  const rtc = useRTCCall(room);

  const [isBeingCalled, setIsBeingCalled_] = useState<string | undefined>(
    undefined
  );
  const isBeingCalledRef = useRef<string | undefined>(undefined);
  const [isAwaitingAnswer, setIsAwaitingAnswer_] = useState<string | undefined>(
    undefined
  );
  const isAwaitingAnswerRef = useRef<string | undefined>(undefined);

  const allVideoStreams = useMemo(
    () =>
      localStream
        ? [
            { str: localStream, isLocal: true },
            ...rtc.remoteVideoStreams.map((x) => ({ str: x, isLocal: false })),
          ]
        : rtc.remoteVideoStreams.map((x) => ({ str: x, isLocal: false })),
    [localStream, rtc.remoteVideoStreams]
  );

  const setIsAwaitingAnswer = (room: string | undefined) => {
    console.log("Setting isAwaitingAnswer to:", room);
    isAwaitingAnswerRef.current = room;
    setIsAwaitingAnswer_(room);
  };

  const setIsBeingCalled = (room: string | undefined) => {
    isBeingCalledRef.current = room;
    setIsBeingCalled_(room);
  };

  useEffect(() => {
    ws.on("start-call-req", (data: any) => {
      setIsBeingCalled(data.room);
    });
    ws.on("start-call-acc", async (data: any) => {
      if (data.room !== isAwaitingAnswerRef.current) {
        console.error("Room mismatch:", data.room, isAwaitingAnswerRef.current);
        return;
      }
      setIsAwaitingAnswer(undefined);
      rtc.startCall();
    });

    return () => {
      ws.off("start-call-req");
      ws.off("start-call-acc");
    };
  }, [ws]);

  const acceptCall = async () => {
    if (isBeingCalled) {
      console.log("Accepting call from:", isBeingCalled);
      await ws.emit("join-room", isBeingCalled);
      ws.emit("start-call-acc", { room: isBeingCalled });
      setIsBeingCalled(undefined);
    }
  };

  async function startCall() {
    console.log(ws.id);
    await ws.emit("join-room", room);
    console.log("Joining room:", room);
    ws.emit("start-call-req", { room: room });
    setIsAwaitingAnswer(room);
  }

  return (
    <>
      <h1>Solo</h1>

      {isBeingCalled && (
        <div>
          Incoming call from {isBeingCalled}{" "}
          <Button onClick={acceptCall}>Accept Call</Button>
        </div>
      )}

      {isAwaitingAnswer && <div>Calling {isAwaitingAnswer}...</div>}

      <div className="flex flex-row gap-4">
        <Button onClick={startCall}>Start Call</Button>
        <Button onClick={rtc.endCall}>End Call</Button>
      </div>

      <div className="p-4 flex flex-row gap-4 align-stretch">
        {allVideoStreams.map((stream, index) => (
          <div key={index} className="overflow-hidden rounded-md inline-block">
            <video
              muted={stream.isLocal}
              autoPlay
              ref={(ref) => {
                if (ref) ref.srcObject = stream.str;
              }}
            ></video>
          </div>
        ))}
      </div>
    </>
  );
};
