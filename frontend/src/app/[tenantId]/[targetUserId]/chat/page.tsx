"use client";

import { WebsocketChat } from "@/components/domain/WebsocketChat";
import { useWS } from "@/components/domain/WebsocketProvider";
import { Phone } from "lucide-react";
import { redirect, RedirectType } from "next/navigation";
import React from "react";
import { useTenant } from "../../tenant-provider";

const Page: React.FC<{ params: Promise<{ targetUserId: string }> }> = ({
  params,
}) => {
  const { targetUserId } = React.use(params);
  const ws = useWS();

  const tenant = useTenant();
  const tenantId = tenant?.id;
  return (
    <div className="p-4 w-full h-full flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-2xl font-bold">User: {targetUserId}</h1>
        <Phone
          className="ml-2 cursor-pointer"
          onClick={() => {
            redirect(`/${tenantId}/${targetUserId}/call?shouldStartCall=true`, RedirectType.push);
          }}
        />
      </div>
      <div>Room chat</div>
      {ws && <WebsocketChat ws={ws} targetUserId={targetUserId} className="grow" />}
    </div>
  );
};

export default Page;
