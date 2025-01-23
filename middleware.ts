import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicPaths = [
  "/",
  "/api/auth/signin",
  "/api/auth/signup",
  "/api/approved",
  "/api/auth/session",
  "/api/approved",
  "/api/tweets",
  "/api/users",
  "/images/",
  "/home",
  "/api/auth",
  "/manifest.json",
  "/api/cron/"
];

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/api/tweets" && request.method !== "GET") {
    return NextResponse.json(
      { error: "Only GET requests are allowed" },
      { status: 405 }
    );
  }

  const token = await getToken({ req: request });
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-url", request.url);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  if (
    request.nextUrl.pathname.includes("/api/auth/") ||
    request.nextUrl.pathname.includes("/api/users/") ||
    publicPaths.includes(request.nextUrl.pathname)
  ) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    try {
      const userResponse = await fetch(
        `${request.nextUrl.origin}/api/approved`,
        {
          headers: { cookie: request.headers.get("cookie") || "" },
        }
      );
      const { approved } = await userResponse.json();
      
      if (!approved) {
        return NextResponse.json({ error: "Not approved" }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|favicon.ico|images).*)"],
};