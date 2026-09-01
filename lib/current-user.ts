import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/auth";

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

export async function getCurrentUser() {
  return (await getSession())?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return user;
}
