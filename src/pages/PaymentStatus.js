// File: src/pages/PaymentStatus.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";


function PaymentStatus() {
  const navigate = useNavigate();
  const location = useLocation();

  const [merchantOrderId, setMerchantOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState("");

  // Recover-missing/all states
  const [recoverLoading, setRecoverLoading] = useState(false);
  const [recoverResults, setRecoverResults] = useState([]);
  const [recoverError, setRecoverError] = useState("");
  const [recoverInfo, setRecoverInfo] = useState("");

  // Read ?merchantOrderId= from query string (optional)
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const qsId = query.get("merchantOrderId");
    if (qsId) {
      setMerchantOrderId(qsId);
      fetchStatus(qsId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const normalizeStatusData = (data) => {
    if (!data) return null;

    return {
      merchantOrderId: data.merchantOrderId ?? data.MerchantOrderId ?? "",
      status: data.status ?? data.Status ?? "",
      stateRaw: data.stateRaw ?? data.StateRaw ?? "",
      amount: data.amount ?? data.Amount ?? "",
      phonePeOrderId: data.phonePeOrderId ?? data.PhonePeOrderId ?? "",
      phonePeTransactionId:
        data.phonePeTransactionId ?? data.PhonePeTransactionId ?? "",
      paymentTimeUtc:
        data.paymentTimeUtc ??
        data.PaymentTimeUtc ??
        data.updatedAtUtc ??
        data.UpdatedAtUtc ??
        "",
      message: data.message ?? data.Message ?? "",
      raw: data,
    };
  };

  const fetchStatus = async (idParam) => {
    const idToUse = (idParam || merchantOrderId || "").trim();

    if (!idToUse) {
      setError("Please enter a valid Merchant Order ID.");
      setStatusData(null);
      return;
    }

    try {
      setError("");
      setLoading(true);
      setStatusData(null);

      const response = await fetch(
        `${API_BASE_URL}/Payments/phonepe/status?merchantOrderId=${encodeURIComponent(
          idToUse
        )}`
      );

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        const msg =
          errJson?.error ||
          errJson?.message ||
          `Request failed with status ${response.status}`;
        throw new Error(msg);
      }

      const data = await response.json();
      const normalized = normalizeStatusData(data);
      setStatusData(normalized);
    } catch (err) {
      console.error("Error fetching PhonePe status:", err);
      setError(err.message || "Something went wrong while fetching status.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchStatus();
  };

  const renderStatusBadge = () => {
    if (!statusData?.status) return null;

    const statusText = String(statusData.status).toLowerCase();

    let badgeClass = "ps-status-badge--other";
    if (statusText.includes("success") || statusText === "completed") {
      badgeClass = "ps-status-badge--success";
    } else if (
      statusText.includes("pending") ||
      statusText.includes("processing")
    ) {
      badgeClass = "ps-status-badge--pending";
    } else if (
      statusText.includes("failed") ||
      statusText.includes("cancel") ||
      statusText.includes("error")
    ) {
      badgeClass = "ps-status-badge--failed";
    }

    return (
      <span className={`ps-status-badge ${badgeClass}`}>
        {statusData.status}
      </span>
    );
  };

  // 🔹 Recover ALL missing transactions (POST /payments/phonepe/recover-missing/all)
  const handleRecoverAll = async () => {
    try {
      setRecoverError("");
      setRecoverInfo("");
      setRecoverResults([]);
      setRecoverLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/Payments/phonepe/recover-missing/all`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        const msg =
          errJson?.error ||
          errJson?.message ||
          `Request failed with status ${response.status}`;
        throw new Error(msg);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setRecoverResults(data);
        setRecoverInfo(
          `Recovered ${data.length} missing transaction${
            data.length === 1 ? "" : "s"
          }.`
        );
      } else {
        setRecoverResults([]);
        setRecoverInfo("No missing transactions were returned by the API.");
      }
    } catch (err) {
      console.error("Error recovering missing transactions:", err);
      setRecoverError(
        err.message || "Something went wrong while recovering transactions."
      );
    } finally {
      setRecoverLoading(false);
    }
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Admin" />

      <div className="section-wrapper">
        <div className="page admin-dashboard pt-0">
          <div className="section-body mt-3 pt-0">
            <div className="container-fluid">
              {/* Header */}
              <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
                <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                  Payment Status & Recovery
                </h2>
                <p className="text-muted mb-0 dashboard-hero-sub">
                  Check individual PhonePe payment status and recover all
                  missing transactions.
                </p>
              </div>

              {/* Content */}
              <div className="row">
                <div className="col-lg-10 col-md-11 col-sm-12 mx-auto">
                  <div className="ps-card">
                    {/* Small top bar with back button */}
                    <div className="ps-card-header">
                      <button
                        type="button"
                        className="ps-back-btn"
                        onClick={() => navigate(-1)}
                      >
                        ← Back
                      </button>
                      <span className="ps-card-header-title">
                        PhonePe Payment Tools
                      </span>
                    </div>

                    {/* 👉 Section 1: Check Single Payment Status */}
                    <div className="ps-section">
                      <div className="ps-section-header">
                        <h3 className="ps-section-title">
                          1. Check Payment Status
                        </h3>
                        <p className="ps-section-subtitle">
                          Enter a specific <strong>Merchant Order ID</strong> to
                          fetch the latest status from PhonePe.
                        </p>
                      </div>

                      <form
                        className="ps-form"
                        onSubmit={handleSubmit}
                        noValidate
                      >
                        <label
                          htmlFor="merchantOrderId"
                          className="ps-label mb-1"
                        >
                          Merchant Order ID
                        </label>
                        <input
                          id="merchantOrderId"
                          type="text"
                          className="ps-input"
                          placeholder="Enter Merchant Order ID"
                          value={merchantOrderId}
                          onChange={(e) =>
                            setMerchantOrderId(e.target.value)
                          }
                          autoComplete="off"
                        />

                        <button
                          type="submit"
                          className="ps-button"
                          disabled={loading || !merchantOrderId.trim()}
                        >
                          {loading ? "Checking..." : "Check Status"}
                        </button>
                      </form>

                      {error && (
                        <div className="ps-alert ps-alert--error">
                          <span className="ps-alert-title">Error</span>
                          <span className="ps-alert-text">{error}</span>
                        </div>
                      )}

                      {statusData && !error && (
                        <div className="ps-result-section">
                          <div className="ps-result-header">
                            <h4 className="ps-result-title">Result</h4>
                            {renderStatusBadge()}
                          </div>

                          <div className="ps-result-grid">
                            <div className="ps-result-item">
                              <span className="ps-result-label">
                                Merchant Order ID
                              </span>
                              <span className="ps-result-value">
                                {statusData.merchantOrderId || "—"}
                              </span>
                            </div>

                            <div className="ps-result-item">
                              <span className="ps-result-label">Amount</span>
                              <span className="ps-result-value">
                                {statusData.amount
                                  ? `₹ ${statusData.amount}`
                                  : "—"}
                              </span>
                            </div>

                            <div className="ps-result-item">
                              <span className="ps-result-label">
                                PhonePe Order ID
                              </span>
                              <span className="ps-result-value">
                                {statusData.phonePeOrderId || "—"}
                              </span>
                            </div>

                            <div className="ps-result-item">
                              <span className="ps-result-label">
                                PhonePe Transaction ID
                              </span>
                              <span className="ps-result-value">
                                {statusData.phonePeTransactionId || "—"}
                              </span>
                            </div>

                            <div className="ps-result-item">
                              <span className="ps-result-label">
                                State Raw
                              </span>
                              <span className="ps-result-value">
                                {statusData.stateRaw || "—"}
                              </span>
                            </div>

                            <div className="ps-result-item">
                              <span className="ps-result-label">
                                Updated Time (UTC)
                              </span>
                              <span className="ps-result-value">
                                {statusData.paymentTimeUtc || "—"}
                              </span>
                            </div>
                          </div>

                          {statusData.message && (
                            <div className="ps-message-box">
                              <span className="ps-message-label">Message</span>
                              <p className="ps-message-text">
                                {statusData.message}
                              </p>
                            </div>
                          )}

                          <details className="ps-raw-details">
                            <summary className="ps-raw-summary">
                              View Raw Response (JSON)
                            </summary>
                            <pre className="ps-raw-json">
                              {JSON.stringify(statusData.raw ?? {}, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="ps-section-divider" />

                    {/* 👉 Section 2: Recover ALL Missing Transactions */}
                    <div className="ps-section">
                      <div className="ps-section-header">
                        <h3 className="ps-section-title">
                          2. Recover Missing Transactions
                        </h3>
                        <p className="ps-section-subtitle">
                          This will call:
                          <br />
                          <code className="ps-api-code">
                            POST /api/payments/phonepe/recover-missing/all
                          </code>
                          <br />
                          and fetch statuses for all transactions where
                          <strong> StateRaw</strong> and{" "}
                          <strong>PhonePeOrderId</strong> were missing earlier.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="ps-button ps-button-secondary"
                        onClick={handleRecoverAll}
                        disabled={recoverLoading}
                      >
                        {recoverLoading
                          ? "Recovering..."
                          : "Recover All Missing"}
                      </button>

                      {recoverError && (
                        <div className="ps-alert ps-alert--error mt-2">
                          <span className="ps-alert-title">Error</span>
                          <span className="ps-alert-text">
                            {recoverError}
                          </span>
                        </div>
                      )}

                      {recoverInfo && (
                        <div className="ps-alert ps-alert--info mt-2">
                          <span className="ps-alert-title">Info</span>
                          <span className="ps-alert-text">
                            {recoverInfo}
                          </span>
                        </div>
                      )}

                      {recoverResults && recoverResults.length > 0 && (
                        <div className="ps-recover-table-wrapper">
                          <table className="ps-recover-table">
                            <thead>
                              <tr>
                                <th>Merchant Order ID</th>
                                <th>Username</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>StateRaw</th>
                                <th>PhonePe Order ID</th>
                                <th>Transaction ID</th>
                                <th>Message</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recoverResults.map((row, idx) => (
                                <tr key={row.merchantOrderId || idx}>
                                  <td>{row.merchantOrderId}</td>
                                  <td>{row.username}</td>
                                  <td>{row.amount}</td>
                                  <td>{row.status}</td>
                                  <td>{row.stateRaw}</td>
                                  <td>{row.phonePeOrderId}</td>
                                  <td>{row.phonePeTransactionId || "—"}</td>
                                  <td>{row.message}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentStatus;
