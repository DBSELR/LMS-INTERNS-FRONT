import React from "react";

const SupportCard = ({ supportOfficer }) => {
  const { name = "-", designation = "-", initials = "--" } = supportOfficer || {};

  return (
    <div className="card shadow-sm bg-white rounded mb-3">
      <div className="card-header bg-gradient-purple text-white">
        <h6 className="mb-0">🛠️ Support</h6>
      </div>
      <div className="card-body d-flex align-items-center">
        <div
          className="rounded-circle bg-pink text-white d-flex align-items-center justify-content-center mr-3"
          style={{ width: "48px", height: "48px", fontSize: "1.2rem", fontWeight: "bold" }}
        >
          {initials}
        </div>
        <div>
          <h6 className="mb-0">{name}</h6>
          <small className="text-muted">{designation}</small>
        </div>
      </div>
    </div>
  );
};

export default SupportCard;