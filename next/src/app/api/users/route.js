import db from "@/lib/db";

// GET: Fetch all users
export async function GET(req) {
  try {
    const result = await db.execute("SELECT * FROM users");
    return Response.json(result.rows, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST: Add a new user
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email } = body;

    await db.execute({
      sql: "INSERT INTO users (name, email) VALUES (?, ?)",
      args: [name, email],
    });

    return Response.json({ message: "User added" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to add user" }, { status: 500 });
  }
}
