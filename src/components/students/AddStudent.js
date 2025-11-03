// File: src/pages/students/AddStudent.jsx
import React, { useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import ReactDOM from "react-dom";
import API_BASE_URL from "../../config";

const AddStudent = ({ student, onSubmit, editMode = false, readOnly = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Get UserId from JWT token once, at the top
  let userId = "";
  const token = localStorage.getItem("jwt");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.UserId || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || "";
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
  const [groupOptions, setGroupOptions] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [filteredProgrammes, setFilteredProgrammes] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);

  /* ========= Form ========= */
  const [formData, setFormData] = useState({
    // hidden (UI) but kept if needed
    password: "",
    // shown
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
    programmeId: "",
    groupId: "",
    semester: "1",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const firstErrorRef = useRef(null);

  /* ========= Load options ========= */
  useEffect(() => {
    const token = localStorage.getItem("jwt");

    fetch(`${API_BASE_URL}/Programme/ProgrammeBatch`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then((r) => r.json())
      .then((data) => {
        setProgrammeOptions(data || []);
        setBatchList([...new Set((data || []).map((p) => p.batchName))]);
      })
      .catch((e) => console.error("Programme fetch error:", e));

    fetch(`${API_BASE_URL}/Group/GroupBatch`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then((r) => r.json())
      .then((data) => setGroupOptions(data || []))
      .catch((e) => console.error("Group fetch error:", e));
  }, []);

  /* ========= Populate for edit ========= */
  useEffect(() => {
    if (student && programmeOptions.length && groupOptions.length) {
      const matchedProgramme = programmeOptions.find(
        (p) => p.programmeName === student.programme || p.programmeId === student.programmeId
      );
      const matchedGroup = groupOptions.find(
        (g) => g.groupName === student.group || g.groupId === student.groupId
      );
      const dob = student.dateOfBirth?.split("T")[0] || "";

      setFormData((prev) => ({
        ...prev,
        ...student,
        programmeId: matchedProgramme?.programmeId?.toString() || "",
        groupId: matchedGroup?.groupId?.toString() || "",
        batch: matchedProgramme?.batchName || student.batch || "",
        dateOfBirth: dob,
        password: "",
      }));
    }
  }, [student, programmeOptions, groupOptions]);

  /* ========= Dependent lists ========= */
  useEffect(() => {
    if (!formData.batch) {
      setFilteredProgrammes([]);
      setFilteredGroups([]);
      setSemesterOptions([]);
      return;
    }

    const progs = programmeOptions.filter((p) => p.batchName === formData.batch);
    setFilteredProgrammes(progs);

    const grps = groupOptions.filter(
      (g) => g.batchName === formData.batch && g.programmeId === parseInt(formData.programmeId || "0")
    );
    setFilteredGroups(grps);

    const selectedProgramme = programmeOptions.find(
      (p) => p.programmeId === parseInt(formData.programmeId || "0")
    );
    const semCount = selectedProgramme?.numberOfSemesters || 0;
    setSemesterOptions(Array.from({ length: semCount }, (_, i) => i + 1));
  }, [formData.batch, formData.programmeId, programmeOptions, groupOptions]);

  /* ========= Validation ========= */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const phoneDigits = (v) => (v || "").replace(/\D/g, "");
  const zipRegexIndia = /^[1-9][0-9]{5}$/;

  const validate = (fd) => {
    const err = {};

    if (!fd.email?.trim()) err.email = "Email is required";
    else if (!emailRegex.test(fd.email.trim())) err.email = "Enter a valid email";

    if (!fd.firstName?.trim()) err.firstName = "First Name is required";
    if (!fd.lastName?.trim()) err.lastName = "Last Name is required";

    const ph = phoneDigits(fd.phoneNumber);
    if (!ph) err.phoneNumber = "Phone Number is required";
    else if (ph.length !== 10) err.phoneNumber = "Enter a 10-digit mobile number";

    if (!fd.dateOfBirth) err.dateOfBirth = "Date of Birth is required";
    else {
      const today = new Date();
      const dob = new Date(fd.dateOfBirth);
      if (dob > today) err.dateOfBirth = "DOB cannot be in the future";
      const min = new Date(today.getFullYear() - 3, today.getMonth(), today.getDate());
      if (!err.dateOfBirth && dob > min) err.dateOfBirth = "Student must be at least 3 years old";
    }

    if (!fd.gender?.trim()) err.gender = "Gender is required";
    if (!fd.address?.trim()) err.address = "Address is required";
    if (!fd.city?.trim()) err.city = "City is required";
    if (!fd.state?.trim()) err.state = "State is required";
    if (!fd.country?.trim()) err.country = "Country is required";

    if (!fd.zipCode?.trim()) err.zipCode = "PIN code is required";
    else if (!zipRegexIndia.test(fd.zipCode.trim())) err.zipCode = "Enter a valid 6-digit PIN";

    if (!fd.batch) err.batch = "Batch is required";
    if (!fd.programmeId) err.programmeId = "Board is required";
    if (!fd.groupId) err.groupId = "Class is required";

    // profilePhotoUrl left optional
    return err;
  };

  /* ========= Error helpers ========= */
  const isConflict409 = (x) => {
    try {
      if (!x) return false;
      if (typeof x === "number") return x === 409;
      if (x.status === 409) return true;
      if (x.response?.status === 409) return true;
      if (x.ok === false && x.status === 409) return true; // fetch Response
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
              <button type="button" className="btn btn-warning" onClick={onClose}>
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

    setFormData((prev) => {
      const next = { ...prev, [name]: v };
      if (submitted) setErrors(validate(next)); // live-validate after first submit
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
  if (isSubmitting) return; // Prevent double submit
  setIsSubmitting(true);
  setSubmitted(true);

    const trimmed = {
      ...formData,
      email: formData.email.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      gender: formData.gender.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      country: formData.country.trim(),
      zipCode: formData.zipCode.trim(),
    };

    const validationErrors = validate(trimmed);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      scrollToFirstError(validationErrors);
      return;
    }

    // build payload
    const { password, username, courseId, ...validFormData } = trimmed;
    const programmeName =
      programmeOptions.find((p) => p.programmeId === parseInt(trimmed.programmeId || "0"))?.programmeName || "";

    const payload = {
      ...validFormData,
      semester: parseInt(trimmed.semester || "1"),
      programmeId: parseInt(trimmed.programmeId || "0"),
      groupId: parseInt(trimmed.groupId || "0"),
      programme: programmeName,
      dateOfBirth: trimmed.dateOfBirth ? new Date(trimmed.dateOfBirth).toISOString() : null,
      RefCode: userId,
    };
    console.log("RefCode for AddStudent:", userId);
    console.log("Payload for AddStudent:", payload);

    try {
      // Parent should either throw on non-2xx OR return the fetch Response
      const res = await onSubmit?.(payload);

      // If parent *returned* res instead of throwing:
      if (res && res.ok === false) {
        const info = buildErrInfo(res);
        console.warn("[AddStudent] Non-OK response from parent:", res);
        setErrInfo(info);
        setShowErrModal(true);
        setIsSubmitting(false);
        return;
      }

      // Success handled by parent (toast/close)
    } catch (err) {
      const info = buildErrInfo(err);
      console.warn("[AddStudent] Caught error from parent:", err);
      setErrInfo(info);
      setShowErrModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ========= UI helpers (errors only show after submit) ========= */
  const showError = (name) => submitted && !!errors[name];

  const renderInput = (label, name, type = "text", { placeholder, required = true } = {}) => (
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
      {showError(name) && <div className="invalid-feedback">{errors[name]}</div>}
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
        value={formData[name]}
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
      {showError(name) && <div className="invalid-feedback">{errors[name]}</div>}
    </div>
  );

  /* ========= Render ========= */
  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <div className="student-form-grid">
          {/* Username & Password hidden in UI as requested */}
          {renderInput("Email", "email", "email", { placeholder: "name@example.com" })}
          {renderInput("First Name", "firstName")}
          {renderInput("Last Name", "lastName")}
          {renderInput("Phone Number", "phoneNumber", "tel", { placeholder: "10-digit mobile number" })}
          {renderInput("Date of Birth", "dateOfBirth", "date")}
          {renderInput("Gender", "gender", { placeholder: "Male / Female / Other" })}
          {renderInput("Address", "address")}
          {renderInput("City", "city")}
          {renderInput("State", "state")}
          {renderInput("Country", "country")}
          {renderInput("Zip / PIN Code", "zipCode", "text", { placeholder: "6-digit PIN" })}
          {renderInput("Profile Photo URL (optional)", "profilePhotoUrl", "url", { required: false, placeholder: "https://..." })}

          {renderSelect("Batch", "batch", batchList, (b) => b, (b) => b, { placeholder: "-- Select Batch --" })}
          {renderSelect(
            "Board",
            "programmeId",
            filteredProgrammes,
            (p) => p.programmeId,
            (p) => `${p.programmeName} (${p.programmeCode})`,
            { placeholder: "-- Select Board --" }
          )}
          {renderSelect(
            "Class",
            "groupId",
            filteredGroups,
            (g) => g.groupId,
            (g) => `Class ${g.groupName ?? ""}`,
            { placeholder: "-- Select Class --" }
          )}
        </div>

        {!readOnly && (
          <div className="student-form-actions mt-3 d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : (editMode ? "Update" : "Add") + " Student"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => window.history.back()} disabled={isSubmitting}>
              Cancel
            </button>
          </div>
        )}
      </form>

      {/* Error Modal (Portal) */}
      <ErrorDetailsModal
        open={showErrModal}
        info={errInfo}
        onClose={() => setShowErrModal(false)}
      />
    </>
  );
};

export default AddStudent;
