"use client";

import { useLocalStream } from "@/components/domain/LocalStreamProvider";
import { useWS } from "@/components/domain/WebsocketProvider";
import { Button } from "@/components/ui/button";
import { useRTCCall } from "@/hooks/use-RTC-call";
import { Mic, Monitor } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ImPhoneHangUp } from "react-icons/im";

const removeQueryParam = (param: string) => {
  const url = new URL(window.location.href);
  url.searchParams.delete(param);
  window.history.replaceState({}, document.title, url.toString());
};

export default function Page({
  params,
}: {
  params: Promise<{
    roomId: string;
    shouldStartCall?: string;
    shouldAcceptCall?: string;
  }>;
}) {
  const { roomId } = React.use(params);
  const ws = useWS();
  const localStream = useLocalStream();
  const rtc = useRTCCall(roomId);

  const searchParams = useSearchParams();

  const [isAwaitingAnswer, setIsAwaitingAnswer_] = useState<string | undefined>(
    undefined
  );
  const isAwaitingAnswerRef = useRef<string | undefined>(undefined);

  const localVideoStreams = useMemo(() => {
    return localStream ? [localStream] : [];
  }, [localStream]);

  const setIsAwaitingAnswer = (roomId: string | undefined) => {
    isAwaitingAnswerRef.current = roomId;
    setIsAwaitingAnswer_(roomId);
  };

  useEffect(() => {
    (async () => {
      await ws.emit("join-room", { room: roomId });
      console.log("Joined room:", roomId);
      ws.on("start-call-acc", (data: any) => {
        console.log("Call accepted for room:", data.room);
        if (data.room !== isAwaitingAnswerRef.current) {
          console.error(
            "Room mismatch:",
            data.room,
            isAwaitingAnswerRef.current
          );
          return;
        }
        setIsAwaitingAnswer(undefined);
        rtc.startCall();
      });

      if (searchParams.get("shouldStartCall") === "true") {
        removeQueryParam("shouldStartCall");

        setIsAwaitingAnswer(roomId);
        ws.emit("start-call-req", { room: roomId });
      }
      if (searchParams.get("shouldAcceptCall") === "true") {
        removeQueryParam("shouldAcceptCall");
        ws.emit("start-call-acc", { room: roomId });
      }
    })();

    return () => {
      ws.off("start-call-acc");
    };
  }, [ws]);

  return (
    <div className="p-4 grow shrink flex flex-col gap-4 bg-gray-800">
      <div className="p-4 flex flex-row gap-4 items-stretch grow justify-center">
        {rtc.remoteVideoStreams.map((stream, index) => (
          <video
            key={index}
            className="rounded-sm inline-block relative"
            controls
            autoPlay
            ref={(ref) => {
              if (ref) ref.srcObject = stream;
            }}
          ></video>
        ))}
      </div>

      {isAwaitingAnswer && (
        <div className="text-xl text-white">Ringing {isAwaitingAnswer} </div>
      )}

      <div className="gap-4 flex flex-row justify-center">
        <div className="rounded-md bg-gray-700 p-2 flex flex-row gap-4 z-20">
          {/* Media controls (Screenshare, mute, ...)*/}

          <Button variant={"ghost"}>
            <Monitor />
          </Button>
          <Button variant={"ghost"}>
            <Mic />
          </Button>
          <Button variant={"destructive"} onClick={rtc.endCall}>
            <ImPhoneHangUp />
          </Button>
        </div>
      </div>

      <div className="p-4 flex flex-row-reverse gap-4 items-stretch absolute bottom-0 right-0">
        {localVideoStreams.map((stream, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-sm inline-block border-3 "
          >
            <video
              className="h-32"
              muted
              controls
              autoPlay
              ref={(ref) => {
                if (ref) ref.srcObject = stream;
              }}
            ></video>
          </div>
        ))}
      </div>
    </div>
  );
}
