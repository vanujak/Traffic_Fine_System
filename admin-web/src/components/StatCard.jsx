export default function StatCard({ title, value, trend }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{value}</p>
      {trend ? <div className="badge">{trend}</div> : null}
    </div>
  );
}
