import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "@/lib/db"; // Using the Turso database client

export async function POST(req) {
  const { name, password } = await req.json();

  try {
    console.log("Received login request for name:", name);

    // Fetch teacher from the database
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

    const teacher = rows[0]; // Get the first teacher row
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
