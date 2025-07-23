import { auth } from "#/lib/auth/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const token = request.nextUrl.pathname.split("/").pop();
  console.log(token);

  if (!token) {
    throw new Error("Token is required");
  }

  const data = await auth.api.resetPassword({
    body: {
      newPassword: "123456789", // required
      token, // required
    },
  });

  return NextResponse.json(data);
};
