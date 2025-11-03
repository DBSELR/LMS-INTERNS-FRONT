import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config";

const AddProfessor = ({
  professor,
  onSubmit,
  mode = null,
  availableCourses = [],
  onCancel,
}) => {
  const readOnly = mode === "view";
  const editMode = mode === "edit";

  /* ========= Error Modal ========= */
  const [showErrModal, setShowErrModal] = useState(false);
  const [errInfo, setErrInfo] = useState({
    title: "",
    message: "",
    conflicts: [],
    raw: null,
  });

  /* ========= Programmes ========= */
  const [programmes, setProgrammes] = useState([]);
  const [progLoading, setProgLoading] = useState(false);
  const [progError, setProgError] = useState(null);

  /* ========= Form State ========= */
  const [formData, setFormData] = useState({
    // hidden (UI)
    username: "",
    password: "",
    // required (UI)
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    department: "", // CODE only (e.g., "CBSE")
    bio: "",
    profilePictureUrl: "",
    officeLocation: "",
    officeHours: "",
    employeeStatus: "Active",
    role: "Instructor",
    socialMediaLinks: [], // comma-separated in UI
    educationalBackground: "",
    researchInterests: "",
    teachingRating: "", // 1..5 required
    assignedCourses: [],

    // local-only helpers (NOT posted)
    programmeCode: "",
    programmeName: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  /* ========= Error helpers ========= */
  function normalizeErrorPayload(err) {
    let status = err?.response?.status ?? err?.status ?? undefined;
    let data = err?.response?.data ?? err?.data ?? err?.body ?? err;
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

  /* ========= Prefill from professor ========= */
  const parseDepartment = (dep) => {
    if (!dep || typeof dep !== "string") return { code: "", name: "" };
    const trimmed = dep.trim();
    const mParen = trimmed.match(/^\(([^)]+)\)\s*-\s*(.+)$/);
    if (mParen) return { code: mParen[1].trim(), name: mParen[2].trim() };
    if (trimmed.startsWith("(") && trimmed.includes(")")) {
      const inner = trimmed.slice(1, trimmed.indexOf(")")).trim();
      return { code: inner, name: "" };
    }
    const hyphenIdx = trimmed.indexOf("-");
    if (hyphenIdx > -1)
      return {
        code: trimmed.slice(0, hyphenIdx).trim(),
        name: trimmed.slice(hyphenIdx + 1).trim(),
      };
    return { code: trimmed, name: "" };
  };

  useEffect(() => {
    if (professor) {
      const next = {
        ...professor,
        username: professor.username || "",
        password: "",
        firstName: professor.fullName?.split(" ")[0] || professor.firstName || "",
        lastName:
          professor.fullName?.split(" ").slice(1).join(" ") ||
          professor.lastName ||
          "",
        socialMediaLinks: Array.isArray(professor.socialMediaLinks)
          ? professor.socialMediaLinks
          : professor.socialMediaLinks
          ? professor.socialMediaLinks.split(",").map((link) => link.trim())
          : [],
        assignedCourses: professor.assignedCourses || [],
        department: (professor.department || "").trim(),
        teachingRating: professor.teachingRating?.toString?.() ?? "",
      };
      const { code, name } = parseDepartment(next.department);
      next.programmeCode = code;
      next.department = code || "";
      next.programmeName = name || "";
      setFormData((prev) => ({ ...prev, ...next }));
    }
  }, [professor]);

  /* ========= Fetch Programmes ========= */
  useEffect(() => {
    const fetchProgrammes = async () => {
      const token = localStorage.getItem("jwt");
      const base = String(API_BASE_URL || "").replace(/\/+$/, "");
      const url = /\/api$/i.test(base)
        ? `${base}/Programme/All`
        : `${base}/api/Programme/All`;

      try {
        setProgLoading(true);
        setProgError(null);
        const res = await fetch(url, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) {
          const snippet = await res.text().catch(() => "");
          console.warn("Non-OK body:", snippet.slice(0, 300));
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        const ct = res.headers.get("content-type") || "";
        const raw = ct.includes("application/json")
          ? await res.json()
          : JSON.parse(await res.text());

        const normalized = Array.isArray(raw)
          ? raw.map((item) => ({
              code:
                item?.ProgrammeCode ??
                item?.programmeCode ??
                item?.ProgramCode ??
                item?.programCode ??
                item?.CODE ??
                item?.code ??
                "",
              name:
                item?.ProgrammeName ??
                item?.programmeName ??
                item?.ProgramName ??
                item?.programName ??
                item?.NAME ??
                item?.name ??
                "",
            }))
          : [];

        const filtered = normalized.filter((p) => p.code && p.name);
        setProgrammes(filtered);
      } catch (err) {
        console.error("Programmes load error:", err);
        setProgError(err?.message || "Failed to load programmes");
        toast.error("Failed to load programmes");
      } finally {
        setProgLoading(false);
      }
    };
    fetchProgrammes();
  }, []);

  /* ========= Validation ========= */
  const showError = (name) => submitted && !!errors[name];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const urlRegex =
    /^(https?:\/\/)([\w-]+\.)+[\w-]+(:\d+)?(\/[^\s]*)?$/i;
  const phoneDigits = (v) => (v || "").replace(/\D/g, "");

  const validate = (fd) => {
    const err = {};

    // Required, with rules
    if (!fd.firstName?.trim()) err.firstName = "First Name is required";
    if (!fd.lastName?.trim()) err.lastName = "Last Name is required";

    if (!fd.email?.trim()) err.email = "Email is required";
    else if (!emailRegex.test(fd.email.trim())) err.email = "Enter a valid email";

    const ph = phoneDigits(fd.phoneNumber);
    if (!ph) err.phoneNumber = "Phone Number is required";
    else if (ph.length !== 10) err.phoneNumber = "Enter a 10-digit mobile number";

    if (!fd.programmeCode) err.programmeCode = "Board is required";
    if (!fd.department) err.department = "Department code is required";

    if (!fd.profilePictureUrl?.trim())
      err.profilePictureUrl = "Profile Picture URL is required";
    else if (!urlRegex.test(fd.profilePictureUrl.trim()))
      err.profilePictureUrl = "Enter a valid URL starting with http(s)://";

    if (!fd.officeLocation?.trim())
      err.officeLocation = "Office Location is required";
    if (!fd.officeHours?.trim()) err.officeHours = "Office Hours are required";

    if (!fd.bio?.trim()) err.bio = "Bio is required";

    const links =
      Array.isArray(fd.socialMediaLinks) && fd.socialMediaLinks.length
        ? fd.socialMediaLinks.filter((s) => s && s.trim())
        : [];
    if (!links.length) err.socialMediaLinks = "At least one social link is required";

    if (!fd.educationalBackground?.trim())
      err.educationalBackground = "Educational Background is required";
    if (!fd.researchInterests?.trim())
      err.researchInterests = "Research Interests are required";

    if (fd.teachingRating === "" || fd.teachingRating === null)
      err.teachingRating = "Teaching Rating is required (1–5)";
    else {
      const tr = Number(fd.teachingRating);
      if (Number.isNaN(tr) || tr < 1 || tr > 5)
        err.teachingRating = "Teaching Rating must be between 1 and 5";
    }

    if (!fd.employeeStatus?.trim())
      err.employeeStatus = "Status is required";
    if (!fd.role?.trim()) err.role = "Role is required";

    // Assigned courses required if you provided a list
    if (availableCourses && availableCourses.length > 0) {
      if (!fd.assignedCourses || fd.assignedCourses.length === 0) {
        err.assignedCourses = "Select at least one course";
      }
    }

    return err;
  };

  /* ========= Handlers ========= */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => {
        const next = { ...prev, [name]: digitsOnly };
        if (submitted) setErrors(validate(next));
        return next;
      });
    } else if (name === "socialMediaLinks") {
      const arr = value.split(",").map((link) => link.trim());
      setFormData((prev) => {
        const next = { ...prev, [name]: arr };
        if (submitted) setErrors(validate(next));
        return next;
      });
    } else if (name === "teachingRating") {
      const cleaned = value.replace(/[^\d.]/g, "");
      setFormData((prev) => {
        const next = { ...prev, [name]: cleaned };
        if (submitted) setErrors(validate(next));
        return next;
      });
    } else {
      setFormData((prev) => {
        const next = { ...prev, [name]: value };
        if (submitted) setErrors(validate(next));
        return next;
      });
    }
  };

  const handleProgrammeChange = (e) => {
    const code = e.target.value;
    const match = programmes.find((p) => String(p.code) === String(code));
    const name = match?.name || "";

    setFormData((prev) => {
      const next = {
        ...prev,
        programmeCode: code,
        programmeName: name,
        department: code || "",
      };
      if (submitted) setErrors(validate(next));
      return next;
    });
  };

  const handleCourseChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (o) => o.value);
    setFormData((prev) => {
      const next = { ...prev, assignedCourses: selected };
      if (submitted) setErrors(validate(next));
      return next;
    });
  };

  const scrollToFirstError = (errObj) => {
    const firstKey = Object.keys(errObj)[0];
    if (!firstKey) return;
    const el = document.getElementById(firstKey);
    if (el?.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus?.();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    // trim simple strings
    const trimmed = {
      ...formData,
      email: formData.email.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      bio: formData.bio.trim(),
      profilePictureUrl: formData.profilePictureUrl.trim(),
      officeLocation: formData.officeLocation.trim(),
      officeHours: formData.officeHours.trim(),
      educationalBackground: formData.educationalBackground.trim(),
      researchInterests: formData.researchInterests.trim(),
    };

    const validationErrors = validate(trimmed);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      scrollToFirstError(validationErrors);
      return;
    }

    // Build payload (coerce types + required placeholders)
    const {
      programmeCode,
      programmeName,
      teachingRating,
      ...rest
    } = trimmed;

    const finalPayload = {
      ...rest,
      username: "TEMPUSER", // required placeholder; server may overwrite
      password: "TempP@ssw0rd!",
      teachingRating:
        teachingRating === "" || teachingRating === null
          ? null
          : Number(teachingRating),
      userId: professor?.userId, // undefined is fine on create
    };

    try {
      await onSubmit?.(finalPayload);
      toast.success(
        `✅ Faculty ${editMode ? "updated" : "added"} successfully`,
        { autoClose: 3000, toastId: "professor-submit-toast" }
      );
    } catch (err) {
      const info = buildErrInfo(err);
      setErrInfo(info);
      setShowErrModal(true);

      if (info.title === "Duplicate entries detected") {
        toast.warning(
          "Duplicate entries detected. Please provide a unique email address and phone number.",
          { autoClose: 3500, toastId: "professor-submit-error" }
        );
      } else {
        toast.error(`❌ ${info.title}`, {
          autoClose: 3500,
          toastId: "professor-submit-error",
        });
      }
      console.error("🚨 Submit error:", info.raw || err);
    }
  };

  /* ========= Render helpers with errors (submit-first) ========= */
  const renderInput = (
    label,
    name,
    type = "text",
    { placeholder, extra = {} } = {}
  ) => (
    <div className="form-group col-md-6">
      <label htmlFor={name} className="form-label">
        {label} <span className="text-danger">*</span>
      </label>
      <input
        type={type}
        id={name}
        name={name}
        className={`form-control ${showError(name) ? "is-invalid" : ""}`}
        value={
          Array.isArray(formData[name])
            ? formData[name].join(", ")
            : formData[name]
        }
        onChange={handleInputChange}
        disabled={readOnly}
        placeholder={placeholder}
        {...extra}
      />
      {showError(name) && (
        <div className="invalid-feedback">{errors[name]}</div>
      )}
    </div>
  );

  const renderSelect = (
    label,
    name,
    value,
    onChange,
    options,
    getValue,
    getLabel,
    { placeholder = "-- Select --" } = {}
  ) => (
    <div className="form-group col-md-6">
      <label htmlFor={name} className="form-label">
        {label} <span className="text-danger">*</span>
      </label>
      <select
        id={name}
        name={name}
        className={`form-control ${showError(name) ? "is-invalid" : ""}`}
        value={value}
        onChange={onChange}
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
      <form onSubmit={handleSubmit} className="container-fluid" noValidate>
        <h4 className="mb-3">
          {mode === "edit"
            ? "Edit Faculty"
            : mode === "view"
            ? "Faculty Details"
            : "Add New Faculty"}
        </h4>

        <div className="row">
          {/* Username & Password intentionally NOT rendered */}

          {renderInput("First Name", "firstName")}
          {renderInput("Last Name", "lastName")}
          {renderInput("Email", "email", "email", {
            placeholder: "name@example.com",
          })}
          {renderInput("Phone Number", "phoneNumber", "tel", {
            placeholder: "10-digit mobile",
          })}

          {/* Board / Programme */}
          <div className="form-group col-md-6">
            <label htmlFor="programme" className="form-label">
              Board <span className="text-danger">*</span>
            </label>
            <select
              id="programme"
              name="programmeCode"
              className={`form-control ${
                showError("programmeCode") ? "is-invalid" : ""
              }`}
              value={formData.programmeCode}
              onChange={handleProgrammeChange}
              disabled={readOnly || progLoading}
            >
              <option value="">
                {progLoading ? "Loading Boards..." : "-- Select Board --"}
              </option>
              {programmes.map((p) => (
                <option key={p.code} value={p.code}>
                  ({p.code})-{p.name}
                </option>
              ))}
            </select>
            {progError && (
              <small className="text-danger d-block mt-1">
                Couldn’t load Boards: {progError}
              </small>
            )}
            {formData.programmeCode && (
              <small className="text-muted d-block mt-1">
                Selected: ({formData.programmeCode})-
                {formData.programmeName || "—"} • Sent as department:{" "}
                <strong>{formData.department}</strong>
              </small>
            )}
            {showError("programmeCode") && (
              <div className="invalid-feedback d-block">
                {errors["programmeCode"]}
              </div>
            )}
          </div>

          {/* These are required too */}
          {renderInput("Profile Picture URL", "profilePictureUrl", "url", {
            placeholder: "https://example.com/pic.jpg",
          })}
          {renderInput("Office Location", "officeLocation")}
          {renderInput("Office Hours", "officeHours", "text", {
            placeholder: "e.g., Mon–Fri 10:00–16:00",
          })}
          {renderInput("Bio", "bio")}
          {renderInput("Social Media Links", "socialMediaLinks", "text", {
            placeholder: "Comma separated (e.g., https://x.com/..., https://in.linkedin.com/...)",
          })}
          {renderInput("Educational Background", "educationalBackground")}
          {renderInput("Research Interests", "researchInterests")}
          {renderInput("Teaching Rating (1–5)", "teachingRating", "number", {
            extra: { min: 1, max: 5, step: 0.1 },
          })}

          {/* Employee Status */}
          {renderSelect(
            "Status",
            "employeeStatus",
            formData.employeeStatus,
            (e) => handleInputChange(e),
            [
              { v: "Active", l: "Active" },
              { v: "Inactive", l: "Inactive" },
              { v: "On Leave", l: "On Leave" },
            ],
            (o) => o.v,
            (o) => o.l
          )}

          {/* Role */}
          {renderSelect(
            "Role",
            "role",
            formData.role,
            (e) => handleInputChange(e),
            [{ v: "Instructor", l: "Instructor" }],
            (o) => o.v,
            (o) => o.l
          )}

         
        </div>

        <div className="d-flex gap-2 mt-3">
          {!readOnly && (
            <button type="submit" className="btn btn-primary">
              {mode === "edit" ? "Update" : "Add"} Faculty
            </button>
          )}
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            {readOnly ? "Close" : "Cancel"}
          </button>
        </div>
      </form>

      {/* Error Modal */}
      <ErrorDetailsModal
        open={showErrModal}
        info={errInfo}
        onClose={() => setShowErrModal(false)}
      />
    </>
  );
};

export default AddProfessor;
