import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { NotificationsPage } from "./pages/NotificationsPage";
import { PriorityNotifications } from "./pages/PriorityNotifications";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 10 }}>
        <nav style={{ display: "flex", gap: 10 }}>
          <Link to="/">All Notifications</Link>
          <Link to="/priority">Priority</Link>
        </nav>

        <Routes>
          <Route path="/" element={<NotificationsPage />} />
          <Route path="/priority" element={<PriorityNotifications />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}