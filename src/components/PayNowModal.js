import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

export default function PayNowModal({ show, onClose, fee, onSubmit }) {
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    if (fee) {
      const due = fee.amountDue - fee.amountPaid;
      setAmount(due > 0 ? due : 0);
    }
  }, [fee]);

  if (!show || !fee) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      feeId: fee.feeId,
      amount,
      paymentMethod,
      transactionId,
    });
  };

  return ReactDOM.createPortal(
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.7)",
      zIndex: 9999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        backgroundColor: "#fff",
        padding: "2rem",
        borderRadius: "10px",
        width: "350px",
        maxWidth: "90%",
        textAlign: "left"
      }}>
        <h2 className="mb-4">Pay Fee</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Amount</label>
            <input
              type="number"
              className="form-control"
              value={amount}
              min={0}
              max={fee.amountDue - fee.amountPaid}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              required
            />
          </div>
          <div className="mb-3">
            <label>Payment Method</label>
            <input
              type="text"
              className="form-control"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label>Transaction ID</label>
            <input
              type="text"
              className="form-control"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              required
            />
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Payment
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
