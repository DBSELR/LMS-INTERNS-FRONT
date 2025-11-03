import React, { useState } from "react";

function SettingsTab() {
  const [form, setForm] = useState({
    username: "john_doe",
    email: "john.doe@example.com",
    password: "",
    confirmPassword: "",
    notification: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, log the form data to the console
    console.log("Settings saved:", form);
    alert("Settings saved successfully!");
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="mb-4">Edit Profile Settings</h5>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              className="form-control"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="custom-control custom-checkbox">
              <input
                type="checkbox"
                name="notification"
                className="custom-control-input"
                checked={form.notification}
                onChange={handleChange}
              />
              <span className="custom-control-label">Enable Notifications</span>
            </label>
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingsTab;
