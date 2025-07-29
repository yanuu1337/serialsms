import { redirect, RedirectType } from "next/navigation";

export default function Page() {
  return redirect("/dashboard/home", RedirectType.replace);
}
