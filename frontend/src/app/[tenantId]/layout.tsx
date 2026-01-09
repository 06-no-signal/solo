"use client";

import { WSProvider } from "@/components/domain/WebsocketProvider";
import { ConfiguredAuthProvider, protectedRoute } from "../auth/authHandlers";
import { CallReciever } from "@/components/domain/CallReceiver";
import { env } from "next-runtime-env";
import { use } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../AppSidebar";
import { $api } from "@/api-helpers/api-getters";
import { TenantContext } from "./tenant-provider";

function RoomLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{
    tenantId: string;
  }>;
}>) {
  const { tenantId } = use(params);
  const {
    data: tenant,
    isFetching,
    error,
  } = $api.useQuery("get", "/tenant", {
    headers: {
      "tenant-id": tenantId,
    },
  });
  return (
    <TenantContext.Provider value={tenant || { id: tenantId }}>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full flex flex-col">
          {/* <SidebarTrigger /> */}
          <ConfiguredAuthProvider>
            <WSProvider
              url={env("NEXT_PUBLIC_SIGNALLING_SERVER_URL")}
              tenantId={tenantId}
            >
              <CallReciever>{children}</CallReciever>
            </WSProvider>
          </ConfiguredAuthProvider>
        </main>
      </SidebarProvider>
    </TenantContext.Provider>
  );
}

export default protectedRoute(RoomLayout);
