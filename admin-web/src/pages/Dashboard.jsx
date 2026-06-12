import { useEffect, useState } from "react";
import StatCard from "../components/StatCard.jsx";
import { getDashboardSummary, getPayments } from "../api/client.js";
import {
  formatCurrencyLkr,
  formatDateTime,
  formatNumber,
  statusBadgeClass,
} from "../utils/format.js";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [summaryResponse, paymentsResponse] = await Promise.all([
          getDashboardSummary(),
          getPayments({ limit: 5 }),
        ]);

        setSummary(summaryResponse?.data ?? null);
        setRecentPayments(paymentsResponse?.data ?? []);
      } catch (dashboardError) {
        setError(dashboardError.message || "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = summary
    ? [
        { title: "Total Fines", value: formatNumber(summary.totalFines), trend: `${formatNumber(summary.totalPaid)} paid` },
        { title: "Total Revenue", value: formatCurrencyLkr(summary.totalRevenue), trend: `${formatNumber(summary.totalCancelled)} cancelled` },
        { title: "Paid Fines", value: formatNumber(summary.totalPaid), trend: `${formatNumber(summary.totalPending)} pending` },
        { title: "Pending Fines", value: formatNumber(summary.totalPending), trend: "Live count from backend" },
      ]
    : [
        { title: "Total Fines", value: loading ? "Loading..." : "—" },
        { title: "Total Revenue", value: loading ? "Loading..." : "—" },
        { title: "Paid Fines", value: loading ? "Loading..." : "—" },
        { title: "Pending Fines", value: loading ? "Loading..." : "—" },
      ];

  return (
    <div>
      <section className="grid grid-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="section card">
        <h3>Recent Payments</h3>
        {error ? <div className="alert alert-error">{error}</div> : null}
        <table className="table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Officer</th>
              <th>Amount</th>
              <th>Paid At</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentPayments.length > 0 ? (
              recentPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.fine?.referenceNo || payment.receiptNo}</td>
                  <td>{payment.fine?.officer?.user?.name || payment.fine?.officer?.badgeNo || "—"}</td>
                  <td>{formatCurrencyLkr(payment.amount)}</td>
                  <td>{formatDateTime(payment.paidAt)}</td>
                  <td><span className={statusBadgeClass(payment.status)}>{payment.status}</span></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">{loading ? "Loading payments..." : "No recent payments found."}</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
