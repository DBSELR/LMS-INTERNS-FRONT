import React, { useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

// ✅ NEW: for PDF generation
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const StudentFeeView = () => {
  const [fees, setFees] = useState([]);
  const [installmentfees, setInstallmentFees] = useState([]);
  const [currentInstallmentDue, setcurrentInstallmentDue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dues, setDues] = useState([]);
  const [showFields, setShowFields] = useState(false);
  const [feePlanOpen, setFeePlanOpen] = useState(false);
  const contentRef = useRef(null);
  const [selectedInstallment, setSelectedInstallment] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [payHeadID, setPayHeadID] = useState("");
  const [payHead, setPayHead] = useState("");
  const [payInstallment, setpayInstallment] = useState("");
  const [selectedInstallmentNo, setSelectedInstallmentNo] = useState(null);
  const [semesterFeeTemplateId, setSemesterFeeTemplateId] = useState(null);

  // ✅ NEW: keep basic student info for receipt
  const [studentInfo, setStudentInfo] = useState({
    studentId: "",
    name: "",
  });

  const toggleFeePlan = () => {
    setFeePlanOpen((prev) => !prev);
    if (feePlanOpen) setShowFields(false);
  };

  const handlePayNow = (fee) => {
    console.log("Paying for:", fee);
    if (!showFields) setShowFields(true);

    const due = parseFloat(fee.amountDue) || 0;
    const paid = parseFloat(fee.paid) || 0;
    setPayAmount(due - paid);

    setPayHead(fee.feeHead);
    setPayHeadID(fee.hid);
    setPaidAmount(fee.paid);

    // For display only
    setpayInstallment("Installment " + fee.installment);

    // 🔹 This is the REAL numeric installment we will send to backend
    setSelectedInstallmentNo(fee.installment);

    // 🔹 Capture SemesterFeeTemplateId from installment fees API
    setSemesterFeeTemplateId(fee.semesterFeeTemplateId); // adjust property name if API returns `SemesterFeeTemplateId`
  };

  const fetchFees = async (studentId, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/Fee/Student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch fee details");
      const data = await res.json();
      setFees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchcurrentInstallmentDue = async (studentId, token) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/Fee/StudentCurrentInstallmentDue/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch installment fees");
      const data = await res.json();
      setcurrentInstallmentDue(data);
      if (data.length > 0) {
        setSelectedInstallment(data[0].installment); // ✅ Set default installment
      }
      console.log("Current Inst Due ;", data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInstallmentFees = async (studentId, token) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/Fee/StudentFeeInstallments/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch installment fees");
      const data = await res.json();
      setInstallmentFees(data);
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error("Invalid token");
      return;
    }

    const studentId =
      decoded["UserId"] || decoded.userId || decoded.nameid || decoded.sub;
    if (!studentId) return;

    // ✅ store student info for receipts (adjust claim names to your JWT)
    setStudentInfo({
      studentId: studentId,
      name:
        decoded["FullName"] ||
        decoded["fullName"] ||
        decoded["name"] ||
        decoded["unique_name"] ||
        "",
    });

    fetch(`${API_BASE_URL}/Fee/StudentDues/${studentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setDues)
      .catch((err) => {
        console.error(err);
        toast.error("Error fetching dues.");
      });

    fetchFees(studentId, token);
    fetchInstallmentFees(studentId, token);
    fetchcurrentInstallmentDue(studentId, token);
    console.log("Payment History ;", fees);
  }, []);

  const updatePayment = async () => {
    const amount = document.getElementById("payAmount").value;
    const paymentMethod = document.getElementById("payMode").value;
    const transactionId = document.getElementById("txnId").value;

    if (!amount || !paymentMethod || !transactionId) {
      toast.warning("Please fill all fields.");
      return;
    }

    const token = localStorage.getItem("jwt");
    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      toast.error("Invalid token.");
      return;
    }

    const studentId =
      decoded["UserId"] || decoded.userId || decoded.nameid || decoded.sub;

    if (!selectedInstallmentNo) {
      toast.warning("Installment not selected.");
      return;
    }

    const payload = {
      studentId, // 🔹 must match DTO property
      amount: parseFloat(amount),
      installment: selectedInstallmentNo, // 🔹 pure number (1, 2, 3…)
      paymentMethod,
      transactionId,
      payHeadId: payHeadID,
      semesterFeeTemplateId: semesterFeeTemplateId,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/Fee/Pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Payment failed.");

      toast.success("Payment updated!");
      setShowFields(false);

      // Refresh data
      fetchFees(studentId, token);
      fetch(`${API_BASE_URL}/Fee/StudentDues/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(setDues);

      fetchcurrentInstallmentDue(studentId, token);
      fetchInstallmentFees(studentId, token);
    } catch (err) {
      console.error(err);
      toast.error("Payment failed.");
    }
  };

  // ✅ NEW: Download PDF receipt for a specific payment row
  const handleDownloadReceipt = (fee) => {
    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(16);
      doc.text("Fee Payment Receipt", 105, 15, { align: "center" });

      doc.setFontSize(11);
      let y = 30;

      // Student details (adjust fields as per your data)
      doc.text(`Student ID: ${studentInfo.studentId || "-"}`, 14, y);
      y += 6;
      if (studentInfo.name) {
        doc.text(`Student Name: ${studentInfo.name}`, 14, y);
        y += 6;
      }

      if (dues.length > 0) {
        const d0 = dues[0];
        if (d0.programme) {
          doc.text(`Programme: ${d0.programme}`, 14, y);
          y += 6;
        }
        if (d0.semester) {
          doc.text(`Semester: ${d0.semester}`, 14, y);
          y += 6;
        }
      }

      y += 4;
      doc.line(14, y, 196, y);
      y += 8;

      const paidAmount =
        typeof fee.amountPaid === "number"
          ? `₹ ${fee.amountPaid.toLocaleString()}`
          : `${fee.amountPaid || "-"}`;

      const paymentDate = fee.paymentDate
        ? new Date(fee.paymentDate).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-";

      const rows = [
        ["Fee Head", fee.feeHead || "-"],
        ["Installment", fee.installment ? `Installment ${fee.installment}` : "-"],
        ["Paid Amount", paidAmount],
        ["Transaction ID", fee.transactionId || "-"],
        ["Payment Date & Time", paymentDate],
      ];

      // If paymentMethod is included in API
      if (fee.paymentMethod) {
        rows.push(["Payment Mode", fee.paymentMethod]);
      }

      if (semesterFeeTemplateId) {
        rows.push([
          "Semester Fee Template ID",
          semesterFeeTemplateId.toString(),
        ]);
      }

      autoTable(doc, {
      startY: y,
      head: [["Field", "Value"]],
      body: rows,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [40, 40, 40] },
    });
      const fileName = `Receipt_${studentInfo.studentId || "student"}_${
        fee.feeId || fee.transactionId || "payment"
      }.pdf`;

      doc.save(fileName);
    } catch (err) {
      console.error(err);
      toast.error("Error generating receipt PDF.");
    }
  };

  const percentPaid =
    dues.length > 0 && dues[0].fee > 0
      ? Math.round((dues[0].paid / dues[0].fee) * 100)
      : 0;
  const percentDue = 100 - percentPaid;

  const balance = dues.length > 0 ? dues[0].due : 0;

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
              <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
                <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                  <i className="fa-solid fa fa-credit-card"></i> Fees & Payment
                </h2>
                <p className="text-muted mb-0 dashboard-hero-sub">
                  View and manage your Fee payments and Installment details
                </p>
              </div>
              <div className="row">
                {/* Fee Header */}
                <div className="col-lg-12 mb-4">
                  <div className="card p-4 shadow-sm">
                    <div className="d-flex justify-content-between align-items-center">
                      <h4 className="mb-0">
                        <i className="fa fa-money text-orange mr-2"></i>Fees
                      </h4>
                    </div>

                    <hr />

                    {/* FEE PLAN Collapse */}
                    <div className="card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <h6 className="card-title mb-0 mr-2">FEE PLAN</h6>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={toggleFeePlan}
                          >
                            {feePlanOpen ? "Hide" : "View"}
                          </button>
                        </div>
                      </div>

                      <div
                        ref={contentRef}
                        style={{
                          overflow: "hidden",
                          maxHeight: feePlanOpen ? "400px" : "0",
                          opacity: feePlanOpen ? 1 : 0,
                          transition:
                            "max-height 0.5s ease, opacity 0.5s ease",
                        }}
                      >
                        <div
                          className="card-body"
                          style={{
                            maxHeight: "400px", // scrollable area height
                            overflowY: "auto", // vertical scrolling
                          }}
                        >
                          <div className="table-responsive">
                            <table className="table table-bordered table-hover table-striped table-sm">
                              <thead className="dark-header">
                                <tr style={{ fontSize: "13.5px" }}>
                                  <th>#</th>
                                  <th>FeeHead</th>
                                  <th>Amount</th>
                                  <th>Due Date</th>
                                  <th>Payment</th>
                                </tr>
                              </thead>
                              <tbody className="text-center align-middle">
                                {installmentfees.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan="6"
                                      className="text-muted py-3"
                                    >
                                      No installment data found.
                                    </td>
                                  </tr>
                                ) : (
                                  installmentfees.map((fee, index) => (
                                    <tr key={index}>
                                      <td>{index + 1}</td>
                                      <td>{fee.feeHead}</td>
                                      <td>
                                        ₹{fee.amountDue.toLocaleString()}
                                      </td>
                                      <td>
                                        {fee.dueDate
                                          ? new Date(
                                              fee.dueDate
                                            ).toLocaleDateString("en-GB", {
                                              day: "2-digit",
                                              month: "short",
                                              year: "numeric",
                                            })
                                          : "-"}
                                      </td>
                                      <td>
                                        {fee.remarks === "P" ? (
                                          <button
                                            className="btn btn-danger btn-sm py-1"
                                            onClick={() => handlePayNow(fee)}
                                          >
                                            Pay Now
                                          </button>
                                        ) : fee.remarks === "PD" ? (
                                          <button className="btn btn-success btn-sm py-1">
                                            Paid
                                          </button>
                                        ) : fee.remarks === "PP" ? (
                                          <button
                                            className="btn btn-warning btn-sm py-1"
                                            onClick={() => handlePayNow(fee)}
                                          >
                                            Part Paid
                                          </button>
                                        ) : (
                                          <span className="text-muted">
                                            Not Available
                                          </span>
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
                    </div>

                    {showFields && (
                      <div className="row mt-3">
                        <div className="col-md-2 mb-2">
                          <input
                            id="payHead"
                            value={payHead}
                            disabled
                            className="form-control"
                            placeholder="Amount"
                          />
                        </div>
                        <div className="col-md-2 mb-2">
                          <input
                            id="payInstallment"
                            value={payInstallment}
                            disabled
                            className="form-control"
                            placeholder="Amount"
                          />
                        </div>
                        <div className="col-md-2 mb-2">
                          <input
                            id="payAmount"
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            type="number"
                            className="form-control"
                            placeholder="Amount"
                          />
                        </div>
                        <div className="col-md-2 mb-3">
                          <input
                            id="payMode"
                            type="text"
                            className="form-control"
                            placeholder="Payment Mode"
                          />
                        </div>
                        <div className="col-md-2 mb-3">
                          <input
                            id="txnId"
                            type="text"
                            className="form-control"
                            placeholder="Transaction ID"
                          />
                        </div>
                        <div className="col-md-2 mb-2">
                          <button
                            className="btn btn-success"
                            onClick={updatePayment}
                          >
                            Update Payment
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Summary Cards */}
                    <div className="row mt-4">
                      <div className="col-md-4 mb-3">
                        <div
                          className="card text-white"
                          style={{
                            background:
                              "linear-gradient(135deg, #662D8C, #ED1E79)",
                          }}
                        >
                          <div className="card-body">
                            <h6>TUTION FEE</h6>
                            <h4>
                              ₹
                              {dues.length > 0
                                ? dues[0].fee.toLocaleString()
                                : "0"}
                            </h4>
                            <div
                              className="progress mt-2"
                              style={{ height: "4px" }}
                            >
                              <div
                                className="progress-bar bg-white"
                                style={{ width: "100%" }}
                              ></div>
                            </div>
                            <small>100%</small>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4 mb-3">
                        <div
                          className="card text-white"
                          style={{
                            background:
                              "linear-gradient(135deg, #396afc, #2948ff)",
                          }}
                        >
                          <div className="card-body">
                            <h6>PAID</h6>
                            <h4>
                              ₹
                              {dues.length > 0
                                ? dues[0].paid.toLocaleString()
                                : "0"}
                            </h4>
                            <div
                              className="progress mt-2"
                              style={{ height: "4px" }}
                            >
                              <div
                                className="progress-bar bg-white"
                                style={{ width: `${percentPaid}%` }}
                              ></div>
                            </div>
                            <small>{percentPaid}%</small>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4 mb-3">
                        <div
                          className="card text-white"
                          style={{
                            background:
                              "linear-gradient(135deg, #ff512f, #dd2476)",
                          }}
                        >
                          <div className="card-body">
                            <h6>DUE</h6>
                            <h4>
                              ₹
                              {dues.length > 0
                                ? dues[0].due.toLocaleString()
                                : "0"}
                            </h4>
                            <div
                              className="progress mt-2"
                              style={{ height: "4px" }}
                            >
                              <div
                                className="progress-bar bg-white"
                                style={{ width: `${percentDue}%` }}
                              ></div>
                            </div>
                            <small>{percentDue}%</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment History Table */}
                    <div className="card mt-3">
                      <div className="card-header">
                        <h6 className="card-title">Payment History</h6>
                      </div>
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table table-bordered table-hover table-striped table-sm">
                            <thead className="dark-header">
                              <tr style={{ fontSize: "13.5px" }}>
                                <th>#</th>
                                <th>Fee Head</th>
                                <th>Paid Amount</th>
                                <th>Transaction ID</th>
                                <th>Transaction Date</th>
                                {/* ✅ NEW: Download receipt */}
                                <th>Receipt</th>
                              </tr>
                            </thead>
                            <tbody className="text-center align-middle">
                              {fees.length === 0 ? (
                                <tr>
                                  <td colSpan="8" className="text-muted py-3">
                                    No fee Payment records found.
                                  </td>
                                </tr>
                              ) : (
                                fees.map((fee, index) => (
                                  <tr key={fee.feeId || index}>
                                    <td>{index + 1}</td>
                                    <td>{fee.feeHead}</td>
                                    <td>
                                      ₹
                                      {fee.amountPaid
                                        ? fee.amountPaid.toLocaleString()
                                        : "0"}
                                    </td>
                                    <td className="text-break">
                                      {fee.transactionId || "-"}
                                    </td>
                                    <td>
                                      {fee.paymentDate
                                        ? new Date(
                                            fee.paymentDate
                                          ).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                          })
                                        : "-"}
                                    </td>
                                    <td>
                                      <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() =>
                                          handleDownloadReceipt(fee)
                                        }
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
                    {/* end card */}
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
