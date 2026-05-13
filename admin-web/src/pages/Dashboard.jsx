import StatCard from "../components/StatCard.jsx";

const stats = [
  { title: "Total Fines", value: "12,480", trend: "+8% this month" },
  { title: "Total Revenue", value: "LKR 58.2M", trend: "+12%" },
  { title: "Paid Today", value: "1,204", trend: "+4%" },
  { title: "Pending Fines", value: "620", trend: "-3%" },
];

const recentPayments = [
  {
    ref: "TF-20491",
    officer: "Inspector Perera",
    amount: "LKR 5,000",
    status: "Paid",
  },
  {
    ref: "TF-20492",
    officer: "SI Silva",
    amount: "LKR 2,500",
    status: "Paid",
  },
  {
    ref: "TF-20493",
    officer: "IP Fernando",
    amount: "LKR 7,500",
    status: "Pending",
  },
];

export default function Dashboard() {
  return (
    <div>
      <section className="grid grid-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="section card">
        <h3>Recent Payments</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Officer</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentPayments.map((payment) => (
              <tr key={payment.ref}>
                <td>{payment.ref}</td>
                <td>{payment.officer}</td>
                <td>{payment.amount}</td>
                <td>
                  <span className="badge">{payment.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
