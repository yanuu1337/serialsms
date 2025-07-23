import { auth } from "#/lib/auth/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const data = await auth.api.requestPasswordReset({
    body: {
      email: "admin@serialsms.com", // required
      redirectTo: "http://localhost:3001/reset-password",
    },
  });
  console.log(data);
  return NextResponse.json(data);
}
