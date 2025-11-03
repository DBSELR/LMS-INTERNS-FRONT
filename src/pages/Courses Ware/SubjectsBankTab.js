import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Table, Row, Col, Modal } from "react-bootstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config";
import ConfirmationPopup from "../../components/ConfirmationPopup"; // uses the same popup design

const SubjectsBankTab = ({ isActive }) => {
  const [cgData, setCgData] = useState([]);
  const [filteredCGOptions, setFilteredCGOptions] = useState([]);
  const [selectedCG, setSelectedCG] = useState([]);
  const [batches, setBatches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [SubBank, setSubBank] = useState([]);
  const formRef = useRef(null);

  // Delete confirmation popup state
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const filteredSubjects = SubBank.filter(
    (item) =>
      item.paperName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.paperCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [activeExaminationId, setActiveExaminationId] = useState(null);
  const [isUnitEditMode, setIsUnitEditMode] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [units, setUnits] = useState([{ unitNo: 1, title: "", duration: "0 0" }]);

  // Only the fields we show + hidden semester
  const [form, setForm] = useState({
    batchName: "",
    semester: "", // hidden: auto set to first available sem for selected batch
    paperCode: "",
    paperName: "",
    // hidden/dummy fields (always sent as fixed values)
    examinationId: null,
  });

  // ---------- helper to reliably show backend errors ----------
  async function readError(res) {
    const text = await res.text().catch(() => "");
    let json;
    try {
      json = text ? JSON.parse(text) : undefined;
    } catch {
      json = undefined;
    }
    const msg =
      json?.message ||
      json?.error ||
      json?.title ||
      text ||
      `HTTP ${res.status}`;
    return { text, json, msg };
  }

  useEffect(() => {
    if (isActive) {
      fetchInitialData();
      setSubBank([]);
      fetchSubBank();
    }
  }, [isActive]);

  useEffect(() => {
    console.log("SubjectsBankTab component mounted");
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(`${API_BASE_URL}/Examination/GetBatch`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const { msg } = await readError(response);
        throw new Error(msg);
      }
      const data = await response.json();
      const uniqueBatches = Array.isArray(data)
        ? [...new Set(data.map((item) => item.batchName))]
        : [];
      setBatches(uniqueBatches);
    } catch (err) {
      toast.error(`Failed to load batches: ${err.message}`);
      console.error("❌ Error fetching batches", err);
    }
  };

  // add {silent} option to suppress toast when called from Edit
  const fetchSemesters = async (batch, { silent = false } = {}) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${API_BASE_URL}/Examination/GetSubjectbankSems?batch=${encodeURIComponent(batch)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const { msg } = await readError(res);
        if (!silent) toast.error(`Failed to fetch semesters: ${msg}`);
        return;
      }
      const data = await res.json();
      const semList = data.map((item) => item.sem);
      setSemesters(semList);
      // Hidden behavior: auto-pick the first semester
      setForm((prev) => ({ ...prev, semester: semList?.[0]?.toString() || "" }));
      setSelectedCG([]);
      setCgData([]);
    } catch (err) {
      if (!silent) toast.error(`Failed to fetch semesters: ${err.message}`);
      console.error("❌ Error fetching semesters", err);
    }
  };

  const fetchSubBank = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Examination/GetSubBank`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const { msg } = await readError(res);
        throw new Error(msg);
      }
      const data = await res.json();
      setSubBank(data);
    } catch (err) {
      toast.error(`Failed to fetch subjects: ${err.message}`);
      console.error("❌ Error fetching SubBank", err);
    }
  };

  const fetchCGData = async (batch, sem) => {
    if (!batch || !sem) return;
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${API_BASE_URL}/COURSE/GetProgrammeandgroups?Batch=${encodeURIComponent(batch)}&SEM=${encodeURIComponent(sem)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const { msg } = await readError(res);
        throw new Error(msg);
      }
      const data = await res.json();
      setCgData(data);
    } catch (err) {
      toast.error(`Failed to fetch Course/Group: ${err.message}`);
      console.error("❌ Error fetching CG data", err);
    }
  };

  // When batch and hidden semester are set, load CG options
  useEffect(() => {
    if (form.batchName && form.semester) {
      fetchCGData(form.batchName, form.semester);
    }
  }, [form.batchName, form.semester]);

  // Build react-select options from cgData
  useEffect(() => {
    if (Array.isArray(cgData) && cgData.length) {
      const filtered = cgData.map((cg) => ({
        value: cg.cGId,
        label: cg.cGName,
        courseId: cg.cGId?.split("_")[0],
        groupId: cg.cGId?.split("_")[1],
        batchName: cg.batchName,
      }));
      setFilteredCGOptions(filtered);
    } else {
      setFilteredCGOptions([]);
    }
  }, [cgData]);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    // Only visible fields handled here
    if (name === "batchName") {
      setForm((prev) => ({
        ...prev,
        batchName: value,
        paperCode: prev.paperCode,
        paperName: prev.paperName,
      }));
      if (value) {
        await fetchSemesters(value); // sets hidden semester to first available
      } else {
        setForm((prev) => ({ ...prev, semester: "" }));
        setSelectedCG([]);
        setCgData([]);
      }
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = async (exam) => {
    // silent=true prevents that validation toast you saw on Edit
    await fetchSemesters(exam.batchName, { silent: true });
    setForm({
      batchName: exam.batchName,
      semester: exam.semester?.toString() || "",
      paperCode: exam.paperCode,
      paperName: exam.paperName,
      examinationId: exam.examinationId ?? null,
    });
    setSelectedCG([
      {
        value: `${exam.programmeId}_${exam.groupId}`,
        label: `${exam.programmeCode} - ${exam.programmeName} / ${exam.groupCode} - ${exam.groupName}`,
        groupId: exam.groupId,
      },
    ]);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetForm = () => {
    setForm({
      batchName: "",
      semester: "",
      paperCode: "",
      paperName: "",
      examinationId: null,
    });
    setSelectedCG([]);
    setSemesters([]);
    setCgData([]);
    setFilteredCGOptions([]);
  };

  // ---- helper that tries JSON update first, then retries with form-encoded if server needs name-value collection ----
  const putUpdateResilient = async (endpointWithId, token, payloadJson) => {
    // 1) JSON try
    let res = await fetch(endpointWithId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payloadJson),
    });

    if (res.ok) return res;

    const { msg } = await readError(res);
    const lower = (msg || "").toLowerCase();

    // If backend says ExaminationId key missing, retry with form-encoded
    if (lower.includes("keynotfound") || lower.includes("examinationid")) {
      const p = payloadJson;
      const urlEncoded = new URLSearchParams();
      urlEncoded.set("ExaminationId", String(p.ExaminationId ?? p.examinationId ?? ""));
      urlEncoded.set("Batch", p.Batch ?? p.batchName ?? "");
      urlEncoded.set("Semester", String(p.Semester ?? p.semester ?? 1));
      urlEncoded.set("PaperCode", p.paperCode ?? "");
      urlEncoded.set("PaperName", p.paperName ?? "");
      urlEncoded.set("IsElective", String(p.isElective ? 1 : 0));
      urlEncoded.set("PaperType", p.paperType ?? "Theory");
      urlEncoded.set("Credits", String(p.credits ?? 0));
      urlEncoded.set("internalMax1", String(p.internalMax1 ?? 0));
      urlEncoded.set("internalPass1", String(p.internalPass1 ?? 0));
      urlEncoded.set("internalMax2", String(p.internalMax2 ?? 0));
      urlEncoded.set("internalPass2", String(p.internalPass2 ?? 0));
      urlEncoded.set("InternalMax", String(p.InternalMax ?? 0));
      urlEncoded.set("InternalPass", String(p.InternalPass ?? 0));
      urlEncoded.set("theoryMax", String(p.theoryMax ?? 0));
      urlEncoded.set("theoryPass", String(p.theoryPass ?? 0));
      urlEncoded.set("totalMax", String(p.totalMax ?? 0));
      urlEncoded.set("totalPass", String(p.totalPass ?? 0));

      res = await fetch(endpointWithId, {
        method: "PUT",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
        body: urlEncoded.toString(),
      });
    }

    return res;
  };

  const handleSubmit = async () => {
    const { paperCode, paperName } = form;

    if (!paperCode || !paperName) {
      toast.error("Please fill all required fields");
      console.error("Submission blocked: Missing required fields.", {
        paperCode,
        paperName,
      });
      return;
    }

    // Use Update when editing; Create when adding new
    const isEdit = form.examinationId != null && form.examinationId !== "";
    const endpoint = isEdit
      ? `${API_BASE_URL}/Examination/Update/${form.examinationId}`
      : `${API_BASE_URL}/Examination/Create`;
    const method = isEdit ? "PUT" : "POST";

    // Build payload; include keys the backend/SP expects
    const payloadBase = {
      paperCode: String(paperCode).trim(),
      paperName: String(paperName).trim(),
      isElective: false,
      paperType: "Theory",
      credits: 0,
      internalMax1: 0,
      internalPass1: 0,
      internalMax2: 0,
      internalPass2: 0,
      InternalMax: 0,
      InternalPass: 0,
      theoryMax: 0,
      theoryPass: 0,
      totalMax: 0,
      totalPass: 0,

      // Existing fields
      batchName: form.batchName || "",
      semester: Number(form.semester || 1),

      // Keys matching stored procedure/controller
      Batch: form.batchName || "",
      Semester: Number(form.semester || 1),
    };

    const payload = isEdit
      ? {
          ...payloadBase,
          ExaminationId: Number(form.examinationId),
          examinationId: Number(form.examinationId), // also include camel just in case
        }
      : payloadBase;

    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        console.error("JWT token is missing. User might not be authenticated.");
        toast.error("Session expired. Please log in again.");
        return;
      }

      console.log("Sending request to server:", {
        endpoint,
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: payload,
      });

      let res;
      if (isEdit) {
        // robust update with fallback to form-encoded if server needs name-value
        res = await putUpdateResilient(endpoint, token, payload);
      } else {
        // plain JSON create
        res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const { msg, text, json } = await readError(res);
        console.error("❌ Server error (Subject Save/Update):", {
          status: res.status,
          msg,
          text,
          json,
          payload,
        });
        const lower = (msg || "").toLowerCase();
        if (lower.includes("duplicate")) {
          toast.error("❌ Duplicate: Subject Code already exists for this Batch & Semester.");
        } else if (lower.includes("examinationid")) {
          toast.error("❌ Update failed: ExaminationId was not received by the server.");
        } else {
          toast.error(`❌ ${msg}`);
        }
        return;
      }

      const responseData = await res.json().catch(() => ({}));
      console.log("Success response data:", {
        responseData,
        payload,
      });
      toast.success(isEdit ? "✅ Subject updated successfully" : "✅ Subject saved successfully");
      resetForm();
      fetchInitialData();
      fetchSubBank();
    } catch (err) {
      console.error("❌ Error during submission (network/runtime):", {
        error: err,
        payload,
      });
      toast.error(`❌ Submission error: ${err.message}`);
    }
  };

  // ----- Delete flow using ConfirmationPopup (no browser alert) -----
  const requestDelete = (examinationId) => {
    setPendingDeleteId(examinationId);
    setShowConfirmPopup(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Examination/Delete/${pendingDeleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const { msg } = await readError(res);
        toast.error(`Delete failed: ${msg}`);
        return;
      }
      toast.success("✅ Subject deleted successfully");
      fetchInitialData();
      fetchSubBank();
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
    } finally {
      setShowConfirmPopup(false);
      setPendingDeleteId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowConfirmPopup(false);
    setPendingDeleteId(null);
  };

  const fetchUnitsByExamId = async (exam) => {
    try {
      const token = localStorage.getItem("jwt");
      // Set subject summary for modal header
      setForm((prev) => ({
        ...prev,
        batchName: exam.batchName,
        semester: exam.semester?.toString() || "",
        paperCode: exam.paperCode,
        paperName: exam.paperName,
      }));

      const res = await fetch(
        `${API_BASE_URL}/Examination/GetSubjectUnitsById/${exam.examinationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        const { msg } = await readError(res);
        throw new Error(msg);
      }

      const data = await res.json();

      const formattedUnits = data.map((u) => ({
        unitId: u.unitId,
        unitNo: u.unitNumber,
        title: u.title,
        duration: `${u.hours} ${u.minutes}`,
      }));

      setUnits(formattedUnits);
      setActiveExaminationId(exam.examinationId);
      setShowUnitModal(true);
    } catch (err) {
      toast.error(`Failed to fetch units: ${err.message}`);
    }
  };

  return (
    <div className="container py-0 pt-0 welcome-card animate-welcome">
      <div className="row g-3">
        {/* Add / Edit Subject */}
        <div className="col-12 col-lg-6">
          <div className="card-subject bg-glass rounded border shadow-sm">
            <div ref={formRef} className="subject-body custom-scrollbar">
              <h5 className="mb-2 text-primary">Add / Edit Subject</h5>

              <Form>
                <hr className="my-3" />

                <Row className="g-3">
                  <Col xs={12} md={4}>
                    <Form.Group>
                      <Form.Label>Subject Code</Form.Label>
                      <Form.Control
                        name="paperCode"
                        value={form.paperCode}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={8}>
                    <Form.Group>
                      <Form.Label>Subject Name</Form.Label>
                      <Form.Control
                        name="paperName"
                        value={form.paperName}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-center mt-3">
                  <Button
                    variant="success"
                    className="rounded-pill px-4"
                    onClick={handleSubmit}
                    type="button"
                  >
                    {form.examinationId ? "Update" : "Save"}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>

        {/* Saved Subjects */}
        <div className="col-12 col-lg-6">
          <div className="card-subject bg-white rounded border shadow-sm">
            <div className="subject-body custom-scrollbar">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 ml-2 gap-2">
                <h5 className="mb-1">📋 Saved Subjects</h5>
                <input
                  type="text"
                  className="form-control ms-sm-3 search-input"
                  placeholder="Search by Name or Code"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="table-wrapper">
                <div className="table-responsive">
                  <Table bordered striped hover size="sm" className="mb-0">
                    <thead>
                      <tr>
                        <th>Subject Code</th>
                        <th>Subject Name</th>
                        <th>Units</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(filteredSubjects || []).map((exam) => (
                        <tr key={exam.examinationId ?? `${exam.paperCode}-${exam.batchName}`}>
                          <td>{exam.paperCode}</td>
                          <td className="text-start">{exam.paperName}</td>
                          <td>
                            {/* 🆕 Show "+" when there are no units */}
                            <Button
                              size="sm"
                              variant="link"
                              onClick={() => fetchUnitsByExamId(exam)}
                              title={Number(exam.unitCount) > 0 ? "View Units" : "Add Units"}
                            >
                              {Number(exam.unitCount) > 0 ? exam.unitCount : "➕"}
                            </Button>
                          </td>
                          <td className="actions-cell d-flex flex-row align-items-center border-0 mt-3">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleEdit(exam)}
                              className="me-1 mb-2 mb-sm-0"
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => requestDelete(exam.examinationId)}
                              className="me-1 mb-2 mb-sm-0"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unit Modal */}
      <Modal
        show={showUnitModal}
        onHide={() => {
          setShowUnitModal(false);
          setActiveExaminationId(null);
          setIsUnitEditMode(false);
        }}
        size="lg"
        className="unit-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>📚 Unit Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="mb-3">
            <div className="fw-bold">
              <span className="text-primary">Subject : {form.paperCode}</span> -{" "}
              <span className="text-primary">{form.paperName}</span>
              {/* {" ("}
              <span className="text-primary">{form.batchName}</span>/
              <span className="text-primary">{form.semester}</span>
              {")"} */}
            </div>
          </div>

          <div className="mb-3">
            <Button
              variant={isUnitEditMode ? "secondary" : "warning"}
              onClick={() => setIsUnitEditMode(!isUnitEditMode)}
            >
              {isUnitEditMode ? "🔒 Cancel Edit" : "✏️ Edit Units"}
            </Button>
          </div>

          <div className="table-responsive modal-table-wrap">
            <Table bordered size="sm" className="mb-0">
              <thead>
                <tr className="text-center">
                  <th>Unit</th>
                  <th>Title</th>
                  <th>Hours</th>
                  <th>Minutes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(units || []).map((unit, index) => {
                  const parts = (unit.duration || "0 0").split(/\s+/);
                  const hours = Number(parts[0]) || 0;
                  const minutes = Number(parts[1]) || 0;
                  return (
                    <tr key={unit.unitId ?? index}>
                      <td className="text-center">Unit {unit.unitNo ?? index + 1}</td>
                      <td>
                        <Form.Control
                          type="text"
                          placeholder="Enter Unit Title"
                          value={unit.title}
                          disabled={!isUnitEditMode}
                          onChange={(e) => {
                            const newUnits = [...units];
                            newUnits[index] = { ...newUnits[index], title: e.target.value };
                            setUnits(newUnits);
                          }}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          min="0"
                          value={hours}
                          disabled={!isUnitEditMode}
                          onChange={(e) => {
                            const newUnits = [...units];
                            const prevM =
                              (newUnits[index]?.duration || "0 0").split(/\s+/)[1] || 0;
                            newUnits[index] = {
                              ...newUnits[index],
                              duration: `${e.target.value || 0} ${prevM}`,
                            };
                            setUnits(newUnits);
                          }}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          min="0"
                          value={minutes}
                          disabled={!isUnitEditMode}
                          onChange={(e) => {
                            const newUnits = [...units];
                            const prevH =
                              (newUnits[index]?.duration || "0 0").split(/\s+/)[0] || 0;
                            newUnits[index] = {
                              ...newUnits[index],
                              duration: `${prevH} ${e.target.value || 0}`,
                            };
                            setUnits(newUnits);
                          }}
                        />
                      </td>
                      <td className="text-center">
                        <Button
                          size="sm"
                          variant="outline-danger"
                          disabled={!isUnitEditMode}
                          onClick={() => {
                            const newUnits = [...units];
                            newUnits.splice(index, 1);
                            setUnits(
                              newUnits.map((u, i) => ({ ...u, unitNo: i + 1 }))
                            );
                          }}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          {isUnitEditMode && (
            <div className="mt-3 d-flex flex-column flex-sm-row gap-2">
              <Button
                variant="secondary"
                onClick={() =>
                  setUnits([
                    ...units,
                    { unitNo: units.length + 1, title: "", duration: "0 0" },
                  ])
                }
              >
                ➕ Add Unit
              </Button>

              <Button
                variant="success"
                onClick={async () => {
                  try {
                    if (!activeExaminationId) {
                      toast.error("❌ Examination ID missing for units");
                      return;
                    }
                    for (let i = 0; i < units.length; i++) {
                      const u = units[i];
                      const parts = (u.duration || "0 0").split(/\s+/);
                      const h = Number(parts[0]);
                      const m = Number(parts[1]);
                      if (!u.title?.trim()) {
                        toast.error(`❌ Unit ${i + 1}: Title is required`);
                        return;
                      }
                      if (isNaN(h)) {
                        toast.error(`❌ Unit ${i + 1}: Hours is required`);
                        return;
                      }
                      if (isNaN(m)) {
                        toast.error(`❌ Unit ${i + 1}: Minutes is required`);
                        return;
                      }
                    }
                    const payload = units.map((u) => {
                      const parts = (u.duration || "0 0").split(/\s+/);
                      return {
                        unitId: u.unitId || 0,
                        examinationId: activeExaminationId,
                        unitNumber: u.unitNo,
                        title: u.title,
                        hours: Number(parts[0]) || 0,
                        minutes: Number(parts[1]) || 0,
                      };
                    });
                    const token = localStorage.getItem("jwt");
                    if (!token) {
                      toast.error("Session expired");
                      return;
                    }
                    const res = await fetch(
                      `${API_BASE_URL}/Examination/insertmultiunits`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(payload),
                      }
                    );
                    if (!res.ok) {
                      const { msg, text, json } = await readError(res);
                      console.error("❌ Server error (Save Units):", {
                        status: res.status,
                        msg,
                        text,
                        json,
                        payload,
                      });
                      toast.error(msg);
                      return;
                    }
                    toast.success("✅ Units saved successfully");
                    setShowUnitModal(false);
                    setActiveExaminationId(null);
                    setIsUnitEditMode(false);
                  } catch (err) {
                    console.error(err);
                    toast.error("Failed to save units");
                  }
                }}
              >
                💾 Save Units
              </Button>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Popup (same design as Library page) */}
      <ConfirmationPopup
        show={showConfirmPopup}
        message="Are you sure you want to delete this subject?"
        onConfirm={handleDeleteConfirmed}
        onCancel={handleDeleteCancel}
        toastMessage="Subject deleted"
      />
    </div>
  );
};

export default SubjectsBankTab;
