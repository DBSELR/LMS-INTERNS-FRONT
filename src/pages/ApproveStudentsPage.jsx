// import React, { useState, useEffect, useMemo } from "react";
// import { Table, Button, Form, Spinner } from "react-bootstrap";
// import { toast } from "react-toastify";
// import API_BASE_URL from "../config";
// import { jwtDecode } from "jwt-decode";
// import HeaderTop from "../components/HeaderTop";
// import RightSidebar from "../components/RightSidebar";
// import LeftSidebar from "../components/LeftSidebar";

// const ApproveStudentsPage = () => {
//   const [colleges, setColleges] = useState([]);
//   const [selectedCollegeId, setSelectedCollegeId] = useState("");
//   const [students, setStudents] = useState([]);
//   const [selectedStudents, setSelectedStudents] = useState(new Set());
//   const [loading, setLoading] = useState(false);
//   const [approving, setApproving] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const [error, setError] = useState("");

//   const token = useMemo(() => localStorage.getItem("jwt"), []);

//   // Helper: normalize college
//   const normalizeCollege = (row) => ({
//     id: Number(row.id || row.ColId || 0),
//     name: row.college || row.Name || `College ${row.id || 0}`,
//   });
//   // Decode JWT to get user ID
//   useEffect(() => {
//     const token = localStorage.getItem("jwt");
//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         const id = decoded["UserId"] || decoded.userId;
//         setUserId(id);
//         console.log("✅ User ID from token:", id);
//       } catch (err) {
//         console.error("❌ Token decode failed", err);
//         setError("Failed to decode user token");
//       }
//     }
//   }, []);

//   // Load colleges
//   useEffect(() => {
//     const fetchColleges = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`${API_BASE_URL}/Programme/GetDbsInternsColleges`, {
//           headers: token ? { Authorization: `Bearer ${token}` } : {},
//         });
//         const data = await res.json();
//         setColleges(Array.isArray(data) ? data.map(normalizeCollege) : []);
//       } catch (err) {
//         console.error("Failed to load colleges:", err);
//         toast.error("Failed to load colleges");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchColleges();
//   }, [token]);

//   // Load students for selected college
//   useEffect(() => {
//     if (!selectedCollegeId) {
//       setStudents([]);
//       return;
//     }

//     const fetchStudents = async () => {
//       setLoading(true);
//       try {
//         const url = `${API_BASE_URL}/Student/GetgetApprovependingstudentlist?colid=${encodeURIComponent(
//           selectedCollegeId
//         )}`;
//         const res = await fetch(url, {
//           headers: token ? { Authorization: `Bearer ${token}` } : {},
//         });
//         const data = await res.json();
//         setStudents(Array.isArray(data) ? data : []);
//         setSelectedStudents(new Set());
//       } catch (err) {
//         console.error("Failed to load students:", err);
//         toast.error("Failed to load students");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStudents();
//   }, [selectedCollegeId, token]);

//   const handleSelectAll = (e) => {
//     if (e.target.checked) setSelectedStudents(new Set(students.map((s) => s.userid)));
//     else setSelectedStudents(new Set());
//   };

//   const handleSelectStudent = (e, userId) => {
//     const updated = new Set(selectedStudents);
//     if (e.target.checked) updated.add(userId);
//     else updated.delete(userId);
//     setSelectedStudents(updated);
//   };

//   const handleApprove = async () => {
//     if (selectedStudents.size === 0) return toast.warning("Select at least one student.");
//     setApproving(true);

//     try {
//       for (const userId of selectedStudents) {
//         const res = await fetch(`${API_BASE_URL}/Student/ApproveStudent/${userId}`, {
//           method: "POST",
//           headers: token ? { Authorization: `Bearer ${token}` } : {},
//         });
//         if (!res.ok) {
//           const errText = await res.text();
//           console.error("Failed to approve user:", userId, errText);
//         }
//       }
//       toast.success("Selected students approved successfully.");
//       // Reload students
//       setSelectedCollegeId(""); // reset triggers reload
//       setSelectedCollegeId(selectedCollegeId);
//     } catch (err) {
//       console.error("Approval failed:", err);
//       toast.error("Approval failed. See console.");
//     } finally {
//       setApproving(false);
//     }
//   };

//   return (
//     <div className="container mt-4">
//         <HeaderTop />
//               <RightSidebar />
//               <LeftSidebar />
//       <h3>Approve Students</h3>

//       <div className="mb-3">
//         <Form.Label>College</Form.Label>
//         <Form.Select
//           value={selectedCollegeId}
//           onChange={(e) => setSelectedCollegeId(e.target.value)}
//           disabled={loading}
//         >
//           <option value="">{loading ? "Loading colleges..." : "-- Select College --"}</option>
//           {colleges.map((c) => (
//             <option key={c.id} value={c.id}>
//               {c.name}
//             </option>
//           ))}
//         </Form.Select>
//       </div>

