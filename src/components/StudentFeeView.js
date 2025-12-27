import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const StudentFeeView = () => {
  const [fees, setFees] = useState([]);
  const [installmentFees, setInstallmentFees] = useState([]);
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);

  const [studentInfo, setStudentInfo] = useState({
    studentId: "",
    name: ""
  });

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      console.log("No JWT token found");
      return;
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
      console.log("Decoded token:", decoded);
    } catch (err) {
      console.error("Error decoding token:", err);
      return;
    }

    const studentId =
      decoded.UserId || decoded.userId || decoded.nameid || decoded.sub;

    console.log("Student ID:", studentId);

    setStudentInfo({
      studentId,
      name:
        decoded.FullName ||
        decoded.fullName ||
        decoded.name ||
        decoded.unique_name ||
        ""
    });

    console.log("Fetching student fees...");
    fetch(`${API_BASE_URL}/Fee/Student/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((data) => {
        console.log("Student Fees:", data);
        setFees(data);
      })
      .catch((err) => console.error("Error fetching fees:", err));

    console.log("Fetching installment fees...");
    fetch(`${API_BASE_URL}/Fee/StudentFeeInstallments/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((data) => {
        console.log("Installment Fees:", data);
        setInstallmentFees(data);
      })
      .catch((err) => console.error("Error fetching installment fees:", err));

    console.log("Fetching student dues...");
    fetch(`${API_BASE_URL}/Fee/StudentDues/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((data) => {
        console.log("Student Dues:", data);
        setDues(data);
      })
      .catch((err) => console.error("Error fetching dues:", err))
      .finally(() => {
        console.log("Data loading completed");
        setLoading(false);
      });
  }, []);

  // ---------------- PAY NOW (LIVE PAYMENT) ----------------
  const handlePayNow = async (fee) => {
    try {
      console.log("Pay now clicked for fee:", fee);
      const token = localStorage.getItem("jwt");

      const amountDue =
        Number(fee.amountDue || 0) - Number(fee.paid || 0);

      console.log("Amount due:", amountDue);

      if (amountDue <= 0) {
        console.log("Fee already paid");
        toast.info("This fee is already paid.");
        return;
      }

      const studentName = fee.sname || studentInfo.name || "Student";
      const studentMobile = fee.mobile || "9999999999";

      console.log("Student name from fee:", studentName);
      console.log("Student mobile from fee:", studentMobile);

      const payload = {
        username: studentName,
        mobileNo: studentMobile,
        name: studentName,
        payments: [
          {
            userId: studentInfo.studentId,
            hid: fee.hid,
            amount: amountDue
          }
        ]
      };

      console.log("Payment payload:", payload);

      const res = await fetch(
        `${API_BASE_URL}/payments/initiate-multi-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) throw new Error("Payment initiation failed");

      const data = await res.json();
      console.log("Payment response:", data);

      // ✅ Redirect to gateway
      console.log("Redirecting to payment gateway:", data.redirectUrl);
      window.location.href = data.redirectUrl;
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Unable to start payment. Please try again.");
    }
  };

  // ---------------- DOWNLOAD RECEIPT ----------------
  const handleDownloadReceipt = (fee) => {
    console.log("Downloading receipt for fee:", fee);
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Fee Payment Receipt", 105, 15, { align: "center" });

    let y = 30;
    doc.setFontSize(11);

    doc.text(`Student ID: ${studentInfo.studentId}`, 14, y);
    y += 6;
    doc.text(`Student Name: ${studentInfo.name}`, 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [["Field", "Value"]],
      body: [
        ["Fee Head", fee.feeHead || "-"],
        ["Paid Amount", `₹${fee.amountPaid || 0}`],
        ["Transaction ID", fee.transactionId || "-"],
        [
          "Payment Date",
          fee.paymentDate
            ? new Date(fee.paymentDate).toLocaleString("en-GB")
            : "-"
        ]
      ],
      theme: "grid"
    });

    const filename = `Receipt_${studentInfo.studentId}_${fee.transactionId || "payment"}.pdf`;
    console.log("Saving receipt as:", filename);
    doc.save(filename);
  };

  const percentPaid =
    dues.length > 0 && dues[0].fee
      ? Math.round((dues[0].paid / dues[0].fee) * 100)
      : 0;

  const percentDue = 100 - percentPaid;

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader"></div>
        </div>
      )}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Student" />

      <div className="section-wrapper">
        <div className="page admin-dashboard pt-0">
          <div className="section-body mt-3 pt-0">
            <div className="container-fluid">

              {/* HEADER */}
              <div className="jumbotron bg-light rounded shadow-sm mb-3">
                <h2 className="text-primary">
                  <i className="fa fa-credit-card"></i> Fees & Payments
                </h2>
                <p className="text-muted">
                  View and pay your pending fees securely
                </p>
              </div>

              {/* FEE PLAN TABLE */}
              <div className="card shadow-sm mb-4">
                <div className="card-header">
                  <h6 className="mb-0">FEE PLAN</h6>
                </div>

                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover table-sm">
                      <thead className="dark-header">
                        <tr>
                          <th>#</th>
                          <th>Fee Head</th>
                          <th>Amount</th>
                          <th>Due Date</th>
                          <th>Payment</th>
                        </tr>
                      </thead>
                      <tbody className="text-center">
                        {installmentFees.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-muted">
                              No fee records found
                            </td>
                          </tr>
                        ) : (
                          installmentFees.map((fee, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{fee.feeHead}</td>
                              <td>₹{fee.amountDue?.toLocaleString()}</td>
                              <td>
                                {fee.dueDate
                                  ? new Date(fee.dueDate).toLocaleDateString(
                                      "en-GB"
                                    )
                                  : "-"}
                              </td>
                              <td>
                                {fee.remarks === "PD" ? (
                                  <span className="btn btn-success btn-sm">
                                    Paid
                                  </span>
                                ) : (
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handlePayNow(fee)}
                                  >
                                    Pay Now
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* SUMMARY */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <div
                    className="card text-white"
                    style={{ background: "linear-gradient(135deg,#662D8C,#ED1E79)" }}
                  >
                    <div className="card-body">
                      <h6>TOTAL FEE</h6>
                      <h4>₹{dues[0]?.fee || 0}</h4>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div
                    className="card text-white"
                    style={{ background: "linear-gradient(135deg,#396afc,#2948ff)" }}
                  >
                    <div className="card-body">
                      <h6>PAID</h6>
                      <h4>₹{dues[0]?.paid || 0}</h4>
                      <small>{percentPaid}%</small>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div
                    className="card text-white"
                    style={{ background: "linear-gradient(135deg,#ff512f,#dd2476)" }}
                  >
                    <div className="card-body">
                      <h6>DUE</h6>
                      <h4>₹{dues[0]?.due || 0}</h4>
                      <small>{percentDue}%</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* PAYMENT HISTORY */}
              <div className="card">
                <div className="card-header">
                  <h6>Payment History</h6>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Fee Head</th>
                          <th>Amount</th>
                          <th>Transaction ID</th>
                          <th>Date</th>
                          <th>Receipt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fees.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center text-muted">
                              No payment records found
                            </td>
                          </tr>
                        ) : (
                          fees.map((f, i) => (
                            <tr key={i}>
                              <td>{i + 1}</td>
                              <td>{f.feeHead}</td>
                              <td>₹{f.amountPaid || 0}</td>
                              <td>{f.transactionId || "-"}</td>
                              <td>
                                {f.paymentDate
                                  ? new Date(f.paymentDate).toLocaleDateString(
                                      "en-GB"
                                    )
                                  : "-"}
                              </td>
                              <td>
                                <button
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => handleDownloadReceipt(f)}
                                >
                                  Download
                                </button>
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
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFeeView;
