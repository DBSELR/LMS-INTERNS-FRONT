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
    "B Com Honours (BFSI)"
  ];

  /* ========= Form ========= */
  const [formData, setFormData] = useState({
    // Now shown in UI
    username: "",
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
    semester: "1",
    degree: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const firstErrorRef = useRef(null);

  /* ========= Load options ========= */
  // useEffect(() => {
  //   const token = localStorage.getItem("jwt");

  //   fetch(`${API_BASE_URL}/Programme/ProgrammeBatch`, {
  //     headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  //   })
  //     .then((r) => r.json())
  //     .then((data) => {
  //       setProgrammeOptions(data || []);
  //       setBatchList([...new Set((data || []).map((p) => p.batchName))]);
  //     })
  //     .catch((e) => console.error("Programme fetch error:", e));
  // }, []);

  /* ========= Load options ========= */
useEffect(() => {
  const token = localStorage.getItem("jwt");
  if (!userId) return; // ensure we have decoded UserId first

  fetch(`${API_BASE_URL}/Programme/GetBatchByUsername?UserId=${userId}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  })
    .then((r) => r.json())
    .then((data) => {
      setProgrammeOptions(data || []);
      setBatchList([...new Set((data || []).map((p) => p.batchName))]);
    })
    .catch((e) => console.error("GetBatchByUsername fetch error:", e));
}, [userId]);


  /* ========= Populate for edit ========= */
  useEffect(() => {
    if (student && programmeOptions.length) {
      const matchedProgramme = programmeOptions.find(
        (p) => p.programmeName === student.programme || p.programmeId === student.programmeId
      );
      const dob = student.dateOfBirth?.split("T")[0] || "";

      setFormData((prev) => ({
        ...prev,
        ...student,
        programmeId: matchedProgramme?.programmeId?.toString() || "",
        batch: matchedProgramme?.batchName || student.batch || "",
        dateOfBirth: dob,
        username: student.username || "",
        password: student.username || "", // Set password to username
        degree: student.degree || "",
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
      (p) => p.programmeId === parseInt(formData.programmeId || "0")
    );
    const semCount = selectedProgramme?.numberOfSemesters || 0;
    setSemesterOptions(Array.from({ length: semCount }, (_, i) => i + 1));
  }, [formData.batch, formData.programmeId, programmeOptions]);

  /* ========= Validation ========= */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const phoneDigits = (v) => (v || "").replace(/\D/g, "");
  const zipRegexIndia = /^[1-9][0-9]{5}$/;

  const validate = (fd) => {
    // Adjusted validation to match the visible form fields.
    const err = {};

    if (!fd.username?.trim()) err.username = "Username is required";
    else if (fd.username.trim().length < 3) err.username = "Username must be at least 3 characters";

    if (!fd.email?.trim()) err.email = "Email is required";
    else if (!emailRegex.test(fd.email.trim())) err.email = "Enter a valid email";

    if (!fd.firstName?.trim()) err.firstName = "First Name is required";
    // lastName is not shown in the form currently, so make it optional

    const ph = phoneDigits(fd.phoneNumber);
    if (!ph) err.phoneNumber = "Phone Number is required";
    else if (ph.length !== 10) err.phoneNumber = "Enter a 10-digit mobile number";

    if (!fd.dateOfBirth) err.dateOfBirth = "Date of Birth is required";
    else {
      const today = new Date();
      const dob = new Date(fd.dateOfBirth);
      if (dob > today) err.dateOfBirth = "DOB cannot be in the future";
      const min = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
      if (!err.dateOfBirth && dob > min) err.dateOfBirth = "Student must be at least 16 years old";
    }

    if (!fd.gender?.trim()) err.gender = "Gender is required";
    // Address, city, state, country and zip are not part of the visible form, so they are optional here.

    if (!fd.batch) err.batch = "Batch is required";
    if (!fd.programmeId) err.programmeId = "Board is required";
    if (!fd.degree?.trim()) err.degree = "Degree is required";

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
    
    // Handle 400 Bad Request with more specific error messages
    if (Number(status) === 400) {
      let message = "Invalid data provided.";
      
      if (data?.errors) {
        // Handle ASP.NET Core ModelState validation errors
        const errorMessages = Object.entries(data.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
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
    if (name === "username") v = v.toLowerCase().replace(/[^a-z0-9._-]/g, ""); // Only allow alphanumeric, dots, underscores, hyphens

    setFormData((prev) => {
      const next = { ...prev, [name]: v };
      // If username changes, automatically update password to match
      if (name === "username" && !editMode) {
        next.password = v;
      }
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
    };

    const validationErrors = validate(trimmed);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      scrollToFirstError(validationErrors);
      setIsSubmitting(false);
      return;
    }

    // build payload
    const selectedProgramme = programmeOptions.find((p) => p.programmeId === parseInt(trimmed.programmeId || "0"));
    const programmeName = selectedProgramme?.programmeName || "";

    const payload = {
      Username: trimmed.username,
      Email: trimmed.email,
      FirstName: trimmed.firstName,
      // Use provided lastName if available, otherwise fall back to firstName to avoid empty last name
      LastName: trimmed.lastName  || "",
      PhoneNumber: trimmed.phoneNumber,
      DateOfBirth: trimmed.dateOfBirth ? new Date(trimmed.dateOfBirth).toISOString() : null,
      Gender: trimmed.gender,
      // Use provided address fields if present, otherwise keep simple placeholders
      Address: trimmed.address || "",
      City: trimmed.city || "",
      State: trimmed.state || "",
      Country: trimmed.country || "",
      ZipCode: trimmed.zipCode || "",
      ProfilePhotoUrl: trimmed.profilePhotoUrl || "",
      Batch: trimmed.batch,
      Programme: programmeName, // Backend expects "Programme" field with name
      programmeId: parseInt(trimmed.programmeId || "0"),
      semester: parseInt(trimmed.semester || "1"),
      degree: trimmed.degree,
      RefCode: userId,
      ...(editMode ? {} : { Password: trimmed.password || "" }), // Password automatically synced with username
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
          <style>{`
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
          {/* Username & Password shown in UI - Password automatically syncs with username */}
          {renderInput("Registration Number", "username", "text", { placeholder: "Enter registration number" })}
          {/* {!editMode && renderInput("Password", "password", "password", { placeholder: "Auto-synced with username" })} */}
          {renderInput("Email", "email", "email", { placeholder: "name@example.com" })}
          {renderInput("Name (As per SSC)", "firstName")}
          {/* {renderInput("Last Name", "lastName")} */}
          {renderInput("Mobile Number", "phoneNumber", "tel", { placeholder: "10-digit mobile number" })}
          {renderInput("Date of Birth", "dateOfBirth", "date")}
          {renderInput("Gender", "gender", "text", { placeholder: "Male / Female / Other" })}
          {/* {renderInput("Address", "address")} */}
          {/* {renderInput("City", "city")}
          {renderInput("State", "state")}
          {renderInput("Country", "country")}
          {renderInput("Zip / PIN Code", "zipCode", "text", { placeholder: "6-digit PIN" })} */}
          {/* {renderInput("Profile Photo URL (optional)", "profilePhotoUrl", "url", { required: false, placeholder: "https://..." })} */}

          {renderSelect("Batch", "batch", batchList, (b) => b, (b) => b, { placeholder: "-- Select Batch --" })}
          {renderSelect(
            "Course",
            "programmeId",
            filteredProgrammes,
            (p) => p.programmeId,
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
