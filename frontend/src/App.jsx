import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { EventProvider } from "./context/EventContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import TopUp from "./pages/TopUp";
import ScanPay from "./pages/ScanPay";
import CreateEvent from "./pages/CreateEvent";
import EventDashboard from "./pages/EventDashboard";
import EventAudit from "./pages/EventAudit";
import Wallet from "./pages/Wallet";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EventProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/topup"
              element={
                <ProtectedRoute>
                  <TopUp />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scan"
              element={
                <ProtectedRoute>
                  <ScanPay />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-event"
              element={
                <ProtectedRoute>
                  <CreateEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/event-dashboard"
              element={
                <ProtectedRoute>
                  <EventDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/event-audit"
              element={
                <ProtectedRoute>
                  <EventAudit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <Wallet />
                </ProtectedRoute>
              }
            />
          </Routes>
        </EventProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
