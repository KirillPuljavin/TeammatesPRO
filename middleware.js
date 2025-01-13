import { NextResponse } from "next/server";

export function middleware(req) {
  console.log("Middleware is being triggered for:", req.nextUrl.pathname);
  return NextResponse.next(); // Allow all requests for now
}

export const config = {
  matcher: ["/:path*"], // Match all routes
};
