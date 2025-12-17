"use client";

import { useWS } from "@/components/domain/WebsocketProvider";
import { use, useEffect } from "react";

export default function RoomLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{
    roomId: string;
  }>;
}>) {
  const { roomId } = use(params);
  const ws = useWS();
  useEffect(() => {
    ws.emit("join-room", { room: roomId });
  }, []);
  return children;
}
