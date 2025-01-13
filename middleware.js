import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("auth-token");

  if (!token) {
    return NextResponse.redirect(
      new URL(
        `/login?redirect=${encodeURIComponent(req.nextUrl.pathname)}`,
        req.url
      )
    );
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check token expiration
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (req.nextUrl.pathname.startsWith("/pages/admin/")) {
      if (decoded.name !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error.message);
    return NextResponse.redirect(new URL("/", req.url)); // Redirect to main page on error
  }
}

export const config = {
  matcher: ["/pages/:path*"], // Adjust routes here
};
