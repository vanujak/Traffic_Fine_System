import { useEffect, useState } from "react";
import { getPayments } from "../api/client.js";
import { formatCurrencyLkr, formatDateTime, statusBadgeClass } from "../utils/format.js";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getPayments({ limit: 50 });
        setPayments(response?.data ?? []);
      } catch (paymentError) {
        setError(paymentError.message || "Unable to load payments.");
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  return (
    <section className="card">
      <h3>Payments</h3>
      {error ? <div className="alert alert-error">{error}</div> : null}
      <table className="table">
        <thead>
          <tr>
            <th>Receipt</th>
            <th>Reference</th>
            <th>Payer</th>
            <th>Channel</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Paid At</th>
          </tr>
        </thead>
        <tbody>
          {payments.length > 0 ? (
            payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.receiptNo}</td>
                <td>{payment.fine?.referenceNo || "—"}</td>
                <td>{payment.payerName}</td>
                <td>{payment.paymentMethod}</td>
                <td>{formatCurrencyLkr(payment.amount)}</td>
                <td><span className={statusBadgeClass(payment.status)}>{payment.status}</span></td>
                <td>{formatDateTime(payment.paidAt)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">{loading ? "Loading payments..." : "No payments found."}</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
