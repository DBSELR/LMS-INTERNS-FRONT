import React from "react";

const UniversityIdCard = ({ student }) => {
  const {
    fullName = "John Doe",
    studentId = "UID12345",
    programme = "B.Tech",
    photoUrl = "https://via.placeholder.com/80",
    validity = "Dec 2025"
  } = student || {};

  return (
    <div className="card shadow-sm border rounded mb-3" style={{ maxWidth: "100%", fontFamily: "sans-serif" }}>
      <div className="card-header bg-dark text-white py-2">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">🎓 University ID Card</h6>
          <span className="badge badge-secondary">Valid Till: {validity}</span>
        </div>
      </div>
      <div className="card-body d-flex align-items-center bg-light">
        <img
          src={photoUrl}
          alt="Student"
          className="rounded border mr-3"
          style={{ width: "80px", height: "80px", objectFit: "cover" }}
        />
        <div>
          <h5 className="mb-1">{fullName}</h5>
          <p className="mb-1 text-muted">ID: {studentId}</p>
          <p className="mb-0">Programme: {programme}</p>
        </div>
        <div className="ml-auto text-right">
          <div
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "#ccc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
              fontSize: "0.7rem",
              color: "#333"
            }}
          >
            QR
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityIdCard;