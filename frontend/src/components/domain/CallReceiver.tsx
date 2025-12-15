"use client";

import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { useWS } from "./WebsocketProvider";
import { redirect } from "next/navigation";
import { Button } from "./LoginButton";

export const CallReciever: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const ws = useWS();

  const [isBeingCalled, setIsBeingCalled] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    ws.on("start-call-req", (data: any) => {
      console.log(ws.id);
      console.debug("[CallReceiver] Incoming call for room:", data);
      setIsBeingCalled(data.room);
    });
    return () => {
      ws.off("start-call-req");
    };
  }, [ws]);

  const acceptCall = async () => {
    if (isBeingCalled) {
      console.debug("[CallReceiver] Accepting call for room:", isBeingCalled);
      setIsBeingCalled(undefined);
      redirect(`/room/${isBeingCalled}/call?shouldAcceptCall=true`);
    }
  };

  const rejectCall = () => {
    setIsBeingCalled(undefined);
    ws.emit("start-call-rej", { room: isBeingCalled });
  };

  if (isBeingCalled) {
    return (
      <>
        <div className="fixed top-0 left-0 w-full h-full inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.25)] z-50">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Incoming Call</h2>
            <div className="flex flex-row gap-4">
              <Button
                onClick={acceptCall}
                className="bg-green-500 text-white hover:bg-green-600"
              >
                Accept Call
              </Button>
              <Button
                onClick={rejectCall}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                Reject Call
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
