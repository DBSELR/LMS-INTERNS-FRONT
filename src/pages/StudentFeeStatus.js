import React, { useEffect, useState } from "react";
import HeaderTop from "../components//HeaderTop";
import RightSidebar from "../components//RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

function StudentFeeStatus({ studentId }) {
  const [fees, setFees] = useState([]);
  const [error, setError] = useState("");
  const [dues, setDues] = useState([]);

  
  useEffect(() => {
  console.log("📦 Fetching fee data for:", studentId);

  if (!studentId) {
    console.warn("❌ studentId is missing");
    return;
  }

  const fetchAllFeeData = async () => {
    try {
      // Fetch fees
      // const feeRes = await fetch(`https://lmsapi.dbasesolutions.in/api/Fee/Student/${studentId}`);
      // if (!feeRes.ok) throw new Error("Failed to fetch fees");
      // const feeData = await feeRes.json();
      // console.log("✅ Fees data:", feeData);
      // setFees(feeData);

      // Fetch dues
      const token = localStorage.getItem("jwt");
      const duesRes = await fetch(`${API_BASE_URL}/Fee/StudentDues/${studentId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!duesRes.ok) throw new Error("Failed to fetch dues");
      const duesData = await duesRes.json();
      console.log("✅ Dues data:", duesData);
      setDues(duesData);

    } catch (err) {
      console.error("🔥 Error in fee fetch:", err);
      setError(err.message);
    }
  };

  fetchAllFeeData();
}, [studentId]);






  const totalDue = fees.reduce((sum, f) => sum + f.amountDue, 0);
  const totalPaid = fees.reduce((sum, f) => sum + f.amountPaid, 0);

  return (
    <div id="main_content" className="font-muli theme-blush">
      <div className="page-loader-wrapper"><div className="loader"></div></div>
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="page">
        <div className="section-body">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center">
              <div className="header-action">
                <h1 className="page-title">Fee Status</h1>
                <ol className="breadcrumb page-breadcrumb">
                  <li className="breadcrumb-item"><a href="#">LMS</a></li>
                  <li className="breadcrumb-item active" aria-current="page">Fee Status</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="section-body mt-4">
          <div className="container-fluid">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h3 className="card-title">Semester-wise Fee Details</h3>
                <div className="text-right">
                  <small className="d-block text-muted">Total Due: ${totalDue.toFixed(2)}</small>
                  <small className="d-block text-muted">Total Paid: ${totalPaid.toFixed(2)}</small>
                </div>
              </div>
              <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}
                {!error && fees.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead className="thead-light">
                        <tr>
                          <th>Fee ID</th>
                          <th>Amount Due</th>
                          <th>Amount Paid</th>
                          <th>Status</th>
                          <th>Payment Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fees.map((fee, index) => (
                          <tr key={index}>
                            <td>{fee.feeId}</td>
                            <td>${fee.amountDue.toFixed(2)}</td>
                            <td>${fee.amountPaid.toFixed(2)}</td>
                            <td>
                              <span className={`badge badge-${fee.feeStatus === "Paid" ? "success" : "danger"}`}>
                                {fee.feeStatus}
                              </span>
                            </td>
                            <td>{fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted mb-0">No fee records found.</p>
                )}
              </div>
            </div>
          </div>
        </div>

         
      </div>
    </div>
  );
}

export default StudentFeeStatus;
