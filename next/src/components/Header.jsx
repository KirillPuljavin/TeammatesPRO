import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Header = () => {
  return (
    <div id="header">
      <h1 />

      <div id="navMenu">
        <button onClick={() => navigate("/")}>
          <h3>Om Mig</h3>
        </button>
        <button onClick={() => navigate("/details")}>
          <h3>Kunskaper</h3>
        </button>
        <button onClick={() => navigate("/interns")}>
          <h3>Praktik</h3>
        </button>
        <button onClick={() => navigate("/publicWorks")}>
          <h3>Publika Projekt</h3>
        </button>
      </div>
      <hr />
    </div>
  );
};

export default Header;
