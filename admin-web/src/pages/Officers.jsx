import { useEffect, useMemo, useState } from "react";
import { getDistricts, getUsers, registerOfficer } from "../api/client.js";

export default function Officers() {
  const [officers, setOfficers] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [badgeNo, setBadgeNo] = useState("");
  const [districtId, setDistrictId] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [districtResponse, usersResponse] = await Promise.all([
        getDistricts(),
        getUsers({ limit: 100 }),
      ]);

      setDistricts(districtResponse?.data || []);

      const officerList = (usersResponse?.data || []).filter(
        (user) => user.role === "OFFICER",
      );
      setOfficers(officerList);
    } catch (fetchError) {
      setError(fetchError.message || "Failed to fetch data from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!districtId) {
      setError("Please select a district.");
      return;
    }

    setSubmitting(true);

    try {
      await registerOfficer({
        name,
        email,
        password,
        role: "OFFICER",
        phone,
        badgeNo,
        districtId: Number(districtId),
      });

      setSuccess(`Officer ${name} registered successfully!`);
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setBadgeNo("");
      setDistrictId("");
      fetchData();
    } catch (registerError) {
      setError(
        registerError.message || "Server connection failed. Could not register officer.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const officerCountLabel = useMemo(
    () => `${officers.length} officer${officers.length === 1 ? "" : "s"}`,
    [officers.length],
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Police Officers Management</h2>
          <p className="topbar-subtitle">Create and review admin-managed officer accounts</p>
        </div>
        <span className="badge">{officerCountLabel}</span>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="success-message">{success}</div> : null}

      <div className="officers-layout">
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
                onChange={(event) => setName(event.target.value)}
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
                onChange={(event) => setEmail(event.target.value)}
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
                onChange={(event) => setPassword(event.target.value)}
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
                onChange={(event) => setPhone(event.target.value)}
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
                onChange={(event) => setBadgeNo(event.target.value)}
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
                onChange={(event) => setDistrictId(event.target.value)}
                required
                disabled={submitting}
              >
                <option value="">Select District</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
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
