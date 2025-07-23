import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  console.log("🔍 MIDDLEWARE EXECUTING FOR:", req.nextUrl.pathname);

  // Since PrismaClient can't run in middleware, we'll use a different approach
  // Option 1: Make an API call to check user count
  try {
    const response = await fetch(`${req.nextUrl.origin}/api/users/count`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const { count } = await response.json();
      console.log("👥 User count:", count);

      // Allow only /setup before first admin is created
      // if (count === 0 && !req.nextUrl.pathname.startsWith("/setup")) {
      //   const url = req.nextUrl.clone();
      //   url.pathname = "/setup";
      //   return NextResponse.redirect(url);
      // }
    }
  } catch (error) {
    console.error("❌ Error checking user count:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - setup (setup page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|setup).*)",
  ],
};
