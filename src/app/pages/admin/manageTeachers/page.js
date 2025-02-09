"use client";

import { useState, useEffect } from "react";

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTeacher, setNewTeacher] = useState({ name: "", password: "" });

  // Fetch teachers on mount
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/admin/teachers");
      if (!response.ok) throw new Error("Failed to fetch teachers");
      const data = await response.json();
      const filteredTeachers = data.filter(
        (teacher) => teacher.name !== "admin"
      );

      setTeachers(filteredTeachers);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (teacherId) => {
    if (!window.confirm("Are you sure you want to delete this teacher?"))
      return;

    try {
      const response = await fetch(`/api/admin/teachers?id=${teacherId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete teacher");

      // Optimistic update: remove the teacher from state
      setTeachers((prev) => prev.filter((teacher) => teacher.id !== teacherId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if (!newTeacher.name.trim() || !newTeacher.password.trim()) return;

    try {
      const response = await fetch("/api/admin/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTeacher),
      });

      if (!response.ok) throw new Error("Failed to add teacher");

      const addedTeacher = await response.json();
      setTeachers((prev) => [...prev, addedTeacher]);
      setNewTeacher({ name: "", password: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <h1>Manage Teachers</h1>
        <p>View and manage all teachers in the system</p>
      </div>

      {loading ? (
        <div className="status-message loading">Loading teachers...</div>
      ) : error ? (
        <div className="status-message error">{error}</div>
      ) : (
        <>
          <ul className="data-list">
            {teachers.map((teacher) => (
              <li key={teacher.id} className="data-item">
                <div className="item-content">
                  <div className="teacher-name">{teacher.name}</div>
                </div>
                <div className="item-actions">
                  <button
                    className="button compact danger"
                    onClick={() => handleDelete(teacher.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddTeacher} className="management-form">
            <input
              type="text"
              value={newTeacher.name}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, name: e.target.value })
              }
              placeholder="Teacher name"
              className="input form-input"
              required
            />
            <input
              type="password"
              value={newTeacher.password}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, password: e.target.value })
              }
              placeholder="Password"
              className="input form-input"
              required
            />
            <button type="submit" className="button">
              Add New Teacher
            </button>
          </form>
        </>
      )}
    </div>
  );
}
