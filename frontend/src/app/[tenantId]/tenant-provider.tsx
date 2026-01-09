import { Tenant } from "@/types/schemata";
import { createContext, useContext } from "react";

export const TenantContext = createContext<Partial<Tenant> | undefined>(
  undefined
);
export const useTenant = (): Partial<Tenant> | undefined => {
  const context = useContext(TenantContext);
  return context;
};
