import { useTenant } from "@/app/[tenantId]/tenant-provider";
import { $api } from "./api-getters";

// Wrapper for use Query that appends tenant-id to the header
export const useTenantQuery: typeof $api.useQuery = ((...args: any[]) => {
  const tenant = useTenant();
  const [method, path, options] = args;
  const headers = {
    ...(options?.headers || {}),
    "tenant-id": tenant?.id || "",
  };
  return $api.useQuery(method, path, {
    ...options,
    headers,
  });
}) as any;
