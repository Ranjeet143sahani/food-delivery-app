import { useEffect, useState } from "react";
import './Profile.css';

const API_URL = import.meta.env.VITE_API_URL;

function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    college: "",
    category: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  if (!token) {
    return <p style={{ textAlign: "center", color: "red" }}>Please login first</p>;
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const baseURL = API_URL || "http://localhost:5000";
        const res = await fetch(`${baseURL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        const userData = data.user || data;
        setUser(userData);
        setFormData({
          name: userData.name || "",
          phone: userData.phone || "",
          address: userData.address || "",
          college: userData.college || userData.collegetName || "",
          category: userData.category || userData.branch || ""
        });
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");

      const baseURL = API_URL || "http://localhost:5000";
      const res = await fetch(`${baseURL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const userData = data.user || data;
      setUser(userData);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      restaurant: user?.restaurant || user?.restaurantName || "",
      category: user?.category || user?.branch || ""
    });
    setIsEditing(false);
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div style={{ padding: "20px", background: "#F0F2F5", minHeight: "100vh" }}>
      <div className="profile-container">
        {/* Cover Photo */}
        <div className="cover-photo">
          <img 
            src={user?.coverPhoto || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=940&h=300&fit=crop"} 
            alt="Cover Photo"
          />
        </div>

        {/* Profile Section */}
        <div className="profile-info-section">
          <div className="profile-pic-container">
            <img 
              src={user?.profilePicture || "https://static.vecteezy.com/system/resources/previews/033/633/383/large_2x/a-painting-of-people-eating-at-a-restaurant-ai-generated-free-photo.jpg"} 
              alt="Profile Picture" 
              className="profile-pic"
            />
          </div>
          <div className="profile-name">
            <h1>{user?.name || "John Doe"}</h1>
          </div>
          <div className="profile-actions">
            <button className="add-story" onClick={() => alert("+ Add to Story feature coming soon!")}>+ Add to Story</button>
            <button className="edit-profile" onClick={() => setIsEditing(true)}>Edit Profile</button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          {isEditing ? (
            <form className="profile-form">
              <h2>Edit Profile</h2>
              <div className="form-group">
                <label>Name</label>
                <input 
                  name="name" 
                  type="text"
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="Enter your name"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input 
                  name="phone" 
                  type="tel"
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input 
                  name="address" 
                  type="text"
                  value={formData.address} 
                  onChange={handleChange} 
                  placeholder="Enter address"
                />
              </div>
              <div className="form-group">
                <label>Restaurant</label>
                <input 
                  name="restaurant" 
                  type="text"
                  value={formData.restaurant} 
                  onChange={handleChange} 
                  placeholder="Enter restaurant name"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-primary" onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" className="btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-form">
              <h2>Profile Information</h2>
              <div className="form-group">
                <label>Name</label>
                <p>{user?.name || "Not set"}</p>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <p>{user?.phone || "Not set"}</p>
              </div>
              <div className="form-group">
                <label>Address</label>
                <p>{user?.address || "Not set"}</p>
              </div>
              <div className="form-group">
                <label>Restaurant</label>
                <p>{user?.restaurant || user?.restaurantName || "Not set"}</p>
              </div>
              <div className="form-group">
                <label>Category</label>
                <p>{user?.category || user?.branch || "Not set"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;

