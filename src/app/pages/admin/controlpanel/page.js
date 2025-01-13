"use client";

import React, { useState, useEffect } from "react";

export default function AdminControlPanel() {
  const [totalClasses, setTotalClasses] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch total classes
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/admin/getClasses");
        const data = await response.json();
        setTotalClasses(data.total || 0);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    // Fetch total teachers
    const fetchTeachers = async () => {
      try {
        const response = await fetch("/api/admin/getTeachers");
        const data = await response.json();
        setTotalTeachers(data.total || 0);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };

    // Fetch both and update loading state
    Promise.all([fetchClasses(), fetchTeachers()]).then(() =>
      setLoading(false)
    );
  }, []);

  if (loading) {
    return <p>Loading Control Panel...</p>;
  }

  return (
    <div className="control-panel flex-center">
      <div className="panel-container">
        <h1>Admin Control Panel</h1>
        <p>
          Welcome, Admin! Manage your school efficiently using the tools below.
        </p>

        {/* Statistics Section */}
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

        {/* Links Section */}
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
      </div>
    </div>
  );
}
