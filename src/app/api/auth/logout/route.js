import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logout successful",
    });
    response.cookies.set("auth-token", "", { maxAge: -1 }); // Clear the cookie
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Logout failed", error: error.message },
      { status: 500 }
    );
  }
}
