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
    sname: "",
    mobile: "",
    course: "",
    batch: ""
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
      mobile: decoded.mobile || "",
      course: decoded.course || "",
      batch: decoded.batch || "",
      sname:
        decoded.FullName ||
        decoded.fullName ||
        decoded.sname ||
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
      const studentCourse = fee.course || studentInfo.course || "Course";
      const studentBatch = fee.batch || studentInfo.batch || "Batch";

      console.log("Student name from fee:", studentName);
      console.log("Student mobile from fee:", studentMobile);

      const payload = {
        username: studentName,
        mobileNo: studentMobile,
        name: studentName,
        course: studentCourse,
        batch: studentBatch,
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
  const handleDownloadReceipt = async (fee) => {
    console.log("Downloading receipt for fee:", fee);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // variables to hold logo draw metrics for centering title
    let logoDrawX = null;
    let logoDrawY = null;
    let logoDrawW = null;
    let logoDrawH = null;

    // Define Colors
    const primaryColor = [44, 62, 80];   // Dark Blue/Grey
    const accentColor = [52, 152, 219];  // Light Blue
    const lightGray = [240, 240, 240];

    // Helper to load image and convert to dataURL
    const loadImageAsDataURL = async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Image load failed: ${res.status}`);
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    // --- HEADER SECTION ---
    // Try to embed logo.png from public/assets; fallback to text
    const logoPath = (process.env.PUBLIC_URL || "") + "/assets/dbase.png";
    let logoDataUrl = null;
    try {
      logoDataUrl = await loadImageAsDataURL(logoPath);
    } catch (e) {
      console.warn("Logo not found at", logoPath, e);
    }

    if (logoDataUrl) {
      // place logo scaled to available width while preserving aspect ratio
      try {
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 12;
        // create an Image to measure natural size
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            try {
              const imgW = img.naturalWidth || img.width;
              const imgH = img.naturalHeight || img.height;
              // max width we want for logo area (leave room on right for title)
              const maxLogoWidth = Math.min(220, pageWidth - margin * 2);
              const scale = Math.min(1, maxLogoWidth / imgW);
              const drawW = imgW * scale;
              const drawH = imgH * scale;
              // draw at left, vertically centered in header area
              const drawX = margin;
              const drawY = 6;
              // store metrics for title centering
              logoDrawX = drawX;
              logoDrawY = drawY;
              logoDrawW = drawW;
              logoDrawH = drawH;
              doc.addImage(logoDataUrl, "PNG", drawX, drawY, drawW, drawH);
              resolve();
            } catch (err) {
              reject(err);
            }
          };
          img.onerror = (err) => reject(err);
          img.src = logoDataUrl;
        });
      } catch (e) {
        console.warn("addImage failed or scaling failed:", e);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(...primaryColor);
        doc.text("D Base Solutions Private Limited", 12, 18);
      }
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(...primaryColor);
      doc.text("D Base Solutions Private Limited", 12, 18);
    }

    // doc.setFontSize(10);
    // doc.setFont("helvetica", "normal");
    // doc.setTextColor(100, 100, 100);

    // Title: center under logo if available, otherwise center on page
    const titleX = logoDrawX !== null ? logoDrawX + (logoDrawW / 2) : pageWidth / 2;
    const dividerY = 32; // same Y as the divider line below
    const titleY = dividerY + 8; // place title just below divider with small gap
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text("PAYMENT RECEIPT", titleX, titleY, { align: "center" });

    // Divider Line
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 32, 196, 32);

    // --- INFO SECTION ---
    let y = 45;

    // Left Column: Student Details
    // doc.setFontSize(10);
    // doc.setTextColor(130, 130, 130);
    // doc.text("BILLED TO:", 14, y);

    y += 5;
      const displayName = fee.sname || studentInfo.sname || "STUDENT";
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${displayName.toUpperCase()}`, 14, y);

      y += 6;
      const displayCourse = fee.course || studentInfo.course || "Course";
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      doc.text(`Course: ${displayCourse}`, 14, y);

      y += 7;
      const displayBatch = fee.batch || studentInfo.batch || "Batch";
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      doc.text(`Batch: ${displayBatch}`, 14, y);

    y += 8;
      const displayMobile = fee.mobile || studentInfo.mobile || "9999999999";
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      doc.text(`Phone: ${displayMobile}`, 14, y);

    // Right Column: Receipt Details
    y = 45;

    // We align values to the right, labels slightly left of that
    doc.setFontSize(10);
    doc.setTextColor(130, 130, 130);
    doc.text("", 196, y, { align: "right" });

    y += 10; // Increased spacing
    doc.setTextColor(50, 50, 50);

    const labelX = 130;
    const valueX = 196;

    doc.text("Receipt No:", labelX, y);
    doc.text(fee.transactionId || "-", valueX, y, { align: "right" });

    y += 6;
    doc.text("Date:", labelX, y);
    doc.text(
      fee.paymentDate
        ? new Date(fee.paymentDate).toLocaleDateString("en-GB")
        : "-",
      valueX,
      y,
      { align: "right" }
    );

    y += 6;
    doc.text("Payment Mode:", labelX, y);
    doc.text("Online", valueX, y, { align: "right" });

    // --- FEE TABLE ---
    const tableY = 75;
    const amountVal = (fee.amountPaid || 0).toLocaleString("en-IN");

    autoTable(doc, {
      startY: tableY,
      head: [["DESCRIPTION", "AMOUNT"]],
      body: [
        [fee.feeHead || "Tuition Fee", `INR ${amountVal}`]
      ],
      theme: "grid",
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontSize: 10,
        fontStyle: "bold",
        halign: "left"
      },
      bodyStyles: {
        fontSize: 10,
        textColor: 50,
        cellPadding: 8,
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 50, halign: "right" }
      },
      foot: [
        ["TOTAL PAID", `INR ${amountVal}`]
      ],
      footStyles: {
        fillColor: [245, 245, 245],
        textColor: primaryColor,
        fontSize: 11,
        fontStyle: "bold",
        halign: "right"
      }
    });

    // --- FOOTER AND NOTES ---
    const finalY = doc.lastAutoTable.finalY + 15;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("Thank you for your payment!", 14, finalY);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(130, 130, 130);
    doc.text("For any queries regarding this receipt, please contact support.", 14, finalY + 5);

    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text("This is a computer-generated receipt.", 105, 285, { align: "center" });

    const filename = `Receipt_${studentInfo.studentId}_${fee.transactionId || "pay"}.pdf`;
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
                      {/* <small>{percentPaid}%</small> */}
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
                      {/* <small>{percentDue}%</small> */}
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
