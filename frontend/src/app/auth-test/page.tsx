import { privateFetch } from "../auth/authHandlers";

export default async () => {
  const res = await privateFetch("https://solo.yon.si/api/restricted");
  const data = await res.json();

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
};
