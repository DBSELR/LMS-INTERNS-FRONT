// File: src/pages/Courses Ware/StudentBatchUpdateTab.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config";

const DEBUG = true;

/* =============== Case-insensitive helper =============== */
function ci(obj) {
  const map = {};
  Object.keys(obj || {}).forEach((k) => (map[k.toLowerCase()] = obj[k]));
  return (candidates) => {
    for (const c of candidates) {
      const v = map[c.toLowerCase()];
      if (v !== undefined && v !== null) return v;
    }
    return undefined;
  };
}

/* =============== Normalizers =============== */
// 🔹 Colleges: id, colcode, college
function normalizeCollege(row, idx) {
  const get = ci(row);
  const id = get(["id", "ColId", "CollegeId"]) ?? 0;

  // "college" = uname + '_' + colcode + '_' + colname
  const collegeLabel =
    get(["college"]) ??
    get(["CollegeName", "Name"]) ??
    `College ${id || idx + 1}`;

  return {
    id: Number(id) || 0,
    name: String(collegeLabel),
  };
}

// 🔹 Courses: from sp_GetDbsInternsCoursesByCollege
// select distinct u.programmeid, p.ProgrammeCode, p.ProgrammeCode + '_' + p.ProgrammeName ProgrammeName
function normalizeCourse(row, idx) {
  const get = ci(row);
  const programmeId =
    get(["ProgrammeId", "Pid", "programmeid", "pid"]) ?? 0;
  const code =
    get(["ProgrammeCode", "Code", "programmecode", "code"]) ?? "";
  // Here ProgrammeName already contains "Code_Name", so just use it as label
  const name =
    get(["ProgrammeName", "programmename", "Name"]) ??
    `Course ${idx + 1}`;

  return {
    programmeId: Number(programmeId) || 0,
    code: String(code || ""),
    name: String(name || ""),
    label: String(name || ""), // use concatenated name coming from SP
  };
}

function normalizeBatch(row, idx) {
  const get = ci(row);
  const bid = get(["Bid", "bid", "Id"]) ?? 0;
  const batchName =
    get(["Batch", "BatchName", "batch", "batchname"]) ??
    `Batch ${idx + 1}`;
  const programmeId =
    get(["ProgrammeId", "Pid", "programmeid", "pid"]) ?? 0;
  const startDate = get(["StartDate", "startdate"]) ?? null;
  const endDate = get(["EndDate", "enddate"]) ?? null;
  const programmeCode = get(["ProgrammeCode", "programmecode"]) ?? "";
  const programmeName = get(["ProgrammeName", "programmename"]) ?? "";

  return {
    bid: Number(bid) || 0,
    batch: String(batchName),
    programmeId: Number(programmeId) || 0,
    startDate,
    endDate,
    programmeCode: programmeCode || "",
    programmeName: programmeName || "",
  };
}

/* =============== API URLs =============== */
const COLLEGES_URL = `${API_BASE_URL}/Programme/GetDbsInternsColleges`;
const COURSES_URL = `${API_BASE_URL}/Programme/GetDbsInternsCourses`; // 🔹 with ColId param
const BATCHES_URL = `${API_BASE_URL}/Programme/GetFutureBatches`;
const UPDATE_URL = `${API_BASE_URL}/Programme/UpdateStudentBatchByCollege`;

