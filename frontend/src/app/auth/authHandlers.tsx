"use client";

import React from "react";
import { withAuthenticationRequired } from "react-oidc-context";
import { AuthProvider, AuthProviderProps } from "react-oidc-context";
import {
  Log,
  UserManager,
  UserManagerSettings,
  WebStorageStateStore,
} from "oidc-client-ts";
import { FC, PropsWithChildren } from "react";

Log.setLogger(console);
Log.setLevel(Log.DEBUG);

// Prevent port numbers 80 and 443 from being added to redirect_uri if not needed
let redirect_uri = process.env.NEXT_PUBLIC_FRONTEND_BASE_URL;
if (
  !(
    (redirect_uri?.startsWith("http") &&
      process.env.NEXT_PUBLIC_FRONTEND_PORT == "80") ||
    (redirect_uri?.startsWith("https") &&
      process.env.NEXT_PUBLIC_FRONTEND_PORT == "443")
  )
) {
  redirect_uri = `${redirect_uri}:${process.env.NEXT_PUBLIC_FRONTEND_PORT}`;
}

const oidcConfig: AuthProviderProps = {
  authority: process.env.NEXT_PUBLIC_OIDC_AUTHORITY_URL!,
  client_id: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID!,
  redirect_uri: `${redirect_uri}/auth/callback`,
  extraQueryParams: {
    audience: process.env.NEXT_PUBLIC_JWT_AUDIENCE!,
  },
  userStore:
    typeof window !== "undefined"
      ? new WebStorageStateStore({ store: window.localStorage })
      : undefined,
  onSigninCallback: (user: any): void => {
    onSigninRedirectToPreviousLocation();
  },
};

console.log(oidcConfig);

export const ConfiguredAuthProvider: FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  "use client";
  return <AuthProvider {...oidcConfig}>{children}</AuthProvider>;
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

export const protectedRoute = (component: React.ComponentType<object>) => {
  const Component = withAuthenticationRequired(component, {
    onBeforeSignin: beforeSignin,
  });
  return <Component />;
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
