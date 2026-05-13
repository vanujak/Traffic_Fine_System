const fines = [
  { ref: "TF-30410", category: "Speeding", amount: "LKR 3,000" },
  { ref: "TF-30411", category: "Signal Violation", amount: "LKR 5,000" },
  { ref: "TF-30412", category: "Helmet", amount: "LKR 1,500" },
];

export default function Fines() {
  return (
    <section className="card">
      <h3>Fine Register</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Category</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {fines.map((fine) => (
            <tr key={fine.ref}>
              <td>{fine.ref}</td>
              <td>{fine.category}</td>
              <td>{fine.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
