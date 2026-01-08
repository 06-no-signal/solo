import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useTenant } from "./[tenantId]/layout";

export function AppSidebar() {
  const tenant = useTenant();
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex flex-row items-center gap-2">
          <div className="flex flex-row items-center">
            <Image src="/favicon.ico" alt="Logo" width={32} height={32} />
            <h1 className="text-xl font-bold">olo</h1>
          </div>
          <h1 className="text-lg font-bold">{tenant?.name}</h1>
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
