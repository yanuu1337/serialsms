"use server";
import { auth } from "#/lib/auth/server";
import { prisma } from "@serialsms/database";
import { type SetupForm } from "./page";

export async function setup(formData: SetupForm) {
  const { email, username, password } = formData;

  const count = await prisma.user.count();
  if (count > 0) {
    return { error: "User already exists" };
  }
  const user = await auth.api.createUser({
    body: {
      email: email as string,
      password: password as string,
      name: "Administrator",
      data: {
        username: username as string,
      },
      role: "admin",
    },
  });
  console.log(user);
  return {};
}
