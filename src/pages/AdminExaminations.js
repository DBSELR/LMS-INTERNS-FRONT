// AdminExaminations.js
import React, { useEffect, useState } from "react";
import { Button, Form, Row, Col, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";

function AdminExaminations() {
  const [examinations, setExaminations] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);

  const [form, setForm] = useState({
    programmeId: "",
    groupId: "",
    semester: "",
    courseId: "",
    paperCode: "",
    paperName: "",
    isElective: false,
    paperType: "Theory",
    credits: 0,
    internalMarks1: 0,
    internalMarks2: 0,
    totalInternalMarks: 0,
    theoryMarks: 0,
    totalMarks: 0,
    examinationId: null
  });

  useEffect(() => {
    fetchProgrammes();
    fetchGroups();
    fetchExaminations();
  }, []);

  const fetchProgrammes = async () => {
    const token = localStorage.getItem("jwt");
    const res = await fetch(`${API_BASE_URL}/Programme/All`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
  
    const data = await res.json();
    setProgrammes(data);
  };

  const fetchGroups = async () => {
    const token = localStorage.getItem("jwt");
    const res = await fetch(`${API_BASE_URL}/Group/All`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setGroups(data);
  };

  const fetchExaminations = async () => {
    const token = localStorage.getItem("jwt");
    const res = await fetch(`${API_BASE_URL}/Examination/All`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setExaminations(data);
  };

  const fetchCoursesByProgrammeAndSemester = async (programmeName, semester) => {
    const token = localStorage.getItem("jwt");
    if (!programmeName || !semester) return;
    try {
      const res = await fetch(`${API_BASE_URL}/Programme/ProgrammesWithSemesters`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const filtered = data.filter(item => item.programmeName === programmeName && item.semester === semester.toString());
      setCourses(filtered);
    } catch {
      toast.error("Failed to load courses");
    }
  };

  useEffect(() => {
    const selectedProgramme = programmes.find(p => p.programmeId === Number(form.programmeId));
    const selectedGroup = groups.find(g => g.groupId === Number(form.groupId));

    if (selectedGroup) {
      setSemesters(Array.from({ length: selectedGroup.numberOfSemesters }, (_, i) => i + 1));
    } else {
      setSemesters([]);
    }

    if (selectedProgramme && form.semester) {
      fetchCoursesByProgrammeAndSemester(selectedProgramme.programmeName, form.semester);
    }
  }, [form.programmeId, form.groupId, form.semester]);

  useEffect(() => {
    const total = Number(form.internalMarks1) + Number(form.internalMarks2);
    const full = total + Number(form.theoryMarks);
    setForm(prev => ({ ...prev, totalInternalMarks: total, totalMarks: full }));
  }, [form.internalMarks1, form.internalMarks2, form.theoryMarks]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedForm = { ...form, [name]: type === "checkbox" ? checked : value };

    if (name === "courseId") {
      const selected = courses.find(c => String(c.courseId) === value);
      if (selected) {
        updatedForm.paperName = selected.name;
        updatedForm.credits = selected.credits;
      }
    }

    setForm(updatedForm);
  };

  const handleSubmit = async () => {
    if (!form.courseId) {
      toast.error("Please select a course.");
      return;
    }
alert("hi.");
    const payload = {
      courseId: Number(form.courseId),
      groupId: Number(form.groupId),
      semester: Number(form.semester),
      paperCode: form.paperCode,
      paperName: form.paperName,
      isElective: form.isElective,
      paperType: form.paperType,
      credits: Number(form.credits),
      internalMarks1: Number(form.internalMarks1),
      internalMarks2: Number(form.internalMarks2),
      totalInternalMarks: Number(form.totalInternalMarks),
      theoryMarks: Number(form.theoryMarks),
      totalMarks: Number(form.totalMarks)
    };

    if (form.examinationId) payload.examinationId = Number(form.examinationId);

    const method = form.examinationId ? "PUT" : "POST";
    const endpoint = form.examinationId
      ? `${API_BASE_URL}/Examination/Update/${form.examinationId}`
      : `${API_BASE_URL}/Examination/Create`;

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
         },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Examination saved successfully");
      setForm({
        programmeId: "", groupId: "", semester: "", courseId: "",
        paperCode: "", paperName: "", isElective: false, paperType: "Theory",
        credits: 0, internalMarks1: 0, internalMarks2: 0,
        totalInternalMarks: 0, theoryMarks: 0, totalMarks: 0, examinationId: null
      });
      fetchExaminations();
    } catch (err) {
      toast.error(err.message || "Failed to save examination");
    }
  };

  const handleEdit = (exam) => setForm({ ...exam });

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this examination?")) return;
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Examination/Delete/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text());
      fetchExaminations();
    } catch (err) {
      toast.error(err.message || "Failed to delete.");
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4 p-4 border rounded bg-light">
        <h5 className="mb-3">Add New Subject</h5>
        <Form>
          <Row className="mb-3">
            <Col>
              <Form.Control as="select" name="programmeId" value={form.programmeId} onChange={handleChange}>
                <option value="">Select Programme</option>
                {programmes.map(p => (
                  <option key={p.programmeId} value={p.programmeId}>{p.programmeName}</option>
                ))}
              </Form.Control>
            </Col>
            <Col>
              <Form.Control as="select" name="groupId" value={form.groupId} onChange={handleChange}>
                <option value="">Select Group</option>
                {groups.filter(g => g.programmeId === Number(form.programmeId)).map(g => (
                  <option key={g.groupId} value={g.groupId}>{g.groupName}</option>
                ))}
              </Form.Control>
            </Col>
            <Col>
              <Form.Control as="select" name="semester" value={form.semester} onChange={handleChange}>
                <option value="">Select Semester</option>
                {semesters.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Form.Control>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Select Course</Form.Label>
            <Form.Control as="select" name="courseId" value={form.courseId} onChange={handleChange}>
              <option value="">Select Course</option>
              {courses.map(c => (
                <option key={c.courseId} value={c.courseId}>{c.name} ({c.courseCode})</option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group className="mb-3"><Form.Control name="paperCode" placeholder="Paper Code" value={form.paperCode} onChange={handleChange} /></Form.Group>
          <Form.Group className="mb-3"><Form.Control name="paperName" placeholder="Paper Name" value={form.paperName} onChange={handleChange} /></Form.Group>
          <Form.Group className="mb-3"><Form.Check type="checkbox" label="Is Elective?" name="isElective" checked={form.isElective} onChange={handleChange} /></Form.Group>
          <Form.Group className="mb-3"><Form.Control name="paperType" placeholder="Paper Type" value={form.paperType} onChange={handleChange} /></Form.Group>
          <Form.Group className="mb-3"><Form.Control type="number" name="credits" placeholder="Credits" value={form.credits} onChange={handleChange} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Internal Marks - 1</Form.Label><Form.Control type="number" name="internalMarks1" value={form.internalMarks1} onChange={handleChange} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Internal Marks - 2</Form.Label><Form.Control type="number" name="internalMarks2" value={form.internalMarks2} onChange={handleChange} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Total Internal Marks</Form.Label><Form.Control value={form.totalInternalMarks} readOnly /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Theory Marks</Form.Label><Form.Control type="number" name="theoryMarks" value={form.theoryMarks} onChange={handleChange} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Total Marks (Auto-calculated)</Form.Label><Form.Control value={form.totalMarks} readOnly /></Form.Group>

          <div className="d-flex gap-2 mt-3">
            <Button variant="primary" onClick={handleSubmit}>{form.examinationId ? "Update" : "Add Subject"}</Button>
            <Button variant="secondary" onClick={() => setForm({
              programmeId: "", groupId: "", semester: "", courseId: "",
              paperCode: "", paperName: "", isElective: false, paperType: "Theory",
              credits: 0, internalMarks1: 0, internalMarks2: 0,
              totalInternalMarks: 0, theoryMarks: 0, totalMarks: 0, examinationId: null
            })}>Clear</Button>
          </div>
        </Form>
      </div>

      <h5 className="mt-4 mb-2">Subjects List</h5>
      <Table bordered striped size="sm">
        <thead>
          <tr>
            <th>Paper Code</th>
            <th>Paper Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {examinations.map((exam) => (
            <tr key={exam.examinationId}>
              <td>{exam.paperCode}</td>
              <td>{exam.paperName}</td>
              <td>
                <Button variant="link" size="sm" onClick={() => handleEdit(exam)}>Edit</Button>
                <Button variant="link" size="sm" onClick={() => handleDelete(exam.examinationId)} className="text-danger">Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default AdminExaminations;
