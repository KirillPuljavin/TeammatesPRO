"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [classesRes, studentsRes] = await Promise.all([
          fetch("/api/admin/classes"),
          fetch("/api/students"),
        ]);

        if (!classesRes.ok || !studentsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const classesData = await classesRes.json();
        const studentsData = await studentsRes.json();

        setClasses(classesData);
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <p>Laddar...</p>;
  }

  return (
    <div className="management-container">
      <div className="management-header">
        <h1>Klasshantering</h1>
        <p>Välj en klass för att hantera dess grupper eller visa detaljer.</p>
      </div>
      <div className="classes-list">
        {classes.map((cls) => {
          const classStudents = students.filter((s) => s.class === cls.name);
          return (
            <div key={cls.id} className="class-card">
              <div className="class-summary">
                <h2>{cls.name}</h2>
                <p>Elever: {classStudents.length}</p>
              </div>
              {cls.school && (
                <div className="extra">
                  <p className="school">Skola: {cls.school}</p>
                </div>
              )}
              <Link
                href={`/pages/randomizer?class=${encodeURIComponent(cls.name)}`}
              >
                <button className="button">
                  Hantera grupper för denna klass
                </button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
