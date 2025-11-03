import React, { useState } from "react";

function AddRoomForm() {
  const [form, setForm] = useState({
    roomNo: "",
    block: "",
    type: "",
    beds: "",
    cost: "",
    description: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Room submitted:", form);
    alert("Room added successfully!");
    setForm({ roomNo: "", block: "", type: "", beds: "", cost: "", description: "" });
  };

  return (
    <div className="row clearfix">
      <div className="col-lg-6 col-md-12">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Add New Hostel Room</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Room No.</label>
                <input
                  type="text"
                  name="roomNo"
                  className="form-control"
                  value={form.roomNo}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Block No.</label>
                <input
                  type="text"
                  name="block"
                  className="form-control"
                  value={form.block}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Room Type</label>
                <select
                  name="type"
                  className="form-control"
                  value={form.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Triple">Triple</option>
                </select>
              </div>
              <div className="form-group">
                <label>No. of Beds</label>
                <input
                  type="number"
                  name="beds"
                  className="form-control"
                  value={form.beds}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Cost per Bed</label>
                <input
                  type="text"
                  name="cost"
                  className="form-control"
                  value={form.cost}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  className="form-control"
                  value={form.description}
                  onChange={handleChange}
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Add Room</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddRoomForm;
