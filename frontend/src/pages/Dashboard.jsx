import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://127.0.0.1:8000/api/my-bookings/", {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch bookings");
        }
        return res.json();
      })
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setError("Error loading bookings. Please try again.");
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading your bookings...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>My Bookings</h2>

      {error && <div style={styles.errorMessage}>{error}</div>}

      {bookings.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>You haven't made any bookings yet.</p>
          <button style={styles.browseButton} onClick={() => navigate("/tours")}>
            Browse Available Tours
          </button>
        </div>
      ) : (
        <div>
          <p style={styles.totalCount}>Total Bookings: {bookings.length}</p>
          {bookings.map((booking) => (
            <div key={booking.id} style={styles.bookingCard}>
              <div style={styles.cardHeader}>
                <h3 style={styles.tourName}>{booking.tour?.name || 'Tour'}</h3>
                <span style={styles.bookingId}>#{booking.id}</span>
              </div>
              
              <div style={styles.cardBody}>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Client Name:</span>
                  <span style={styles.value}>{booking.client_name}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Email:</span>
                  <span style={styles.value}>{booking.email}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Number of People:</span>
                  <span style={styles.value}>{booking.number_of_people}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Travel Date:</span>
                  <span style={styles.value}>
                    {booking.travel_date ? new Date(booking.travel_date).toLocaleDateString() : 'Not specified'}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Booked On:</span>
                  <span style={styles.value}>
                    {booking.booking_date ? new Date(booking.booking_date).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div style={{...styles.infoRow, ...styles.priceRow}}>
                  <span style={styles.label}>Total Price:</span>
                  <span style={styles.price}>${booking.tour?.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    fontSize: "18px",
    color: "#666",
  },
  pageTitle: {
    fontSize: "28px",
    color: "#2c3e50",
    marginBottom: "25px",
    borderBottom: "2px solid #3498db",
    paddingBottom: "10px",
  },
  errorMessage: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "15px 20px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid #f5c6cb",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
  },
  emptyText: {
    fontSize: "18px",
    color: "#666",
    marginBottom: "20px",
  },
  browseButton: {
    padding: "12px 30px",
    backgroundColor: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  totalCount: {
    fontSize: "16px",
    color: "#7f8c8d",
    marginBottom: "20px",
  },
  bookingCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
    marginBottom: "20px",
    overflow: "hidden",
  },
  cardHeader: {
    backgroundColor: "#2c3e50",
    color: "#fff",
    padding: "15px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tourName: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "600",
  },
  bookingId: {
    fontSize: "12px",
    opacity: "0.8",
  },
  cardBody: {
    padding: "20px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #f0f0f0",
    fontSize: "14px",
  },
  label: {
    color: "#7f8c8d",
    fontWeight: "500",
  },
  value: {
    color: "#2c3e50",
    fontWeight: "600",
  },
  priceRow: {
    borderBottom: "none",
    marginTop: "10px",
    paddingTop: "15px",
  },
  price: {
    color: "#27ae60",
    fontSize: "18px",
    fontWeight: "700",
  },
};

export default Dashboard;
