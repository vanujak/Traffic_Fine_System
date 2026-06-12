import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-shell">
        <section className="card auth-loading">
          <h3>Loading session</h3>
          <p>Checking your admin access...</p>
        </section>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}