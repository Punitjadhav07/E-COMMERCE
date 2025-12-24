import { Routes, Route } from "react-router-dom";
import { Login } from "./Frontend_Components/Components/Login";
import { Register } from "./Frontend_Components/Components/Register";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;