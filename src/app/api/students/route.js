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
    const { name, class: className } = await request.json();
    const result = await db.execute(
      `INSERT INTO students (name, class)
       VALUES (?, ?)
       RETURNING *`,
      [name, className]
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

export async function PATCH(request) {
  try {
    const { id, group_name } = await request.json();
    await db.execute(`UPDATE students SET group_name = ? WHERE id = ?`, [
      group_name,
      id,
    ]);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error updating student:", error);
    return new Response(JSON.stringify({ error: "Failed to update student" }), {
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
