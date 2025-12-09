// File: src/pages/students/AddStudent.jsx
import React, { useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import ReactDOM from "react-dom";
import API_BASE_URL from "../../config";

const AddStudent = ({ student, onSubmit, editMode = false, readOnly = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔹 Tabs: "single" | "bulk"
  const [activeTab, setActiveTab] = useState("single");

  // 🔹 Bulk upload state
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkError, setBulkError] = useState("");

  // Get UserId from JWT token once, at the top
  let userId = "";
  const token = localStorage.getItem("jwt");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId =
        decoded.UserId ||
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        "";
    } catch (e) {
      console.warn("Failed to decode JWT for UserId", e);
    }
  }

  /* ========= Error Modal ========= */
  const [showErrModal, setShowErrModal] = useState(false);
  const [errInfo, setErrInfo] = useState({
    title: "",
    message: "",
    conflicts: [],
    raw: null,
  });

  /* ========= Options / Lists ========= */
  const [programmeOptions, setProgrammeOptions] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [filteredProgrammes, setFilteredProgrammes] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);

  // Degree options as provided
  const degreeOptions = [
    "B A Honours",
    "B AOL Honours",
    "BBA Honours",
    "BCA Honours",
    "B Com Honours (General)",
    "B Com Honours (Computer Applications)",
    "B Com Honours (Digital Marketing)",
    "B Com Honours (Financial Markets)",
    "BHM Honours",
    "B Sc Honours",
    "B Voc Honours",
    "B Com Honours (Logistics Management)",
    "B Com Honours (BFSI)",
  ];

  /* ========= Form ========= */
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    profilePhotoUrl: "",
    batch: "",
    programmeId: "", // keep as string in state
    semester: "1",
    degree: "",
    aBC_UniqueID: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const firstErrorRef = useRef(null);

  /* ========= Load options ========= */
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!userId) return; // ensure we have decoded UserId first

    fetch(`${API_BASE_URL}/Programme/GetBatchByUsername?UserId=${userId}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then((r) => r.json())
      .then((data) => {
        console.log("[AddStudent] /GetBatchByUsername data:", data);
        setProgrammeOptions(data || []);
        setBatchList([...new Set((data || []).map((p) => p.batchName))]);
      })
      .catch((e) => console.error("GetBatchByUsername fetch error:", e));
  }, [userId]);

  /* ========= Populate for edit ========= */
  useEffect(() => {
    if (student && programmeOptions.length) {
      const matchedProgramme = programmeOptions.find(
        (p) =>
          p.programmeName === student.programme ||
          p.programmeId === student.programmeId
      );
      const dob = student.dateOfBirth?.split("T")[0] || "";

      setFormData((prev) => ({
        ...prev,
        ...student,
        programmeId: matchedProgramme?.programmeId
          ? String(matchedProgramme.programmeId)
          : "",
        batch: matchedProgramme?.batchName || student.batch || "",
        dateOfBirth: dob,
        username: student.username || "",
        password: student.username || "", // Set password to username
        degree: student.degree || "",
        aBC_UniqueID: student.aBC_UniqueID || "",
      }));
    }
  }, [student, programmeOptions]);

  /* ========= Dependent lists ========= */
  useEffect(() => {
    if (!formData.batch) {
      setFilteredProgrammes([]);
      setSemesterOptions([]);
      return;
    }

    const progs = programmeOptions.filter((p) => p.batchName === formData.batch);
    setFilteredProgrammes(progs);

    const selectedProgramme = programmeOptions.find(
      (p) => String(p.programmeId) === String(formData.programmeId || "")
    );

    const semCount = selectedProgramme?.numberOfSemesters || 0;
    setSemesterOptions(Array.from({ length: semCount }, (_, i) => i + 1));
  }, [formData.batch, formData.programmeId, programmeOptions]);

  /* ========= Validation ========= */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const phoneDigits = (v) => (v || "").replace(/\D/g, "");
  const zipRegexIndia = /^[1-9][0-9]{5}$/;

  const validate = (fd) => {
    const err = {};

    if (!fd.username?.trim()) err.username = "Username is required";
    else if (fd.username.trim().length < 3)
      err.username = "Username must be at least 3 characters";

    if (!fd.email?.trim()) err.email = "Email is required";
    else if (!emailRegex.test(fd.email.trim()))
      err.email = "Enter a valid email";

    if (!fd.firstName?.trim()) err.firstName = "First Name is required";

    const ph = phoneDigits(fd.phoneNumber);
    if (!ph) err.phoneNumber = "Phone Number is required";
    else if (ph.length !== 10)
      err.phoneNumber = "Enter a 10-digit mobile number";

    if (!fd.dateOfBirth) err.dateOfBirth = "Date of Birth is required";
    else {
      const today = new Date();
      const dob = new Date(fd.dateOfBirth);
      if (dob > today) err.dateOfBirth = "DOB cannot be in the future";
      const min = new Date(
        today.getFullYear() - 16,
        today.getMonth(),
        today.getDate()
      );
      if (!err.dateOfBirth && dob > min)
        err.dateOfBirth = "Student must be at least 16 years old";
    }

    if (!fd.gender?.trim()) err.gender = "Gender is required";
    if (!fd.batch) err.batch = "Batch is required";
    if (!fd.programmeId) err.programmeId = "Board is required";
    if (!fd.degree?.trim()) err.degree = "Degree is required";
    if (!fd.aBC_UniqueID?.trim()) err.aBC_UniqueID = "ABC Id is required";

    return err;
  };

  /* ========= Error helpers ========= */
  const isConflict409 = (x) => {
    try {
      if (!x) return false;
      if (typeof x === "number") return x === 409;
      if (x.status === 409) return true;
      if (x.response?.status === 409) return true;
      if (x.ok === false && x.status === 409) return true;
      return false;
    } catch {
      return false;
    }
  };

  function normalizeErrorPayload(err) {
    const status =
      err?.response?.status ??
      err?.status ??
      (err?.ok === false ? err.status : undefined);

    let data =
      err?.response?.data ??
      err?.data ??
      err?.body ??
      err?.payload ??
      err;

    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {
        /* keep as string */
      }
    }
    return { status, data };
  }

  function buildErrInfo(err) {
    const { status, data } = normalizeErrorPayload(err);
    if (Number(status) === 409) {
      return {
        title: "Duplicate entries detected",
        message:
          "Duplicate entries detected. Please provide a unique email address and phone number.",
        conflicts: [],
        raw: data,
      };
    }

    if (Number(status) === 400) {
      let message = "Invalid data provided.";

      if (data?.errors) {
        const errorMessages = Object.entries(data.errors)
          .map(([field, messages]) =>
            `${field}: ${
              Array.isArray(messages) ? messages.join(", ") : messages
            }`
          )
          .join("\n");
        message = `Validation errors:\n${errorMessages}`;
      } else if (data?.error) {
        message = data.error;
      } else if (data?.message) {
        message = data.message;
      } else if (typeof data === "string") {
        message = data;
      }

      return {
        title: "Validation Error",
        message: message,
        conflicts: [],
        raw: data,
      };
    }

    return {
      title: "Save failed",
      message:
        (typeof data === "string" && data) ||
        data?.message ||
        err?.message ||
        "An unexpected error occurred.",
      conflicts: [],
      raw: data,
    };
  }

  /* ========= Portal Modal ========= */
  const ErrorDetailsModal = ({ open, info, onClose }) => {
    if (!open) return null;
    return (
      <>
        <div
          className="modal-backdrop fade show"
          style={{ display: "block" }}
          onClick={onClose}
        />
        <div
          className="modal fade show"
          tabIndex={-1}
          role="dialog"
          style={{ display: "block" }}
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content shadow">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">
                  <i className="fa fa-exclamation-triangle me-2 text-danger" />
                  {info.title || "Error"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={onClose}
                />
              </div>
              <div className="modal-body text-center">
                <div className="alert alert-warning mb-0 p-3">
                  <strong>{info.message}</strong>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  /* ========= Handlers ========= */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let v = value;

    if (name === "phoneNumber") v = v.replace(/\D/g, "").slice(0, 10);
    if (name === "zipCode") v = v.replace(/\D/g, "").slice(0, 6);
    if (name === "username")
      v = v.toLowerCase().replace(/[^a-z0-9._-]/g, ""); // Only allow alphanumeric, dots, underscores, hyphens

    if (name === "programmeId") {
      v = value == null ? "" : String(value); // always string in state
    }

    setFormData((prev) => {
      const next = { ...prev, [name]: v };
      if (name === "username" && !editMode) {
        next.password = v;
      }
      if (submitted) setErrors(validate(next));
      return next;
    });
  };

  const scrollToFirstError = (errObj) => {
    const firstKey = Object.keys(errObj)[0];
    if (!firstKey) return;
    const el = document.getElementById(firstKey);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus?.();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitted(true);

    const trimmed = {
      ...formData,
      username: formData.username.trim(),
      password: formData.password.trim(),
      email: formData.email.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      gender: formData.gender.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      country: formData.country.trim(),
      zipCode: formData.zipCode.trim(),
      degree: formData.degree.trim(),
      aBC_UniqueID: formData.aBC_UniqueID.trim(),
    };

    const validationErrors = validate(trimmed);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      scrollToFirstError(validationErrors);
      setIsSubmitting(false);
      return;
    }

    // ✅ SAFEST: find the programme from dropdown list using the selected value
    const selectedProgramme = programmeOptions.find(
      (p) => String(p.programmeId) === String(formData.programmeId)
    );

    console.log("[AddStudent] formData.programmeId:", formData.programmeId);
    console.log("[AddStudent] selectedProgramme:", selectedProgramme);

    if (!selectedProgramme) {
      // If for some reason we can't find it, stop and show error – never send 0
      setErrors((prev) => ({
        ...prev,
        programmeId: "Please select a valid course",
      }));
      scrollToFirstError({ programmeId: true });
      setIsSubmitting(false);
      return;
    }

    const finalProgrammeId = selectedProgramme.programmeId; // <-- REAL INT FROM API
    console.log("[AddStudent] finalProgrammeId to send:", finalProgrammeId);

    const programmeName = selectedProgramme.programmeName || "";

    const payload = {
      Username: trimmed.username || "unknown",
      Email: trimmed.email || `${trimmed.username || "user"}@example.com`,
      FirstName: trimmed.firstName || "Unknown",
      LastName: trimmed.lastName || trimmed.firstName || "Unknown",
      PhoneNumber: trimmed.phoneNumber || "0000000000",
      DateOfBirth: trimmed.dateOfBirth
        ? new Date(trimmed.dateOfBirth).toISOString()
        : new Date(2000, 0, 1).toISOString(),
      Gender: trimmed.gender || "NotSpecified",
      Address: trimmed.address || "N/A",
      City: trimmed.city || "N/A",
      State: trimmed.state || "N/A",
      Country: trimmed.country || "N/A",
      ZipCode: trimmed.zipCode || "000000",
      ProfilePhotoUrl: trimmed.profilePhotoUrl || "N/A",
      Batch: trimmed.batch || selectedProgramme.batchName || "Default",
      Programme: programmeName || "Unknown",

      // 🔥 send programmeId as a clean integer
      programmeId: finalProgrammeId,
      ProgrammeId: finalProgrammeId, // also send PascalCase for safety

      sem: Number.parseInt(trimmed.semester || "1", 10) || 1,
      semester: Number.parseInt(trimmed.semester || "1", 10) || 1,
      degree: trimmed.degree || "NotSpecified",
      aBC_UniqueID: trimmed.aBC_UniqueID || "N/A",
      RefCode: Number.parseInt(userId || "0", 10) || 0,
      ...(editMode ? {} : { Password: trimmed.password || "" }),
    };

    console.log("RefCode for AddStudent:", userId);
    console.log("Payload for AddStudent:", payload);

    try {
      const res = await onSubmit?.(payload);

      if (res && res.ok === false) {
        const info = buildErrInfo(res);
        console.warn("[AddStudent] Non-OK response from parent:", res);
        setErrInfo(info);
        setShowErrModal(true);
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      const info = buildErrInfo(err);
      console.warn("[AddStudent] Caught error from parent:", err);
      setErrInfo(info);
      setShowErrModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ========= Bulk upload handlers ========= */

  const handleBulkDownloadTemplate = () => {
    // match your backend route: /student/register/sample-excel
    window.location.href = `${API_BASE_URL}/student/register/sample-excel`;
  };

  const handleBulkFileChange = (e) => {
    setBulkFile(e.target.files?.[0] || null);
    setBulkResult(null);
    setBulkError("");
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) {
      setBulkError("Please select an Excel file (.xlsx).");
      return;
    }

    setBulkUploading(true);
    setBulkError("");
    setBulkResult(null);

    try {
      const formData = new FormData();
      formData.append("file", bulkFile);

      const res = await fetch(`${API_BASE_URL}/student/register/bulk`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setBulkError(
          data?.error ||
            data?.message ||
            `Bulk upload failed with status ${res.status}`
        );
      } else {
        setBulkResult(data);
      }
    } catch (err) {
      console.error("Bulk upload error:", err);
      setBulkError(err.message || "Bulk upload failed.");
    } finally {
      setBulkUploading(false);
    }
  };

  /* ========= UI helpers ========= */
  const showError = (name) => submitted && !!errors[name];

  const renderInput = (
    label,
    name,
    type = "text",
    { placeholder, required = true } = {}
  ) => (
    <div className="form-group">
      <label htmlFor={name} className="mb-1">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        className={`form-control ${showError(name) ? "is-invalid" : ""}`}
        value={formData[name] ?? ""}
        onChange={handleInputChange}
        disabled={readOnly || (name === "password" && editMode)}
        placeholder={placeholder}
      />
      {showError(name) && (
        <div className="invalid-feedback">{errors[name]}</div>
      )}
    </div>
  );

  const renderSelect = (
    label,
    name,
    options,
    getValue,
    getLabel,
    { placeholder = "-- Select --", required = true } = {}
  ) => (
    <div className="form-group">
      <label htmlFor={name} className="mb-1">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <select
        id={name}
        name={name}
        className={`form-control ${showError(name) ? "is-invalid" : ""}`}
        value={formData[name] ?? ""}
        onChange={handleInputChange}
        disabled={readOnly}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={getValue(opt)} value={getValue(opt)}>
            {getLabel(opt)}
          </option>
        ))}
      </select>
      {showError(name) && (
        <div className="invalid-feedback">{errors[name]}</div>
      )}
    </div>
  );

  /* ========= Render ========= */
  return (
    <>
      <style>{`
        .student-tabs {
          border-bottom: 1px solid #dee2e6;
          margin-bottom: 1rem;
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .student-tab-btn {
          border: none;
          background: transparent;
          padding: 0.5rem 1rem;
          border-bottom: 3px solid transparent;
          font-weight: 500;
          cursor: pointer;
        }
        .student-tab-btn.active {
          border-bottom-color: #0d6efd;
          color: #0d6efd;
        }
        .student-tab-content {
          margin-top: 1rem;
        }
        .student-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        .student-form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-start;
          flex-wrap: wrap;
        }
      `}</style>

      {/* ===== Tabs Header ===== */}
      <div className="student-tabs">
        <button
          type="button"
          className={`student-tab-btn ${
            activeTab === "single" ? "active" : ""
          }`}
          onClick={() => setActiveTab("single")}
        >
          Add New Student
        </button>
        <button
          type="button"
          className={`student-tab-btn ${
            activeTab === "bulk" ? "active" : ""
          }`}
          onClick={() => setActiveTab("bulk")}
        >
          Bulk Upload
        </button>
      </div>

      <div className="student-tab-content">
        {/* ===== TAB 1: Single Student Form ===== */}
        {activeTab === "single" && (
          <form onSubmit={handleSubmit} noValidate>
            <div className="student-form-grid">
              {renderInput("Registration Number", "username", "text", {
                placeholder: "Enter registration number",
              })}
              {renderInput("ABC ID", "aBC_UniqueID", "text", {
                placeholder: "Enter ABC ID",
              })}
              {renderInput("Email", "email", "email", {
                placeholder: "name@example.com",
              })}
              {renderInput("Name (As per SSC)", "firstName")}
              {renderInput("Mobile Number", "phoneNumber", "tel", {
                placeholder: "10-digit mobile number",
              })}
              {renderInput("Date of Birth", "dateOfBirth", "date")}
              {renderInput("Gender", "gender", "text", {
                placeholder: "Male / Female / Other",
              })}

              {renderSelect(
                "Batch",
                "batch",
                batchList,
                (b) => b,
                (b) => b,
                { placeholder: "-- Select Batch --" }
              )}

              {renderSelect(
                "Course",
                "programmeId",
                filteredProgrammes,
                (p) => String(p.programmeId), // ✅ ALWAYS STRING
                (p) => `${p.programmeName} (${p.programmeCode})`,
                { placeholder: "-- Select Course --" }
              )}

              {renderSelect(
                "Pursuing Degree",
                "degree",
                degreeOptions,
                (d) => d,
                (d) => d,
                { placeholder: "-- Select Degree --" }
              )}
            </div>

            {!readOnly && (
              <div className="student-form-actions mt-3 d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Submitting..."
                    : (editMode ? "Update" : "Add") + " Student"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => window.history.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        )}

        {/* ===== TAB 2: Bulk Upload ===== */}
        {activeTab === "bulk" && !readOnly && (
          <div>
            <h4>Bulk Upload Students via Excel</h4>
            <p className="text-muted">
              1) Download the sample Excel, 2) Fill student data, 3) Upload the file.
            </p>

            <div className="mb-3 d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleBulkDownloadTemplate}
              >
                Download Sample Excel
              </button>
            </div>

            <form onSubmit={handleBulkUpload}>
              <div className="mb-3">
                <label className="form-label">Select Excel File (.xlsx)</label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="form-control"
                  onChange={handleBulkFileChange}
                />
              </div>

              {bulkError && (
                <div className="alert alert-danger py-2">
                  <strong>Error:</strong> {bulkError}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-success"
                disabled={bulkUploading}
              >
                {bulkUploading
                  ? "Uploading..."
                  : "Upload & Register Students"}
              </button>
            </form>

            {bulkResult && (
              <div className="mt-4">
                <h5>Upload Summary</h5>
                <ul>
                  <li>Total: {bulkResult.total}</li>
                  <li>Success: {bulkResult.success}</li>
                  <li>Failed: {bulkResult.failed}</li>
                </ul>

                {bulkResult.rows && bulkResult.rows.length > 0 && (
                  <div className="table-responsive mt-3">
                    <table className="table table-sm table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Row</th>
                          <th>Username</th>
                          <th>Status</th>
                          <th>Error / Conflicts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkResult.rows.map((r, idx) => (
                          <tr key={idx}>
                            <td>{r.rowNumber}</td>
                            <td>{r.username}</td>
                            <td>
                              {r.success ? (
                                <span className="text-success fw-bold">OK</span>
                              ) : (
                                <span className="text-danger fw-bold">
                                  FAILED
                                </span>
                              )}
                            </td>
                            <td style={{ whiteSpace: "pre-wrap" }}>
                              {r.success
                                ? "-"
                                : r.error ||
                                  (r.conflicts || [])
                                    .map(
                                      (c) =>
                                        `${c.conflictType ?? ""}: ${
                                          c.details ?? ""
                                        }`
                                    )
                                    .join("\n")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <ErrorDetailsModal
        open={showErrModal}
        info={errInfo}
        onClose={() => setShowErrModal(false)}
      />
    </>
  );
};

export default AddStudent;
