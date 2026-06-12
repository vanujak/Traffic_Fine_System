import { useState, useEffect } from "react";

export default function Officers() {
  const [officers, setOfficers] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [badgeNo, setBadgeNo] = useState("");
  const [districtId, setDistrictId] = useState("");

  const token = localStorage.getItem("adminToken");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch Districts
      const distRes = await fetch("http://localhost:5000/api/v1/districts");
      const distData = await distRes.json();
      if (distRes.ok && distData.success) {
        setDistricts(distData.data || []);
      }

      // Fetch Users (which we will filter for role === "OFFICER")
      const usersRes = await fetch("http://localhost:5000/api/v1/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const usersData = await usersRes.json();
      if (usersRes.ok && usersData.success) {
        const officerList = (usersData.data || []).filter(
          (u) => u.role === "OFFICER"
        );
        setOfficers(officerList);
      } else {
        setError(usersData.message || "Failed to fetch officers list.");
      }
    } catch (err) {
      setError("Failed to fetch data from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!districtId) {
      setError("Please select a district.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: "OFFICER",
          phone,
          badgeNo,
          districtId: Number(districtId),
        }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setSuccess(`Officer ${name} registered successfully!`);
        // Reset Form
        setName("");
        setEmail("");
        setPassword("");
        setPhone("");
        setBadgeNo("");
        setDistrictId("");
        // Reload List
        fetchData();
      } else {
        setError(resData.message || "Registration failed.");
      }
    } catch (err) {
      setError("Server connection failed. Could not register officer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Police Officers Management</h2>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="officers-layout">
        {/* Officers Directory */}
        <section className="card">
          <h3>Officers Directory</h3>
          {loading ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
              Loading officers directory...
            </div>
          ) : officers.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
              No registered officers found in the system.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Badge Number</th>
                    <th>District</th>
                    <th>Email</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {officers.map((officer) => (
                    <tr key={officer.id}>
                      <td style={{ fontWeight: "600" }}>{officer.name}</td>
                      <td>
                        <span className="badge">
                          {officer.officer?.badgeNo || "N/A"}
                        </span>
                      </td>
                      <td>{officer.officer?.district?.name || officer.district?.name || "N/A"}</td>
                      <td>{officer.email}</td>
                      <td>{officer.officer?.phone || officer.phone || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Register Form */}
        <section className="card">
          <h3>Register New Officer</h3>
          <form onSubmit={handleRegister} style={{ marginTop: "16px" }}>
            <div className="form-group">
              <label className="form-label-light" htmlFor="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                className="form-input-light"
                placeholder="e.g. Inspector K. Perera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label-light" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="form-input-light"
                placeholder="e.g. perera@trafficfines.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label-light" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="form-input-light"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label-light" htmlFor="phone">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                className="form-input-light"
                placeholder="e.g. +94771234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label-light" htmlFor="badgeNo">
                Badge Number
              </label>
              <input
                type="text"
                id="badgeNo"
                className="form-input-light"
                placeholder="e.g. SLP8942"
                value={badgeNo}
                onChange={(e) => setBadgeNo(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label-light" htmlFor="district">
                Assigned District
              </label>
              <select
                id="district"
                className="form-select"
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                required
                disabled={submitting}
              >
                <option value="">Select District</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Registering..." : "Register Officer"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
