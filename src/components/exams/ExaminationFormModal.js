import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config";

function ExaminationFormModal({ show, onHide, onSave, examination }) {
  const [form, setForm] = useState({
    paperCode: "",
    paperName: "",
    isElective: false,
    paperType: "Theory",
    credits: 0,
    internalMarks1: 0,
    internalMarks2: 0,
    totalInternalMarks: 0,
    totalMarks: 0,
    programmeId: "",
    courseId: "",
    groupId: "",
    semester: "",
    examinationId: null
  });

  const [programmes, setProgrammes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [semesters, setSemesters] = useState([]);

  useEffect(() => {
    if (examination) {
      setForm({ ...examination });
    } else {
      setForm(prev => ({
        ...prev,
        examinationId: null,
        paperCode: "",
        paperName: "",
        isElective: false,
        paperType: "Theory",
        credits: 0,
        internalMarks1: 0,
        internalMarks2: 0,
        totalInternalMarks: 0,
        totalMarks: 0,
        programmeId: "",
        courseId: "",
        groupId: "",
        semester: ""
      }));
    }
  }, [examination]);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    fetch(`${API_BASE_URL}/Programme/All`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setProgrammes(data))
      .catch(err => console.error("Failed to load programmes", err));

    fetch(`${API_BASE_URL}/Course/All`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error("Failed to load courses", err));

    fetch(`${API_BASE_URL}/Group/All`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setGroups(data))
      .catch(err => console.error("Failed to load groups", err));
  }, []);

  useEffect(() => {
    const selectedProgramme = programmes.find(p => p.programmeId === Number(form.programmeId));
    if (selectedProgramme) {
      setSemesters(Array.from({ length: selectedProgramme.numberOfSemesters }, (_, i) => i + 1));
    } else {
      setSemesters([]);
    }
  }, [form.programmeId, programmes]);

  useEffect(() => {
    const total = Number(form.internalMarks1) + Number(form.internalMarks2);
    setForm(prev => ({
      ...prev,
      totalInternalMarks: total,
      totalMarks: total
    }));
  }, [form.internalMarks1, form.internalMarks2]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async () => {
    const {
      examinationId,
      ...formFields
    } = form;

    const payload = {
      ...formFields,
      credits: Number(formFields.credits),
      internalMarks1: Number(formFields.internalMarks1),
      internalMarks2: Number(formFields.internalMarks2),
      totalInternalMarks: Number(formFields.totalInternalMarks),
      totalMarks: Number(formFields.totalMarks),
      courseId: Number(formFields.courseId),
      groupId: Number(formFields.groupId),
      programmeId: Number(formFields.programmeId),
      semester: Number(formFields.semester)
    };

    const method = examinationId ? "PUT" : "POST";
    const endpoint = examinationId
      ? `${API_BASE_URL}/Examination/Update/${examinationId}`
      : `${API_BASE_URL}/Examination/Create`;

    if (examinationId) payload.examinationId = Number(examinationId);

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(await res.text());
      toast.success("Examination saved successfully");
      onSave();
    } catch (err) {
      toast.error(err.message || "Failed to save examination");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{form.examinationId ? "Edit" : "Add"} Examination</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group><Form.Label>Select Programme</Form.Label>
            <Form.Control as="select" name="programmeId" value={form.programmeId} onChange={handleChange}>
              <option value="">Select Programme</option>
              {programmes.map(p => (<option key={p.programmeId} value={p.programmeId}>{p.programmeName}</option>))}
            </Form.Control>
          </Form.Group>

          <Form.Group><Form.Label>Select Course</Form.Label>
            <Form.Control as="select" name="courseId" value={form.courseId} onChange={handleChange}>
              <option value="">Select Course</option>
              {courses.map(c => (<option key={c.courseId} value={c.courseId}>{c.courseCode} - {c.name}</option>))}
            </Form.Control>
          </Form.Group>

          <Form.Group><Form.Label>Select Group</Form.Label>
            <Form.Control as="select" name="groupId" value={form.groupId} onChange={handleChange}>
              <option value="">Select Group</option>
              {groups.map(g => (<option key={g.groupId} value={g.groupId}>{g.groupCode} - {g.groupName}</option>))}
            </Form.Control>
          </Form.Group>

          <Form.Group><Form.Label>Select Semester</Form.Label>
            <Form.Control as="select" name="semester" value={form.semester} onChange={handleChange}>
              <option value="">Select Semester</option>
              {semesters.map(s => (<option key={s} value={s}>{s}</option>))}
            </Form.Control>
          </Form.Group>

          <Form.Group><Form.Label>Paper Code</Form.Label>
            <Form.Control name="paperCode" value={form.paperCode} onChange={handleChange} />
          </Form.Group>

          <Form.Group><Form.Label>Paper Name</Form.Label>
            <Form.Control name="paperName" value={form.paperName} onChange={handleChange} />
          </Form.Group>

          <Form.Group><Form.Check type="checkbox" label="Is Elective?" name="isElective" checked={form.isElective} onChange={handleChange} /></Form.Group>

          <Form.Group><Form.Label>Paper Type</Form.Label>
            <Form.Control as="select" name="paperType" value={form.paperType} onChange={handleChange}>
              <option value="Theory">Theory</option>
              <option value="Practical">Practical</option>
              <option value="Project">Project</option>
            </Form.Control>
          </Form.Group>

          <Form.Group><Form.Label>Credits</Form.Label>
            <Form.Control type="number" name="credits" value={form.credits} onChange={handleChange} /></Form.Group>

          <hr />
          <h5>Marks Section</h5>

          <Form.Group><Form.Label>Internal Marks</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control type="number" name="internalMarks1" placeholder="Internal Marks 1" value={form.internalMarks1} onChange={handleChange} />
              <Form.Control type="number" name="internalMarks2" placeholder="Internal Marks 2" value={form.internalMarks2} onChange={handleChange} />
            </div>
          </Form.Group>

          <Form.Group><Form.Label>Total Internal Marks</Form.Label>
            <Form.Control type="number" name="totalInternalMarks" value={form.totalInternalMarks} readOnly />
          </Form.Group>

          <Form.Group><Form.Label>Total Marks</Form.Label>
            <Form.Control type="number" name="totalMarks" value={form.totalMarks} readOnly />
          </Form.Group>

        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>{form.examinationId ? "Update" : "Create"}</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ExaminationFormModal;
