import React, { useEffect, useState } from "react";
import { Collapse, Form, Button } from "react-bootstrap";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";

function AdminProgrammesPage() {
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openProgramme, setOpenProgramme] = useState({});
  const [form, setForm] = useState({
    programmeName: "",
    programmeCode: "",
    numberOfSemesters: 1,
    fee: 0,
    batchName: "",
    programmeId: null
  });

  useEffect(() => {
    fetchProgrammes();
  }, []);

  const fetchProgrammes = async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/Programme/All`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setProgrammes(data);
    } catch (err) {
      console.error("Failed to fetch programmes", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleProgramme = (id) => {
    setOpenProgramme(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEdit = (programme) => {
    setForm({
      programmeId: programme.programmeId,
      programmeName: programme.programmeName,
      programmeCode: programme.programmeCode,
      numberOfSemesters: programme.numberOfSemesters,
      fee: programme.fee || 0,
      batchName: programme.batchName || ""
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this programme?")) {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/Programme/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success("Programme deleted successfully");
        await fetchProgrammes(); // ✅ Auto-refresh after delete
      } catch (err) {
        toast.error(err.message || "Delete failed");
      }
    }
  };

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
    if (programmeId) payload.programmeId = programmeId;

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
         },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success(`Programme ${programmeId ? "updated" : "created"} successfully!`);
      setForm({
        programmeName: "",
        programmeCode: "",
        numberOfSemesters: 1,
        fee: 0,
        batchName: "",
        programmeId: null
      });
      await fetchProgrammes(); // ✅ Auto-refresh after create/update
    } catch (err) {
      toast.error(err.message || "Failed to save programme");
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4 p-4 border rounded bg-light">
        <h5 className="mb-3">Add / Edit Course</h5>
        <Form>
          <Form.Group>
            <Form.Label>Course Name</Form.Label>
            <Form.Control name="programmeName" value={form.programmeName} onChange={handleChange} required />
          </Form.Group>
          <Form.Group>
            <Form.Label>Course Code</Form.Label>
            <Form.Control name="programmeCode" value={form.programmeCode} onChange={handleChange} required />
          </Form.Group>
          <Form.Group>
            <Form.Label>Batch Name</Form.Label>
            <Form.Control name="batchName" value={form.batchName} onChange={handleChange} required />
          </Form.Group>
          <Form.Group>
            <Form.Label>Number of Semesters</Form.Label>
            <Form.Control type="number" name="numberOfSemesters" min="1" value={form.numberOfSemesters} onChange={handleChange} required />
          </Form.Group>
          <Form.Group>
            <Form.Label>Course Fee - Per semester(₹)</Form.Label>
            <Form.Control type="number" name="fee" min="0" value={form.fee} onChange={handleChange} required />
          </Form.Group>
          <Button className="mt-3" variant="primary" onClick={handleSubmit}>
            {form.programmeId ? "Update" : "Create"}
          </Button>
        </Form>
      </div>

      <h5 className="mb-3"><i className="fa fa-book mr-2"></i> Courses List</h5>

      {programmes.map((programme) => (
        <div key={programme.programmeId} className="mb-2">
          <button
            className="w-100 text-white text-left px-3 py-2 d-flex justify-content-between align-items-center"
            style={{ backgroundColor: "#1c1c1c", border: "none", borderRadius: "25px", fontWeight: "bold" }}
            onClick={() => toggleProgramme(programme.programmeId)}
            aria-controls={`collapse-${programme.programmeId}`}
            aria-expanded={!!openProgramme[programme.programmeId]}
          >
            <span>
              {programme.batchName} | {programme.programmeCode} - {programme.programmeName} | Semesters: {programme.numberOfSemesters} | Fee: ₹{programme.fee}
            </span>
            {openProgramme[programme.programmeId] ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          <Collapse in={!!openProgramme[programme.programmeId]}>
            <div className="bg-white border rounded p-3 mt-1">
              <p><strong>Course:</strong> {programme.programmeName}</p>
              <p><strong>Code:</strong> {programme.programmeCode}</p>
              <p><strong>Batch:</strong> {programme.batchName}</p>
              <p><strong>Semesters:</strong> {programme.numberOfSemesters}</p>
              <p><strong>Fee:</strong> ₹{programme.fee}</p>
              <div className="d-flex justify-content-end gap-2 mt-2">
                <button className="btn btn-sm btn-outline-info" onClick={() => handleEdit(programme)}>
                  <i className="fa fa-edit"></i> Edit
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(programme.programmeId)}>
                  <i className="fa fa-trash"></i> Delete
                </button>
              </div>
            </div>
          </Collapse>
        </div>
      ))}
    </div>
  );
}

export default AdminProgrammesPage;
