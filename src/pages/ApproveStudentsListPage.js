// File: src/pages/ApproveStudentsListPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Form,
  Spinner,
  Alert,
  Tab,
  Tabs,
  Badge,
} from "react-bootstrap";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";

import "./ApproveStudentsListPage.css";

function ApproveStudentsListPage() {
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approvingIds, setApprovingIds] = useState(new Set());
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const token = useMemo(() => localStorage.getItem("jwt"), []);

  function ci(obj = {}) {
    const map = {};
    Object.keys(obj || {}).forEach((k) => (map[k.toLowerCase()] = obj[k]));
    return (candidates) => {
      for (const c of candidates) {
        const v = map[(c || "").toLowerCase()];
        if (v !== undefined && v !== null) return v;
      }
      return undefined;
    };
  }

  function normalizeCollege(row = {}, idx = 0) {
    const get = ci(row);
    const id = get(["id", "colid", "ColId", "Id"]) ?? idx + 1;
    const name =
      get(["college", "College", "colname", "colName", "uname"]) ??
      `College ${id}`;
    return {
      id: Number(id) || 0,
      name: String(name),
      __raw: row,
    };
  }

  function normalizeStudent(row = {}, idx = 0) {
    const get = ci(row);
    return {
      userid: Number(get(["userid", "userId", "id"]) || 0),
      ApproveStatus: String(
        get(["ApproveStatus", "approvestatus", "IsApprove", "isapprove"]) ??
        "Pending"
      ),
      Username: String(
        get([
          "Username",
          "username",
          "user",
          "regno",
          "registrationnumber",
          "RegistrationNumber",
        ]) ?? ""
      ),
      FirstName: String(
        get(["FirstName", "firstname", "name", "FullName", "fullname"]) ?? ""
      ),
      Email: String(get(["Email", "email"]) ?? ""),
      Gender: String(get(["Gender", "gender"]) ?? ""),
      ABC_UniqueID: String(
        get([
          "ABC_UniqueID",
          "abc_uniqueid",
          "abcuniqueid",
          "abcid",
          "aBC_UniqueID",
        ]) ?? ""
      ),
      College: String(
        get(["College", "college", "colname", "colCode_Name"]) ?? ""
      ),
      __raw: row,
      __idx: idx,
    };
  }

  useEffect(() => {
    const t = localStorage.getItem("jwt");
    if (!t) return;
    try {
      const decoded = jwtDecode(t);
      const id =
        decoded?.UserId ??
        decoded?.userId ??
        decoded?.[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] ??
        null;
      setUserId(id);
      const role =
        decoded?.[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] ?? null;
      setUserRole(role || "");
    } catch (err) {
      console.warn("Token decode failed:", err);
    }
  }, []);

  useEffect(() => {
    const fetchColleges = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${API_BASE_URL}/Programme/GetDbsInternsColleges`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`Failed to load colleges (${res.status}) ${txt}`);
        }
        const data = await res.json().catch(() => []);
        const list = Array.isArray(data) ? data : data?.rows ?? [];
        const normalized = list.map(normalizeCollege);
        setColleges(normalized);
      } catch (err) {
        console.error("fetchColleges error:", err);
        setError(err.message || "Failed to load colleges");
        toast.error("Failed to load colleges");
      } finally {
        setLoading(false);
      }
    };
    fetchColleges();
  }, [token]);

  useEffect(() => {
    if (!selectedCollegeId) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      setLoading(true);
      setError("");
      try {
        const url = `${API_BASE_URL}/Student/GetgetApprovependingstudentlist?colid=${encodeURIComponent(
          selectedCollegeId
        )}`;
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`Failed to load students (${res.status}) ${txt}`);
        }
        const data = await res.json().catch(() => []);
        const list = Array.isArray(data)
          ? data
          : data?.rows ?? data?.result ?? [];
        const normalized = (list || []).map(normalizeStudent);
        setStudents(normalized);
      } catch (err) {
        console.error("fetchStudents error:", err);
        setError(err.message || "Failed to load students");
        toast.error("Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedCollegeId, token]);

  const filteredStudents = useMemo(() => {
    const q = String(searchQuery || "")
      .trim()
      .toLowerCase();
    const byTab = (row) => {
      const st = String(row.ApproveStatus || "").toLowerCase();
      const isApproved = st === "approved" || st === "y" || st === "yes";
      return activeTab === "approved" ? isApproved : !isApproved;
    };

    let list = (students || []).filter(byTab);
    if (!q) return list;

    return list.filter((row) => {
      for (const k of Object.keys(row || {})) {
        if (String(k || "").startsWith("__")) continue;
        const v = row[k];
        if (v === null || v === undefined) continue;
        let s;
        if (typeof v === "string") s = v;
        else if (typeof v === "number") s = String(v);
        else s = JSON.stringify(v);
        if (s.toLowerCase().includes(q)) return true;
      }
      return false;
    });
  }, [students, searchQuery, activeTab]);

  const studentCounts = useMemo(() => {
    const total = (students || []).length;
    const approved = (students || []).filter((s) => {
      const st = String(s.ApproveStatus || "").toLowerCase();
      return st === "approved" || st === "y" || st === "yes";
    }).length;
    const pending = total - approved;
    return { total, approved, pending };
  }, [students]);

  const handleApproveRow = async (uid) => {
    if (!uid) return;
    if (userRole && userRole !== "AppGenesis") {
      toast.error("You do not have permission to approve students.");
      return;
    }

    setApprovingIds((s) => new Set(s).add(uid));
    try {
      const res = await fetch(`${API_BASE_URL}/Student/ApproveStudent/${uid}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        if (res.status === 404)
          toast.warn("Student not found or already approved.");
        else toast.error(`Approve failed (${res.status}).`);
      } else {
        const data = await res.json().catch(() => null);
        toast.success(data?.message ?? "Student approved.");
        setStudents((prev) =>
          (prev || []).map((r) =>
            Number(r.userid) === Number(uid)
              ? { ...r, ApproveStatus: "Approved" }
              : r
          )
        );
      }
    } catch (err) {
      console.error("Approve exception for", uid, err);
      toast.error("Approval request failed.");
    } finally {
      setApprovingIds((s) => {
        const copy = new Set(s);
        copy.delete(uid);
        return copy;
      });
    }
  };

  const renderCollegeOption = (c) => (
    <option key={c.id} value={c.id} title={c.name}>
      {c.name}
    </option>
  );

  const renderStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    const isApproved = s === "approved" || s === "y" || s === "yes";
    if (isApproved) {
      return (
        <span className="status-badge status-badge--approved">Approved</span>
      );
    }
    return <span className="status-badge status-badge--pending">Pending</span>;
  };

  // Desktop Table Row
  const renderTableRow = (s, isPendingTab) => {
    const key = s.userid || s.__idx;
    const isProcessing = approvingIds.has(s.userid);
    const isApproved =
      String(s.ApproveStatus || "").toLowerCase() === "approved" ||
      String(s.ApproveStatus || "").toLowerCase() === "y";

    return (
      <tr key={key}>
        <td>
          <div className="student-cell">
            <div className="student-meta">
              <div className="student-name">{s.FirstName || "-"}</div>
              <div className="student-username">{s.Username || "N/A"}</div>
            </div>
          </div>
        </td>
        <td className="email-cell">
          <div className="email-cell-content">{s.Email || "-"}</div>
        </td>

        <td className="id-cell">
          <span className="badge-soft badge-soft--id">
            {s.ABC_UniqueID || "-"}
          </span>
        </td>

        <td className="status-cell">{renderStatusBadge(s.ApproveStatus)}</td>
        <td className="action-cell">
          {isPendingTab ? (
            <button
              className="action-button action-button--approve"
              disabled={
                isApproved ||
                isProcessing ||
                (userRole && userRole !== "AppGenesis")
              }
              onClick={() => handleApproveRow(s.userid)}
            >
              {isProcessing ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                  />
                  Approving...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check" />
                  Approve
                </>
              )}
            </button>
          ) : (
            <button className="action-button action-button--locked" disabled>
              <i className="fa-solid fa-lock" />
              Approved
            </button>
          )}
        </td>
      </tr>
    );
  };

  // Mobile Card Layout
  const renderStudentCard = (s, isPendingTab) => {
    const key = s.userid || s.__idx;
    const isProcessing = approvingIds.has(s.userid);
    const isApproved =
      String(s.ApproveStatus || "").toLowerCase() === "approved" ||
      String(s.ApproveStatus || "").toLowerCase() === "y";

    return (
      <div key={key} className="student-card">
        
      </div>
    );
  };

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
        <div
          className="page admin-dashboard pt-0"
          style={{ marginBottom: "100px" }}
        >
          <div className="section-body mt-3 pt-0">
            <div className="container-fluid">
              {/* Hero/Welcome Section */}
              <div className="welcome-card dashboard-hero">
                <h2 className="dashboard-hero-title">
                  <i className="fa-solid fa-user-check" /> Approve Students
                </h2>
                <p className="dashboard-hero-sub">
                  Review and approve student registrations efficiently
                </p>
              </div>

              {/* Filter Section */}
              <div className="filter-section">
                {error && (
                  <Alert
                    variant="warning"
                    className="approvals-alert-modern mb-3"
                  >
                    {error}
                  </Alert>
                )}

                <div className="filter-grid">
                  <div className="filter-item">
                    <label className="form-label">College</label>
                    <div className="select-wrapper">
                      <select
                        className="form-select modern-select"
                        value={selectedCollegeId}
                        onChange={(e) => {
                          setSelectedCollegeId(e.target.value);
                          setSearchQuery("");
                        }}
                        disabled={loading}
                        title={
                          colleges.find(
                            (c) => String(c.id) === String(selectedCollegeId)
                          )?.name || ""
                        }
                      >
                        <option value="">
                          {loading
                            ? "Loading colleges..."
                            : "-- Select College --"}
                        </option>
                        {colleges.map(renderCollegeOption)}
                      </select>
                    </div>
                  </div>

                  <div className="filter-item">
                    <label className="form-label">Search Students</label>
                    <div className="search-input-wrapper">
                      <span className="search-icon">
                        <i className="fa-solid fa-magnifying-glass" />
                      </span>
                      <input
                        type="search"
                        className="form-control search-input modern-input"
                        placeholder="Search by name, email, ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={loading || students.length === 0}
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="filter-item overview-item">
                    <div className="overview-stats">
                      <div className="stat-pill">
                        <span className="stat-label">Total</span>
                        <span className="stat-value">{studentCounts.total}</span>
                      </div>
                      <div className="stat-pill stat-pill--approved">
                        <span className="stat-label">Approved</span>
                        <span className="stat-value">
                          {studentCounts.approved}
                        </span>
                      </div>
                      <div className="stat-pill stat-pill--pending">
                        <span className="stat-label">Pending</span>
                        <span className="stat-value">
                          {studentCounts.pending}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs & Content */}
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k || "pending")}
                className="modern-tabs"
              >
                {/* PENDING TAB */}
                <Tab
                  eventKey="pending"
                  title={
                    <div className="tab-title-wrapper">
                      <i className="fa-regular fa-hourglass-half tab-icon-main" />
                      <span>Pending</span>
                      {studentCounts.pending > 0 && (
                        <span className="tab-badge-count">{studentCounts.pending}</span>
                      )}
                    </div>
                  }
                >
                  <div className="tab-content-wrapper">
                    {loading ? (
                      <div className="loading-state">
                        <Spinner animation="border" variant="primary" />
                        <span className="mt-2 d-block">Loading students...</span>
                      </div>
                    ) : filteredStudents.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon-bg">
                          <i className="fa-regular fa-calendar-check" />
                        </div>
                        <h6 className="empty-title">All Caught Up!</h6>
                        <p className="empty-subtitle">
                          No pending approvals found for this college.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Desktop Table */}
                        <div className="table-container show-desktop">
                          <table className="modern-table">
                            <thead>
                              <tr>
                                <th style={{ width: "35%" }}>Student Details</th>
                                <th style={{ width: "25%" }}>Contact Info</th>
                                <th style={{ width: "15%" }}>ABC ID</th>
                                <th style={{ width: "10%" }} className="text-center">Status</th>
                                <th style={{ width: "15%" }} className="text-end">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredStudents.map((s) =>
                                renderTableRow(s, true)
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="cards-container show-mobile">
                          {filteredStudents.map((s) =>
                            renderStudentCard(s, true)
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </Tab>

                {/* APPROVED TAB */}
                <Tab
                  eventKey="approved"
                  title={
                    <div className="tab-title-wrapper">
                      <i className="fa-regular fa-circle-check tab-icon-main" />
                      <span>Approved</span>
                      {studentCounts.approved > 0 && (
                        <span className="tab-badge-count success">{studentCounts.approved}</span>
                      )}
                    </div>
                  }
                >
                  <div className="tab-content-wrapper">
                    {loading ? (
                      <div className="loading-state">
                        <Spinner animation="border" variant="primary" />
                        <span className="mt-2 d-block">Loading students...</span>
                      </div>
                    ) : filteredStudents.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon-bg">
                          <i className="fa-regular fa-folder-open" />
                        </div>
                        <h6 className="empty-title">No Pending Students</h6>
                        <p className="empty-subtitle">
                          Select a college to view pending students.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Desktop Table */}
                        <div className="table-container show-desktop">
                          <table className="modern-table">
                            <thead>
                              <tr>
                                <th style={{ width: "35%" }}>Student Details</th>
                                <th style={{ width: "25%" }}>Contact Info</th>
                                <th style={{ width: "15%" }}>ABC ID</th>
                                <th style={{ width: "10%" }} className="text-center">Status</th>
                                <th style={{ width: "15%" }} className="text-end">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredStudents.map((s) =>
                                renderTableRow(s, false)
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="cards-container show-mobile">
                          {filteredStudents.map((s) =>
                            renderStudentCard(s, false)
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
}

export default ApproveStudentsListPage;
