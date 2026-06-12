import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, isAuthenticated, loading, error: sessionError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = location.state?.from?.pathname || "/";

  useEffect(() => {
    document.title = "Admin Login | Traffic Fine System";
  }, []);

  if (!loading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      setError(loginError.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  const helpText =
    sessionError ||
    "Sign in with an admin account to access live traffic fine data.";

  return (
    <div className="auth-shell">
      <section className="card auth-card">
        <div className="auth-brand">
          <div className="auth-badge">Traffic Fine System</div>
          <h1>Admin Portal</h1>
          <p>{helpText}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@trafficfines.lk"
              autoComplete="email"
              required
              disabled={loading}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </label>

          {(error || sessionError) && (
            <div className="alert alert-error">{error || sessionError}</div>
          )}

          <button type="submit" className="primary-button" disabled={loading || submitting}>
            {loading || submitting ? "Authenticating..." : "Login to Dashboard"}
          </button>
        </form>
      </section>
    </div>
  );
}
