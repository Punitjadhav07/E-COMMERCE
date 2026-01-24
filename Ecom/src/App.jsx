import { Routes, Route } from "react-router-dom";
import { Login } from "./Frontend_Components/Components/Login";
import { Register } from "./Frontend_Components/Components/Register";
import { VerifyOTP } from "./Frontend_Components/Components/VerifyOTP";
import AdminDashboard from "./Frontend_Components/Components/AdminDashboard";
import SellerDashboard from "./Frontend_Components/Components/SellerDashboard";
import UserHome from "./Frontend_Components/Components/UserHome";

function App() {
  return (
    <Routes>
      <Route path="/" element={<UserHome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/seller-dashboard" element={<SellerDashboard />} />
      <Route path="/home" element={<UserHome />} />
    </Routes>
  );
}

export default App;