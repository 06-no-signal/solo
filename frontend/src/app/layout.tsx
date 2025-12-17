import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConfiguredAuthProvider } from "./auth/authHandlers";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { WSProvider } from "@/components/domain/WebsocketProvider";
import { CallReciever } from "@/components/domain/CallReceiver";
import { env, PublicEnvScript } from "next-runtime-env";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Solo",
  description: "Solo is a video calling app for one who hates video calls",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <PublicEnvScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider>
          <AppSidebar />
          <main className="w-full flex flex-col">
            {/* <SidebarTrigger /> */}
            <ConfiguredAuthProvider>
              <WSProvider url={env("NEXT_PUBLIC_SIGNALLING_SERVER_URL")}>
                <CallReciever>{children}</CallReciever>
              </WSProvider>
            </ConfiguredAuthProvider>
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
