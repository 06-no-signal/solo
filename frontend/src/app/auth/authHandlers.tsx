"use client";

import React from "react";
import { useAuth, withAuthenticationRequired } from "react-oidc-context";
import { AuthProvider } from "react-oidc-context";
import { Log, User, WebStorageStateStore } from "oidc-client-ts";
import { FC, PropsWithChildren } from "react";
import { env } from "next-runtime-env";
import { $api } from "@/api-helpers/api-getters";
import { useTenant } from "../[tenantId]/tenant-provider";

Log.setLogger(console);
Log.setLevel(Log.DEBUG);

const getOidcConfig = () => {
  // Prevent port numbers 80 and 443 from being added to redirect_uri if not needed
  let redirect_uri = env("NEXT_PUBLIC_FRONTEND_BASE_URL");
  if (
    !(
      (redirect_uri?.startsWith("http") &&
        env("NEXT_PUBLIC_FRONTEND_PORT") == "80") ||
      (redirect_uri?.startsWith("https") &&
        env("NEXT_PUBLIC_FRONTEND_PORT") == "443")
    )
  ) {
    redirect_uri = `${redirect_uri}:${env("NEXT_PUBLIC_FRONTEND_PORT")}`;
  }
  return {
    authority: env("NEXT_PUBLIC_OIDC_AUTHORITY_URL"),
    client_id: env("NEXT_PUBLIC_OIDC_CLIENT_ID"),
    redirect_uri: `${redirect_uri}/auth/callback`,
    extraQueryParams: {
      audience: env("NEXT_PUBLIC_JWT_AUDIENCE"),
    },
    userStore:
      typeof window !== "undefined"
        ? new WebStorageStateStore({ store: window.localStorage })
        : undefined,
    onSigninCallback: (user?: User): void => {
      onSigninRedirectToPreviousLocation();
    },
  };
};

const RegisterUser: FC<{}> = () => {
  const tenant = useTenant();
  const { user } = useAuth();

  React.useEffect(() => {
    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );
    if (
      tenant &&
      user &&
      !registeredUsers.includes(`${tenant.id}|${user.profile.sub}`)
    ) {
      fetch(env("NEXT_PUBLIC_SIGNALLING_SERVER_URL") + "/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "tenant-id": tenant.id,
        },
        body: JSON.stringify({
          keycloakId: user.profile.sub,
          username: user.profile.preferred_username,
        }),
      } as any)
        .then(() => {
          registeredUsers.push(`${tenant.id}|${user.profile.sub}`);
          localStorage.setItem(
            "registeredUsers",
            JSON.stringify(registeredUsers)
          );
        })
        .catch((err) => {
          console.error("Error registering user:", err);
        });
    }
  }, [tenant, user]);
  return null;
};

export const ConfiguredAuthProvider: FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  return (
    <AuthProvider {...getOidcConfig()}>
      <RegisterUser />
      {children}
    </AuthProvider>
  );
};

const getCurrentLocation = (): string => {
  return (
    window.location.pathname + window.location.search + window.location.hash
  );
};
export const privateFetch = async (
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> => {
  const oidcConfig = getOidcConfig();
  const oidcStorage = localStorage.getItem(
    `oidc.user:${oidcConfig.authority}:${oidcConfig.client_id}`
  );
  if (!oidcStorage) {
    sessionStorage.setItem("onSigninRedirectTo", getCurrentLocation());
    sessionStorage.setItem("preventOverrideonSigninRedirectTo", "true");

    window.location.replace("/login");
    return Promise.reject(new Error("User is not authenticated"));
  }

  const oidcUser = JSON.parse(oidcStorage);
  const accessToken = oidcUser.access_token;

  const modifiedInit: RequestInit = {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    },
  };

  return fetch(input, modifiedInit);
};

export const beforeSignin = (): void => {
  if (!sessionStorage.getItem("preventOverrideonSigninRedirectTo")) {
    sessionStorage.setItem("onSigninRedirectTo", getCurrentLocation());
  }
};

export const protectedRoute = <T extends object>(
  component: React.ComponentType<T>
): React.ComponentType<T> => {
  const Component = withAuthenticationRequired(component, {
    onBeforeSignin: beforeSignin,
  });
  return (props) => <Component {...props} />;
};

export const onSigninRedirectToPreviousLocation = (): void => {
  const prevLoc = sessionStorage.getItem("onSigninRedirectTo");
  if (prevLoc) {
    sessionStorage.removeItem("onSigninRedirectTo");
    sessionStorage.removeItem("preventOverrideonSigninRedirectTo");
    window.location.replace(prevLoc);
  } else {
    window.location.replace("/");
  }
};
