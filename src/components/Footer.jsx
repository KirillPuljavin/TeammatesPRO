"use client";

const Footer = () => {
  const handleLogout = async () => {
    console.log("Token in middleware:", req.cookies.get("auth-token"));

    const res = await fetch("/api/logout", { method: "POST" });
    if (res.ok) {
      window.location.href = "/"; // Redirect to main page
    } else {
      console.error("Logout failed");
    }
  };

  return (
    <div className="footer">
      <h3>© 2024</h3>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Footer;
