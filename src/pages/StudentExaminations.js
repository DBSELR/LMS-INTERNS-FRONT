import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "../config";

function StudentExaminations() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      console.warn("Token not found");
      setLoading(false);
      return;
    }

    const decoded = jwtDecode(token);
    const userId = decoded["UserId"] || decoded.userId || decoded.nameid;
    if (!userId) {
      console.warn("User ID missing in JWT");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/Examination/ByStudent/${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch exams");
        return res.json();
      })
      .then(setExams)
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const formatMarks = (obt, outOf) => (outOf === 0 ? "-" : `${obt}/${outOf}`);

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader" />
        </div>
      )}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Student" />

      <div className="section-wrapper">
          <div className="page admin-dashboard">
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
            <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
              <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                <i class="fa-solid fa-pencil"></i> Subject List
              </h2>
              <p className="text-muted mb-0 dashboard-hero-sub"> 
                View all subjects with their examination details
              </p>
            </div>

            {exams.length === 0 && !loading && (
              <div className="text-center text-muted">
                No examinations assigned.
              </div>
            )}

            {exams.length > 0 && (
              <div className="card shadow-sm border-0">
                <div className="card-header bg-primary text-white font-weight-bold">
                  Your Examination Subjects
                </div>
                <div className="card-body p-0">
                  <Table
                    responsive
                    striped
                    bordered
                    hover
                    className="mb-0 text-center"
                    style={{ fontSize: "14px" }}
                  >
                    <thead className="bg-light text-dark" style={{ fontWeight: "600" }}>
                      <tr>
                        <th>Subject Code</th>
                        <th>Subject Name</th>
                        <th>Programme</th>
                        <th>Group</th>
                        <th>Semester</th>
                        <th>Credits</th>
                        <th>Type</th>
                        <th>Internal</th>
                        <th>Theory</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exams.map((exam) => (
                        <tr key={exam.examinationId}>
                          <td>{exam.paperCode}</td>
                          <td>{exam.paperName}</td>
                          <td>{exam.programmeName || "-"}</td>
                          <td>{exam.groupName || "-"}</td>
                          <td>{exam.semester}</td>
                          <td>{exam.credits}</td>
                          <td>{exam.paperType}</td>
                          <td>{exam.internalMax}</td>
                          <td>{exam.theoryMax}</td>
                          <td>{exam.totalMax}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </div>
         
      </div>
      </div>
    </div>
  );
}

export default StudentExaminations;
