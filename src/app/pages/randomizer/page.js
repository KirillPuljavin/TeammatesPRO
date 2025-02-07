/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function GroupRandomizer() {
  const searchParams = useSearchParams();
  const currentClass = searchParams.get("class");
  console.log("Current class:", currentClass);

  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [groupsRes, studentsRes] = await Promise.all([
          fetch(`/api/groups?class=${currentClass}`),
          fetch(`/api/students?class=${currentClass}`),
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
    if (currentClass) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [currentClass]);

  const assignedGroupNames = groups.map((group) => group.name);
  const unassignedStudents = students.filter(
    (student) =>
      !student.group_name || !assignedGroupNames.includes(student.group_name)
  );

  return (
    <div className="management-container flex-center">
      <div className="content-wrapper">
        <div className="groups-section">
          {loading ? (
            <p className="status-message loading">
              Loading groups and students...
            </p>
          ) : (
            <>
              {groups.map((group) => {
                const groupStudents = students.filter(
                  (student) => student.group_name === group.name
                );
                return (
                  <div key={group.id} className="group-card">
                    <h3 className="group-name">{group.name}</h3>
                    <div className="students-list">
                      {groupStudents.map((student) => (
                        <div key={student.id} className="student">
                          <img
                            className="student-img"
                            src={
                              student.profilePic ||
                              "https://via.placeholder.com/60?text=Profile"
                            }
                            alt={student.name}
                          />
                          <span className="student-name">{student.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {unassignedStudents.length > 0 && (
                <div className="group-card unassigned">
                  <h3 className="group-name">Unassigned Students</h3>
                  <div className="students-list">
                    {unassignedStudents.map((student) => (
                      <div key={student.id} className="student">
                        <img
                          className="student-img"
                          src={
                            student.profilePic ||
                            "https://via.placeholder.com/60?text=Profile"
                          }
                          alt={student.name}
                        />
                        <span className="student-name">{student.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="randomize-sidebar">
          <h2>Randomize Groups for {currentClass}</h2>
          <div className="randomize-params">
            {/* Future parameter inputs go here */}
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
