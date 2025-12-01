// File: src/pages/PrivacyPolicy.js
import React from "react";
import "./PrivacyPolicy.css";
import { useNavigate } from "react-router-dom";


function PrivacyPolicy() {

  const navigate = useNavigate();

  return (
    <div className="policy-page">
      <button
  onClick={() => navigate(-1)}
  className="back-btn"
>
  ← Back
</button>

      <h1>Privacy Policy (College Internship LMS)</h1>
      {/* <p><strong>Last Updated:</strong> [Insert Date]</p> */}

      <p>
        This Privacy Policy explains how our <strong>College Internship Learning
        Management System</strong> (“LMS”, “we”, “our”, “us”) collects, uses, stores,
        and protects personal information of students, interns, coordinators, and
        faculty who use our platform.
      </p>

      <hr />

      <h2>1. Information We Collect</h2>
      <p>We collect the following categories of information:</p>

      <h3>A. Student / Intern Information</h3>
      <ul>
        <li>Full Name</li>
        <li>Email Address</li>
        <li>Mobile Number</li>
        <li>College &amp; Department details</li>
        <li>Academic year &amp; enrollment details</li>
        <li>Internship program selected</li>
      </ul>

      <h3>B. Login &amp; Account Data</h3>
      <ul>
        <li>Username</li>
        <li>Encrypted password</li>
        <li>Attendance logs</li>
        <li>Course/module progress</li>
        <li>Assessment results</li>
      </ul>

      <h3>C. Payment Information</h3>
      <ul>
        <li>Payment status</li>
        <li>Transaction ID</li>
        <li>Order ID</li>
        <li>Amount paid</li>
      </ul>

      <p>
        <strong>We do NOT store any card details, UPI PIN, CVV, or banking passwords.</strong>
        <br />
        All payments are securely processed by authorized payment gateways.
      </p>

      <h3>D. Usage Data</h3>
      <ul>
        <li>IP address</li>
        <li>Device &amp; browser information</li>
        <li>Login history</li>
        <li>Activity logs</li>
        <li>File/video reading progress</li>
      </ul>

      <h3>E. Cookies</h3>
      <p>Cookies are used to:</p>
      <ul>
        <li>Maintain session</li>
        <li>Improve navigation</li>
        <li>Track content progress</li>
      </ul>

      <hr />

      <h2>2. How We Use Your Information</h2>
      <p>We use collected data for:</p>
      <ul>
        <li>Providing internship course access</li>
        <li>Verifying payments</li>
        <li>Tracking attendance &amp; progress</li>
        <li>Sending internship updates &amp; reminders</li>
        <li>Generating certificates</li>
        <li>Improving LMS features</li>
        <li>Ensuring platform security</li>
      </ul>

      <hr />

      <h2>3. Data Protection Measures</h2>
      <p>We use secure industry standards, such as:</p>
      <ul>
        <li>Encrypted storage</li>
        <li>HTTPS secure access</li>
        <li>Role-based access control</li>
        <li>Regular security audits</li>
        <li>No storage of sensitive banking data</li>
      </ul>

      <hr />

      <h2>4. Data Sharing</h2>
      <p>Your data is shared only with:</p>
      <ul>
        <li><strong>Payment gateways</strong> for transaction verification</li>
        <li><strong>Technical partners</strong> for hosting, email/SMS</li>
        <li><strong>Colleges/Institutes</strong> when required for academic compliance</li>
        <li><strong>Government/legal authorities</strong> if mandated by law</li>
      </ul>
      <p>We never sell or rent student information.</p>

      <hr />

      <h2>5. Data Retention</h2>
      <p>We store data for:</p>
      <ul>
        <li>Duration of internship program</li>
        <li>Academic verification</li>
        <li>Compliance with legal requirements</li>
      </ul>
      <p>
        You may request account deletion, but payment records will be retained as
        required by law.
      </p>

      <hr />

      <h2>6. Student Rights</h2>
      <p>Students can request:</p>
      <ul>
        <li>Access to their data</li>
        <li>Correction of incorrect details</li>
        <li>Account/profile deletion</li>
        <li>Removal from marketing messages</li>
      </ul>
      <p>
        Contact: <strong>[Your Support Email]</strong>
      </p>

      <hr />

      <h2>7. Policy Updates</h2>
      <p>
        We may update this policy at any time. Revised versions will be posted with an
        updated date.
      </p>

      <hr />

      <h2>8. Contact</h2>
      <p>
        <strong>Email:</strong> support@dbasesolutions.in
       
      </p>
    </div>
  );
}

export default PrivacyPolicy;
