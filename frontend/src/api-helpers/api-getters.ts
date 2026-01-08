import type { paths } from "@/types/Api";
import { env } from "next-runtime-env";
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

const fetchClient = createFetchClient<paths>({
  baseUrl: env("NEXT_PUBLIC_SIGNALLING_SERVER_URL"),
});
export const $api = createClient(fetchClient);
