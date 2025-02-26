"use client";

import React, { useState, useEffect } from "react";

export default function ManageStudents() {
  const [name, setName] = useState("");
  const [classId, setClassId] = useState("");
  const [error, setError] = useState("");
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editingStudentName, setEditingStudentName] = useState("");

  // Fetch available classes from the API endpoint
  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/admin/classes");
        if (res.ok) {
          const data = await res.json();
          setClasses(data);
        } else {
          console.error("Failed to fetch classes");
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    }
    fetchClasses();
  }, []);

  // Fetch students on mount
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch("/api/students");
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
        } else {
          console.error("Failed to fetch students");
        }
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    }
    fetchStudents();
  }, []);

  // Add a new student
  const handleAddStudent = async (e) => {
    e.preventDefault();

    if (!name || !classId) {
      setError("Both name and class are required.");
      return;
    }

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, class: classId }),
      });

      if (res.ok) {
        const newStudent = await res.json();
        setStudents((prev) => [...prev, newStudent]);
        setName("");
        setClassId("");
        setError("");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to add student.");
      }
    } catch (err) {
      console.error("Error adding student:", err);
      setError("An unexpected error occurred.");
    }
  };

  // Delete a student
  const handleDeleteStudent = async (id) => {
    try {
      const res = await fetch(`/api/students?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStudents((prev) => prev.filter((student) => student.id !== id));
      } else {
        const errorData = await res.json();
        console.error("Delete error:", errorData.error);
      }
    } catch (err) {
      console.error("Error deleting student:", err);
    }
  };

  // Start editing a student's name
  const handleEditStudent = (student) => {
    setEditingStudentId(student.id);
    setEditingStudentName(student.name);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingStudentId(null);
    setEditingStudentName("");
  };

  // Update the student's name
  const handleUpdateStudent = async (id) => {
    try {
      const res = await fetch("/api/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: editingStudentName }),
      });
      if (res.ok) {
        setStudents((prev) =>
          prev.map((student) =>
            student.id === id
              ? { ...student, name: editingStudentName }
              : student
          )
        );
        setEditingStudentId(null);
        setEditingStudentName("");
      } else {
        const errorData = await res.json();
        console.error("Update error:", errorData.error);
      }
    } catch (err) {
      console.error("Error updating student:", err);
    }
  };

  return (
    <div className="control-panel flex-center">
      <div className="panel-container">
        <h1>Manage Students</h1>
        <p>Add a new student to the database.</p>

        <form onSubmit={handleAddStudent} className="management-form">
          <input
            type="text"
            placeholder="Student Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input form-input"
          />
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="input form-input"
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.name}>
                {cls.name}
              </option>
            ))}
          </select>
          <button type="submit" className="button">
            Add Student
          </button>
        </form>
        {error && <p className="error">{error}</p>}

        {students.length > 0 && (
          <ul className="data-list">
            {students.map((student) => (
              <li key={student.id} className="data-item">
                <div className="item-content">
                  {editingStudentId === student.id ? (
                    <input
                      type="text"
                      value={editingStudentName}
                      onChange={(e) => setEditingStudentName(e.target.value)}
                      className="input form-input"
                    />
                  ) : (
                    <p>
                      {student.name} - {student.class}
                    </p>
                  )}
                </div>
                <div className="item-actions">
                  {editingStudentId === student.id ? (
                    <>
                      <button
                        onClick={() => handleUpdateStudent(student.id)}
                        className="button"
                      >
                        Save
                      </button>
                      <button onClick={handleCancelEdit} className="button">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="button"
                      >
                        Edit Name
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="button"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
