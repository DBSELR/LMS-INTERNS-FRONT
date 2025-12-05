// File: src/pages/TermsAndConditions.js
import React from "react";
import { useNavigate } from "react-router-dom";

function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="policy-page">

      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="back-btn">
        ← Back
      </button>

      <h1>Terms &amp; Conditions (College Internship LMS)</h1>

      <p>
        These Terms &amp; Conditions (“Terms”) govern your use of our College
        Internship LMS and participation in the internship training programs.
      </p>
      <p>By registering or making a payment, you agree to these Terms.</p>

      <hr />

      <h2>1. Eligibility</h2>
      <p>You must be:</p>
      <ul>
        <li>A college student or intern</li>
        <li>Using your own valid details</li>
        <li>Authorized to enroll in the internship program</li>
      </ul>

      <h2>2. Account Responsibilities</h2>
      <p>You agree to:</p>
      <ul>
        <li>Provide accurate information</li>
        <li>Keep your password confidential</li>
        <li>Not share your account with anyone</li>
        <li>Use the LMS for legitimate academic purposes only</li>
      </ul>

      <h2>3. Internship Access</h2>
      <p>After successful payment:</p>
      <ul>
        <li>Access will be provided to the selected internship program</li>
        <li>Access is non-transferable</li>
        <li>Access period depends on the chosen program structure</li>
      </ul>

      <h2>4. Usage Rules</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Copy, distribute, or resell LMS content</li>
        <li>Share videos, modules, or files outside the LMS</li>
        <li>Use scripts/automation to access the LMS</li>
        <li>Engage in cheating or fraudulent activity</li>
      </ul>
      <p>Violation may lead to suspension without refund.</p>

      <h2>5. Certificates</h2>
      <p>Certificates are awarded only if:</p>
      <ul>
        <li>Student completes all required modules</li>
        <li>Attendance and tests meet criteria</li>
        <li>Internship tasks are completed</li>
      </ul>

      <h2>6. Payments</h2>
      <ul>
        <li>All payments are final and non-refundable</li>
        <li>Payment gateways may charge additional fees</li>
        <li>Payment confirmation will be shared by email/SMS</li>
      </ul>

      <h2>7. Limitation of Liability</h2>
      <p>We are not responsible for:</p>
      <ul>
        <li>Internet issues on the user side</li>
        <li>Device malfunctions</li>
        <li>Student inability to complete the internship</li>
        <li>Missed classes due to technical issues outside our control</li>
      </ul>

      <h2>8. Termination</h2>
      <p>We may suspend or delete accounts for:</p>
      <ul>
        <li>Misuse of LMS</li>
        <li>Sharing credentials</li>
        <li>Illegal activity</li>
        <li>Violating these Terms</li>
      </ul>

      <h2>9. Changes to Terms</h2>
      <p>
        We may modify these Terms at any time. Updated versions will be posted
        on the LMS.
      </p>

      <h2>10. Contact</h2>
      <p>
        <strong>Email:</strong> support@dbasesolutions.in
      </p>

      <h2>11. Governing Law &amp; Dispute Resolution</h2>
      <p>
        These terms are governed by the laws of India. All disputes are subject
        to the jurisdiction of <strong>Eluru, Andhra Pradesh, India</strong>.
      </p>

      <p>Dispute Resolution Process:</p>
      <ol>
        <li>Written complaint to Grievance Officer</li>
        <li>Mediation / Conciliation</li>
        <li>Legal proceedings if unresolved</li>
      </ol>

    </div>
  );
}

export default TermsAndConditions;
