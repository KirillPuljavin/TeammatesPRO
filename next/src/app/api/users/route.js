import db from "@/lib/db";

export async function GET(req) {
  try {
    const stmt = db.prepare("SELECT * FROM users");
    const users = stmt.all(); // Fetch all rows

    return Response.json(users, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
