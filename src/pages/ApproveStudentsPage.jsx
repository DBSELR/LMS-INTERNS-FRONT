// File: src/pages/ApproveStudentsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Table, Button, Form, Spinner, Alert, Tab, Tabs } from "react-bootstrap";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";

const ApproveStudentsPage = () => {
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approvingIds, setApprovingIds] = useState(new Set());
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // "approved" or "pending"
  const token = useMemo(() => localStorage.getItem("jwt"), []);

  // -------------------------
  // Helpers: case-insensitive getters & normalizers
  // -------------------------
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
        get(["ApproveStatus", "approvestatus", "IsApprove", "isapprove"]) ?? "Pending"
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
      College: String(get(["College", "college", "colname", "colCode_Name"]) ?? ""),
      __raw: row,
      __idx: idx,
    };
  }

  // -------------------------
  // Read userId & role from JWT (optional)
  // -------------------------
  useEffect(() => {
    const t = localStorage.getItem("jwt");
    if (!t) return;
    try {
      const decoded = jwtDecode(t);
      const id =
        decoded?.UserId ??
        decoded?.userId ??
        decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ??
        null;
      setUserId(id);
      const role =
        decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? null;
      setUserRole(role || "");
      console.log("✅ User ID from token:", id, "Role:", role);
    } catch (err) {
      console.warn("Token decode failed:", err);
    }
  }, []);

  // -------------------------
  // Fetch colleges
  // -------------------------
  useEffect(() => {
    const fetchColleges = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE_URL}/Programme/GetDbsInternsColleges`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
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

  // -------------------------
  // Fetch students for selected college
  // -------------------------
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
        const list = Array.isArray(data) ? data : data?.rows ?? data?.result ?? [];
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

  // -------------------------
  // Search state
  // -------------------------
  const [searchQuery, setSearchQuery] = useState("");

  // Filter students based on activeTab and search
  const filteredStudents = useMemo(() => {
    const q = String(searchQuery || "").trim().toLowerCase();
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

  // Counts
  const studentCounts = useMemo(() => {
    const total = (students || []).length;
    const approved = (students || []).filter((s) => {
      const st = String(s.ApproveStatus || "").toLowerCase();
      return st === "approved" || st === "y" || st === "yes";
    }).length;
    const pending = total - approved;
    return { total, approved, pending };
  }, [students]);

  // -------------------------
  // Approve single student (row-wise)
  // -------------------------
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
        console.error("Approve failed for", uid, res.status, text);
        if (res.status === 404) toast.warn("Student not found or already approved.");
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

  // small helper to render long names safely (truncation in select)
  const renderCollegeOption = (c) => {
    return (
      <option key={c.id} value={c.id} title={c.name}>
        {c.name}
      </option>
    );
  };

  // Styles used inline to avoid extra CSS file
  // tableWrapperStyle: enables horizontal scroll on small screens, prevents layout collapse
  const tableWrapperStyle = {
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    marginBottom: 8,
    borderRadius: "4px",
    border: "1px solid #dee2e6",
  };
  const tableMinWidth = 1100; // minimum width before scrollbar appears
  // Cell text wrapping: truncate with ellipsis on mobile, wrap on desktop
  const wrapCell = {
    whiteSpace: "normal",
    wordBreak: "break-word",
    maxWidth: "clamp(120px, 20vw, 300px)",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };
  const collegeCell = {
    whiteSpace: "normal",
    wordBreak: "break-word",
    maxWidth: "clamp(120px, 18vw, 280px)",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };
  const emailCell = {
    whiteSpace: "normal",
    wordBreak: "break-word",
    maxWidth: "clamp(150px, 22vw, 320px)",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Admin" />

      <div className="section-wrapper">
        <div className="page admin-dashboard pt-0">
          <div className="section-body mt-3 pt-0">
            <div className="container-fluid px-3">
              <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
                <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                  <i className="fa-solid fa-user-check me-2" /> Approve Students
                </h2>
                <p className="text-muted mb-0 dashboard-hero-sub">
                  Approve student registrations by college (per-row approve).
                </p>
              </div>
            </div>
          </div>

          <div className="section-body mt-2">
            <div className="container-fluid px-3">
              <div className="card welcome-card animate-welcome">
                <div className="card-header bg-primary text-white d-flex align-items-center ">
                  <h6 className="mb-0">Student Approvals</h6>
                </div>

                <div className="card-body">
                  {error && <Alert variant="warning">{error}</Alert>}

                  <div className="row mb-3 gx-2">
                    <div className="col-12 col-sm-6 col-md-4 mb-3 mb-md-0">
                      <Form.Label className="mb-2">College</Form.Label>
                      <Form.Control
                        as="select"
                        value={selectedCollegeId}
                        onChange={(e) => {
                          setSelectedCollegeId(e.target.value);
                          setSearchQuery("");
                        }}
                        disabled={loading}
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "100%",
                        }}
                        title={
                          colleges.find((c) => String(c.id) === String(selectedCollegeId))?.name ||
                          ""
                        }
                      >
                        <option value="">{loading ? "Loading colleges..." : "-- Select College --"}</option>
                        {colleges.map(renderCollegeOption)}
                      </Form.Control>
                    </div>

                    <div className="col-12 col-sm-6 col-md-4 mb-3 mb-md-0">
                      <Form.Label className="mb-2">Search</Form.Label>
                      <Form.Control
                        type="search"
                        placeholder="Search within the active tab"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={loading || students.length === 0}
                        maxLength={100}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <div className="text-md-end">
                        <div className="small text-muted mb-1">Total / Approved / Pending</div>
                        <div className="fw-bold" style={{ fontSize: "1.1rem" }}>
                          {studentCounts.total} / {studentCounts.approved} / {studentCounts.pending}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || "pending")} className="mb-3">
                    <Tab eventKey="approved" title={`Approved (${studentCounts.approved})`}>
                      {loading ? (
                        <div className="text-center my-4">
                          <Spinner animation="border" />
                        </div>
                      ) : filteredStudents.length === 0 ? (
                        <p className="text-muted">No approved records.</p>
                      ) : (
                        <div style={tableWrapperStyle}>
                          <Table bordered hover className="mb-3" style={{ minWidth: tableMinWidth }}>
                            <thead className="table-light">
                              <tr>
                                <th>Username</th>
                                <th style={{ minWidth: 200 }}>Full Name</th>
                                <th style={{ minWidth: 220 }}>Email</th>
                                <th>Gender</th>
                                <th>ABC Unique ID</th>
                                <th style={{ minWidth: 220 }}>College</th>
                                <th>Approve Status</th>
                                <th style={{ width: 140 }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredStudents.map((s) => {
                                const key = s.userid || s.__idx || `${s.__idx}-a`;
                                return (
                                  <tr key={key}>
                                    <td>{s.Username}</td>
                                    <td style={wrapCell}>{s.FirstName}</td>
                                    <td style={emailCell}>{s.Email}</td>
                                    <td>{s.Gender}</td>
                                    <td>{s.ABC_UniqueID}</td>
                                    <td style={collegeCell} title={s.College}>{s.College}</td>
                                    <td>{s.ApproveStatus || "Approved"}</td>
                                    <td>
                                      <Button variant="outline-secondary" size="sm" disabled>
                                        Approved
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </Tab>

                    <Tab eventKey="pending" title={`Pending (${studentCounts.pending})`}>
                      {loading ? (
                        <div className="text-center my-4">
                          <Spinner animation="border" />
                        </div>
                      ) : filteredStudents.length === 0 ? (
                        <p className="text-muted">No pending students for approval.</p>
                      ) : (
                        <div style={tableWrapperStyle}>
                          
                          <Table bordered hover className="mb-3" style={{ minWidth: tableMinWidth }}>
                            <thead className="table-light">
                              <tr>
                                <th>Username</th>
                                <th style={{ minWidth: 200 }}>Full Name</th>
                                <th style={{ minWidth: 220 }}>Email</th>
                                <th>Gender</th>
                                <th>ABC Unique ID</th>
                                <th style={{ minWidth: 220 }}>College</th>
                                <th>Approve Status</th>
                                <th style={{ width: 140 }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredStudents.map((s) => {
                                const key = s.userid || s.__idx;
                                const isApproved =
                                  String(s.ApproveStatus || "").toLowerCase() === "approved" ||
                                  String(s.ApproveStatus || "").toLowerCase() === "y";
                                const isProcessing = approvingIds.has(s.userid);
                                return (
                                  <tr key={key}>
                                    <td>{s.Username}</td>
                                    <td style={wrapCell}>{s.FirstName}</td>
                                    <td style={emailCell}>{s.Email}</td>
                                    <td>{s.Gender}</td>
                                    <td>{s.ABC_UniqueID}</td>
                                    <td style={collegeCell} title={s.College}>{s.College}</td>
                                    <td>{s.ApproveStatus || "Pending"}</td>
                                    <td>
                                      <Button
                                        variant="success"
                                        size="sm"
                                        disabled={isApproved || isProcessing || (userRole && userRole !== "AppGenesis")}
                                        onClick={() => handleApproveRow(s.userid)}
                                      >
                                        {isProcessing ? (
                                          <>
                                            <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                                            Approving...
                                          </>
                                        ) : (
                                          "Approve"
                                        )}
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </Tab>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="section-body mt-2">
            <div className="container-fluid px-3">
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApproveStudentsPage;
