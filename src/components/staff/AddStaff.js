import React, { useState } from "react";
import API_BASE_URL from "../../config";

function AddStaff() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "Staff",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Adding Staff:", form);

    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(`${API_BASE_URL}/admin/create-staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form), // Send form data
      });

      const data = await response.json();
      if (data.message) {
        alert(data.message);  // Show success message
        setForm({ username: "", password: "" });  // Reset form after success
      }
    } catch (error) {
      console.error("Error adding staff:", error);
      alert("Failed to add staff");
    }
  };

  return (
    <div className="container">
      <h3>Add Staff</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            className="form-control"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Add Staff
        </button>
      </form>
    </div>
  );
}

export default AddStaff;
