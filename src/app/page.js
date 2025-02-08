"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isTeacher, setIsTeacher] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ name: "", password: "", general: "" });

  const router = useRouter();

  const handleStudentClick = () => {
    router.push("/pages/classes");
  };

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    setErrors({ name: "", password: "", general: "" }); // Reset errors

    // Validate fields
    let valid = true;
    if (!name.trim()) {
      setErrors((prev) => ({ ...prev, name: "Name is required." }));
      valid = false;
    }
    if (!password.trim()) {
      setErrors((prev) => ({ ...prev, password: "Password is required." }));
      valid = false;
    }

    if (valid) {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, password }),
        });

        if (response.ok) {
          router.push("/pages/classes");
          window.location.reload();
        } else {
          const data = await response.json();
          if (data.message) {
            setErrors((prev) => ({ ...prev, general: data.message }));
          } else {
            setErrors((prev) => ({ ...prev, general: "Invalid credentials." }));
          }
        }
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          general: "An error occurred. Please try again.",
          error,
        }));
      }
    }
  };

  return (
    <>
      <div className="flex-center">
        <h1>Välkommen till TeammatesPro</h1>
        <p>
          TeammatesPro är ett verktyg som hjälper skolor att snabbt slumpa och
          hantera elevgrupper över klasser, vilket möjliggör enkla
          gruppindelningar för projekt och aktiviteter med bara ett klick.
        </p>

        <h2>Jag är...</h2>
        <div className="button-group">
          <button className="button" onClick={handleStudentClick}>
            Elev
          </button>
          <button
            className="button secondary"
            onClick={() => setIsTeacher(!isTeacher)}
          >
            Lärare
          </button>
        </div>

        {isTeacher && (
          <form onSubmit={handleTeacherSubmit} className="login-form">
            <input
              type="text"
              placeholder="Namn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`input ${errors.name ? "error-border" : ""}`}
            />
            {errors.name && <p className="error">{errors.name}</p>}

            <input
              type="password"
              placeholder="Lösenord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`input ${errors.password ? "error-border" : ""}`}
            />
            {errors.password && <p className="error">{errors.password}</p>}

            {errors.general && (
              <p className="error general-error">{errors.general}</p>
            )}

            <button type="submit" className="button">
              Logga in
            </button>
          </form>
        )}
      </div>
    </>
  );
}
