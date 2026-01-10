

// File: src/pages/FeeSummary.jsx
import React, { useEffect, useMemo, useState } from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

function FeeSummary() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchFees = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("jwt");
    try {
      const res = await fetch(`${API_BASE_URL}/Fee/All`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Failed to load fees (${res.status}) ${txt}`);
      }
      const data = await res.json().catch(() => []);
      const list = Array.isArray(data) ? data : data?.rows ?? [];
      setFees(list);
    } catch (err) {
      console.error("FeeSummary fetch error:", err);
      setError(err.message || "Failed to load fees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const filteredFees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return fees;
    return (fees || []).filter((fee) => {
      const fields = [
        fee?.studentName,
        fee?.feeHead,
        fee?.transactionId,
        fee?.paymentDate,
        fee?.installment,
      ];
      return fields.some((v) => {
        if (v === null || v === undefined) return false;
        return String(v).toLowerCase().includes(q);
      });
    });
  }, [fees, search]);

  const stats = useMemo(() => {
    let totalPaid = 0;
    let totalDue = 0;
    const students = new Set();

    (fees || []).forEach((fee) => {
      const paid = Number(fee?.amountPaid ?? 0);
      if (!Number.isNaN(paid)) totalPaid += paid;

      if (fee?.amountDue !== undefined && fee?.amountDue !== null) {
        const due = Number(fee.amountDue) - (Number.isNaN(paid) ? 0 : paid);
        if (!Number.isNaN(due)) totalDue += Math.max(due, 0);
      }

      if (fee?.studentName) students.add(fee.studentName);
    });

    return {
      totalPaid,
      totalDue,
      totalTransactions: (fees || []).length,
      uniqueStudents: students.size,
    };
  }, [fees]);

  const formatCurrency = (v) => `₹${Number(v ?? 0).toLocaleString()}`;

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader" />
        </div>
      )}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Admin" />

      <div className="section-wrapper">
        <div className="page admin-dashboard pt-0" style={{ marginBottom: "80px" }}>
          <div className="section-body mt-3 pt-0">
            <div className="container-fluid">
              <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
                <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                  Fee Summary
                </h2>
                <p className="text-muted mb-0 dashboard-hero-sub">
                  Track collected amounts, outstanding balances, and recent transactions at a glance.
                </p>
              </div>

              {error && (
                <div className="alert alert-warning" role="alert">
                  {error}
                </div>
              )}

              <div className="row mb-3">
                <div className="col-lg-3 col-md-6 mb-3">
                  <div className="card shadow-sm h-100">
                    <div className="card-body">
                      <p className="text-muted mb-1">Total Collected</p>
                      <h4 className="mb-0 text-success">{formatCurrency(stats.totalPaid)}</h4>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 mb-3">
                  <div className="card shadow-sm h-100">
                    <div className="card-body">
                      <p className="text-muted mb-1">Est. Outstanding</p>
                      <h4 className="mb-0 text-danger">{formatCurrency(stats.totalDue)}</h4>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 mb-3">
                  <div className="card shadow-sm h-100">
                    <div className="card-body">
                      <p className="text-muted mb-1">Transactions</p>
                      <h4 className="mb-0">{stats.totalTransactions}</h4>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 mb-3">
                  <div className="card shadow-sm h-100">
                    <div className="card-body">
                      <p className="text-muted mb-1">Students</p>
                      <h4 className="mb-0">{stats.uniqueStudents}</h4>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card shadow-sm">
                <div className="card-header d-flex flex-wrap align-items-center gap-2">
                  <h6 className="mb-0">Payment History</h6>
                  <div className="ms-auto d-flex align-items-center gap-2" style={{ columnGap: "8px" }}>
                    <input
                      type="search"
                      className="form-control"
                      placeholder="Search by student, head, transaction..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ minWidth: "220px" }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => setRefreshKey((k) => k + 1)}
                      disabled={loading}
                    >
                      <i className="fa fa-rotate-right me-1" /> Refresh
                    </button>
                  </div>
                </div>

                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover table-striped mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "4rem" }}>S.No</th>
                          <th>Student Name</th>
                          <th>Fee Head</th>
                          <th>Installment</th>
                          <th className="text-end">Paid Amount</th>
                          <th>Transaction ID</th>
                          <th>Transaction Date</th>
                        </tr>
                      </thead>
                      <tbody className="align-middle">
                        {filteredFees.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center text-muted py-4">
                              {loading ? "Loading payments..." : "No matching records found."}
                            </td>
                          </tr>
                        ) : (
                          filteredFees.map((fee, idx) => (
                            <tr key={`${fee?.transactionId || "fee"}-${idx}`}>
                              <td>{idx + 1}</td>
                              <td>{fee?.studentName || "-"}</td>
                              <td>{fee?.feeHead || "-"}</td>
                              <td>{fee?.installment ? `Installment ${fee.installment}` : "-"}</td>
                              <td className="text-end">{formatCurrency(fee?.amountPaid)}</td>
                              <td className="text-break">{fee?.transactionId || "-"}</td>
                              <td>
                                {fee?.paymentDate
                                  ? new Date(fee.paymentDate).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "-"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
}

export default FeeSummary;
