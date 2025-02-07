import db from "@/lib/db";

export async function GET() {
  try {
    const result = await db.execute(`
      SELECT id, name, class, group_name
      FROM students
    `);
    return new Response(JSON.stringify(result.rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch students" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request) {
  try {
    const { name, class: className, group_name } = await request.json();
    const result = await db.execute(
      `INSERT INTO students (name, class, group_name)
       VALUES (?, ?, ?)
       RETURNING *`,
      [name, className, group_name]
    );
    return new Response(JSON.stringify(result.rows[0]), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating student:", error);
    return new Response(JSON.stringify({ error: "Failed to create student" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    await db.execute("DELETE FROM students WHERE id = ?", [id]);
    return new Response(
      JSON.stringify({ message: "Student deleted successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error deleting student:", error);
    return new Response(JSON.stringify({ error: "Failed to delete student" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
