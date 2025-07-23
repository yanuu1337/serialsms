"use client";
import { authClient } from "#/lib/auth/client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { LogOutIcon } from "lucide-react";

export function LogOutButton() {
  const router = useRouter();
  return (
    <Button
      onClick={() => {
        authClient.signOut();
        router.push("/");
      }}
      variant="outline"
    >
      <LogOutIcon className="h-4 w-4" />
      Log out
    </Button>
  );
}
