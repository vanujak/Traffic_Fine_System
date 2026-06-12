import { useEffect, useState } from "react";
import { getFines } from "../api/client.js";
import { formatCurrencyLkr, formatDateTime, statusBadgeClass } from "../utils/format.js";

export default function Fines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFines = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getFines({ limit: 50 });
        setFines(response?.data ?? []);
      } catch (fineError) {
        setError(fineError.message || "Unable to load fines.");
      } finally {
        setLoading(false);
      }
    };

    loadFines();
  }, []);

  return (
    <section className="card">
      <h3>Fine Register</h3>
      {error ? <div className="alert alert-error">{error}</div> : null}
      <table className="table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Vehicle</th>
            <th>Driver</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {fines.length > 0 ? (
            fines.map((fine) => (
              <tr key={fine.id}>
                <td>{fine.referenceNo}</td>
                <td>{fine.vehicleNo}</td>
                <td>{fine.driverName}</td>
                <td>{fine.category?.name || "—"}</td>
                <td>{formatCurrencyLkr(fine.category?.amount)}</td>
                <td><span className={statusBadgeClass(fine.status)}>{fine.status}</span></td>
                <td>{formatDateTime(fine.createdAt)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">{loading ? "Loading fines..." : "No fines found."}</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
