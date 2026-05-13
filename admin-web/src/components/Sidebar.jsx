import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Fines", path: "/fines" },
  { label: "Payments", path: "/payments" },
  { label: "Reports", path: "/reports" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">Traffic Fine Admin</div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="card">
        <h3>System Status</h3>
        <p>Operational</p>
      </div>
    </aside>
  );
}
