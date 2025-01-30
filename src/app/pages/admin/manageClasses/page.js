"use client";

import { useState, useEffect } from "react";

export default function ManageClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newClassName, setNewClassName] = useState("");

  // Fetch classes on mount
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/admin/classes");
      if (!response.ok) throw new Error("Failed to fetch classes");
      const data = await response.json();
      setClasses(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;

    try {
      const response = await fetch(`/api/admin/classes?id=${classId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete class");

      // Optimistic update
      setClasses((prev) => prev.filter((cls) => cls.id !== classId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    try {
      const response = await fetch("/api/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClassName }),
      });

      if (!response.ok) throw new Error("Failed to add class");

      const newClass = await response.json();
      setClasses((prev) => [...prev, newClass]);
      setNewClassName("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <h1>Manage Classes</h1>
        <p>View and manage all classes in the system</p>
      </div>

      {loading ? (
        <div className="status-message loading">Loading classes...</div>
      ) : error ? (
        <div className="status-message error">{error}</div>
      ) : (
        <>
          <ul className="data-list">
            {classes.map((cls) => (
              <li key={cls.id} className="data-item">
                <div className="item-content">{cls.name}</div>
                <div className="item-actions">
                  <button
                    className="button compact danger"
                    onClick={() => handleDelete(cls.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddClass} className="management-form">
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="New class name"
              className="input form-input"
              required
            />
            <button type="submit" className="button">
              Add New Class
            </button>
          </form>
        </>
      )}
    </div>
  );
}
