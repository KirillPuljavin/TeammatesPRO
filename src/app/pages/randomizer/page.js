/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function GroupRandomizer() {
  const searchParams = useSearchParams();
  const currentClass = searchParams.get("class");

  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [draftGroups, setDraftGroups] = useState([]);
  const [draftStudents, setDraftStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [method, setMethod] = useState("count");
  const [groupCount, setGroupCount] = useState("");
  const [groupSize, setGroupSize] = useState("");

  // Track dragging for visual feedback
  const [draggingStudentId, setDraggingStudentId] = useState(null);
  const [dragOverGroup, setDragOverGroup] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [groupsRes, studentsRes] = await Promise.all([
          fetch(`/api/groups?class=${currentClass}`),
          fetch(`/api/students?class=${currentClass}`),
        ]);
        if (!groupsRes.ok || !studentsRes.ok) throw new Error("Fetch error");
        const [groupsData, studentsData] = await Promise.all([
          groupsRes.json(),
          studentsRes.json(),
        ]);
        setGroups(groupsData);
        setStudents(studentsData);
        setDraftGroups(groupsData);
        setDraftStudents(studentsData);
      } catch {
        // Ignore errors
      } finally {
        setLoading(false);
      }
    }
    if (currentClass) fetchData();
    else setLoading(false);
  }, [currentClass]);

  const assignedNames = draftGroups.map((g) => g.name);
  const unassigned = draftStudents.filter(
    (s) => !s.group_name || !assignedNames.includes(s.group_name)
  );

  function handleGenerate() {
    const shuffled = draftStudents.map((s) => ({ ...s, group_name: null }));
    shuffled.sort(() => Math.random() - 0.5);

    let newGroups = [];
    let offset = 0;
    const total = shuffled.length;

    if (method === "count") {
      const count = parseInt(groupCount, 10) || 0;
      for (let i = 0; i < count; i++) {
        newGroups.push({ id: `temp-${i}`, name: `Group ${i + 1}` });
      }
      const baseSize = Math.floor(total / count);
      const remainder = total % count;
      newGroups.forEach((g, i) => {
        const size = i < remainder ? baseSize + 1 : baseSize;
        shuffled
          .slice(offset, offset + size)
          .forEach((stu) => (stu.group_name = g.name));
        offset += size;
      });
    } else {
      const size = parseInt(groupSize, 10) || 0;
      const count = size > 0 ? Math.ceil(total / size) : 0;
      for (let i = 0; i < count; i++) {
        newGroups.push({ id: `temp-${i}`, name: `Group ${i + 1}` });
      }
      const baseSize = Math.floor(total / count);
      const remainder = total % count;
      newGroups.forEach((g, i) => {
        const chunkSize = i < remainder ? baseSize + 1 : baseSize;
        shuffled
          .slice(offset, offset + chunkSize)
          .forEach((stu) => (stu.group_name = g.name));
        offset += chunkSize;
      });
    }

    setDraftGroups(newGroups);
    setDraftStudents(shuffled);
  }

  function handleGroupNameChange(idx, newName) {
    const oldName = draftGroups[idx].name;
    const nextGroups = draftGroups.map((g, i) =>
      i === idx ? { ...g, name: newName } : g
    );
    const nextStudents = draftStudents.map((s) =>
      s.group_name === oldName ? { ...s, group_name: newName } : s
    );
    setDraftGroups(nextGroups);
    setDraftStudents(nextStudents);
  }

  // DRAG & DROP
  function handleDragStart(e, studentId) {
    setDraggingStudentId(studentId);
    e.dataTransfer.setData("text/studentId", studentId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragEnd() {
    setDraggingStudentId(null);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDragEnter(groupName) {
    setDragOverGroup(groupName);
  }

  function handleDragLeave() {
    setDragOverGroup(null);
  }

  function handleDrop(e, targetGroupName) {
    e.preventDefault();
    const studentId = e.dataTransfer.getData("text/studentId");
    setDragOverGroup(null);
    setDraftStudents((prev) =>
      prev.map((s) =>
        s.id.toString() === studentId
          ? {
              ...s,
              group_name:
                targetGroupName === "Unassigned Students"
                  ? null
                  : targetGroupName,
            }
          : s
      )
    );
  }

  async function handleSave() {
    try {
      // Remove old groups for this class
      const allGroupsRes = await fetch("/api/groups");
      const allGroups = await allGroupsRes.json();
      const currentClassGroups = allGroups.filter(
        (g) => g.class === currentClass
      );
      for (const grp of currentClassGroups) {
        await fetch(`/api/groups?id=${grp.id}`, { method: "DELETE" });
      }

      // Insert new groups, leader = first student
      for (const grp of draftGroups) {
        const groupStudents = draftStudents.filter(
          (s) => s.group_name === grp.name
        );
        const leaderId = groupStudents.length > 0 ? groupStudents[0].id : null;
        await fetch("/api/groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: grp.name,
            class: currentClass,
            leader: leaderId,
          }),
        });
      }

      // Update existing students
      const currentClassStudents = students.filter(
        (s) => s.class === currentClass
      );
      for (const std of currentClassStudents) {
        const draft = draftStudents.find((ds) => ds.id === std.id);
        const newGroupName = draft ? draft.group_name : null;
        await fetch("/api/students", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: std.id,
            group_name: newGroupName,
          }),
        });
      }
    } catch {
      // Ignore errors
    }
  }

  return (
    <div className="groups-container">
      {loading ? (
        <p className="status-message loading">Loading...</p>
      ) : (
        <>
          <div className="groups-grid">
            {draftGroups.map((grp, idx) => {
              const groupStudents = draftStudents.filter(
                (s) => s.group_name === grp.name
              );
              const leaderId =
                groupStudents.length > 0 ? groupStudents[0].id : null;

              const isDragOver = dragOverGroup === grp.name;

              return (
                <div
                  key={grp.id}
                  className={`group-card ${isDragOver ? "drag-over" : ""}`}
                  onDragOver={handleDragOver}
                  onDragEnter={() => handleDragEnter(grp.name)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, grp.name)}
                >
                  <input
                    className="group-name-input"
                    value={grp.name}
                    onChange={(e) => handleGroupNameChange(idx, e.target.value)}
                  />
                  <div className="students-grid">
                    {groupStudents.map((s) => {
                      const isLeader = s.id === leaderId;
                      const draggable = !isLeader; // leader not draggable
                      return (
                        <div
                          key={s.id}
                          className={`student ${
                            draggingStudentId === s.id ? "dragging" : ""
                          }`}
                          draggable={draggable}
                          onDragStart={(e) =>
                            draggable && handleDragStart(e, s.id)
                          }
                          onDragEnd={handleDragEnd}
                        >
                          <img
                            className={`student-img ${
                              isLeader ? "leader" : ""
                            }`}
                            src="https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg"
                            alt={s.name}
                          />
                          <span className="student-name">{s.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {unassigned.length > 0 && (
              <div
                className={`group-card unassigned ${
                  dragOverGroup === "Unassigned Students" ? "drag-over" : ""
                }`}
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter("Unassigned Students")}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "Unassigned Students")}
              >
                <input
                  className="group-name-input"
                  value="Unassigned Students"
                  readOnly
                />
                <div className="students-grid">
                  {unassigned.map((s) => (
                    <div
                      key={s.id}
                      className={`student ${
                        draggingStudentId === s.id ? "dragging" : ""
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, s.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <img
                        className="student-img"
                        src="https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg"
                        alt={s.name}
                      />
                      <span className="student-name">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="randomize-sidebar">
            <h2>Group Randomizer Settings</h2>
            <div className="method-selector">
              <label>
                <input
                  type="radio"
                  name="method"
                  value="count"
                  checked={method === "count"}
                  onChange={() => setMethod("count")}
                />
                Fixed Group Count
              </label>
              <label>
                <input
                  type="radio"
                  name="method"
                  value="size"
                  checked={method === "size"}
                  onChange={() => setMethod("size")}
                />
                Students per Group
              </label>
            </div>

            <div className="input-group">
              {method === "count" ? (
                <input
                  className="input"
                  type="number"
                  placeholder="Number of groups"
                  value={groupCount}
                  onChange={(e) => setGroupCount(e.target.value)}
                />
              ) : (
                <input
                  className="input"
                  type="number"
                  placeholder="Group size"
                  value={groupSize}
                  onChange={(e) => setGroupSize(e.target.value)}
                />
              )}
            </div>

            <button className="button" onClick={handleGenerate}>
              Generate Groups
            </button>
            <button className="button contrast" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </>
      )}
    </div>
  );
}
