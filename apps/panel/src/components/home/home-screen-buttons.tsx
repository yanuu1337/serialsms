import Link from "next/link";
import { Button } from "../ui/button";
import { auth } from "#/lib/auth/server";
import { headers } from "next/headers";
import { LogOutButton } from "./log-out-button";
import { LayoutDashboardIcon, LogInIcon } from "lucide-react";

export async function HomeScreenButtons() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user)
    return (
      <div className="flex flex-col gap-2">
        <p>You are not logged in.</p>
        <Button asChild>
          <Link href="/login">
            <LogInIcon className="h-4 w-4" />
            Log in
          </Link>
        </Button>
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      <Button asChild>
        <Link href="/dashboard">
          <LayoutDashboardIcon className="h-4 w-4" />
          Dashboard
        </Link>
      </Button>
      <LogOutButton />
    </div>
  );
}
