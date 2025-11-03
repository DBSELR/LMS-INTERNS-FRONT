import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import API_BASE_URL from "../../config";

function FeeEditModal({ show, onHide, fee, onSave }) {
  const [form, setForm] = useState({
    feeId: 0,
    studentId: "",
    amountDue: "",
    amountPaid: "",
    feeStatus: "",
    paymentDate: "",
  });

  useEffect(() => {
    if (fee) {
      setForm({
        feeId: fee.feeId,
        studentId: fee.studentId,
        amountDue: fee.amountDue,
        amountPaid: fee.amountPaid,
        feeStatus: fee.feeStatus,
        paymentDate: fee.paymentDate?.slice(0, 10) || "",
      });
    }
  }, [fee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("jwt");
      await fetch(`${API_BASE_URL}/Fee/Update/${form.feeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      onSave();
    } catch (error) {
      console.error("Fee update failed", error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Fee Record</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Student ID</Form.Label>
            <Form.Control
              type="text"
              name="studentId"
              value={form.studentId}
              disabled
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Amount Due</Form.Label>
            <Form.Control
              type="number"
              name="amountDue"
              value={form.amountDue}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Amount Paid</Form.Label>
            <Form.Control
              type="number"
              name="amountPaid"
              value={form.amountPaid}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Fee Status</Form.Label>
            <Form.Control
              as="select"
              name="feeStatus"
              value={form.feeStatus}
              onChange={handleChange}
            >
              <option>Pending</option>
              <option>Paid</option>
              <option>Overdue</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Payment Date</Form.Label>
            <Form.Control
              type="date"
              name="paymentDate"
              value={form.paymentDate}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default FeeEditModal;
