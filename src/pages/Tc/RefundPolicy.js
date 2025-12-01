// File: src/pages/RefundPolicy.js
import React from "react";
import { useNavigate } from "react-router-dom";


function RefundPolicy() {
    const navigate = useNavigate();

  return (
    <div className="policy-page">
        <button
  onClick={() => navigate(-1)}
  className="back-btn"
>
  ← Back
</button>

      <h1>Refund Policy (College Internship LMS)</h1>
      {/* <p><strong>Last Updated:</strong> [Insert Date]</p> */}

      <h2>No Refund Policy</h2>
      <p>
        All payments made toward the <strong>Paid Internship Program</strong> are{" "}
        <strong>100% non-refundable</strong> under any circumstances.
      </p>

      <p>Once the payment is completed:</p>
      <ul>
        <li>It is final</li>
        <li>No refunds will be provided</li>
        <li>No partial refunds will be provided</li>
      </ul>

      <p>This applies to:</p>
      <ul>
        <li>Internship program fees</li>
        <li>Course/module access fees</li>
        <li>Training/content fees</li>
      </ul>

      <p>
        Please ensure you review the program details thoroughly before making the
        payment.
      </p>
    </div>
  );
}

export default RefundPolicy;
