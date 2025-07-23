import { NextResponse } from "next/server";
import { prisma } from "@serialsms/database";

export async function GET() {
  try {
    const count = await prisma.user.count();
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error getting user count:", error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
