import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Admin() {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("tours");
  const [editingTour, setEditingTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [tourForm, setTourForm] = useState({
    name: "",
    description: "",
    price: "",
    duration_days: "",
    available_slots: "",
    tour_date: "",
    tour_time: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.is_staff) {
      navigate("/");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    try {
      const toursRes = await fetch("http://127.0.0.1:8000/api/admin/tours/", {
        headers: {
          "Authorization": `Token ${token}`,
        },
      });
      
      if (!toursRes.ok) {
        throw new Error("Admin access required");
      }
      
      const toursData = await toursRes.json();
      setTours(toursData);

      const bookingsRes = await fetch("http://127.0.0.1:8000/api/admin/bookings/", {
        headers: {
          "Authorization": `Token ${token}`,
        },
      });
      
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }
    } catch (err) {
      setError(err.message);
    }
    
    setLoading(false);
  };

  const handleEditTour = (tour) => {
    setEditingTour(tour.id);
    setTourForm({
      name: tour.name,
      description: tour.description || "",
      price: tour.price,
      duration_days: tour.duration_days,
      available_slots: tour.available_slots,
      tour_date: tour.tour_date || "",
      tour_time: tour.tour_time || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingTour(null);
    setTourForm({
      name: "",
      description: "",
      price: "",
      duration_days: "",
      available_slots: "",
      tour_date: "",
      tour_time: "",
    });
  };

  const handleTourChange = (e) => {
    setTourForm({
      ...tourForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleTourSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/tours/${editingTour}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`,
          },
          body: JSON.stringify(tourForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update tour");
      }

      setSuccess("Tour updated successfully!");
      setEditingTour(null);
      fetchData();
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  if (loading && tours.length === 0) {
    return (
      <div className="container">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      
      {error && <p className="error" style={{color: 'red'}}>{error}</p>}
      {success && <p style={{color: 'green'}}>{success}</p>}

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab("tours")} 
          style={{ 
            marginRight: '10px',
            padding: '10px 20px',
            background: activeTab === "tours" ? '#2a5298' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Manage Tours
        </button>
        <button 
          onClick={() => setActiveTab("bookings")} 
          style={{ 
            padding: '10px 20px',
            background: activeTab === "bookings" ? '#2a5298' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          View All Bookings
        </button>
      </div>

      {activeTab === "tours" && (
        <div>
          <h3>All Tours</h3>
          {tours.length === 0 ? (
            <p>No tours available.</p>
          ) : (
            <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
              {tours.map((tour) => (
                <div key={tour.id} className="card" style={{ textAlign: 'left' }}>
                  {editingTour === tour.id ? (
                    <form onSubmit={handleTourSubmit}>
                      <div className="form-group">
                        <label>Tour Name:</label>
                        <input
                          type="text"
                          name="name"
                          value={tourForm.name}
                          onChange={handleTourChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Description:</label>
                        <textarea
                          name="description"
                          value={tourForm.description}
                          onChange={handleTourChange}
                          rows="3"
                        />
                      </div>
                      <div className="form-group">
                        <label>Price:</label>
                        <input
                          type="number"
                          name="price"
                          value={tourForm.price}
                          onChange={handleTourChange}
                          required
                          step="0.01"
                        />
                      </div>
                      <div className="form-group">
                        <label>Duration (days):</label>
                        <input
                          type="number"
                          name="duration_days"
                          value={tourForm.duration_days}
                          onChange={handleTourChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Available Slots:</label>
                        <input
                          type="number"
                          name="available_slots"
                          value={tourForm.available_slots}
                          onChange={handleTourChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Tour Date:</label>
                        <input
                          type="date"
                          name="tour_date"
                          value={tourForm.tour_date}
                          onChange={handleTourChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Tour Time:</label>
                          <input
                          type="time"
                          name="tour_time"
                          value={tourForm.tour_time}
                          onChange={handleTourChange}
                        />
                      </div>
                      <button type="submit" className="btn" disabled={loading}>
                        Save Changes
                      </button>
                      <button 
                        type="button" 
                        onClick={handleCancelEdit}
                        style={{ 
                          marginLeft: '10px',
                          padding: '10px 20px',
                          background: '#ccc',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      <h4>{tour.name}</h4>
                      <p><strong>Price:</strong> ${tour.price}</p>
                      <p><strong>Duration:</strong> {tour.duration_days} days</p>
                      <p><strong>Available Slots:</strong> {tour.available_slots}</p>
                      <p><strong>Date:</strong> {tour.tour_date}</p>
                      <p><strong>Time:</strong> {tour.tour_time}</p>
                      {tour.description && <p>{tour.description}</p>}
                      <button 
                        onClick={() => handleEditTour(tour)}
                        style={{ 
                          marginTop: '10px',
                          padding: '8px 16px',
                          background: '#2a5298',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Edit Tour
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "bookings" && (
        <div>
          <h3>All Bookings</h3>
          {bookings.length === 0 ? (
            <p>No bookings available.</p>
          ) : (
            <div style={{ marginTop: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#2a5298', color: 'white' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Client</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Phone</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Tour</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>People</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Travel Date</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Booked</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '10px' }}>#{booking.id}</td>
                      <td style={{ padding: '10px' }}>{booking.client_name}</td>
                      <td style={{ padding: '10px' }}>{booking.email}</td>
                      <td style={{ padding: '10px' }}>{booking.phone_number}</td>
                      <td style={{ padding: '10px' }}>{booking.tour.name}</td>
                      <td style={{ padding: '10px' }}>{booking.number_of_people}</td>
                      <td style={{ padding: '10px' }}>{booking.travel_date || "N/A"}</td>
                      <td style={{ padding: '10px' }}>{booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Admin;
