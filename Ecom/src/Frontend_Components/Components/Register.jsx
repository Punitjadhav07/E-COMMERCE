import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../Components_css/register.css";

export const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const passwordsMismatch =
    formData.confirmPassword &&
    formData.password !== formData.confirmPassword;

  return (
    <div className="registerContainer">
      <div>
        <h1>Register</h1>

        {/* Full Name */}
        <label>Full Name</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
        />

        {/* Username */}
        <label>Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
        />

        {/* Email */}
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        {/* Password */}
        <label>Password</label>
        <input
          type="password"
          name="password"
          className={passwordsMismatch ? "error" : ""}
          value={formData.password}
          onChange={handleChange}
        />

        {/* Confirm Password */}
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

        <div className="action_buttons">
          <button className="login" onClick={() => navigate("/")}>
            Back
          </button>
          <button className="register" disabled={passwordsMismatch}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
};