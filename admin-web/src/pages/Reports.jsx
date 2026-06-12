import { useEffect, useMemo, useState } from "react";
import { getCategoryReport, getDistrictReport, getRevenueReport, getDashboardSummary } from "../api/client.js";
import { formatCurrencyLkr, formatNumber } from "../utils/format.js";

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      setError("");
      try {
        const currentYear = new Date().getFullYear();
        const [summaryResponse, districtResponse, categoryResponse, revenueResponse] = await Promise.all([
          getDashboardSummary(),
          getDistrictReport(),
          getCategoryReport(),
          getRevenueReport({ year: currentYear }),
        ]);

        setSummary(summaryResponse?.data ?? null);
        setDistricts(districtResponse?.data ?? []);
        setCategories(categoryResponse?.data ?? []);
        setRevenue(revenueResponse?.data?.monthly ?? []);
      } catch (reportsError) {
        setError(reportsError.message || "Unable to load reports.");
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const metrics = useMemo(() => {
    if (!summary) {
      return [
        { title: "Total Revenue", value: loading ? "Loading..." : "—" },
        { title: "Paid Fines", value: loading ? "Loading..." : "—" },
        { title: "Pending Fines", value: loading ? "Loading..." : "—" },
        { title: "Cancelled Fines", value: loading ? "Loading..." : "—" },
      ];
    }

    return [
      { title: "Total Revenue", value: formatCurrencyLkr(summary.totalRevenue) },
      { title: "Paid Fines", value: formatNumber(summary.totalPaid) },
      { title: "Pending Fines", value: formatNumber(summary.totalPending) },
      { title: "Cancelled Fines", value: formatNumber(summary.totalCancelled) },
    ];
  }, [summary, loading]);

  return (
    <div className="report-stack">
      <section className="grid grid-4">
        {metrics.map((metric) => (
          <article className="card" key={metric.title}>
            <h3>{metric.title}</h3>
            <p>{metric.value}</p>
          </article>
        ))}
      </section>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="card section">
        <h3>District Report</h3>
        <table className="table">
          <thead>
            <tr>
              <th>District</th>
              <th>Total Fines</th>
              <th>Paid</th>
              <th>Pending</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {districts.length > 0 ? (
              districts.map((district) => (
                <tr key={district.districtId}>
                  <td>{district.district}</td>
                  <td>{formatNumber(district.totalFines)}</td>
                  <td>{formatNumber(district.paidFines)}</td>
                  <td>{formatNumber(district.pendingFines)}</td>
                  <td>{formatCurrencyLkr(district.totalRevenue)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">{loading ? "Loading districts..." : "No district report data."}</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="card section">
        <h3>Category Report</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Standard Amount</th>
              <th>Total Fines</th>
              <th>Paid</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((category) => (
                <tr key={category.categoryId}>
                  <td>{category.category}</td>
                  <td>{formatCurrencyLkr(category.standardAmount)}</td>
                  <td>{formatNumber(category.totalFines)}</td>
                  <td>{formatNumber(category.paidFines)}</td>
                  <td>{formatCurrencyLkr(category.totalRevenue)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">{loading ? "Loading categories..." : "No category report data."}</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="card section">
        <h3>Monthly Revenue</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Payments</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {revenue.length > 0 ? (
              revenue.map((row) => (
                <tr key={row.month}>
                  <td>{row.monthName}</td>
                  <td>{formatNumber(row.totalPayments)}</td>
                  <td>{formatCurrencyLkr(row.totalRevenue)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">{loading ? "Loading revenue..." : "No monthly revenue data."}</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
