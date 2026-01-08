import { useTenant } from "@/app/[tenantId]/layout";
import { $api } from "./api-getters";

// Wrapper for use Query that appends tenant-id to the header
// export const useTenantQuery = <T extends keyof typeof $api.queries>(
//   ...args: Parameters<typeof $api.useQuery<T>>
// ) => {
//   const [method, path, options] = args;
//   const tenantId = useTenant();

//   return $api.useQuery(method, path, {
//     ...options,
//     fetchOptions: {
//       ...options?.fetchOptions,
//       headers: {
//         ...options?.fetchOptions?.headers,
//         "tenant-id": tenantId || "",
//       },
//     },
//   });
// };
