import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config";

function DepartmentFormModal({ show, onHide, onSave, department }) {
  const [form, setForm] = useState({
    id: null,
    name: "",
    headOfDepartment: "",
    facultyCount: 0,
    contactEmail: "",
    contactPhone: "",
    description: "",
    location: "",
    establishedYear: new Date().getFullYear(),
    websiteUrl: "",
    code: "",
    coursesOffered: "",
  });

  useEffect(() => {
    console.log("📝 Department form modal opened. Department to edit:", department);
    if (department) {
      setForm({
        id: department.id,
        name: department.name,
        headOfDepartment: department.headOfDepartment,
        facultyCount: department.facultyCount,
        contactEmail: department.contactEmail,
        contactPhone: department.contactPhone,
        description: department.description,
        location: department.location,
        establishedYear: department.establishedYear,
        websiteUrl: department.websiteUrl,
        code: department.code,
        coursesOffered: department.coursesOffered || "",
      });
    } else {
      setForm({
        id: null,
        name: "",
        headOfDepartment: "",
        facultyCount: 0,
        contactEmail: "",
        contactPhone: "",
        description: "",
        location: "",
        establishedYear: new Date().getFullYear(),
        websiteUrl: "",
        code: "",
        coursesOffered: "",
      });
    }
  }, [department]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === "number" ? parseInt(value) || 0 : value;
    console.log(`✏️ Changing ${name} to`, newValue);
    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      facultyCount: Number(form.facultyCount),
    };

    if (!form.id) {
      delete payload.id;
    }

    console.log("🚀 Submitting form payload:", payload);

    if (!payload.name || !payload.headOfDepartment || !payload.contactEmail || !payload.coursesOffered) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const method = form.id ? "PUT" : "POST";
    const endpoint = form.id
      ? `${API_BASE_URL}/Department/${form.id}`
      : `${API_BASE_URL}/Department`;

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();
      if (!res.ok) throw new Error(responseText);

      toast.success(`Department ${form.id ? "updated" : "created"} successfully!`);
      onSave();
    } catch (err) {
      console.error("❌ Failed to save department:", err);
      toast.error(err.message || "Failed to save department");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{form.id ? "Edit Department" : "Add Department"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Department Name</Form.Label>
                <Form.Control
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Code</Form.Label>
                <Form.Control
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, "");
                    console.log("🔢 Code input sanitized to:", numericValue);
                    setForm((prev) => ({ ...prev, code: numericValue }));
                  }}
                  inputMode="numeric"
                  placeholder="Enter numeric code"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Head of Department</Form.Label>
                <Form.Control
                  name="headOfDepartment"
                  value={form.headOfDepartment}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Faculty Count</Form.Label>
                <Form.Control
                  type="number"
                  name="facultyCount"
                  value={form.facultyCount}
                  onChange={handleChange}
                  min="0"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Contact Email</Form.Label>
                <Form.Control
                  type="email"
                  name="contactEmail"
                  value={form.contactEmail}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
  <Form.Label>Contact Phone</Form.Label>
  <Form.Control
    name="contactPhone"
    value={form.contactPhone}
    onChange={(e) => {
      const numericValue = e.target.value.replace(/\D/g, "");
      console.log("🔢 Phone input sanitized to:", numericValue);
      setForm((prev) => ({ ...prev, contactPhone: numericValue }));
    }}
    placeholder="Enter phone number"
  />
</Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Established Year</Form.Label>
                <Form.Control
                  type="number"
                  name="establishedYear"
                  value={form.establishedYear}
                  onChange={handleChange}
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Website URL</Form.Label>
                <Form.Control
                  name="websiteUrl"
                  value={form.websiteUrl}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Location</Form.Label>
                <Form.Control
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Courses Offered (comma-separated)</Form.Label>
                <Form.Control
                  name="coursesOffered"
                  value={form.coursesOffered}
                  onChange={handleChange}
                  placeholder="e.g., B.Tech, M.Tech, PhD"
                  required
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => {
          console.log("❎ Cancel clicked. Closing modal.");
          onHide();
        }}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {form.id ? "Update" : "Create"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DepartmentFormModal;
