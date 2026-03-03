import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Tours.css";

function Tours() {
  const [tours, setTours] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      // Not logged in, redirect to login
      navigate("/login");
      return;
    }

    fetch("http://127.0.0.1:8000/api/tours/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch tours");
        }
        return response.json();
      })
      .then((data) => {
        setTours(data);
      })
      .catch((err) => {
        setError("Error loading tours");
        console.error(err);
      });
  }, [navigate]);

  const handleBookNow = (tourId) => {
    navigate(`/booking/${tourId}`);
  };

  return (
    <div className="tours-container">
      <h2>Available Tours</h2>

      {error && <p className="error">{error}</p>}

      {tours.length === 0 && !error ? (
        <p>No tours available at the moment.</p>
      ) : (
        <div className="tours-grid">
          {tours.map((tour) => (
            <div key={tour.id} className="tour-card">
              <h3>{tour.title || tour.name}</h3>
              <p>{tour.description}</p>
              <p className="price">${tour.price}</p>
              <p>Duration: {tour.duration_days} days</p>
              <p>Available Slots: {tour.available_slots}</p>
              <button onClick={() => handleBookNow(tour.id)}>Book Now</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Tours;
