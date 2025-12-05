// File: src/pages/ReturnExchangePolicy.js
import React from "react";
import { useNavigate } from "react-router-dom";

function ReturnExchangePolicy() {
  const navigate = useNavigate();

  return (
    <div className="policy-page">

      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="back-btn">
        ← Back
      </button>

      <h1>Return / Exchange Policy</h1>

      {/* 🔴 Clear Statement */}
      <p style={{ color: "red", fontWeight: "bold" }}>
        There is <u>no return</u> for this digital internship program.
      </p>

      <p>
        Since this is a <strong>digital internship training LMS</strong>, there are{" "}
        <strong>no physical products</strong>, therefore returns do not apply.
      </p>

      <p>However, we provide exchange/correction only in the following cases:</p>

      <h2>Eligible for Exchange/Correction</h2>
      <ul>
        <li>Wrong internship login credentials provided</li>
        <li>Incorrect course/module access assigned</li>
        <li>Incorrect program access due to a technical issue</li>
      </ul>

      <h2>Conditions</h2>
      <ul>
        <li>
          Request must be raised within <strong>1–2 days</strong> of receiving login
          credentials
        </li>
        <li>Proof/screenshots may be required for verification</li>
        <li>
          After verification, correction/exchange will be completed within{" "}
          <strong>1–2 working days</strong>
        </li>
      </ul>

      <h2>Not Eligible</h2>
      <ul>
        <li>Student changed their mind</li>
        <li>Student selected the wrong program</li>
        <li>Student completed part of the internship and wants access changed</li>
      </ul>
    </div>
  );
}

export default ReturnExchangePolicy;
