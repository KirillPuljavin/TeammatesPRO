import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Mock user data (replace with your database lookup)
const mockUser = {
  username: "testuser",
  passwordHash: bcrypt.hashSync("testpassword", 10), // Store securely
};

export async function POST(req) {
  const { username, password } = await req.json();

  // Validate user credentials
  if (
    username === mockUser.username &&
    bcrypt.compareSync(password, mockUser.passwordHash)
  ) {
    // Create a JWT token
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set a secure cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600,
    });
    return response;
  }

  return NextResponse.json(
    { success: false, message: "Invalid credentials" },
    { status: 401 }
  );
}
