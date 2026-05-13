import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Reports from "./pages/Reports.jsx";
import Fines from "./pages/Fines.jsx";
import Payments from "./pages/Payments.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/fines" element={<Fines />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
