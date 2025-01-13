import { parse } from "cookie";
import jwt from "jsonwebtoken";

export const authenticateUser = (req) => {
  const cookies = parse(req.headers.cookie || ""); // Parse cookies
  const token = cookies["auth-token"];

  if (!token) {
    return { isAuthenticated: false, redirect: "/" }; // Redirect to login if no token
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return {
      isAuthenticated: true,
      user: decoded,
    };
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    return { isAuthenticated: false, redirect: "/" }; // Redirect on invalid token
  }
};

export const authorizeAdmin = (user) => {
  if (user?.name !== "admin") {
    return { isAuthorized: false, redirect: "/" }; // Redirect if not admin
  }

  return { isAuthorized: true };
};
