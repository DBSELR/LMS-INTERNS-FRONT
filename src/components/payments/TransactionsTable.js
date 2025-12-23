import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "../../config";
import { Button } from "react-bootstrap";
import axios from "axios"; // ✅ FIX 1: axios imported


function TransactionsTable() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [courseFilter, setCourseFilter] = useState("");
  const [feeHeadFilter, setFeeHeadFilter] = useState("");

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

  // select all / clear all (apply to currently displayed rows)
  const filteredTransactions = transactions.filter((t) => {
    const courseMatch = courseFilter
      ? String(t.course || "").trim() === String(courseFilter).trim()
      : true;
    const feeHeadMatch = feeHeadFilter
      ? String(t.feeHead || "").trim() === String(feeHeadFilter).trim()
      : true;
    return courseMatch && feeHeadMatch;
  });

  // Only rows that are selectable when doing a "select all" — i.e. have outstanding balance and not marked PD
  const selectableTransactions = filteredTransactions.filter((t) => {
    const amountDue = Number(t.amountDue || 0);
    const paid = Number(t.paid || 0);
    const balance = Math.max(0, amountDue - paid);
    const disabled = t.remarks === "PD";
    return balance > 0 && !disabled;
  });

  const allKeys = selectableTransactions.map(rowKey);
  const allSelected = selectedKeys.size > 0 && selectedKeys.size === allKeys.length;
  const someSelected = selectedKeys.size > 0 && selectedKeys.size < allKeys.length;

  const toggleAll = (checked) => {
    setSelectedKeys(checked ? new Set(allKeys) : new Set());
  };

  // Compute selected items and their total payable amount
  const selectedItems = transactions.filter((t) => selectedKeys.has(rowKey(t)));
  const totalSelectedAmount = selectedItems.reduce((sum, t) => {
    const amountDue = Number(t.amountDue || 0);
    const paid = Number(t.paid || 0);
    const balance = Math.max(0, amountDue - paid);
    return sum + balance;
  }, 0);

// replace existing handlePayNow with this
const handlePayNow = async () => {
  try {
    const token = localStorage.getItem("jwt");

    // Build payments array (one row per selected item) using balance = amountDue - paid
    const payments = selectedItems.map((r) => {
      const amountDue = Number(r.amountDue || 0);
      const paid = Number(r.paid || 0);
      const balance = Math.max(0, amountDue - paid);
      return {
        userId: r.studentId || r.studentID, // matches backend UserPaymentDto.UserId
        hid: r.hid,
        amount: balance
      };
    });

    if (payments.length === 0) {
      alert("No selectable rows chosen.");
      return;
    }

    const totalAmount = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

    const payload = {
      username: "TempCollegeName", // or loggedInUser.username
      mobileNo: "9999999999",      // backend expects mobileNo (camelCase)
      name: "TempUserName",
      payments // list of { userId, hid, amount }
    };

    console.log("📤 Multi-payment payload:", payload, "total:", totalAmount);

    const res = await axios.post(
      `${API_BASE_URL}/payments/initiate-multi-payment`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    // backend returns redirectUrl + merchantOrderId + insertedRows
    window.location.href = res.data.redirectUrl;
  } catch (err) {
    console.error("❌ Payment initiation failed:", err);
    alert("Unable to initiate payment. Please try again.");
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
          <h6 className="mb-0">Student Fee Transactions</h6>
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
          <h6 className="mb-0">Student Fee Transactions</h6>
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
            Fee Transactions
          </h6>
        </div>
        <div className="d-flex align-items-center gap-2">
          <small className="text-light">Showing {filteredTransactions.length} of {transactions.length} records</small>
          <select
            className="form-select form-select-sm"
            style={{ width: 220 }}
            value={feeHeadFilter}
            onChange={(e) => setFeeHeadFilter(e.target.value)}
            title="Filter by fee head"
          >
            <option value="">All Fee Heads</option>
            {Array.from(new Set(transactions.map((t) => t.feeHead || "")))
              .filter((h) => h && h.trim())
              .map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
          </select>
          <select
            className="form-select form-select-sm"
            style={{ width: 220 }}
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            title="Filter by course"
          >
            <option value="">All Courses</option>
            {Array.from(new Set(transactions.map((t) => t.course || "")))
              .filter((c) => c && c.trim())
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>
          <div className="btn-group">
            <button
              className="btn btn-sm btn-light"
              onClick={() => { setFeeHeadFilter(""); setCourseFilter(""); }}
              title="Clear filters"
            >
              Clear
            </button>
          </div>
        </div>
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
                  <th>Fee Head</th>
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
                {filteredTransactions.map((transaction, index) => {
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
                      <td>
                        <small className="text-muted">
                         <strong>{transaction.feeHead || "N/A"}</strong> 
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
                Total Students: {new Set(filteredTransactions.map((t) => t.studentId)).size}
              </small>
            </div>
            <div className="col-md-3">
              <small className="text-muted">
                <i className="fa fa-money-bill-wave mr-1"></i>
                Total Due: {formatCurrency(filteredTransactions.reduce((sum, t) => sum + (t.amountDue || 0), 0))}
              </small>
            </div>
            <div className="col-md-3">
              <small className="text-muted">
                <i className="fa fa-check-circle mr-1"></i>
                Total Paid: {formatCurrency(filteredTransactions.reduce((sum, t) => sum + (t.paid || 0), 0))}
              </small>
            </div>
            <div className="col-md-3">
              <Button
                variant="primary"
                onClick={handlePayNow}
                disabled={selectedKeys.size === 0 || loading}
              >
                {loading
                  ? "Processing..."
                  : `Pay Now (${selectedKeys.size}) • ${formatCurrency(totalSelectedAmount)}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionsTable;
