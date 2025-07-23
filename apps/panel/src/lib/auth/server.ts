import "server-only";

import { cache } from "react";
import { initAuth } from "@serialsms/auth";
import { headers } from "next/headers";

export const auth = initAuth();

export const getServerSideSession = cache(async () =>
  auth.api.getSession({
    headers: await headers(),
  }),
);
