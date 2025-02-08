/* eslint-disable no-unused-vars */
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

export async function POST(req) {
  const { name, password } = await req.json();

  try {
    console.log("Received login request for name:", name);
    const query = "SELECT * FROM teachers WHERE name = ?";
    const { rows } = await db.execute(query, [name]);

    // Check if teacher exists
    if (rows.length === 0) {
      console.error("Teacher not found:", name);
      return NextResponse.json(
        { success: false, message: "Teacher not found." },
        { status: 401 }
      );
    }
    const teacher = rows[0];
    console.log("Found teacher:", teacher);

    // Compare hashed password
    const isPasswordCorrect = bcrypt.compareSync(password, teacher.password);
    console.log(
      "Password comparison result:",
      password,
      ", match: ",
      isPasswordCorrect
    );

    if (!isPasswordCorrect) {
      console.error("Invalid password for teacher:", name);
      return NextResponse.json(
        { success: false, message: "Invalid password." },
        { status: 401 }
      );
    }

    // Create a JWT token
    const token = jwt.sign(
      { id: teacher.id, name: teacher.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    console.log("Generated JWT token for teacher:", name);

    // Set a secure cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600,
    });

    console.log("Login successful for teacher:", name);
    return response;
  } catch (error) {
    console.error("Error during login:", error.message);
    return NextResponse.json(
      { success: false, message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) {
    return NextResponse.json({ loggedIn: false, name: null });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return NextResponse.json({ loggedIn: true, name: decoded.name });
  } catch (error) {
    return NextResponse.json({ loggedIn: false, name: null });
  }
}
