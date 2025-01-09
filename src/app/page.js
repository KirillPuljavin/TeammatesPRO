"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Main() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch data from API
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className={"main"}>
      <div className={"container"}>
        <h1>User List</h1>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.name} - {user.email}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
