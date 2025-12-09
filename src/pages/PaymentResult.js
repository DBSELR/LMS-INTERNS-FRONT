import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Home,
  Loader2,
} from "lucide-react";
// Make sure to import this CSS file in your project
// import "./PaymentResult.css";

const PaymentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState(null);
  const [amount, setAmount] = useState(null);
  const [merchantOrderId, setMerchantOrderId] = useState(null);
  const [phonePeTransactionId, setPhonePeTransactionId] = useState(null);
  const [phonePeOrderId, setPhonePeOrderId] = useState(null);
  const [paymentTimeUtc, setPaymentTimeUtc] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const orderId = query.get("merchantOrderId");

    if (!orderId) {
      setStatus("ERROR");
      setMessage("Missing order id in URL.");
      setLoading(false);
      return;
    }

    setMerchantOrderId(orderId);

    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `https://localhost:7163/api/payments/phonepe/status?merchantOrderId=${encodeURIComponent(
            orderId
          )}`
        );

        if (!res.ok) {
          const txt = await res.text();
          console.error("Payment status error:", txt);
          setStatus("ERROR");
          setMessage(
            "Unable to fetch payment status. Please contact support."
          );
          return;
        }

        const data = await res.json();
        console.log("Payment status response:", data);

        setStatus(data.status || null);
        setMessage(data.message || null);
        setAmount(typeof data.amount === "number" ? data.amount : null);
        setPhonePeTransactionId(data.phonePeTransactionId || null);
        setPhonePeOrderId(data.phonePeOrderId || null);
        setPaymentTimeUtc(data.paymentTimeUtc || null);
      } catch (err) {
        console.error("Payment status fetch failed:", err);
        setStatus("ERROR");
        setMessage("Something went wrong while checking payment.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [location.search]);

  const handleDownloadPdf = () => {
    window.print();
  };

  const isSuccess = status === "COMPLETED";
  const isFailure = status === "FAILED";
  const isPending = status === "PENDING";
  const isError = status === "ERROR";

  if (loading) {
    return (
      <div className="payres-page payres-loading-page">
        <div className="payres-loading-box">
          <Loader2 className="payres-loading-spinner" />
          <h2 className="payres-loading-title">Checking Payment Status...</h2>
          <p className="payres-loading-text">
            Please wait, we are confirming your payment details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="payres-page">
      {/* Invoice Card – this will be printed */}
      <div id="payres-invoice-card" className="payres-card">
        {/* Top strip */}
        <div
          className={
            "payres-strip " +
            (isSuccess
              ? "payres-strip-success"
              : isFailure || isError
              ? "payres-strip-failed"
              : "payres-strip-pending")
          }
        />

        <div className="payres-inner">
          {/* Icon + title */}
          <div className="payres-header">
            {isSuccess && (
              <CheckCircle className="payres-icon payres-icon-success" />
            )}
            {isFailure && (
              <XCircle className="payres-icon payres-icon-failed" />
            )}
            {(isPending || isError) && (
              <AlertTriangle className="payres-icon payres-icon-pending" />
            )}

            <h2 className="payres-title">
              {isSuccess
                ? "Payment Successful"
                : isFailure
                ? "Payment Failed"
                : isPending
                ? "Payment Pending"
                : "Payment Status"}
            </h2>
            <p className="payres-subtitle">
              {message || "Transaction details are shown below."}
            </p>
          </div>

          {/* Amount block */}
          {amount != null && (
            <div className="payres-amount-box">
              <span className="payres-amount-label">Total Amount</span>
              <div className="payres-amount-value">
                ₹ {amount.toFixed(2)}
              </div>
            </div>
          )}

          {/* Details */}
          <div className="payres-details-section">
            {merchantOrderId && (
              <div className="payres-details-row">
                <span className="payres-details-label">Order ID</span>
                <span className="payres-details-value payres-details-mono">
                  {merchantOrderId}
                </span>
              </div>
            )}

            {phonePeOrderId && (
              <div className="payres-details-row">
                <span className="payres-details-label">PhonePe Order ID</span>
                <span className="payres-details-value payres-details-mono">
                  {phonePeOrderId}
                </span>
              </div>
            )}

            {phonePeTransactionId && (
              <div className="payres-details-row">
                <span className="payres-details-label">Transaction Ref</span>
                <span className="payres-details-value payres-details-mono">
                  {phonePeTransactionId}
                </span>
              </div>
            )}

            {paymentTimeUtc && (
              <div className="payres-details-row">
                <span className="payres-details-label">Date &amp; Time</span>
                <span className="payres-details-value">
                  {new Date(paymentTimeUtc).toLocaleString()}
                </span>
              </div>
            )}

            <div className="payres-details-row">
              <span className="payres-details-label">Payment Method</span>
              <span className="payres-details-value">
                Online / PhonePe
              </span>
            </div>
          </div>

          {/* Footer text */}
          <div className="payres-footer">
            <p>Thank you for your business.</p>
          </div>
        </div>
      </div>

      {/* Buttons (not printed) */}
      <div className="payres-actions payres-no-print">
        {isSuccess && (
          <button
            type="button"
            className="payres-download-btn"
            onClick={handleDownloadPdf}
          >
            <Download className="payres-btn-icon" />
            <span className="payres-btn-text">Download Invoice</span>
          </button>
        )}

        <button
          type="button"
          className="payres-home-btn"
          onClick={() => navigate("/", { replace: true })}
        >
          <Home className="payres-home-icon" />
          <span className="payres-home-text">Go to Home</span>
        </button>
      </div>
    </div>
  );
};

export default PaymentResult;
