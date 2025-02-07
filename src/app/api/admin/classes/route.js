// app/api/admin/classes/route.js
import db from "@/lib/db";

export async function GET(request) {
  try {
    const classes = await db.execute("SELECT * FROM classes");
    return new Response(JSON.stringify(classes.rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch classes" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request) {
  try {
    const { name, school } = await request.json();
    if (!name || !school) {
      return new Response(
        JSON.stringify({ error: "Class name and school are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const result = await db.execute(
      "INSERT INTO classes (name, school) VALUES (?, ?) RETURNING *",
      [name, school]
    );

    return new Response(JSON.stringify(result.rows[0]), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating class:", error);
    return new Response(JSON.stringify({ error: "Failed to create class" }), {
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
      return new Response(JSON.stringify({ error: "Class ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await db.execute("DELETE FROM classes WHERE id = ?", [id]);
    return new Response(
      JSON.stringify({ message: "Class deleted successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error deleting class:", error);
    return new Response(JSON.stringify({ error: "Failed to delete class" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