//       {loading ? (
//         <Spinner animation="border" />
//       ) : students.length === 0 ? (
//         selectedCollegeId && <p>No pending students.</p>
//       ) : (
//         <div className="table-responsive">
//           <Table bordered hover>
//             <thead className="table-light">
//               <tr>
//                 <th>
//                   <Form.Check
//                     type="checkbox"
//                     checked={selectedStudents.size === students.length}
//                     onChange={handleSelectAll}
//                   />
//                 </th>
//                 <th>Username</th>
//                 <th>Full Name</th>
//                 <th>Email</th>
//                 <th>Gender</th>
//                 <th>ABC Unique ID</th>
//                 <th>College</th>
//               </tr>
//             </thead>
//             <tbody>
//               {students.map((s) => (
//                 <tr key={s.userid}>
//                   <td>
//                     <Form.Check
//                       type="checkbox"
//                       checked={selectedStudents.has(s.userid)}
//                       onChange={(e) => handleSelectStudent(e, s.userid)}
//                     />
//                   </td>
//                   <td>{s.Username}</td>
//                   <td>{s.FirstName}</td>
//                   <td>{s.Email}</td>
//                   <td>{s.Gender}</td>
//                   <td>{s.ABC_UniqueID}</td>
//                   <td>{s.College}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         </div>
//       )}

//       {students.length > 0 && (
//         <Button
//           variant="success"
//           onClick={handleApprove}
//           disabled={approving}
//         >
//           {approving ? "Approving..." : "Approve Selected Students"}
//         </Button>
//       )}
//     </div>
//   );
// };

// export default ApproveStudentsPage;


// File: src/pages/ApproveStudentsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Table, Button, Form, Spinner, Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";
import { jwtDecode } from "jwt-decode"; // prefer default import
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";

