import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Image from "next/image";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex flex-row items-center">
          <Image src="/favicon.ico" alt="Logo" width={32} height={32} />
          <h1 className="text-xl font-bold">olo</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
