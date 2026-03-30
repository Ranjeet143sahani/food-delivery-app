import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          setError("Please login to view your orders");
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:5000/api/orders", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) {
          if (res.status === 401) {
            setError("Session expired. Please login again.");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          } else {
            throw new Error("Failed to fetch orders");
          }
          return;
        }

        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "#10B981";
      case "Preparing":
        return "#3B82F6";
      case "Pending":
        return "#F59E0B";
      case "Cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return "✅";
      case "Preparing":
        return "👨‍🍳";
      case "Pending":
        return "⏳";
      case "Cancelled":
        return "❌";
      default:
        return "📋";
    }
  };

  const getItemNames = (items) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map(item => item.name || item);
  };

  return (
    <div style={{ padding: "40px 20px", minHeight: "80vh", background: "#F9FAFB" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "30px", color: "#111" }}>📋 My Orders</h1>

        <div style={{ display: "flex", gap: "15px", marginBottom: "30px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ background: "#F59E0B", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", color: "white" }}>⏳ Pending</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ background: "#3B82F6", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", color: "white" }}>👨‍🍳 Preparing</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ background: "#10B981", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", color: "white" }}>✅ Delivered</span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Loading your orders...</p>
          </div>
        ) : error ? (
          <div style={{ background: "white", borderRadius: "10px", padding: "60px 20px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: "60px", marginBottom: "20px" }}>⚠️</div>
            <h2 style={{ color: "#666", marginBottom: "10px" }}>{error}</h2>
            <p style={{ color: "#999", marginBottom: "30px" }}>
              {error.includes("login") ? "Please login to view your orders" : "Please try again later"}
            </p>
            <Link to="/login" style={{ background: "#ff6347", color: "white", padding: "10px 20px", textDecoration: "none", borderRadius: "5px" }}>
              Login
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ background: "white", borderRadius: "10px", padding: "60px 20px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: "60px", marginBottom: "20px" }}>📦</div>
            <h2 style={{ color: "#666", marginBottom: "10px" }}>No Orders Yet</h2>
            <p style={{ color: "#999", marginBottom: "30px" }}>Start by ordering some delicious food!</p>
            <Link to="/" style={{ background: "#ff6347", color: "white", padding: "10px 20px", textDecoration: "none", borderRadius: "5px" }}>
              Browse Menu
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {orders.map((order) => (
              <div key={order._id} style={{ background: "white", borderRadius: "10px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderLeft: `4px solid ${getStatusColor(order.status)}` }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "20px", marginBottom: "15px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 10px 0", color: "#111" }}>Order #{order._id.slice(-8).toUpperCase()}</h3>
                    <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
                      Ordered on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    {order.vendorId?.restaurantName && (
                      <p style={{ margin: "5px 0 0 0", fontWeight: "bold", color: "#3B82F6", fontSize: "16px" }}>
                        🍽️ {order.vendorId.restaurantName}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-block", background: getStatusColor(order.status), color: "white", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                      {getStatusIcon(order.status)} {order.status}
                    </div>
                  </div>
                </div>

                <div style={{ background: "#F3F4F6", padding: "15px", borderRadius: "5px", marginBottom: "15px" }}>
                  <p style={{ margin: "0 0 10px 0", color: "#666", fontSize: "14px", fontWeight: "bold" }}>Items:</p>
                  <ul style={{ listStyle: "none", padding: "0", margin: "0" }}>
                    {getItemNames(order.items).map((item, idx) => (
                      <li key={idx} style={{ padding: "5px 0", color: "#333" }}>✓ {item}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>Total Amount</p>
                    <p style={{ margin: "5px 0 0 0", fontSize: "20px", fontWeight: "bold", color: "#111" }}>₹{order.totalAmount}</p>
                  </div>
                  {order.status === "Delivered" && (
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: "0 0 5px 0", color: "#666", fontSize: "12px" }}>How was your order?</p>
                      <div style={{ fontSize: "20px" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} style={{ cursor: "pointer", opacity: 0.3, marginRight: "5px" }}>⭐</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;
