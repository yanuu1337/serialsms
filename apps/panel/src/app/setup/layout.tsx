import { getServerSideSession } from "#/lib/auth/server";
import { prisma } from "@serialsms/database";
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
  const count = await prisma.user.count();
  if (count > 0) {
    redirect("/");
  }
  return <div>{children}</div>;
}
