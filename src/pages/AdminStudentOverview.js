import React, { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

const thStyle = {
  border: "1px solid #ccc",
  padding: "6px",
  backgroundColor: "#e1e1f2",
  textAlign: "left",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "6px",
};

function convertToWords(num) {
  if (!num && num !== 0) return "";
  const words = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  if (num < 20) return words[num];
  if (num < 100)
    return tens[Math.floor(num / 10)] + (num % 10 ? "-" + words[num % 10] : "");
  return num.toString();
}

function AdminStudentOverview() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [searchText, setSearchText] = useState("");
  const pdfRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    console.log("📦 Fetching all students...");
    fetch(`${API_BASE_URL}/Admin/students`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Students loaded:", data);
        setStudents(data);
        setFilteredStudents(data);
      })
      .catch((err) => console.error("❌ Failed to load students", err));
  }, []);

  const loadDetails = async (id) => {
    try {
      console.log("🔍 Fetching details for student ID:", id);
      setSelectedId(id);
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Admin/students/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log("📄 Student details loaded:", data);
      setStudentDetails(data);
    } catch (err) {
      console.error("❌ Failed to load student detail", err);
    }
  };

  useEffect(() => {
    console.log("🔎 Filtering students by search text:", searchText);
    const filtered = students.filter(
      (s) =>
        s.name.toLowerCase().includes(searchText.toLowerCase()) ||
        s.username.toLowerCase().includes(searchText.toLowerCase())
    );
    console.log("📋 Filtered students:", filtered);
    setFilteredStudents(filtered);
  }, [searchText, students]);

  const downloadPDF = async () => {
    if (!studentDetails) {
      console.warn("⚠️ No student selected for PDF download.");
      return;
    }

    console.log("📥 Starting PDF generation...");
    const input = pdfRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = 210;
    const ratio = pageWidth / canvas.width;
    const height = canvas.height * ratio;

    console.log("🖼️ Adding image to PDF...");
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, height);

    const fileName = `${studentDetails.name.replace(/\s+/g, "_")}_report.pdf`;
    console.log("💾 Saving PDF as:", fileName);
    pdf.save(fileName);
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Admin" />

      <div className="section-wrapper">
         <div className="page departments-page">
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
            <div className="jumbotron bg-light p-4 rounded shadow-sm mb-4 welcome-card animate-welcome">
                <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                  <i class="fa-solid fa-chart-line"></i> Student Progress Overview
                </h2>
                <p className="text-muted mb-0 dashboard-hero-sub">
                    View student details, academic performance, and download reports.
                </p>
          </div>
            <div className="row clearfix">
              <div className="col-md-4">
                <div className="">
                  
                  <div className="card-body welcome-card animate-welcome">
                    {/* <h6 style={{ fontWeight: "bold" }}>SELECT A STUDENT</h6> */}
      
      <div className="form-item">
        <input
          type="text"
          className="form-control mb-2"
          id="username"
          autoComplete="off"
          required
          /* use defaultValue to keep it uncontrolled */
        />
        <label htmlFor="username">SELECT A STUDENT</label>
        </div>

                    {/* <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Search student..."
                      value={searchText}
                      onChange={(e) => {
                        console.log("⌨️ Search input changed:", e.target.value);
                        setSearchText(e.target.value);
                      }}
                    /> */}
                    <ul className="list-group">
                      {filteredStudents.map((s) => (
                        <li
                          key={s.userId}
                          className={`list-group-item ${
                            selectedId === s.userId ? "active" : ""
                          }`}
                          onClick={() => {
                            console.log("👆 Student selected:", s);
                            loadDetails(s.userId);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          {s.name} ({s.username})
                        </li>
                      ))}
                      {filteredStudents.length === 0 && (
                        <li className="list-group-item text-muted">
                          No students found.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-md-8">
                {studentDetails ? (
                  <div className="card">
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">
                        Student Overview: {studentDetails.name}
                      </h6>
                      <button
                        onClick={downloadPDF}
                        className="btn btn-sm btn-light"
                      >
                        Download Report (PDF)
                      </button>
                    </div>
                    <div className="card-body">
                      <div
                        ref={pdfRef}
                        style={{
                          padding: "20px",
                          backgroundColor: "#fff",
                          color: "#000",
                          fontFamily: "Arial, sans-serif",
                          fontSize: "13px",
                          width: "100%",
                          maxWidth: "595px",
                          margin: "0 auto",
                          border: "1px solid #ccc",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "#5a67d8",
                            color: "white",
                            padding: "10px 20px",
                            borderTopLeftRadius: "6px",
                            borderTopRightRadius: "6px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <h2 style={{ margin: 0 }}>REPORT CARD</h2>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "12px" }}>
                              ABC UNIVERSITY
                            </div>
                            <div style={{ fontSize: "22px" }}>🎓</div>
                          </div>
                        </div>

                        <div
                          style={{ padding: "10px 20px", textAlign: "center" }}
                        >
                          <p style={{ margin: 0 }}>
                            This report summarizes the academic performance of
                            the student.
                          </p>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "10px 20px",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <p>
                              <strong>Full Name</strong>
                              <br />
                              {studentDetails.name || "-"}
                            </p>
                            <p>
                              <strong>Username</strong>
                              <br />
                              {studentDetails.name || "-"}
                            </p>
                            <p>
                              <strong>Email</strong>
                              <br />
                              {studentDetails.email || "-"}
                            </p>
                            <p>
                              <strong>Date of Birth</strong>
                              <br />
                              {studentDetails.dateOfBirth || "-"}
                            </p>
                            <p>
                              <strong>Class</strong>
                              <br />
                              {studentDetails.className || "-"}
                            </p>
                            <p>
                              <strong>Programme</strong>
                              <br />
                              {studentDetails.programme || "-"}
                            </p>
                            <p>
                              <strong>Semester</strong>
                              <br />
                              {studentDetails.semester || "-"}
                            </p>
                          </div>
                          <div style={{ marginLeft: "20px" }}>
                            <img
                              src={
                                studentDetails.profilePhotoUrl ||
                                "./assets/graduate-student-avatar.png"
                              }
                              alt="student"
                              style={{
                                width: "100px",
                                height: "120px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                border: "1px solid #ccc",
                              }}
                            />
                          </div>
                        </div>

                        <table
                          style={{
                            width: "90%",
                            margin: "20px auto",
                            borderCollapse: "collapse",
                            fontSize: "12px",
                          }}
                        >
                          <thead>
                            <tr style={{ backgroundColor: "#e1e1f2" }}>
                              <th style={thStyle}>Subject</th>
                              <th style={thStyle}>Score</th>
                              <th style={thStyle}>Value in Letter</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(studentDetails.marks || []).map((m, i) => (
                              <tr key={i}>
                                <td style={tdStyle}>{m.paperName}</td>
                                <td style={tdStyle}>{m.totalMarks}</td>
                                <td style={tdStyle}>
                                  {convertToWords(m.totalMarks)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <div
                          style={{
                            padding: "0 20px",
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "12px",
                          }}
                        >
                          <div>
                            <p>
                              Personality
                              <br />
                              <em>{studentDetails.personality || "Good"}</em>
                            </p>
                            <p>
                              Attendance
                              <br />
                              <em>
                                {studentDetails.attendancePercentage?.toFixed(
                                  2
                                ) || "100"}
                                %
                              </em>
                            </p>
                          </div>
                          <div>
                            <p>
                              Motivation to Learn
                              <br />
                              <em>{studentDetails.motivation || "Good"}</em>
                            </p>
                            <p>
                              Learning Achievements
                              <br />
                              <em>
                                {studentDetails.achievements || "Satisfying"}
                              </em>
                            </p>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-around",
                            marginTop: "40px",
                            fontSize: "12px",
                          }}
                        >
                          <div style={{ textAlign: "center" }}>
                            <hr style={{ width: "100px" }} />
                            <span>
                              <em>Homeroom Teacher</em>
                            </span>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <hr style={{ width: "100px" }} />
                            <span>
                              <em>Head of Campus</em>
                            </span>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <hr style={{ width: "100px" }} />
                            <span>
                              <em>Student Guardian</em>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted">
                    Select a student to view details.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
         
      </div>

      </div>
    </div>
  );
}

export default AdminStudentOverview;
