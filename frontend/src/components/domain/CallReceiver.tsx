"use client";

import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { useWS } from "./WebsocketProvider";
import { redirect, RedirectType } from "next/navigation";
import { Button } from "./LoginButton";
import { Phone, PhoneOff } from "lucide-react";
import { useTenant } from "@/app/[tenantId]/tenant-provider";

export const CallReciever: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const ws = useWS();

  const [isBeingCalled, setIsBeingCalled] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    ws.on("start-call-req", (data: any) => {
      console.log(ws.id);
      console.debug("[CallReceiver] Incoming call from user:", data);
      setIsBeingCalled(data.from);
    });
    return () => {
      ws.off("start-call-req");
    };
  }, [ws]);

  const tenant = useTenant();
  const tenantId = tenant?.id;  

  const acceptCall = async () => {
    if (isBeingCalled) {
      console.debug("[CallReceiver] Accepting call from user:", isBeingCalled);
      setIsBeingCalled(undefined);
      redirect(
        `/${tenantId}/${isBeingCalled}/call?shouldAcceptCall=true`,
        RedirectType.push
      );
    }
  };

  const rejectCall = () => {
    setIsBeingCalled(undefined);
    ws.emit("start-call-rej", { targetUserId: isBeingCalled });
  };

  if (isBeingCalled) {
    return (
      <>
        <div className="fixed top-0 left-0 w-full h-full inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.25)] z-50">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Incoming Call</h2>
            <div className="flex flex-row gap-4 justify-between">
              <div className="flex flex-col gap-2 items-center">
                <Button
                  onClick={acceptCall}
                  className="bg-green-500 text-white hover:bg-green-600 rounded-full"
                >
                  <Phone />
                </Button>
              </div>
              <Button
                onClick={rejectCall}
                className="bg-red-500 text-white hover:bg-red-600 rounded-full"
              >
                <PhoneOff />
              </Button>
            </div>
          </div>
        </div>
        {children}
      </>
    );
  }

  return <>{children}</>;
};
