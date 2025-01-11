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

/* 
useEffect(() => {
    // Fetch data from API
    fetch("/api/users", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);
  
  */
