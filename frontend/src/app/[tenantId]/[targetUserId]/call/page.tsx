"use client";

import { useLocalStream } from "@/components/domain/LocalStreamProvider";
import { useWS } from "@/components/domain/WebsocketProvider";
import { Button } from "@/components/ui/button";
import { useRTCCall } from "@/hooks/use-RTC-call";
import { Mic, MicOff, Monitor } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ImPhoneHangUp } from "react-icons/im";
import { VideoGrid } from "./VideoGrid";
import { useAuth } from "react-oidc-context";

const removeQueryParam = (param: string) => {
  const url = new URL(window.location.href);
  url.searchParams.delete(param);
  window.history.replaceState({}, document.title, url.toString());
};

export default function Page({
  params,
}: {
  params: Promise<{
    targetUserId: string;
    shouldStartCall?: string;
    shouldAcceptCall?: string;
  }>;
}) {
  const { targetUserId } = React.use(params);
  const ws = useWS();
  const rtc = useRTCCall(targetUserId);
  const localStream = useLocalStream();
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [isAwaitingAnswer, setIsAwaitingAnswer_] = useState<string | undefined>(
    undefined
  );
  const isAwaitingAnswerRef = useRef<string | undefined>(undefined);
  const [isMuted, setIsMuted] = useState(false);

  const [screenshareStream, setScreenshareStream] =
    useState<MediaStream | null>(null);

  const localVideoStreams = useMemo<MediaStream[]>(() => {
    const s = [];
    if (localStream) {
      s.push(localStream);
    }
    if (screenshareStream) {
      s.push(screenshareStream);
    }
    return s;
  }, [localStream, screenshareStream]);

  const setIsAwaitingAnswer = (targetUserId: string | undefined) => {
    isAwaitingAnswerRef.current = targetUserId;
    setIsAwaitingAnswer_(targetUserId);
  };

  useEffect(() => {
    (async () => {
      ws.on("start-call-acc", (data: any) => {
        console.log("Call accepted from user:", data.from);
        if (data.from !== isAwaitingAnswerRef.current) {
          console.error(
            "User mismatch:",
            data.from,
            isAwaitingAnswerRef.current
          );
          return;
        }
        setIsAwaitingAnswer(undefined);
        rtc.startCall();
      });

      if (searchParams.get("shouldStartCall") === "true") {
        removeQueryParam("shouldStartCall");

        setIsAwaitingAnswer(targetUserId);
        ws.emit("start-call-req", { targetUserId });
      }
      if (searchParams.get("shouldAcceptCall") === "true") {
        removeQueryParam("shouldAcceptCall");
        ws.emit("start-call-acc", { targetUserId });
      }
    })();

    return () => {
      ws.off("start-call-acc");
    };
  }, [ws]);

  return (
    <div className="grow shrink flex flex-col gap-4 bg-gray-800 h-dvh overflow-hidden box-border">
      <VideoGrid streams={rtc.remoteVideoStreams} />

      {isAwaitingAnswer && (
        <div className="text-xl text-white">Ringing {isAwaitingAnswer} </div>
      )}

      <div className="gap-4 flex flex-row justify-center">
        <div className="rounded-md bg-gray-700 p-2 flex flex-row gap-4 z-20">
          {/* Media controls (Screenshare, mute, ...)*/}

          <Button
            variant={"ghost"}
            onClick={() => {
              // Start screenshare
              navigator.mediaDevices
                .getDisplayMedia({ video: true, audio: false })
                .then((screenStream) => {
                  setScreenshareStream(screenStream);
                  screenStream.getTracks().forEach((track) => {
                    if (rtc.peerConnection) {
                      rtc.peerConnection.addTrack(track, screenStream);
                    }
                  });

                  rtc.startCall();
                });
            }}
          >
            <Monitor />
          </Button>
          <Button
            variant={"ghost"}
            onClick={() => {
              rtc.peerConnection
                ?.getSenders()
                .filter((s) => s?.track?.kind === "audio")
                .forEach((sender) => {
                  if (sender?.track?.enabled) {
                    sender.track.enabled = !sender.track.enabled;
                    setIsMuted(!sender.track.enabled);
                  }
                });
            }}
          >
            {isMuted ? <Mic /> : <MicOff />}
          </Button>
          <Button variant={"destructive"} onClick={rtc.endCall}>
            <ImPhoneHangUp />
          </Button>
        </div>
      </div>

      <div className="p-4 flex flex-row-reverse gap-4 items-stretch absolute bottom-0 right-0 h-64">
        <VideoGrid streams={localVideoStreams} muted />
        {/* {localVideoStreams.map((stream, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-sm inline-block border-3 "
          >
            <video
              className="h-64"
              muted
              controls
              autoPlay
              ref={(ref) => {
                if (ref) ref.srcObject = stream;
              }}
            ></video>
          </div>
        ))} */}
      </div>
    </div>
  );
}
