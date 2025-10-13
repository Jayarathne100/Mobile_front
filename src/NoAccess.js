import React from "react";
import { useNavigate } from "react-router-dom";

function NoAccess() {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>🚫 Access Denied</h2>
      <p>You don’t have permission to view this page.</p>
      <button
        onClick={() => navigate("/Dashboard")}
        style={{ marginTop: "20px", padding: "10px 20px" }}
      >
        Go to Dashboard
      </button>
    </div>
  );
}

export default NoAccess;
