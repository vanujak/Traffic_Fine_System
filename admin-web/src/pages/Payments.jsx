const payments = [
  { ref: "TF-20491", channel: "Mobile", amount: "LKR 5,000" },
  { ref: "TF-20492", channel: "Web", amount: "LKR 2,500" },
  { ref: "TF-20493", channel: "Web", amount: "LKR 7,500" },
];

export default function Payments() {
  return (
    <section className="card">
      <h3>Payments</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Channel</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.ref}>
              <td>{payment.ref}</td>
              <td>{payment.channel}</td>
              <td>{payment.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
