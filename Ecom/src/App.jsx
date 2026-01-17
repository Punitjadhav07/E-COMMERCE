import { Routes, Route } from "react-router-dom";
import { Login } from "./Frontend_Components/Components/Login";
import { Register } from "./Frontend_Components/Components/Register";
import { VerifyOTP } from "./Frontend_Components/Components/VerifyOTP";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
    </Routes>
  );
}

export default App;