import React from "react";
import { useNavigate } from "react-router-dom";
import "./panel.css";

function Panel() {
  const access = JSON.parse(localStorage.getItem("access")) || [];
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  // Define pages based on role
  const pages =
    role === "Admin"
      ? ["Dashboard", "Category", "Product", "Stock", "Sales", "System"]
      : access;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="sidepanel">
      <h2 className="sidepanel-title">Menu</h2>

      {pages.map((page) => (
        <button
          key={page}
          className="sidepanel-btn"
          onClick={() => navigate(`/${page.replace(/\s+/g, "")}`)}
        >
          {page}
        </button>
      ))}

      <button
        className="sidepanel-btn logout"
        onClick={handleLogout}
        style={{ marginTop: "30px", backgroundColor: "#e63946", color: "white" }}
      >
        Logout
      </button>
    </div>
  );
}

export default Panel;
