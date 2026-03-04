import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/api";
function emptyTourForm() {
  return {
    name: "",
    description: "",
    price: "",
    duration_days: "",
    available_slots: "",
    tour_date: "",
    tour_time: "",
  };
}

function formatApiError(errorValue, fallbackMessage) {
  if (!errorValue) return fallbackMessage;
  if (typeof errorValue === "string") return errorValue;
  if (Array.isArray(errorValue)) return errorValue.join(", ");
  if (typeof errorValue === "object") {
    return Object.entries(errorValue)
      .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
      .join(" | ");
  }
  return fallbackMessage;
}

function Admin() {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingTourId, setEditingTourId] = useState(null);
  const [tourForm, setTourForm] = useState(emptyTourForm());
  const [createForm, setCreateForm] = useState(emptyTourForm());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.is_staff) {
      navigate("/");
      return;
    }
    fetchData();
  }, [navigate]);

  const authHeaders = (json = false) => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Token ${token}` };
    if (json) headers["Content-Type"] = "application/json";
    return headers;
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [toursRes, bookingsRes] = await Promise.all([
        fetch(apiUrl("/api/admin/tours/"), { headers: authHeaders() }),
        fetch(apiUrl("/api/admin/bookings/"), { headers: authHeaders() }),
      ]);

      if (!toursRes.ok) {
        throw new Error("Admin access required");
      }
      const toursData = await toursRes.json();
      setTours(Array.isArray(toursData) ? toursData : []);

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      }
    } catch (err) {
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleCreateTour = async (e) => {
    e.preventDefault();
    clearMessages();
    setActionLoading(true);
    try {
      const res = await fetch(apiUrl("/api/admin/tours/"), {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify(createForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(formatApiError(data.error, "Failed to create tour"));
      setSuccess("Tour created successfully");
      setCreateForm(emptyTourForm());
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to create tour");
    } finally {
      setActionLoading(false);
    }
  };

  const startEditTour = (tour) => {
    setEditingTourId(tour.id);
    setTourForm({
      name: tour.name || "",
      description: tour.description || "",
      price: tour.price ?? "",
      duration_days: tour.duration_days ?? "",
      available_slots: tour.available_slots ?? "",
      tour_date: tour.tour_date || "",
      tour_time: tour.tour_time || "",
    });
  };

  const cancelEditTour = () => {
    setEditingTourId(null);
    setTourForm(emptyTourForm());
  };

  const saveTour = async (tourId) => {
    clearMessages();
    setActionLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/admin/tours/${tourId}/`), {
        method: "PUT",
        headers: authHeaders(true),
        body: JSON.stringify(tourForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(formatApiError(data.error, "Failed to update tour"));
      setSuccess("Tour updated successfully");
      cancelEditTour();
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to update tour");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteTour = async (tourId) => {
    if (!window.confirm("Delete this tour?")) return;
    clearMessages();
    setActionLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/admin/tours/${tourId}/`), {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(formatApiError(data.error, "Failed to delete tour"));
      setSuccess("Tour deleted successfully");
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to delete tour");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteBooking = async (bookingId) => {
    if (!window.confirm("Delete this booking and restore tour slots?")) return;
    clearMessages();
    setActionLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/admin/bookings/${bookingId}/`), {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(formatApiError(data.error, "Failed to delete booking"));
      setSuccess("Booking deleted successfully");
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to delete booking");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><h2>Loading admin dashboard...</h2></div>;
  }

  return (
    <div className="container" style={{ textAlign: "left" }}>
      <h2>Admin Dashboard</h2>
      <p style={{ color: "#666" }}>Manage tours and bookings without Django admin.</p>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button className="btn" onClick={() => setActiveTab("overview")}>Overview</button>
        <button className="btn" onClick={() => setActiveTab("tours")}>Tours</button>
        <button className="btn" onClick={() => setActiveTab("bookings")}>Bookings</button>
      </div>

      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "12px" }}>
          <div className="card">
            <h4>Total Tours</h4>
            <p style={{ fontSize: "28px", margin: 0 }}>{tours.length}</p>
          </div>
          <div className="card">
            <h4>Total Bookings</h4>
            <p style={{ fontSize: "28px", margin: 0 }}>{bookings.length}</p>
          </div>
          <div className="card">
            <h4>Open Slots</h4>
            <p style={{ fontSize: "28px", margin: 0 }}>
              {tours.reduce((acc, t) => acc + Number(t.available_slots || 0), 0)}
            </p>
          </div>
        </div>
      )}

      {activeTab === "tours" && (
        <div>
          <h3>Create Tour</h3>
          <form onSubmit={handleCreateTour} className="card" style={{ marginBottom: "20px" }}>
            <div className="form-group"><label>Name</label><input name="name" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} required /></div>
            <div className="form-group"><label>Description</label><textarea name="description" value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} rows="3" /></div>
            <div className="form-group"><label>Price</label><input name="price" type="number" step="0.01" value={createForm.price} onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })} required /></div>
            <div className="form-group"><label>Duration Days</label><input name="duration_days" type="number" value={createForm.duration_days} onChange={(e) => setCreateForm({ ...createForm, duration_days: e.target.value })} required /></div>
            <div className="form-group"><label>Available Slots</label><input name="available_slots" type="number" value={createForm.available_slots} onChange={(e) => setCreateForm({ ...createForm, available_slots: e.target.value })} required /></div>
            <div className="form-group"><label>Tour Date</label><input name="tour_date" type="date" value={createForm.tour_date} onChange={(e) => setCreateForm({ ...createForm, tour_date: e.target.value })} /></div>
            <div className="form-group"><label>Tour Time</label><input name="tour_time" type="time" value={createForm.tour_time} onChange={(e) => setCreateForm({ ...createForm, tour_time: e.target.value })} /></div>
            <button className="btn" type="submit" disabled={actionLoading}>Create Tour</button>
          </form>

          <h3>Manage Tours</h3>
          <div style={{ display: "grid", gap: "12px" }}>
            {tours.map((tour) => (
              <div key={tour.id} className="card">
                {editingTourId === tour.id ? (
                  <div>
                    <div className="form-group"><label>Name</label><input name="name" value={tourForm.name} onChange={(e) => setTourForm({ ...tourForm, name: e.target.value })} /></div>
                    <div className="form-group"><label>Description</label><textarea name="description" value={tourForm.description} onChange={(e) => setTourForm({ ...tourForm, description: e.target.value })} rows="3" /></div>
                    <div className="form-group"><label>Price</label><input name="price" type="number" step="0.01" value={tourForm.price} onChange={(e) => setTourForm({ ...tourForm, price: e.target.value })} /></div>
                    <div className="form-group"><label>Duration Days</label><input name="duration_days" type="number" value={tourForm.duration_days} onChange={(e) => setTourForm({ ...tourForm, duration_days: e.target.value })} /></div>
                    <div className="form-group"><label>Available Slots</label><input name="available_slots" type="number" value={tourForm.available_slots} onChange={(e) => setTourForm({ ...tourForm, available_slots: e.target.value })} /></div>
                    <div className="form-group"><label>Tour Date</label><input name="tour_date" type="date" value={tourForm.tour_date || ""} onChange={(e) => setTourForm({ ...tourForm, tour_date: e.target.value })} /></div>
                    <div className="form-group"><label>Tour Time</label><input name="tour_time" type="time" value={tourForm.tour_time || ""} onChange={(e) => setTourForm({ ...tourForm, tour_time: e.target.value })} /></div>
                    <button className="btn" onClick={() => saveTour(tour.id)} disabled={actionLoading}>Save</button>
                    <button className="btn" style={{ marginLeft: "8px", background: "#888" }} onClick={cancelEditTour}>Cancel</button>
                  </div>
                ) : (
                  <div>
                    <h4 style={{ marginTop: 0 }}>{tour.name}</h4>
                    <p><strong>Price:</strong> ${tour.price}</p>
                    <p><strong>Duration:</strong> {tour.duration_days} days</p>
                    <p><strong>Slots:</strong> {tour.available_slots}</p>
                    <p><strong>Date:</strong> {tour.tour_date || "N/A"} | <strong>Time:</strong> {tour.tour_time || "N/A"}</p>
                    <p>{tour.description || "No description"}</p>
                    <button className="btn" onClick={() => startEditTour(tour)}>Edit</button>
                    <button className="btn" style={{ marginLeft: "8px", background: "#c0392b" }} onClick={() => deleteTour(tour.id)}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "bookings" && (
        <div>
          <h3>Manage Bookings</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#2a5298", color: "white" }}>
                  <th style={{ padding: "8px", textAlign: "left" }}>ID</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Client</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Tour</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>People</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Email</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Phone</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Travel Date</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Booked On</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "8px" }}>#{booking.id}</td>
                    <td style={{ padding: "8px" }}>{booking.client_name}</td>
                    <td style={{ padding: "8px" }}>{booking.tour?.name || "N/A"}</td>
                    <td style={{ padding: "8px" }}>{booking.number_of_people}</td>
                    <td style={{ padding: "8px" }}>{booking.email}</td>
                    <td style={{ padding: "8px" }}>{booking.phone_number}</td>
                    <td style={{ padding: "8px" }}>{booking.travel_date || "N/A"}</td>
                    <td style={{ padding: "8px" }}>{booking.booking_date ? new Date(booking.booking_date).toLocaleString() : "N/A"}</td>
                    <td style={{ padding: "8px" }}>
                      <button className="btn" style={{ background: "#c0392b" }} onClick={() => deleteBooking(booking.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
