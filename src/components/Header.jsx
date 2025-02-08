"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header({ title = "Page Title" }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("Guest");

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/login", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data?.name) setUserName(data.name);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    }
    fetchUser();
  }, []);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <header className="header">
      <div className="header-content">
        <div className="left-section">
          <button className="menu-icon" onClick={toggleMenu}>
            ☰
          </button>
          {menuOpen && (
            <div className="dropdown-menu">
              <ul>
                <li onClick={() => router.push("/")}>Inlogning</li>
                <li onClick={() => router.push("/pages/classes")}>Klasser</li>
                <li
                  onClick={() => router.push("/pages/randomizer?class=1TEK2")}
                >
                  Grupp Hanterare
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="center-section">
          <h1 className="page-title">{title}</h1>
        </div>

        <div className="right-section">
          <div className="profile-menu">{userName}</div>
        </div>
      </div>
    </header>
  );
}
