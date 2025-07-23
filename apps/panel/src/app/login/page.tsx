import { getServerSideSession } from "#/lib/auth/server";
import { redirect } from "next/navigation";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const session = await getServerSideSession();
  if (session) {
    redirect("/");
  }
  return <LoginForm />;
}