const ApproveStudentsPage = () => {
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");

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

  // Normalize college row
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

  // Normalize student row to exact keys used in UI
  function normalizeStudent(row = {}, idx = 0) {
    const get = ci(row);
    return {
      userid: Number(get(["userid", "userId", "id"]) || 0),
      // ApproveStatus comes from the modified stored procedure: 'Approved'|'Pending'
      ApproveStatus: String(get(["ApproveStatus", "approvestatus", "IsApprove", "isapprove"]) ?? "Pending"),
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
  // Read userId from JWT (optional)
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
      console.log("✅ User ID from token:", id);
    } catch (err) {
      console.warn("Token decode failed:", err);
      // not fatal for page functionality
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
        console.debug("GetDbsInternsColleges raw response:", data);
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
        console.debug("GetgetApprovependingstudentlist raw response:", data);

        // Support either array response or wrapper object
        const list = Array.isArray(data) ? data : data?.rows ?? data?.result ?? [];

        const normalized = (list || []).map(normalizeStudent);
        console.debug("Normalized students (first 8):", normalized.slice(0, 8));
        setStudents(normalized);
        setSelectedStudents(new Set());
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
  // Search + Select handlers
  // -------------------------
  const [searchQuery, setSearchQuery] = useState("");

  // filteredStudents: check every key (except internal __ keys) for the search text
  const filteredStudents = useMemo(() => {
    const q = String(searchQuery || "").trim().toLowerCase();
    if (!q) return students;
    return students.filter((row) => {
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
  }, [students, searchQuery]);

  // Counts based on currently loaded students for selected college
  const studentCounts = useMemo(() => {
    const total = (students || []).length;
    const approved = (students || []).filter((s) => String(s.ApproveStatus || "").toLowerCase() === "approved").length;
    const pending = total - approved;
    return { total, approved, pending };
  }, [students]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // select only currently visible rows
      setSelectedStudents(new Set((filteredStudents || students).filter((s) => String(s.ApproveStatus || "").toLowerCase() !== "approved").map((s) => s.userid)));
    } else {
      setSelectedStudents(new Set());
    }
  };

  const handleSelectStudent = (e, uid) => {
    // prevent selecting rows that are already approved
    const row = (students || []).find((x) => Number(x.userid) === Number(uid));
    if (row && String(row.ApproveStatus || "").toLowerCase() === "approved") return;

    const updated = new Set(selectedStudents);
    if (e.target.checked) updated.add(uid);
    else updated.delete(uid);
    setSelectedStudents(updated);
  };

  // -------------------------
  // Approve selected students (per-user loop)
  // -------------------------
  const handleApprove = async () => {
    if (!selectedStudents || selectedStudents.size === 0) {
      toast.warning("Select at least one student.");
      return;
    }
    setApproving(true);
    setError("");

    try {
      // If you later expose a bulk API, call that instead of looping
      const failures = [];
      for (const uid of selectedStudents) {
        try {
          const res = await fetch(`${API_BASE_URL}/Student/ApproveStudent/${uid}`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (!res.ok) {
            const text = await res.text().catch(() => "");
            failures.push({ uid, status: res.status, text });
            console.error("Approve failed for", uid, res.status, text);
          }
        } catch (err) {
          failures.push({ uid, error: String(err) });
          console.error("Approve exception for", uid, err);
        }
      }

      if (failures.length) {
        toast.warn(`Approval completed with ${failures.length} failures. See console for details.`);
        console.warn("Approval failures:", failures);
      } else {
        toast.success("Selected students approved successfully.");
      }

      // Refresh students list for the same college
      // quick flicker: clear then restore selectedCollegeId to trigger useEffect fetch
      const cur = selectedCollegeId;
      setSelectedCollegeId("");
      setTimeout(() => setSelectedCollegeId(cur), 80);
    } catch (err) {
      console.error("handleApprove error:", err);
      setError("Approval failed. See console for details.");
      toast.error("Approval failed. See console.");
    } finally {
      setApproving(false);
    }
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
            <div className="container-fluid ">
              <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
                <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                  <i className="fa-solid fa-user-check me-2" /> Approve Students
                </h2>
                <p className="text-muted mb-0 dashboard-hero-sub">
                  Approve pending student registrations by college.
                </p>
              </div>
            </div>
          </div>

          <div className="section-body mt-2">
            <div className="container-fluid">
              <div className="card welcome-card animate-welcome">
                <div className="card-header bg-primary text-white d-flex align-items-center ">
                  <h6 className="mb-0">Student Approvals</h6>
                </div>

                <div className="card-body">
                  {error && <Alert variant="warning">{error}</Alert>}

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <Form.Label>College</Form.Label>
                      <Form.Control
                        as="select"
                        value={selectedCollegeId}
                        onChange={(e) => setSelectedCollegeId(e.target.value)}
                        disabled={loading}
                      >
                        <option value="">{loading ? "Loading colleges..." : "-- Select College --"}</option>
                        {colleges.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </Form.Control>
                    </div>

                    <div className="col-md-4">
                      <Form.Label>Search</Form.Label>
                      <Form.Control
                        type="search"
                        placeholder="Search across all columns"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={loading || students.length === 0}
                      />
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center my-4">
                      <Spinner animation="border" />
                    </div>
                  ) : students.length === 0 ? (
                    selectedCollegeId ? (
                      <p className="text-muted">No pending students for approval.</p>
                    ) : (
                      <p className="text-muted">Select a college to view pending students.</p>
                    )
                  ) : (
                    <div className="table-responsive">
                      <Table bordered hover className="mb-3">
                        <thead className="table-light">
                          <tr>
                           
                            <th>Username</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Gender</th>
                            <th>ABC Unique ID</th>
                            <th>College</th>
                            <th>Approve Status</th>
                             <th style={{ width: 40 }}>
                              <Form.Check
                                type="checkbox"
                                checked={
                                  (filteredStudents || []).length > 0 && selectedStudents.size === (filteredStudents || []).length
                                }
                                onChange={handleSelectAll}
                              />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.map((s) => {
                            const isApproved = String(s.ApproveStatus || "").toLowerCase() === "approved";
                            const checkboxDisabled = isApproved;
                            return (
                            <tr key={s.userid || s.__idx || Math.random()}>
                              
                              <td>{s.Username}</td>
                              <td>{s.FirstName}</td>
                              <td>{s.Email}</td>
                              <td>{s.Gender}</td>
                              <td>{s.ABC_UniqueID}</td>
                              <td>{s.College}</td>
                              <td>{s.ApproveStatus || "Pending"}</td>
                              <td>
                                <Form.Check
                                  type="checkbox"
                                  checked={selectedStudents.has(s.userid)}
                                  onChange={(e) => handleSelectStudent(e, s.userid)}
                                  disabled={checkboxDisabled}
                                />
                              </td>
                            </tr>
                          );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  )}

                  {/* Counts: Total / Approved / To Be Approved (Pending) */}
                  {students.length > 0 && (
                    <div className="mt-3 d-flex gap-2 align-items-center">
                      <div className="p-2 rounded border bg-light">
                        <div className="text-muted small">Total Students</div>
                        <div className="fw-bold">{studentCounts.total}</div>
                      </div>
                      <div className="p-2 rounded border bg-light">
                        <div className="text-muted small">Approved</div>
                        <div className="fw-bold">{studentCounts.approved}</div>
                      </div>
                      <div className="p-2 rounded border bg-light">
                        <div className="text-muted small">To Be Approved</div>
                        <div className="fw-bold">{studentCounts.pending}</div>
                      </div>
                    </div>
                  )}

                  <div className="d-flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedStudents(new Set())}
                      disabled={approving}
                    >
                      Clear Selection
                    </Button>

                    <Button
                      variant="success"
                      onClick={handleApprove}
                      disabled={approving || selectedStudents.size === 0}
                    >
                      {approving ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                          Approving...
                        </>
                      ) : (
                        "Approve Selected Students"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="section-body mt-2">
            <div className="container-fluid">
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApproveStudentsPage;

