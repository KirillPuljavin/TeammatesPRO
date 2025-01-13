import db from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const result = await db.execute("SELECT COUNT(*) as total FROM teachers");
    const totalTeachers = result.rows[0]?.total || 0;

    res.status(200).json({ total: totalTeachers });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ error: "Failed to fetch teachers." });
  }
}
