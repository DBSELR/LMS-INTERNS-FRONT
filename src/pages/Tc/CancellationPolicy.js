// File: src/pages/CancellationPolicy.js
import React from "react";
import { useNavigate } from "react-router-dom";


function CancellationPolicy() {
    const navigate = useNavigate();

  return (
    <div className="policy-page">
        <button
  onClick={() => navigate(-1)}
  className="back-btn"
>
  ← Back
</button>

      <h1>Cancellation Policy</h1>
      {/* <p><strong>Last Updated:</strong> [Insert Date]</p> */}

      <p>
        The Paid Internship Program <strong>cannot be cancelled</strong> once the
        registration and payment are completed.
      </p>

      <h2>No Cancellation Allowed</h2>
      <ul>
        <li>No cancellation after account creation</li>
        <li>No cancellation due to change of mind</li>
        <li>No cancellation due to non-usage</li>
      </ul>

      <p><strong>All sales are final.</strong></p>
    </div>
  );
}

export default CancellationPolicy;
