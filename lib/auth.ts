import "server-only";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { anonymous } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import * as schema from "@/db/schema";
import { chat } from "@/db/schema";

export const auth = betterAuth({
  appName: "Zis Chat",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  plugins: [
    anonymous({
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        await db
          .update(chat)
          .set({ userId: newUser.user.id })
          .where(eq(chat.userId, anonymousUser.user.id));
      },
    }),
  ],
});
