import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import API_BASE_URL from "../../config";

function LiveClassFormModal({ show, onHide, onSave, liveClass }) {
  const [form, setForm] = useState({
    className: "",
    courseId: "",
    instructorId: "",
    instructorName: "",
    startTime: "",
    endTime: "",
    durationMinutes: "",
    status: "Upcoming", // Default value for status
  });

  useEffect(() => {
    if (liveClass) {
      setForm({
        className: liveClass.className || "",
        courseId: liveClass.courseId || "",
        instructorId: liveClass.instructorId || "",
        instructorName: liveClass.instructorName || "",
        startTime: liveClass.startTime || "",
        endTime: liveClass.endTime || "",
        durationMinutes: liveClass.durationMinutes || "",
        status: liveClass.status || "Upcoming", // Default to "Upcoming" if not set
      });
    } else {
      setForm({
        className: "",
        courseId: "",
        instructorId: "",
        instructorName: "",
        startTime: "",
        endTime: "",
        durationMinutes: "",
        status: "Upcoming", // Default value for status
      });
    }
  }, [liveClass]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    console.log("Submitted")
    const url = liveClass
      ? `${API_BASE_URL}/LiveClass/Update/${liveClass.liveClassId}`
      : `${API_BASE_URL}/LiveClass/Create`;

    const method = liveClass ? "PUT" : "POST";

    try {
      const token = localStorage.getItem("jwt");
      console.log("Edit Clicked....")
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      onSave();
    } catch (err) {
      console.error("Failed to submit form", err);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header>
        <Modal.Title>{liveClass ? "Edit Live Class" : "Add Live Class"}</Modal.Title>
        <button
                    type="button"
                    className="close"
                    onClick={onHide}
                  >
                    <span>&times;</span>
                  </button>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="className">
            <Form.Label>Class Name</Form.Label>
            <Form.Control type="text" name="className" value={form.className} onChange={handleChange} />
          </Form.Group>
          <Form.Group controlId="courseId">
            <Form.Label>Course ID</Form.Label>
            <Form.Control type="text" name="courseId" value={form.courseId} onChange={handleChange} />
          </Form.Group>
          <Form.Group controlId="instructorId">
            <Form.Label>Instructor ID</Form.Label>
            <Form.Control type="text" name="instructorId" value={form.instructorId} onChange={handleChange} />
          </Form.Group>
          <Form.Group controlId="instructorName">
            <Form.Label>Instructor Name</Form.Label>
            <Form.Control type="text" name="instructorName" value={form.instructorName} onChange={handleChange} />
          </Form.Group>
          <Form.Group controlId="startTime">
            <Form.Label>Start Time</Form.Label>
            <Form.Control type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange} />
          </Form.Group>
          <Form.Group controlId="endTime">
            <Form.Label>End Time</Form.Label>
            <Form.Control type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange} />
          </Form.Group>
          <Form.Group controlId="durationMinutes">
            <Form.Label>Duration (minutes)</Form.Label>
            <Form.Control type="number" name="durationMinutes" value={form.durationMinutes} onChange={handleChange} />
          </Form.Group>
          <Form.Group controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Control as="select" name="status" value={form.status} onChange={handleChange}>
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default LiveClassFormModal;
