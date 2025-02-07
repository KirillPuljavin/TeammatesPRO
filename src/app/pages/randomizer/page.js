"use client";

import React, { useState, useEffect } from "react";

export default function GroupRandomizer() {
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [groupsRes, studentsRes] = await Promise.all([
          fetch("/api/groups"),
          fetch("/api/students"),
        ]);
        if (!groupsRes.ok) {
          throw new Error("Failed to fetch groups");
        }
        if (!studentsRes.ok) {
          throw new Error("Failed to fetch students");
        }
        const groupsData = await groupsRes.json();
        const studentsData = await studentsRes.json();
        setGroups(groupsData);
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="management-container flex-center">
      <div className="group-randomizer-container">
        {/* Main Groups Section */}
        <div className="groups-section">
          {loading ? (
            <p className="status-message loading">
              Loading groups and students...
            </p>
          ) : (
            groups.map((group) => {
              const groupStudents = students.filter(
                (student) => student.group === group.id
              );
              return (
                <div key={group.id} className="group-card">
                  <h3 className="group-name">{group.name}</h3>
                  <div className="students-list">
                    {groupStudents.map((student) => (
                      <div key={student.id} className="student">
                        <img
                          src={student.profilePic || "/placeholder.png"}
                          alt={student.name}
                          className="student-img"
                        />
                        <span className="student-name">{student.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Randomize Sidebar / Bottom Menu */}
        <div className="randomize-sidebar">
          <h2>Randomize Groups</h2>
          <div className="randomize-params">
            {/* Future parameter inputs will go here */}
          </div>
          <div className="button-group">
            <button className="button apply-btn">Apply</button>
            <button className="button secondary save-btn">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
