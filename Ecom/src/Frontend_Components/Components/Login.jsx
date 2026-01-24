import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../Api/api";  // ← import from your api
import "../Components_css/login.css";

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false) ;
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await loginUser({
        email,
        password,
      });

      const userData = response.data.user;

      // save user info
      localStorage.setItem("user", JSON.stringify(userData));
      alert(`✅ Welcome ${userData.email} (${userData.role})`);
      
      // route based on role
      if (userData.role === "ADMIN") {
        navigate("/admin");
      } else if (userData.role === "SELLER") {
        navigate("/seller-dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      // Check if user is not verified
      if (err.response?.status === 403 && err.response?.data?.verified === false) {
        setError(err.response?.data?.error || "Email not verified");
        // Optionally redirect to verify-otp after 2 seconds
        setTimeout(() => {
          navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setError(err.response?.data?.error || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginContainer">
      <div>
        <h1>Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <h1>Password</h1>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="errorText">{error}</p>}

        <div className="action_buttons">
          <button className="login" onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            className="register"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};
  