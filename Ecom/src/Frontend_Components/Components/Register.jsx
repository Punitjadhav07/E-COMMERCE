import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../Api/api";  // ← import from your api
import "../Components_css/register.css";

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "CUSTOMER",  // ← default to CUSTOMER or SELLER
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const passwordsMismatch =
    formData.confirmPassword &&
    formData.password !== formData.confirmPassword;

  const handleRegister = async () => {
    if (passwordsMismatch) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Send to backend (writes to DB and sends OTP)
      const response = await registerUser({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      setSuccess("✅ Registered successfully! Redirecting to verification...");
      
      // Redirect to verify-otp page after a short delay
      setTimeout(() => {
        navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registerContainer">
      <div>
        <h1>Register</h1>

        <label>Full Name</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        <label>Role</label>
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="CUSTOMER">Customer</option>
          <option value="SELLER">Seller</option>
        </select>

        <label>Password</label>
        <input
          type="password"
          name="password"
          className={passwordsMismatch ? "error" : ""}
          value={formData.password}
          onChange={handleChange}
        />

        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          className={passwordsMismatch ? "error" : ""}
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        {passwordsMismatch && (
          <p className="errorText">Passwords do not match</p>
        )}
        {error && <p className="errorText">{error}</p>}
        {success && <p className="successText">{success}</p>}

        <div className="action_buttons">
          <button className="login" onClick={() => navigate("/")}>
            Back
          </button>
          <button
            className="register"
            disabled={passwordsMismatch || loading}
            onClick={handleRegister}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
};
