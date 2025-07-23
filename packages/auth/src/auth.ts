import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@serialsms/database";
import { username } from "better-auth/plugins";
import { admin } from "better-auth/plugins";
export function initAuth() {
  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      autoSignIn: true,
      minPasswordLength: 8,
      sendResetPassword: async ({ user, url, token }, req) => {
        console.log(user, url, token);
      },
    },
    plugins: [username(), admin()],
  });
}
export const auth = initAuth();
