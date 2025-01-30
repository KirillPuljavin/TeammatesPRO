import db from "@/lib/db";

export async function GET() {
  try {
    const teachers = await db.execute("SELECT id, name FROM teachers");
    return new Response(JSON.stringify(teachers.rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch teachers" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request) {
  try {
    const { name, password } = await request.json();
    if (!name || !password) {
      return new Response(
        JSON.stringify({ error: "Name and password are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const result = await db.execute(
      "INSERT INTO teachers (name, password) VALUES (?, ?) RETURNING id, name",
      [name, password]
    );

    return new Response(JSON.stringify(result.rows[0]), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return new Response(JSON.stringify({ error: "Failed to create teacher" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "Teacher ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await db.execute("DELETE FROM teachers WHERE id = ?", [id]);
    return new Response(
      JSON.stringify({ message: "Teacher deleted successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return new Response(JSON.stringify({ error: "Failed to delete teacher" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
