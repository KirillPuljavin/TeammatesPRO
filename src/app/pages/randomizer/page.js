/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function GroupRandomizer() {
  const searchParams = useSearchParams();
  const currentClass = searchParams.get("class");
  const router = useRouter();

  // State for available classes (for the drop-down)
  const [availableClasses, setAvailableClasses] = useState([]);

  const [students, setStudents] = useState([]);
  const [draftGroups, setDraftGroups] = useState([]);
  const [draftStudents, setDraftStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [method, setMethod] = useState("count");
  const [groupCount, setGroupCount] = useState("");
  const [groupSize, setGroupSize] = useState("");
  // saveStatus can be null, "saving", "success", or "error"
  const [saveStatus, setSaveStatus] = useState(null);

  const [draggingStudentId, setDraggingStudentId] = useState(null);
  const [dragOverGroup, setDragOverGroup] = useState(null);

  // Fetch available classes for the drop-down
  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/admin/classes");
        if (!res.ok) throw new Error("Failed to fetch classes");
        const data = await res.json();
        setAvailableClasses(data);
      } catch (error) {
        console.error("Error fetching available classes:", error);
      }
    }
    fetchClasses();
  }, []);

  // Fetch groups and students for the current class
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

        const normalizedGroups = groupsData.map((g) => ({
          ...g,
          leaderId: g.leader || null,
        }));

        setStudents(studentsData);
        setDraftGroups(normalizedGroups);
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
    setSaveStatus(null);

    const countVal = parseInt(groupCount, 10) || 0;
    const sizeVal = parseInt(groupSize, 10) || 0;
    if (method === "count" && countVal < 1) return;
    if (method === "size" && sizeVal < 1) return;

    const shuffled = draftStudents.map((s) => ({ ...s, group_name: null }));
    shuffled.sort(() => Math.random() - 0.5);

    let newGroups = [];
    let offset = 0;
    const total = shuffled.length;

    if (method === "count") {
      for (let i = 0; i < countVal; i++) {
        newGroups.push({
          id: `temp-${i}`,
          name: `Group ${i + 1}`,
          leaderId: null,
        });
      }
      const baseSize = Math.floor(total / countVal);
      const remainder = total % countVal;
      newGroups.forEach((g, i) => {
        const sliceSize = i < remainder ? baseSize + 1 : baseSize;
        shuffled.slice(offset, offset + sliceSize).forEach((stu) => {
          stu.group_name = g.name;
        });
        offset += sliceSize;
      });
    } else {
      const calcCount = Math.ceil(total / sizeVal);
      for (let i = 0; i < calcCount; i++) {
        newGroups.push({
          id: `temp-${i}`,
          name: `Group ${i + 1}`,
          leaderId: null,
        });
      }
      const baseSize = Math.floor(total / calcCount);
      const remainder = total % calcCount;
      newGroups.forEach((g, i) => {
        const sliceSize = i < remainder ? baseSize + 1 : baseSize;
        shuffled.slice(offset, offset + sliceSize).forEach((stu) => {
          stu.group_name = g.name;
        });
        offset += sliceSize;
      });
    }

    newGroups = newGroups.map((g) => {
      const groupStudents = shuffled.filter((s) => s.group_name === g.name);
      if (groupStudents.length > 0) {
        const randomIndex = Math.floor(Math.random() * groupStudents.length);
        g.leaderId = groupStudents[randomIndex].id;
      }
      return g;
    });

    setDraftGroups(newGroups);
    setDraftStudents(shuffled);
  }

  function handleGroupNameChange(idx, newName) {
    setSaveStatus(null);
    const oldName = draftGroups[idx].name;
    const updatedGroups = draftGroups.map((g, i) =>
      i === idx ? { ...g, name: newName } : g
    );
    const updatedStudents = draftStudents.map((s) =>
      s.group_name === oldName ? { ...s, group_name: newName } : s
    );
    setDraftGroups(updatedGroups);
    setDraftStudents(updatedStudents);
  }

  function handleSetLeader(groupId, studentId) {
    setSaveStatus(null);
    setDraftGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, leaderId: studentId } : g))
    );
  }

  // DRAG & DROP handlers
  function handleDragStart(e, studentId) {
    setDraggingStudentId(studentId);
    e.dataTransfer.setData("text/studentId", studentId);
    e.dataTransfer.effectAllowed = "move";
  }

  function clearDragState() {
    setDraggingStudentId(null);
    setDragOverGroup(null);
  }

  function handleDragEnd() {
    clearDragState();
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDragEnter(groupName) {
    setDragOverGroup(groupName);
  }

  function handleDragLeave(e) {
    if (e.currentTarget === e.target) setDragOverGroup(null);
  }

  function handleDrop(e, targetGroupName) {
    e.preventDefault();
    const studentId = e.dataTransfer.getData("text/studentId");
    clearDragState();

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

  async function handleDeleteGroup(groupId, groupName) {
    const confirmed = window.confirm(
      "All students from this group will be unassigned. Are you sure you want to delete this group?"
    );
    if (!confirmed) return;

    try {
      // Delete group from database
      const res = await fetch(`/api/groups?id=${groupId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("Failed to delete group.");
        return;
      }
      // Update local state: remove group from draftGroups
      const newDraftGroups = draftGroups.filter((g) => g.id !== groupId);
      setDraftGroups(newDraftGroups);
      // Unassign all students from that group
      const newDraftStudents = draftStudents.map((s) =>
        s.group_name === groupName ? { ...s, group_name: null } : s
      );
      setDraftStudents(newDraftStudents);
    } catch (error) {
      console.error("Error deleting group:", error);
      alert("Error deleting group.");
    }
  }

  async function handleSave() {
    // Issue a warning before proceeding
    const confirmed = window.confirm(
      "Warning: If you proceed, all existing groups for this class will be permanently lost and overwritten. Do you want to continue?"
    );
    if (!confirmed) return;

    setSaveStatus("saving");

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    try {
      // Remove old groups
      const allGroupsRes = await fetch("/api/groups");
      const allGroups = await allGroupsRes.json();
      const currentClassGroups = allGroups.filter(
        (g) => g.class === currentClass
      );
      for (const grp of currentClassGroups) {
        await fetch(`/api/groups?id=${grp.id}`, { method: "DELETE" });
      }

      // Insert new groups
      for (const grp of draftGroups) {
        await fetch("/api/groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: grp.name,
            class: currentClass,
            leader: grp.leaderId,
          }),
        });
      }

      // Update existing students
      const allClassStudents = students.filter((s) => s.class === currentClass);
      for (const std of allClassStudents) {
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

      setSaveStatus("success");
    } catch {
      setSaveStatus("error");
    } finally {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }

  return (
    <div className="groups-container">
      <div className="class-selector">
        <div className="current-class">
          <strong>Current Class:</strong> {currentClass || "None"}
        </div>
        <div className="class-dropdown">
          <select
            value={currentClass || ""}
            onChange={(e) => {
              const newClass = e.target.value;
              router.push(
                `/pages/randomizer?class=${encodeURIComponent(newClass)}`
              );
            }}
          >
            <option value="" disabled>
              Select a class...
            </option>
            {availableClasses.map((cls) => (
              <option key={cls.id} value={cls.name}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="status-message loading">Loading...</p>
      ) : draftStudents.length === 0 ? (
        <div className="placeholder">
          <p>No students or groups found for the current class.</p>
        </div>
      ) : (
        <>
          <div className="groups-grid">
            {draftGroups.map((grp, idx) => {
              const groupStudents = draftStudents.filter(
                (s) => s.group_name === grp.name
              );
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
                  {/* Red X delete button (only for non-unassigned groups) */}
                  <button
                    className="delete-group-button"
                    onClick={() => handleDeleteGroup(grp.id, grp.name)}
                  >
                    ×
                  </button>
                  <input
                    className="group-name-input"
                    type="text"
                    value={grp.name}
                    onChange={(e) => handleGroupNameChange(idx, e.target.value)}
                  />
                  <div className="students-grid">
                    {groupStudents.map((s) => {
                      const isLeader = s.id === grp.leaderId;
                      return (
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
                            className={`student-img ${
                              isLeader ? "leader" : ""
                            }`}
                            src="https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg"
                            alt={s.name}
                          />
                          <span className="student-name">{s.name}</span>
                          <span
                            className="star-icon"
                            style={{ opacity: isLeader ? 1 : 0.3 }}
                            onClick={() => handleSetLeader(grp.id, s.id)}
                          >
                            ⭐
                          </span>
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
                      onDragEnd={clearDragState}
                    >
                      <img
                        className="student-img"
                        src="https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg"
                        alt={s.name}
                      />
                      <span className="student-name">{s.name}</span>
                      <span className="star-icon" style={{ opacity: 0.3 }}>
                        ★
                      </span>
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
                  min="1"
                  placeholder="Number of groups"
                  value={groupCount}
                  onChange={(e) => setGroupCount(e.target.value)}
                />
              ) : (
                <input
                  className="input"
                  type="number"
                  min="1"
                  placeholder="Group size"
                  value={groupSize}
                  onChange={(e) => setGroupSize(e.target.value)}
                />
              )}
            </div>
            <button className="button" onClick={handleGenerate}>
              Generate Groups
            </button>
            <button
              className="button contrast"
              onClick={handleSave}
              disabled={saveStatus === "saving"}
            >
              Save Changes
            </button>
            {saveStatus === "saving" && (
              <p className="save-message saving">Saving...</p>
            )}
            {saveStatus === "success" && (
              <p className="save-message success">Groups saved successfully!</p>
            )}
            {saveStatus === "error" && (
              <p className="save-message error">Failed to save groups.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
