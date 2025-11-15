import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "../../config";
import { Button } from "react-bootstrap";

function TransactionsTable() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  // Decode JWT to get user ID
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const id = decoded["UserId"] || decoded.userId;
        setUserId(id);
        console.log("✅ User ID from token:", id);
      } catch (err) {
        console.error("❌ Token decode failed", err);
        setError("Failed to decode user token");
      }
    }
  }, []);

  // Fetch transactions when userId is available
  useEffect(() => {
    if (userId) {
      fetchTransactions(userId);
    }
  }, [userId]);

  const fetchTransactions = async (userID) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("jwt");
      const url = `${API_BASE_URL}/Fee/GetByCollegewiseStudentFee/${userID}`;
      console.log("🔍 Fetching transactions from:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📡 Transactions API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Transactions data received:", data);
        setTransactions(data || []);
      } else if (response.status === 404) {
        setTransactions([]);
        setError("No fee records found for this user.");
      } else {
        const errorText = await response.text();
        console.error(
          "❌ Failed to fetch transactions:",
          response.status,
          errorText
        );
        setError(`Failed to load transactions: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error fetching transactions:", error);
      setError("Error loading transactions");
    } finally {
      setLoading(false);
    }
  };

  // NEW state to track selected rows (keyed by student+head+installment)
  const [selectedKeys, setSelectedKeys] = useState(new Set());

  // make a stable key per row (student + head + installment)
  const rowKey = (t) =>
    `${t.studentId || t.studentID}-${t.hid}-${t.installment}`;

  // toggle selection
  const toggleRow = (t, checked) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      const k = rowKey(t);
      checked ? next.add(k) : next.delete(k);
      return next;
    });
  };

  // select all / clear all
  const allKeys = transactions.map(rowKey);
  const allSelected =
    selectedKeys.size > 0 && selectedKeys.size === allKeys.length;
  const someSelected =
    selectedKeys.size > 0 && selectedKeys.size < allKeys.length;

  const toggleAll = (checked) => {
    setSelectedKeys(checked ? new Set(allKeys) : new Set());
  };

  const handleBulkPay = async () => {
    if (selectedKeys.size === 0) {
      setError("Please select at least one student to pay.");
      return;
    }

    const token = localStorage.getItem("jwt");

    // Build payload: pay the *remaining balance* by default
    const items = transactions
      .filter((t) => selectedKeys.has(rowKey(t)))
      .map((t) => {
        const amountDue = Number(t.amountDue || 0);
        const paid = Number(t.paid || 0);
        const balance = Math.max(0, amountDue - paid);

        return {
          StudentID: String(t.studentId ?? t.studentID ?? ""), // backend expects string
          Amount: balance, // pay remaining; change if you want custom input
          Installment: Number(t.installment || 0),
          PaymentMethod: "Cash", // or drive from a dropdown
          TransactionId:
            crypto?.randomUUID?.() ??
            `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          payHeadID: Number(t.hid), // maps to HeadID in SP
          ftid: Number(t.ftid || 0), // fee transaction ID
        };
      })
      .filter((x) => x.StudentID && x.Amount > 0);

    if (items.length === 0) {
      setError("Selected rows have no payable balance.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/Fee/BulkPay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(items),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`${res.status} ${txt}`);
      }

      // success: refresh table
      await fetchTransactions(userId);
      setSelectedKeys(new Set());
    } catch (err) {
      console.error("BulkPay failed:", err);
      setError("Failed to save bulk payments.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00") return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const getStatusBadge = (paid, amountDue) => {
    if (paid >= amountDue) {
      return <span className="badge badge-success">Paid</span>;
    } else if (paid > 0) {
      return <span className="badge badge-warning">Partial</span>;
    } else {
      return <span className="badge badge-danger">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white d-flex align-items-center">
          <i className="fa fa-exchange-alt mr-2"></i>
          <h6 className="mb-0">College-wise Student Fee Transactions</h6>
        </div>
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white d-flex align-items-center">
          <i className="fa fa-exchange-alt mr-2"></i>
          <h6 className="mb-0">College-wise Student Fee Transactions</h6>
        </div>
        <div className="card-body text-center py-5">
          <div className="alert alert-warning">
            <i className="fa fa-exclamation-triangle mr-2"></i>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white d-flex align-items-center justify-content-between">
        <div>
          <i className="fa fa-exchange-alt mr-2"></i>
          <h6 className="mb-0 d-inline">
            College-wise Student Fee Transactions
          </h6>
        </div>
        <small>Total Records: {transactions.length}</small>
      </div>

      <div className="card-body p-0">
        {transactions.length === 0 ? (
          <div className="text-center py-5">
            <i className="fa fa-inbox fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">No Transactions Found</h5>
            <p className="text-muted">
              No fee records available for your college.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Reg No</th>
                  <th>Student Name</th>
                  <th>Course</th>
                  {/* <th>Fee Head</th>
                  <th>Installment</th> */}
                  <th>Amount Due</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  {/* <th>Remarks</th> */}
                  <th style={{ width: 40 }}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                      }}
                      onChange={(e) => toggleAll(e.target.checked)}
                      aria-label="Select all"
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => {
                  const balance =
                    (transaction.amountDue || 0) - (transaction.paid || 0);
                  return (
                    <tr
                      key={`${transaction.studentId}-${transaction.hid}-${index}`}
                    >
                      <td>
                        <span className="badge badge-secondary">
                          {transaction.regno || "N/A"}
                        </span>
                      </td>
                      <td>
                        <strong>{transaction.studentName || "Unknown"}</strong>
                      </td>
                      <td>
                        <small className="text-muted">
                          <strong>{transaction.course || "No course"}</strong>
                        </small>
                      </td> 
                      {/* <td>
                        <span className="text-primary font-weight-bold">
                          {transaction.feeHead || "N/A"}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-info">
                          {transaction.installment || 0}
                        </span>
                      </td> */}
                      <td>
                        <strong className="text-danger">
                          {formatCurrency(transaction.amountDue)}
                        </strong>
                      </td>
                      <td>
                        <strong className="text-success">
                          {formatCurrency(transaction.paid)}
                        </strong>
                      </td>
                      <td>
                        <strong
                          className={
                            balance > 0 ? "text-warning" : "text-success"
                          }
                        >
                          {formatCurrency(balance)}
                        </strong>
                      </td>
                      <td>{formatDate(transaction.dueDate)}</td>
                      <td>
                        {getStatusBadge(
                          transaction.paid,
                          transaction.amountDue
                        )}
                      </td>
                      {/* <td>
                        <small className="text-muted">
                          {transaction.remarks || "No remarks"}
                        </small>
                      </td> */}
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedKeys.has(rowKey(transaction))}
                          onChange={(e) =>
                            toggleRow(transaction, e.target.checked)
                          }
                          disabled={transaction.remarks === "PD"}
                          aria-label={`Select ${
                            transaction.studentName || transaction.regno
                          }`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {transactions.length > 0 && (
        <div className="card-footer bg-light">
          <div className="row">
            <div className="col-md-3">
              <small className="text-muted">
                <i className="fa fa-users mr-1"></i>
                Total Students:{" "}
                {new Set(transactions.map((t) => t.studentId)).size}
              </small>
            </div>
            <div className="col-md-3">
              <small className="text-muted">
                <i className="fa fa-money-bill-wave mr-1"></i>
                Total Due:{" "}
                {formatCurrency(
                  transactions.reduce((sum, t) => sum + (t.amountDue || 0), 0)
                )}
              </small>
            </div>
            <div className="col-md-3">
              <small className="text-muted">
                <i className="fa fa-check-circle mr-1"></i>
                Total Paid:{" "}
                {formatCurrency(
                  transactions.reduce((sum, t) => sum + (t.paid || 0), 0)
                )}
              </small>
            </div>
            <div className="col-md-3">
              <Button
                variant="primary"
                onClick={handleBulkPay}
                disabled={selectedKeys.size === 0 || loading}
              >
                {loading ? "Processing..." : `Pay Now (${selectedKeys.size})`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionsTable;
