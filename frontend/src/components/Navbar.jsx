import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      if (token && userData) {
        setIsLoggedIn(true);
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (e) {
          setUser(null);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    // Initial check
    checkAuth();

    // Listen for storage events (works across tabs)
    const handleStorage = (e) => {
      if (e.key === "token" || e.key === "user") {
        checkAuth();
      }
    };
    window.addEventListener("storage", handleStorage);

    // Listen for custom auth change event (works in same tab)
    const handleAuthChange = () => {
      checkAuth();
    };
    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    // Dispatch event to update Navbar
    window.dispatchEvent(new Event("authChange"));
    navigate("/");
  };

  return (
    <div className="navbar">
      <h2>Booking System</h2>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>

        {!isLoggedIn && <Link to="/login">Login</Link>}
        {!isLoggedIn && <Link to="/register">-</Link>}

        {isLoggedIn && <Link to="/dashboard">Dashboard</Link>}
        {isLoggedIn && user && user.is_staff && <Link to="/admin">Admin</Link>}
        {isLoggedIn && (
          <button className="btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
      
      {isLoggedIn && user && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '20px',
          color: '#26cf4b',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          Welcome, {user.username}!
        </div>
      )}
    </div>
  );
}

export default Navbar;
