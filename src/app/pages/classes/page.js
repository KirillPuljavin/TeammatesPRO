"use client";

export default function ClassesPage() {
  const classes = [
    { id: 1, name: "Class A", students: 25 },
    { id: 2, name: "Class B", students: 30 },
    { id: 3, name: "Class C", students: 20 },
  ];

  return (
    <div className="classes-page">
      <h1>Classes</h1>
      <p>Select a class to manage its groups or view details.</p>

      <div className="classes-list">
        {classes.map((cls) => (
          <div key={cls.id} className="class-card">
            <h2>{cls.name}</h2>
            <p>Students: {cls.students}</p>
            <button className="button">View</button>
          </div>
        ))}
      </div>
    </div>
  );
}
