"use client";
import React from "react";
import { useRouter } from "next/navigation";

const Footer = () => {
  const router = useRouter();

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
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <p>© 2024 TeammatesPro</p>
        </div>

        <div className="footer-center"></div>

        <div className="footer-right">
          <button onClick={handleLogout} className="button">
            Logga ut
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
