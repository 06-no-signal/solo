import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { $api } from "@/api-helpers/api-getters";
import { CgSpinner } from "react-icons/cg";
import { useTenant } from "./[tenantId]/tenant-provider";
import { useTenantQuery } from "@/api-helpers/tenant-hook";
import { LiaHatCowboySolid } from "react-icons/lia";
import { useAuth } from "react-oidc-context";

export function AppSidebar() {
  const { user } = useAuth();
  const tenant = useTenant();
  const tenantId = tenant?.id;
  const {
    data: users,
    isFetching,
    isFetched,
  } = useTenantQuery("get", "/users");
  // } = $api.useQuery("get", "/users", {
  //   headers: {
  //     "tenant-id": tenant?.id || "",
  //   },
  // });
  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <div className="flex flex-row items-center gap-2 justify-between">
          <div className="flex flex-row items-center">
            <Image src="/favicon.ico" alt="Logo" width={32} height={32} />
            <h1 className="text-xl font-bold">olo</h1>
          </div>
          <h1 className="text-lg font-bold">{tenant?.name}</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {isFetched && (
          <SidebarGroup>
            {users?.map((u) => (
              <SidebarMenuItem key={u.id}>
                <SidebarMenuButton asChild className="relative">
                  <div className="flex flex-row">
                    <a
                      href={`/${tenantId}/${u.id}/chat`}
                      className="grow shrink"
                    >
                      <span>{u.username}</span>
                    </a>
                    {user?.profile?.sub == u.keycloakId && (
                      <LiaHatCowboySolid className="grow-0 shrink-0" />
                    )}
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
        )}
        {isFetching && <CgSpinner className="animate-spin" />}
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
