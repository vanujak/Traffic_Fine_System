import { useAuth } from "../context/AuthContext.jsx";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div>
        <h1>Admin Overview</h1>
        <p className="topbar-subtitle">Monitor fines, payments, and reports</p>
      </div>
      <div className="topbar-actions">
        <div className="user-chip">
          {user?.name || "Admin"} · {user?.role || "ADMIN"}
        </div>
        <button onClick={logout} className="btn-logout" type="button">
          Logout
        </button>
      </div>
    </header>
  );
}

