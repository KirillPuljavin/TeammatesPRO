import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const token = req.cookies.get("auth-token"); // Check if the cookie exists

    if (!token) {
      return NextResponse.json({
        success: false,
        message: "Already logged out",
      });
    }

    const response = NextResponse.json({
      success: true,
      message: "Logout successful",
    });

    // Clear the cookie
    response.cookies.set("auth-token", "", { maxAge: -1 });
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Logout failed", error: error.message },
      { status: 500 }
    );
  }
}
