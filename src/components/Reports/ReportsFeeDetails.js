// File: pages/ReportsFeeDetails.jsx
import React, { useEffect, useState } from "react";
import HeaderTop from "../../components/HeaderTop";
import RightSidebar from "../../components/RightSidebar";
import LeftSidebar from "../../components/LeftSidebar";
import Footer from "../../components/Footer";
import API_BASE_URL from "../../config";

function ReportsFeeDetails() {
  const [fees, setFees] = useState([]);
  const [programme, setProgramme] = useState("");
  const [semester, setSemester] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/fee/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setFees(data);
    } catch (err) {
      console.error("Failed to fetch fee records", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = fees.filter((f) => {
    const matchProgramme = !programme || f.programme?.toLowerCase().includes(programme.toLowerCase());
    const matchSemester = !semester || f.semester?.toLowerCase().includes(semester.toLowerCase());
    const matchStatus = !status || f.feeStatus?.toLowerCase() === status.toLowerCase();

    const matchDateFrom = !dateFrom || new Date(f.paymentDate) >= new Date(dateFrom);
    const matchDateTo = !dateTo || new Date(f.paymentDate) <= new Date(dateTo);

    return matchProgramme && matchSemester && matchStatus && matchDateFrom && matchDateTo;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handleExport = () => {
    const headers = ["Student Name", "Programme", "Semester", "Amount Due", "Amount Paid", "Status", "Payment Date"];
    const rows = filtered.map((f) => [
      f.studentName,
      f.programme,
      f.semester,
      f.amountDue,
      f.amountPaid,
      f.feeStatus,
      f.paymentDate ? new Date(f.paymentDate).toLocaleDateString() : "-"
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fee_details_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPaid = filtered.reduce((sum, f) => sum + (f.amountPaid || 0), 0);
  const totalDue = filtered.reduce((sum, f) => sum + (f.amountDue || 0), 0);

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader"></div>
        </div>
      )}

      {/* <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Admin" /> */}

        <div className="section-body mt-3">
          <div className="container-fluid">
            <div className="jumbotron bg-light p-1 rounded shadow-sm mb-2 welcome-card dashboard-hero">
              <h2 className="text-primary mb-1 dashboard-hero-title">Fee Details Report</h2>
              <p className="text-muted mb-0 dashboard-hero-sub">Filter and export fee records by programme, semester, status, or date range.</p>
            </div>

            {/* Filters */}
            <div className="row mb-3">
              <div className="col-md-3">
                <input type="text" className="form-control" placeholder="Programme" value={programme} onChange={(e) => setProgramme(e.target.value)} />
              </div>
              <div className="col-md-2">
                <input type="text" className="form-control" placeholder="Semester" value={semester} onChange={(e) => setSemester(e.target.value)} />
              </div>
              <div className="col-md-2">
                <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div className="col-md-2">
                <input type="date" className="form-control" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="col-md-2">
                <input type="date" className="form-control" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>

            {/* Export */}
            <div className="mb-3 text-right">
              <button className="btn btn-sm btn-success" onClick={handleExport}>Download CSV</button>
            </div>

            {/* Table */}
            <div className="card shadow-sm">
              <div className="card-header bg-info text-white">Fee Records</div>
              <div className="card-body p-0">
                {currentData.length ? (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Programme</th>
                          <th>Semester</th>
                          <th>Amount Due</th>
                          <th>Amount Paid</th>
                          <th>Status</th>
                          <th>Payment Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentData.map((f, idx) => (
                          <tr key={idx}>
                            <td>{f.studentName}</td>
                            <td>{f.programme}</td>
                            <td>{f.semester}</td>
                            <td>₹{f.amountDue}</td>
                            <td>₹{f.amountPaid}</td>
                            <td>{f.feeStatus}</td>
                            <td>{f.paymentDate ? new Date(f.paymentDate).toLocaleDateString() : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-light font-weight-bold">
                          <td colSpan="3">Totals</td>
                          <td>₹{totalDue}</td>
                          <td>₹{totalPaid}</td>
                          <td colSpan="2"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-4">No fee records found.</div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-4 d-flex justify-content-center">
                <ul className="pagination">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`} onClick={() => setCurrentPage(i + 1)} style={{ cursor: "pointer" }}>
                      <span className="page-link">{i + 1}</span>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

          </div>
        </div>

         

    </div>
  );
}

export default ReportsFeeDetails;
