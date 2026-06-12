import { useState, useEffect } from "react";

export default function Topbar({ onLogout }) {
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("adminUser");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.name) {
          setUserName(user.name);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="topbar">
      <h1>Admin Overview</h1>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div className="user-chip">{userName}</div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </header>
  );
}

