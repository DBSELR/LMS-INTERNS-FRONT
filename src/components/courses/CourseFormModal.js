import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config";

function CourseFormModal({ show, onHide, onSave, course }) {
  const [form, setForm] = useState({
    name: "",
    courseCode: "",
    credits: 0,
    courseDescription: "",
    programme: "",
    semester: "",
    courseId: null
  });

  const [programmes, setProgrammes] = useState([]);
  const [availableSemesters, setAvailableSemesters] = useState([]);

  useEffect(() => {
    fetchProgrammes();
  }, []);

  const fetchProgrammes = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Programme/All`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setProgrammes(data);
    } catch (err) {
      console.error("Failed to fetch programmes", err);
    }
  };

  useEffect(() => {
    if (course) {
      setForm({
        courseId: course.courseId,
        name: course.name,
        courseCode: course.courseCode,
        credits: course.credits,
        courseDescription: course.courseDescription,
        programme: course.programme || "",
        semester: course.semester || ""
      });
    } else {
      setForm({
        name: "",
        courseCode: "",
        credits: 0,
        courseDescription: "",
        programme: "",
        semester: "",
        courseId: null
      });
    }
  }, [course]);

  useEffect(() => {
    const found = programmes.find(p => p.programmeName === form.programme);
    if (found) {
      setAvailableSemesters(Array.from({ length: found.numberOfSemesters }, (_, i) => i + 1));
    } else {
      setAvailableSemesters([]);
    }
  }, [form.programme, programmes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    const cleanForm = {
      name: form.name,
      courseCode: form.courseCode,
      credits: Number(form.credits),
      courseDescription: form.courseDescription,
      programme: form.programme,
      semester: form.semester,
      InstructorCourses: []
    };

    if (form.courseId !== null) {
      cleanForm.courseId = form.courseId;
    }

    if (!cleanForm.name || !cleanForm.courseCode || !cleanForm.programme || !cleanForm.semester) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const method = form.courseId ? "PUT" : "POST";
    const endpoint = form.courseId
      ? `${API_BASE_URL}/Course/Update/${form.courseId}`
      : `${API_BASE_URL}/Course/Create`;

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(cleanForm)
      });

      const resultText = await res.text();
      if (!res.ok) throw new Error(resultText);

      toast.success(`Course ${form.courseId ? "updated" : "created"} successfully!`);
      onSave();
    } catch (err) {
      toast.error(err.message || "Failed to save course");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{form.courseId ? "Edit Course" : "Add Course"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Course</Form.Label>
            <Form.Control
              as="select"
              name="programme"
              value={form.programme}
              onChange={handleChange}
              required
            >
              <option value="">Select Course</option>
              {programmes.map(p => (
                <option key={p.programmeId} value={p.programmeName}>{p.programmeName}</option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group>
            <Form.Label>Semester</Form.Label>
            <Form.Control
              as="select"
              name="semester"
              value={form.semester}
              onChange={handleChange}
              required
            >
              <option value="">Select Semester</option>
              {availableSemesters.map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group>
            <Form.Label>Subject Name</Form.Label>
            <Form.Control
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Subject Code</Form.Label>
            <Form.Control
              name="courseCode"
              value={form.courseCode}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Credits</Form.Label>
            <Form.Control
              type="number"
              name="credits"
              value={form.credits}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="courseDescription"
              value={form.courseDescription}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>
          {form.courseId ? "Update" : "Create"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CourseFormModal;
