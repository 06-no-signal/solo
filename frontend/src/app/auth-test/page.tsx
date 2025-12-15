"use client";

import { useEffect, useState } from "react";
import { privateFetch } from "../auth/authHandlers";

export default () => {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    privateFetch("https://solo.yon.si/api/restricted").then((res) =>
      res.json().then((data) => setData(JSON.stringify(data, null, 2)))
    );
  }, []);

  return <pre>{data}</pre>;
};
