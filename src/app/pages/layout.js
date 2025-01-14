import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/"); // Redirect to login if no tokena
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET); // Verify the token
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    redirect("/"); // Redirect if token is invalid
  }

  return <>{children}</>; // Render the protected pages
}
