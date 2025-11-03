import React from "react";

function ProfileCard() {
  return (
    <div className="card">
      <div className="card-body text-center">
        <img
          src="https://via.placeholder.com/150"
          alt="User"
          className="avatar avatar-xl rounded-circle mb-3"
        />
        <h5 className="mb-0">John Doe</h5>
        <p className="text-muted">Web Developer</p>

        {/* Stats */}
        <div className="row text-center mt-4">
          <div className="col">
            <h6>Total Earned</h6>
            <p className="text-success">$2,500</p>
          </div>
          <div className="col">
            <h6>Likes</h6>
            <p className="text-primary">1,200</p>
          </div>
          <div className="col">
            <h6>Jobs Completed</h6>
            <p className="text-info">50</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4">
          <button className="btn btn-primary">Edit Profile</button>
          <button className="btn btn-outline-secondary ml-2">Change Picture</button>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;
