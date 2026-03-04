import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
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

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
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

    if (!formData.username || !formData.password) {
      setError("All fields are required");
      return;
    }

    try {
      const response = await fetch(apiUrl("/api/login/"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setError(formatApiError(data.error, `Login failed (${response.status})`));
        return;
      }

      // Save token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        id: data.user_id,
        username: data.username,
        is_staff: data.is_staff || false
      }));

      // Dispatch custom event to notify Navbar (works in same tab)
      window.dispatchEvent(new Event("authChange"));

      alert("Login successful!");
      navigate(data.is_staff ? "/admin" : "/tours");

    } catch (err) {
      setError(`Server error: ${err.message || "Try again."}`);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Client Login</h2>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <button type="submit">Login</button>
        </form>

        <div className="links">
          <span onClick={() => navigate("/register")}>
            if you haven't account,Register here
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