const StudentBatchUpdateTab = () => {
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [selectedProgrammeId, setSelectedProgrammeId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");

  const [loadingColleges, setLoadingColleges] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");

  const token = useMemo(() => localStorage.getItem("jwt"), []);

  /* =============== Initial load: just colleges =============== */
  useEffect(() => {
    fetchColleges();
    // courses now depend on selected college, so we don't fetch them here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchColleges = async () => {
    setLoadingColleges(true);
    setError("");
    try {
      const res = await fetch(COLLEGES_URL, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        throw new Error(`Failed to load colleges (${res.status})`);
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const normalized = list.map(normalizeCollege);
      if (DEBUG) console.log("🎓 Colleges:", normalized);
      setColleges(normalized);
    } catch (err) {
      console.error("❌ fetchColleges error:", err);
      setError(err.message || "Failed to load colleges");
      toast.error("Failed to load colleges");
    } finally {
      setLoadingColleges(false);
    }
  };

  // 🔹 Fetch COURSES for a given College (ColId)
  const fetchCourses = async (colId) => {
    if (!colId) {
      setCourses([]);
      return;
    }
    setLoadingCourses(true);
    setError("");
    try {
      const url = `${COURSES_URL}?ColId=${encodeURIComponent(colId)}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        throw new Error(`Failed to load courses (${res.status})`);
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const normalized = list.map(normalizeCourse);
      if (DEBUG) console.log("📚 Courses (by college):", normalized);
      setCourses(normalized);
    } catch (err) {
      console.error("❌ fetchCourses error:", err);
      setError(err.message || "Failed to load courses");
      toast.error("Failed to load courses");
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchBatches = async (programmeId) => {
    if (!programmeId) {
      setBatches([]);
      return;
    }
    setLoadingBatches(true);
    setError("");
    try {
      const url = `${BATCHES_URL}?programmeId=${programmeId}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        throw new Error(`Failed to load batches (${res.status})`);
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const normalized = list.map(normalizeBatch);
      if (DEBUG) console.log("🧾 Batches:", normalized);
      setBatches(normalized);
    } catch (err) {
      console.error("❌ fetchBatches error:", err);
      setError(err.message || "Failed to load batches");
      toast.error("Failed to load batches");
    } finally {
      setLoadingBatches(false);
    }
  };

  /* =============== Handlers =============== */
  const handleCollegeChange = (e) => {
    const val = e.target.value;
    setSelectedCollegeId(val);

    // reset dependent dropdowns
    setSelectedProgrammeId("");
    setSelectedBatchId("");
    setCourses([]);
    setBatches([]);

    if (val) {
      fetchCourses(val); // 🔹 load courses for this college
    }
  };

  const handleProgrammeChange = (e) => {
    const val = e.target.value;
    setSelectedProgrammeId(val);
    setSelectedBatchId("");
    if (val) {
      fetchBatches(val);
    } else {
      setBatches([]);
    }
  };

  const handleBatchChange = (e) => {
    const val = e.target.value;
    setSelectedBatchId(val);
  };

  const handleUpdate = async () => {
    if (!selectedCollegeId) {
      toast.error("Please select a College");
      return;
    }
    if (!selectedProgrammeId) {
      toast.error("Please select a Course");
      return;
    }
    if (!selectedBatchId) {
      toast.error("Please select a Batch");
      return;
    }

    const batch = batches.find(
      (b) => String(b.bid) === String(selectedBatchId)
    );
    if (!batch) {
      toast.error("Selected batch not found");
      return;
    }

    const payload = {
      ColId: Number(selectedCollegeId),
      BatchName: batch.batch,
      ProgrammeId: Number(selectedProgrammeId),
    };

    if (DEBUG) console.log("➡️ Update payload:", payload);

    try {
      setUpdating(true);
      const res = await fetch(UPDATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let json;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }

      if (!res.ok) {
        const msg =
          (json && (json.message || json.error)) ||
          text ||
          `Update failed (${res.status})`;
        throw new Error(msg);
      }

      const successMsg =
        (json && (json.message || json.Message)) ||
        "Students Batch updated successfully";
      toast.success(successMsg);
    } catch (err) {
      console.error("❌ UpdateStudentBatchByCollege error:", err);
      toast.error(err.message || "Failed to update students batch");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="container py-0 pt-0 welcome-card animate-welcome">
      <div className="mb-0 p-0 rounded">
        <h5 className="mb-0 mt-0 text-primary">
          Update Students Batch
        </h5>

        {error && (
          <Alert variant="warning" className="mb-3 mt-2">
            {error}
          </Alert>
        )}

        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdate();
          }}
        >
          {/* Match CourseGroupAssignmentTab row design */}
          <div className="row mb-3 subject-assignment-buttons">
            {/* College */}
            <div className="col-md-4">
              <Form.Label>College</Form.Label>
              <Form.Control
                as="select"
                value={selectedCollegeId}
                onChange={handleCollegeChange}
                disabled={loadingColleges}
              >
                <option value="">
                  {loadingColleges ? "Loading colleges..." : "Select College"}
                </option>
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Form.Control>
            </div>

            {/* Course (depends on College) */}
            <div className="col-md-4">
              <Form.Label>Course</Form.Label>
              <Form.Control
                as="select"
                value={selectedProgrammeId}
                onChange={handleProgrammeChange}
                disabled={loadingCourses || !selectedCollegeId}
              >
                <option value="">
                  {!selectedCollegeId
                    ? "Select College first"
                    : loadingCourses
                    ? "Loading courses..."
                    : "Select Course"}
                </option>
                {courses.map((c, i) => (
                  <option key={i} value={c.programmeId}>
                    {c.label}
                  </option>
                ))}
              </Form.Control>
            </div>

            {/* Batch (future, depends on course) */}
            <div className="col-md-4">
              <Form.Label>Batch (Future)</Form.Label>
              <Form.Control
                as="select"
                value={selectedBatchId}
                onChange={handleBatchChange}
                disabled={loadingBatches || !selectedProgrammeId}
              >
                {!selectedProgrammeId ? (
                  <option value="">
                    Select Course first to load future Batches
                  </option>
                ) : loadingBatches ? (
                  <option value="">Loading batches...</option>
                ) : batches.length === 0 ? (
                  <option value="">No future batches found</option>
                ) : (
                  <>
                    <option value="">Select Batch</option>
                    {batches.map((b, i) => (
                      <option key={i} value={b.bid}>
                        {b.batch}
                      </option>
                    ))}
                  </>
                )}
              </Form.Control>
            </div>
          </div>

          <div className="text-center mt-3">
            <Button
              type="submit"
              variant="success"
              className="rounded-pill px-5 py-2 shadow mb-2"
              style={{
                fontSize: "1.05rem",
                minWidth: "220px",
                background:
                  "linear-gradient(90deg, rgba(29,161,242,1) 0%, rgba(0,212,255,1) 100%)",
                border: "none",
              }}
              disabled={updating}
            >
              {updating ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    className="me-2"
                  />
                  Updating...
                </>
              ) : (
                "💾 Update Students Batch"
              )}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default StudentBatchUpdateTab;
