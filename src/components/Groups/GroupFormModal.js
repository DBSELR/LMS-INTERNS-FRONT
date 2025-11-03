import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config";

function GroupFormModal({ show, onHide, onSave, group }) {
  const [programmes, setProgrammes] = useState([]);
  const [form, setForm] = useState({
    groupCode: "",
    groupName: "",
    programmeName: "",
    programmeId: "",
    batchName: "",
    fee: "",
    numberOfSemesters: 1,
    selectedSemesters: [],
    groupId: null,
  });

  useEffect(() => {
    fetchProgrammes();
  }, []);

  useEffect(() => {
    if (group && programmes.length > 0) {
      const selectedProgramme = programmes.find(
        (p) => p.programmeId === group.programmeId
      );

      setForm({
        groupId: group.groupId,
        groupCode: group.groupCode,
        groupName: group.groupName,
        programmeName: selectedProgramme?.programmeName || "",
        programmeId: selectedProgramme?.programmeId || group.programmeId,
        batchName: selectedProgramme?.batchName || group.batchName || "",
        fee: selectedProgramme?.fee || group.fee || "",
        numberOfSemesters:
          selectedProgramme?.numberOfSemesters || group.numberOfSemesters || 1,
        selectedSemesters: group.selectedSemesters || [],
      });
    } else if (!group) {
      setForm({
        groupCode: "",
        groupName: "",
        programmeName: "",
        programmeId: "",
        batchName: "",
        fee: "",
        numberOfSemesters: 1,
        selectedSemesters: [],
        groupId: null,
      });
    }
  }, [group, programmes]);

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
      console.error("Failed to fetch Courses", err);
    }
  };

  const uniqueProgrammeNames = [
    ...new Set(programmes.map((p) => p.programmeName)),
  ];

  const handleProgrammeChange = (e) => {
    const selectedName = e.target.value;
    const selectedProgramme = programmes.find(
      (p) => p.programmeName === selectedName
    );

    if (selectedProgramme) {
      setForm((prev) => ({
        ...prev,
        programmeName: selectedProgramme.programmeName,
        programmeId: selectedProgramme.programmeId,
        batchName: selectedProgramme.batchName,
        fee: selectedProgramme.fee,
        numberOfSemesters: selectedProgramme.numberOfSemesters,
        selectedSemesters: Array.from(
          { length: selectedProgramme.numberOfSemesters },
          (_, i) => i + 1
        ),
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
const handleSubmit = async () => {
  const {
    groupCode,
    groupName,
    programmeName,
    programmeId,
    batchName,
    fee,
    numberOfSemesters,
    selectedSemesters,
    groupId,
  } = form;

  if (!groupCode || !groupName || !programmeName || !batchName || !programmeId) {
    toast.error("All fields are required.");
    return;
  }

  const parsedSemesters = Array.isArray(selectedSemesters)
    ? selectedSemesters.map(Number)
    : String(selectedSemesters)
        .split(",")
        .map((v) => parseInt(v.trim(), 10));

  const payload = {
    groupCode,
    groupName,
    programmeName,
    programmeId,
    batchName,
    fee: parseFloat(fee),
    numberOfSemesters,
    selectedSemesters: parsedSemesters, // ✅ fixed
  };

  const method = groupId ? "PUT" : "POST";
  const endpoint = groupId
    ? `${API_BASE_URL}/Group/Update/${groupId}`
    : `${API_BASE_URL}/Group/Create`;

  try {
    const token = localStorage.getItem("jwt");
    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(await res.text());

    toast.success(`Group ${groupId ? "updated" : "created"} successfully!`);
    onSave();
  } catch (err) {
    toast.error(err.message || "Failed to save group");
  }
};

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{form.groupId ? "Edit Group" : "Add Group"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Course</Form.Label>
            <Form.Control
              as="select"
              name="programmeName"
              value={form.programmeName}
              onChange={handleProgrammeChange}
              required
            >
              <option value="">Select Course</option>
              {uniqueProgrammeNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group>
            <Form.Label>Batch</Form.Label>
            <Form.Control
              as="select"
              name="batchName"
              value={form.batchName}
              onChange={handleChange}
              required
            >
              <option value="">Select Batch</option>
              {programmes
                .filter((p) => p.programmeName === form.programmeName)
                .map((p) => (
                  <option key={p.batchName} value={p.batchName}>
                    {p.batchName}
                  </option>
                ))}
            </Form.Control>
          </Form.Group>

          <Form.Group>
            <Form.Label>Fee</Form.Label>
            <Form.Control
              type="number"
              name="fee"
              value={form.fee}
              onChange={handleChange}
              min="0"
              required
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Group Code</Form.Label>
            <Form.Control
              name="groupCode"
              value={form.groupCode}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Group Name</Form.Label>
            <Form.Control
              name="groupName"
              value={form.groupName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Select Semesters</Form.Label>
            <div className="d-flex flex-wrap">
              {Array.from({ length: form.numberOfSemesters }, (_, i) => (
                <Form.Check
                  key={i + 1}
                  type="checkbox"
                  label={`Semester ${i + 1}`}
                  checked={form.selectedSemesters.includes(i + 1)}
                  onChange={() => {
                    setForm((prev) => {
                      const updated = [...prev.selectedSemesters];
                      const index = updated.indexOf(i + 1);
                      if (index > -1) updated.splice(index, 1);
                      else updated.push(i + 1);
                      return { ...prev, selectedSemesters: updated };
                    });
                  }}
                />
              ))}
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {form.groupId ? "Update" : "Create"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default GroupFormModal;
