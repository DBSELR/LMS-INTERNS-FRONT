import React from "react";

const ProfileCard = ({ student }) => {
  if (!student) return null;

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const initials = getInitials(`${student.firstName} ${student.lastName}`);

  return (
    <div className="card text-center shadow-sm mb-3">
      <div className="card-body">
        <div
          className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
          style={{ width: "80px", height: "80px", fontSize: "1.5rem" }}
        >
          {initials}
        </div>

        <button className="btn btn-sm btn-primary position-absolute" style={{ right: "15px", top: "15px" }}>
          Edit
        </button>

        <div className="d-flex justify-content-around my-3 text-muted">
          <div>
            <div>0</div>
            <small>Tickets</small>
          </div>
          <div>
            <div>0</div>
            <small>Notification</small>
          </div>
          <div>
            <div>0</div>
            <small>Alerts</small>
          </div>
        </div>

        <h6 className="mb-0">{student.firstName} {student.lastName}</h6>
        <p className="text-muted small mb-1">{student.email}</p>
        <p className="text-muted small mb-1">{student.phoneNumber}</p>
        <p className="text-muted small">{student.city}, {student.state}</p>
      </div>
    </div>
  );
};

export default ProfileCard;