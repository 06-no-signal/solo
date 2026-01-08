"use client";

import { beforeSignin } from "@/app/auth/authHandlers";
import classNames from "classnames";
import { FC } from "react";
import { useAuth } from "react-oidc-context";

export const Button = (
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) => {
  return (
    <button
      {...props}
      className={classNames(
        props.className,
        "px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
      )}
    />
  );
};

export const LoginButton = () => {
  const auth = useAuth();
  if (auth?.user) {
    return (
      <>
        Signed in as {auth.user?.profile?.email} {auth.user?.access_token}{" "}
        <br />
        <Button onClick={async () => void auth.signoutRedirect()}>
          Sign out
        </Button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <Button
        onClick={() => {
          beforeSignin();
          void auth.signinRedirect();
        }}
      >
        Sign in
      </Button>
    </>
  );
};
