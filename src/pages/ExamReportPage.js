import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import HeaderTop from "../components/HeaderTop";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

function ExamReportPage() {
  const { examId } = useParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    fetchReport();
  }, [examId]);

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Exam/${examId}/ResultReport`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`, // ✅ Attach JWT token here
        },
      });
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      console.error("Failed to load report", err);
      setError("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!reportData) return;

    const headers = [
      "StudentId", "FullName", "Email", "Programme", "Semester", "CourseName", "SubmittedAt", "Score", "IsGraded", "IsAutoGraded"
    ];

    const rows = reportData.results.map(row => [
      row.studentId,
      row.fullName,
      row.email,
      row.programme,
      row.semester || "N/A",
      row.courseName,
      new Date(row.submittedAt).toLocaleString(),
      row.score,
      row.isGraded,
      row.isAutoGraded
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `exam_report_${examId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredResults = reportData?.results?.filter(r =>
    r.fullName.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filteredResults.length / recordsPerPage);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const calcSummary = () => {
    const scores = filteredResults.map(r => r.score);
    const gradedCount = filteredResults.filter(r => r.isGraded).length;
    const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0;
    return { averageScore: avg, totalGraded: gradedCount };
  };

  const scoreData = [...new Set(filteredResults.map(r => r.score))].sort((a, b) => a - b).map(score => ({
    score,
    count: filteredResults.filter(r => r.score === score).length
  }));

  if (loading) return <div className="container mt-5">Loading report...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;

  const { averageScore, totalGraded } = calcSummary();

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="page">
        <div className="container-fluid mt-4">
          <h2 className="mb-3">Exam Report: {reportData.examTitle || "Untitled Exam"}</h2>
          <p><strong>Exam Date:</strong> {reportData.examDate ? new Date(reportData.examDate).toLocaleDateString() : "N/A"}</p>
          <p><strong>Total Submissions:</strong> {reportData.totalSubmissions ?? 0}</p>
          <p><strong>Average Score:</strong> {averageScore}</p>
          <p><strong>Total Graded:</strong> {totalGraded}</p>

          <div className="row mb-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or email"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="col-md-6 text-right">
              <button className="btn btn-success ml-2" onClick={downloadCSV}>
                <i className="fa fa-file-csv"></i> Download CSV
              </button>
            </div>
          </div>

          <div className="mb-5" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData}>
                <XAxis dataKey="score" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="thead-light">
                <tr>
                  <th>Student ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Programme</th>
                  <th>Semester</th>
                  <th>Course</th>
                  <th>Submitted At</th>
                  <th>Score</th>
                  <th>Graded</th>
                  <th>Auto-Graded</th>
                </tr>
              </thead>
              <tbody>
                {paginatedResults.length > 0 ? (
                  paginatedResults.map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.studentId}</td>
                      <td>{r.fullName}</td>
                      <td>{r.email}</td>
                      <td>{r.programme}</td>
                      <td>{r.semester || "N/A"}</td>
                      <td>{r.courseName}</td>
                      <td>{new Date(r.submittedAt).toLocaleString()}</td>
                      <td>{r.score}</td>
                      <td>{r.isGraded ? "Yes" : "No"}</td>
                      <td>{r.isAutoGraded ? "Yes" : "No"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center text-muted">No results available for this exam.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredResults.length > recordsPerPage && (
            <div className="card-footer d-flex justify-content-center mt-4">
              <button
                className="btn btn-outline-primary btn-sm mr-2"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="mx-3 align-self-center">{currentPage} / {totalPages}</span>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}

           
        </div>
      </div>
    </div>
  );
}

export default ExamReportPage;