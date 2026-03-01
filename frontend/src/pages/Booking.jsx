import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tour, setTour] = useState(null);
  const [formData, setFormData] = useState({
    client_name: "",
    email: "",
    phone_number: "",
    number_of_people: 1,
    travel_date: "",
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch tour details
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/tours/")
      .then((res) => res.json())
      .then((data) => {
        const selectedTour = data.find(t => t.id === parseInt(id));
        if (selectedTour) {
          setTour(selectedTour);
        }
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      alert("Please login first");
      navigate("/login");
      return;
    }

    // Get today's date in YYYY-MM-DD format for comparison
    const today = new Date().toISOString().split('T')[0];
    
    // Validate travel date
    if (formData.travel_date && formData.travel_date < today) {
      setLoading(false);
      setError("Travel date cannot be in the past. Please select a valid date.");
      return;
    }

    fetch("http://127.0.0.1:8000/api/bookings/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`,
      },
      body: JSON.stringify({
        tour_id: parseInt(id),
        client_name: formData.client_name,
        email: formData.email,
        phone_number: formData.phone_number,
        number_of_people: parseInt(formData.number_of_people),
        travel_date: formData.travel_date || null,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setLoading(false);
        if (data.error) {
          setError(data.error);
        } else {
          setSuccess(true);
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
        setError("Booking failed. Try again.");
      });
  };

  if (!tour) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading tour details...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Book Tour: {tour.name}</h2>
          <div style={styles.tourInfo}>
            <span style={styles.price}>${tour.price}</span>
            <span style={styles.duration}>Duration: {tour.duration_days} day(s)</span>
          </div>
        </div>

        {success && (
          <div style={styles.successMessage}>
            ✓ Booking successful! Redirecting to dashboard...
          </div>
        )}

        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              name="client_name"
              placeholder="Enter your full name"
              value={formData.client_name}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address *</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number *</label>
            <input
              type="tel"
              name="phone_number"
              placeholder="Enter your phone number"
              value={formData.phone_number}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Number of People *</label>
            <input
              type="number"
              name="number_of_people"
              placeholder="Number of people"
              value={formData.number_of_people}
              onChange={handleChange}
              min="1"
              max={tour.available_slots}
              required
              style={styles.input}
            />
            <small style={styles.hint}>Available slots: {tour.available_slots}</small>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Preferred Travel Date</label>
            <input
              type="date"
              name="travel_date"
              value={formData.travel_date}
              onChange={handleChange}
              style={styles.input}
            />
            <small style={styles.hint}>Select your preferred travel date (optional)</small>
          </div>

          <div style={styles.summary}>
            <h3 style={styles.summaryTitle}>Booking Summary</h3>
            <div style={styles.summaryRow}>
              <span>Tour:</span>
              <span>{tour.name}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Price per person:</span>
              <span>${tour.price}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Number of people:</span>
              <span>{formData.number_of_people}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Travel date:</span>
              <span>{formData.travel_date || 'Not specified'}</span>
            </div>
            <div style={{...styles.summaryRow, ...styles.totalRow}}>
              <span>Total:</span>
              <span>${(parseFloat(tour.price) * parseInt(formData.number_of_people || 0)).toFixed(2)}</span>
            </div>
          </div>

          <button 
            type="submit" 
            style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "700px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    fontSize: "18px",
    color: "#1161f5",
  },
  card: {
    backgroundColor: "#776074",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#2c3e50",
    color: "#fff",
    padding: "25px 30px",
    borderBottom: "1px solid #eee",
  },
  title: {
    margin: "0 0 10px 0",
    fontSize: "24px",
    fontWeight: "600",
  },
  tourInfo: {
    display: "flex",
    gap: "20px",
    fontSize: "14px",
    opacity: "0.9",
  },
  price: {
    backgroundColor: "#27ae60",
    padding: "4px 12px",
    borderRadius: "20px",
    fontWeight: "600",
  },
  duration: {
    padding: "4px 0",
  },
  form: {
    padding: "30px",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#333",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "15px",
    transition: "border-color 0.3s, box-shadow 0.3s",
    boxSizing: "border-box",
  },
  hint: {
    display: "block",
    marginTop: "5px",
    color: "#7f8c8d",
    fontSize: "12px",
  },
  summary: {
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "25px",
    border: "1px solid #e9ecef",
  },
  summaryTitle: {
    margin: "0 0 15px 0",
    fontSize: "16px",
    color: "#2c3e50",
    borderBottom: "1px solid #dee2e6",
    paddingBottom: "10px",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    fontSize: "14px",
    color: "#555",
  },
  totalRow: {
    marginTop: "15px",
    paddingTop: "15px",
    borderTop: "1px solid #dee2e6",
    fontSize: "18px",
    fontWeight: "700",
    color: "#2c3e50",
  },
  button: {
    width: "100%",
    padding: "15px",
    backgroundColor: "#27ae60",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  buttonDisabled: {
    backgroundColor: "#95a5a6",
    cursor: "not-allowed",
  },
  successMessage: {
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "15px 20px",
    borderRadius: "8px",
    margin: "20px 30px",
    border: "1px solid #c3e6cb",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  errorMessage: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "15px 20px",
    borderRadius: "8px",
    margin: "20px 30px",
    border: "1px solid #f5c6cb",
    fontSize: "14px",
  },
};

export default Booking;
