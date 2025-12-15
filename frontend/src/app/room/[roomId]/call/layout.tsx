import { LocalStreamProvider } from "@/components/domain/LocalStreamProvider";

export default function CallLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LocalStreamProvider>{children}</LocalStreamProvider>;
}
