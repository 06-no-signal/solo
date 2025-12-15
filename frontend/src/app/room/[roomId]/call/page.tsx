"use client";

import {
  LocalStreamProvider,
  useLocalStream,
} from "@/components/domain/LocalStreamProvider";
import { useWS } from "@/components/domain/WebsocketProvider";
import { Button } from "@/components/ui/button";
import { useRTCCall } from "@/hooks/use-RTC-call";
import { useSearchParams } from "next/navigation";
import React, { FC, useEffect, useMemo, useRef, useState } from "react";

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

  const allVideoStreams = useMemo(
    () =>
      localStream
        ? [localStream, ...rtc.remoteVideoStreams]
        : rtc.remoteVideoStreams,
    [localStream, rtc.remoteVideoStreams]
  );

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

        isAwaitingAnswerRef.current = roomId;
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
    <div className="p-4 w-full h-full flex flex-col gap-4 bg-gray-800">
      <div className="p-4 flex flex-row gap-4 align-stretch">
        {allVideoStreams.map((stream, index) => (
          <div key={index} className="overflow-hidden rounded-md inline-block">
            <video
              autoPlay
              ref={(ref) => {
                if (ref) ref.srcObject = stream;
              }}
            ></video>
          </div>
        ))}
      </div>

      {isAwaitingAnswer && (
        <div>
          Ringing {isAwaitingAnswer}{" "}
          <div className="w-24 h-24 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      )}

      <div className="flex flex-row gap-4">
        <Button onClick={rtc.endCall}>End Call</Button>
      </div>
    </div>
  );
}
