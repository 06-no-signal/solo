"use client";

import { LocalStreamProvider } from "@/components/domain/LocalStreamProvider";
import { WebsocketChat } from "@/components/domain/WebsocketChat";
import { useWS } from "@/components/domain/WebsocketProvider";
import { Phone, PhoneCallIcon } from "lucide-react";
import { redirect, RedirectType } from "next/navigation";
import React from "react";

export default function Page({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = React.use(params);
  const ws = useWS();

  return (
    <div className="p-4 w-full h-full flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-2xl font-bold">Room: {roomId}</h1>
        <Phone
          className="ml-2 cursor-pointer"
          onClick={() => {
            redirect(`${roomId}/call?shouldStartCall=true`, RedirectType.push);
          }}
        />
      </div>
      <div>Room chat</div>
      {ws && <WebsocketChat ws={ws} roomId={roomId} className="grow" />}
    </div>
  );
}
