import React, { useState } from "react";

function AddTransportForm() {
  const [formData, setFormData] = useState({
    routeName: "",
    vehicleNo: "",
    driverName: "",
    licenseNo: "",
    phone: "",
    avatar: null,
    description: "",
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? e.target.files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Transport Submitted:", formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group row">
        <label className="col-md-3 col-form-label">Route Name</label>
        <div className="col-md-7">
          <input
            type="text"
            className="form-control"
            name="routeName"
            value={formData.routeName}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group row">
        <label className="col-md-3 col-form-label">Vehicle No</label>
        <div className="col-md-7">
          <input
            type="text"
            className="form-control"
            name="vehicleNo"
            value={formData.vehicleNo}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group row">
        <label className="col-md-3 col-form-label">Driver Name</label>
        <div className="col-md-7">
          <input
            type="text"
            className="form-control"
            name="driverName"
            value={formData.driverName}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group row">
        <label className="col-md-3 col-form-label">License No</label>
        <div className="col-md-7">
          <input
            type="text"
            className="form-control"
            name="licenseNo"
            value={formData.licenseNo}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group row">
        <label className="col-md-3 col-form-label">Phone Number</label>
        <div className="col-md-7">
          <input
            type="text"
            className="form-control"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group row">
        <label className="col-md-3 col-form-label">Avatar</label>
        <div className="col-md-7">
          <input
            type="file"
            className="form-control"
            name="avatar"
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group row">
        <label className="col-md-3 col-form-label">Description</label>
        <div className="col-md-7">
          <textarea
            className="form-control"
            rows="4"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>
      </div>

      <div className="form-group row">
        <label className="col-md-3 col-form-label"></label>
        <div className="col-md-7">
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
          <button type="button" className="btn btn-outline-secondary">
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

export default AddTransportForm;
