import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config";

function UserFormModal({ isOpen, onClose, user, onSave }) {
  // Error modal state
  const [showErrModal, setShowErrModal] = useState(false);
  const [errInfo, setErrInfo] = useState({
    title: "",
    message: "",
    conflicts: [],
    raw: null,
  });
  const [formData, setFormData] = useState({
    // kept in state but NOT shown in UI
    username: "",
    password: "",
    // required fields (UI)
    role: "Admin",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "Male",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        password: "",
        role: user.role || "Admin",
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: (user.phoneNumber || "").replace(/\D/g, "").slice(0, 10),
        // if API returns ISO with time, keep date part only
        dateOfBirth: (user.dateOfBirth || "").split("T")[0],
        gender: user.gender || "Male",
        address: user.address || "",
      });
    } else {
      setFormData({
        username: "",
        password: "",
        role: "Admin",
        email: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        dateOfBirth: "",
        gender: "Male",
        address: "",
      });
    }
    setErrors({});
    setSubmitted(false);
  }, [user, isOpen]);

  /* ---------------- Validation ---------------- */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const phoneDigits = (v) => (v || "").replace(/\D/g, "");

  const validate = (fd) => {
    const err = {};

    if (!fd.role?.trim()) err.role = "Role is required";

    if (!fd.email?.trim()) err.email = "Email is required";
    else if (!emailRegex.test(fd.email.trim())) err.email = "Enter a valid email address";

    if (!fd.firstName?.trim()) err.firstName = "First Name is required";
    if (!fd.lastName?.trim()) err.lastName = "Last Name is required";

    const ph = phoneDigits(fd.phoneNumber);
    if (!ph) err.phoneNumber = "Phone Number is required";
    else if (ph.length !== 10) err.phoneNumber = "Enter a valid 10-digit phone number";

    if (!fd.dateOfBirth) err.dateOfBirth = "Date of Birth is required";
    else {
      const today = new Date();
      const dob = new Date(fd.dateOfBirth);
      if (dob > today) err.dateOfBirth = "DOB cannot be in the future";
    }

    if (!fd.gender?.trim()) err.gender = "Gender is required";
    if (!fd.address?.trim()) err.address = "Address is required";

    return err;
  };

  const showError = (name) => submitted && !!errors[name];

  /* ---------------- Handlers ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => {
        const next = { ...prev, [name]: digits };
        if (submitted) setErrors(validate(next));
        return next;
      });
      return;
    }

    setFormData((prev) => {
      const next = { ...prev, [name]: value };
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

  const handleSubmit = async () => {
    setSubmitted(true);

    const trimmed = {
      ...formData,
      email: formData.email.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      address: formData.address.trim(),
    };

    const validationErrors = validate(trimmed);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      scrollToFirstError(validationErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    const isCreate = !user;
    const base = String(API_BASE_URL || "").replace(/\/+$/, "");
    const endpoint = isCreate
      ? (/\/api$/i.test(base) ? `${base}/User` : `${base}/api/User`)
      : (/\/api$/i.test(base) ? `${base}/User/${user.userId}` : `${base}/api/User/${user.userId}`);
    const method = isCreate ? "POST" : "PUT";
    const payloadBase = {
      role: trimmed.role,
      email: trimmed.email,
      firstName: trimmed.firstName,
      lastName: trimmed.lastName,
      phoneNumber: trimmed.phoneNumber,
      dateOfBirth: trimmed.dateOfBirth,
      gender: trimmed.gender,
      address: trimmed.address,
    };
    const payload = isCreate
      ? {
          ...payloadBase,
          username: "TEMPUSER",
          password: "TempP@ssw0rd!",
        }
      : payloadBase;

    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      if (!response.ok) {
        // Show modal for duplicate entry (409)
        if (response.status === 409) {
          setErrInfo({
            title: "Duplicate entries detected",
            message: "Duplicate entries detected. Please provide a unique email address and phone number.",
            conflicts: [],
            raw: text,
          });
          setShowErrModal(true);
        } else {
          setErrInfo({
            title: "Save failed",
            message: text || `HTTP ${response.status}`,
            conflicts: [],
            raw: text,
          });
          setShowErrModal(true);
        }
        return;
      }

      toast.success(isCreate ? "✅ User created!" : "✅ User updated!");
      onClose();
      onSave && onSave();
    } catch (err) {
      setErrInfo({
        title: "Network or server error",
        message: err?.message || "Request failed.",
        conflicts: [],
        raw: err,
      });
      setShowErrModal(true);
    }
  };
  // Error modal component
  const ErrorDetailsModal = ({ open, info, onClose }) => {
    if (!open) return null;
    return ReactDOM.createPortal(
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
                <Button variant="warning" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>,
      document.body
    );
  };

  /* ---------------- Render ---------------- */
  return (
    <>
      <Modal show={isOpen} onHide={onClose} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{user ? "Edit User" : "Add New User"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form noValidate>
            <Row>
              {/* Username & Password are intentionally HIDDEN (auto-generated server-side). */}
              <Col md={6}>
                <Form.Group controlId="role" className="mb-3">
                  <Form.Label>
                    Role <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="select"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    isInvalid={showError("role")}
                  >
                    <option>Admin</option>
                    <option>SRO</option>
                    <option>Business_Executive</option>
                  </Form.Control>
                  <Form.Control.Feedback type="invalid">
                    {errors.role}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>
                    Email <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={showError("email")}
                    placeholder="name@example.com"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="firstName" className="mb-3">
                  <Form.Label>
                    First Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    isInvalid={showError("firstName")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.firstName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="lastName" className="mb-3">
                  <Form.Label>
                    Last Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    isInvalid={showError("lastName")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.lastName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="phoneNumber" className="mb-3">
                  <Form.Label>
                    Phone Number <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    isInvalid={showError("phoneNumber")}
                    placeholder="10-digit mobile number"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phoneNumber}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="dateOfBirth" className="mb-3">
                  <Form.Label>
                    Date of Birth <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    isInvalid={showError("dateOfBirth")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.dateOfBirth}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="gender" className="mb-3">
                  <Form.Label>
                    Gender <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="select"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    isInvalid={showError("gender")}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </Form.Control>
                  <Form.Control.Feedback type="invalid">
                    {errors.gender}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group controlId="address" className="mb-3">
                  <Form.Label>
                    Address <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    isInvalid={showError("address")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.address}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {user ? "Update" : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Error Modal (Portal) */}
      <ErrorDetailsModal
        open={showErrModal}
        info={errInfo}
        onClose={() => setShowErrModal(false)}
      />
    </>
  );
}

export default UserFormModal;
