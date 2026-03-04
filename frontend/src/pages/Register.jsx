import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import { apiUrl } from "../config/api";

function formatApiError(errorValue, fallbackMessage) {
  if (!errorValue) return fallbackMessage;
  if (typeof errorValue === "string") return errorValue;
  if (Array.isArray(errorValue)) return errorValue.join(", ");
  if (typeof errorValue === "object") {
    const messages = Object.entries(errorValue).map(([field, value]) => {
      if (Array.isArray(value)) return `${field}: ${value.join(", ")}`;
      if (typeof value === "string") return `${field}: ${value}`;
      return `${field}: ${JSON.stringify(value)}`;
    });
    return messages.join(" | ");
  }
  return fallbackMessage;
}

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password1: "",
    password2: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password1 !== formData.password2) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(apiUrl("/api/register/"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password1,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setError(formatApiError(data.error, "Registration failed"));
      } else {
        alert("Registration successful! Please login.");
        navigate("/login");
      }
    } catch (err) {
      setError(`Server error: ${err.message || "Try again."}`);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Client Registration</h2>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
          <input type="text" name="first_name" placeholder="First Name" onChange={handleChange} required />
          <input type="text" name="last_name" placeholder="Last Name" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password1" placeholder="Password" onChange={handleChange} required />
          <input type="password" name="password2" placeholder="Confirm Password" onChange={handleChange} required />

          <button type="submit">Register</button>
        </form>

        <div className="login-link">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")} className="login-click">
            Login here
          </span>
        </div>
      </div>
    </div>
  );
}

export default Register;
