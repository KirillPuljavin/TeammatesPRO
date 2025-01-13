"use client";

const Footer = () => {
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });

      if (res.ok) {
        const data = await res.json();
        console.log("Logout successful:", data);
        window.location.reload();
      } else {
        const errorData = await res.json();
        console.error("Logout failed:", errorData.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error during logout:", error.message);
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
