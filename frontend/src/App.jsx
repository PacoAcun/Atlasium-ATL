import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/wallet" element={<Wallet />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;
