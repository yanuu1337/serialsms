import { getServerSideSession } from "#/lib/auth/server";
import { redirect } from "next/navigation";

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSideSession();
  if (session) {
    redirect("/");
  }
  return <div>{children}</div>;
}
