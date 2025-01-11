import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("auth-token", "", { maxAge: -1 }); // Clear the cookie
  return response;
}
