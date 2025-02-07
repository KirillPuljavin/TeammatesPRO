// app/api/admin/groups/route.js
import db from "@/lib/db";

export async function GET() {
  try {
    const groups = await db.execute(`
      SELECT 
        id,
        name,
        class,
        leader
      FROM groups
    `);

    return new Response(JSON.stringify(groups.rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch groups" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request) {
  try {
    const { name, class: className, leader } = await request.json();

    const result = await db.execute(
      `INSERT INTO groups 
       (name, class, leader) 
       VALUES (?, ?, ?) 
       RETURNING *`,
      [name, className, leader]
    );

    return new Response(JSON.stringify(result.rows[0]), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating group:", error);
    return new Response(JSON.stringify({ error: "Failed to create group" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    await db.execute("DELETE FROM groups WHERE id = ?", [id]);
    return new Response(
      JSON.stringify({ message: "Group deleted successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deleting group:", error);
    return new Response(JSON.stringify({ error: "Failed to delete group" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
