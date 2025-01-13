import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

export default function AdminLayout({ children }) {
  const cookieStore = cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/"); // Redirect to login if no token
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.name !== "admin") {
      redirect("/"); // Redirect non-admin users to home
    }
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    redirect("/"); // Redirect on invalid token
  }

  return <>{children}</>;
}
