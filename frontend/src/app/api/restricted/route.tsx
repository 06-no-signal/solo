import { FC } from "react";

export const GET = async (request: Request) => {
  const session = null;
  if (!session) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        authorization: request.headers.get("authorization"),
      }),
      {
        status: 401,
      }
    );
  }

  return new Response(
    JSON.stringify({
      message: "This is restricted data",
      user: "no",
    })
  );
};
