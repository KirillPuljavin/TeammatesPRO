"use client";

import React, { useState } from "react";

export default function AdminControlPanel() {
  const [totalClasses, setTotalClasses] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("/api/admin/changePassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        alert("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
      } else {
        const data = await response.json();
        setPasswordError(data.error || "Failed to change password.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError("An unexpected error occurred.");
    }
  };

  return (
    <div className="control-panel flex-center">
      <div className="panel-container">
        <h1>Admin Control Panel</h1>
        <p>
          Welcome, Admin! Manage your school efficiently using the tools below.
        </p>

        <div className="stats-section">
          <div className="stat">
            <h2>{totalClasses}</h2>
            <p>Classes</p>
          </div>
          <div className="stat">
            <h2>{totalTeachers}</h2>
            <p>Teachers</p>
          </div>
        </div>

        <div className="links-section">
          <button
            className="button"
            onClick={() =>
              (window.location.href = "/pages/admin/manageClasses")
            }
          >
            Manage Classes
          </button>
          <button
            className="button secondary"
            onClick={() =>
              (window.location.href = "/pages/admin/manageTeachers")
            }
          >
            Manage Teachers
          </button>
        </div>

        {/* Password Change Section */}
        <div className="form">
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordChange}>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
            />
            {passwordError && <p className="error">{passwordError}</p>}
            <button type="submit" className="button">
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
