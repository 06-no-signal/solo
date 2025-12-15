"use client";

import { LocalStreamProvider } from "@/components/domain/LocalStreamProvider";
import React from "react";

export default function VideoCallLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LocalStreamProvider>{children}</LocalStreamProvider>;
}
