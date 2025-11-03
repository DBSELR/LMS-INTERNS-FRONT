
import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config";

function ProgrammeFormModal({ show, onHide, onSave, programme }) {
  const [form, setForm] = useState({
    programmeName: "",
    programmeCode: "",
    numberOfSemesters: 1,
    fee: 0,
    batchName: "",
    programmeId: null
  });

  useEffect(() => {
    if (programme) {
      setForm({
        programmeId: programme.programmeId,
        programmeName: programme.programmeName,
        programmeCode: programme.programmeCode,
        numberOfSemesters: programme.numberOfSemesters,
        fee: programme.fee || 0,
        batchName: programme.batchName || ""
      });
    } else {
      setForm({
        programmeName: "",
        programmeCode: "",
        numberOfSemesters: 1,
        fee: 0,
        batchName: "",
        programmeId: null
      });
    }
  }, [programme]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'numberOfSemesters' || name === 'fee' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async () => {
    const { programmeId, programmeName, programmeCode, numberOfSemesters, fee, batchName } = form;

    if (!programmeName || !programmeCode || !batchName || numberOfSemesters <= 0 || fee < 0) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    const method = programmeId ? "PUT" : "POST";
    const endpoint = programmeId
      ? `${API_BASE_URL}/Programme/Update/${programmeId}`
      : `${API_BASE_URL}/Programme`;

    const payload = {
      programmeCode,
      programmeName,
      numberOfSemesters: Number(numberOfSemesters),
      fee: Number(fee),
      batchName
    };

    if (programmeId) {
      payload.programmeId = programmeId;
    }

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success(`Programme ${programmeId ? "updated" : "created"} successfully!`);
      onSave();
    } catch (err) {
      toast.error(err.message || "Failed to save programme");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{form.programmeId ? "Edit Programme" : "Add Programme"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Course Name</Form.Label>
            <Form.Control
              name="programmeName"
              value={form.programmeName}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Course Code</Form.Label>
            <Form.Control
              name="programmeCode"
              value={form.programmeCode}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Batch Name</Form.Label>
            <Form.Control
              name="batchName"
              value={form.batchName}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Number of Semesters</Form.Label>
            <Form.Control
              type="number"
              name="numberOfSemesters"
              min="1"
              value={form.numberOfSemesters}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Course Fee (₹)</Form.Label>
            <Form.Control
              type="number"
              name="fee"
              min="0"
              value={form.fee}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>
          {form.programmeId ? "Update" : "Create"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProgrammeFormModal;
