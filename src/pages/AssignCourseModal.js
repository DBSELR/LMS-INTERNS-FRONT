import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import API_BASE_URL from "../config";

const AssignCourseModal = ({ show, onHide, onAssign, courseId }) => {
  const [groupData, setGroupData] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  useEffect(() => {
    if (show) fetchGroupData();
  }, [show]);

  const fetchGroupData = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Group/All`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setGroupData(data);

      const uniqueProgrammes = Array.from(
        new Map(data.map(d => [d.programmeId, {
          programmeId: d.programmeId,
          programmeName: d.programmeName
        }])).values()
      );
      setProgrammes(uniqueProgrammes);
    } catch (err) {
      console.error("Failed to fetch group data", err);
    }
  };

  const handleProgrammeChange = (e) => {
    const pid = e.target.value;
    setSelectedProgrammeId(pid);
    setSelectedGroupId("");
    setSelectedSemester("");
    const filtered = groupData.filter(g => g.programmeId.toString() === pid);
    setFilteredGroups(filtered);
  };

  const handleGroupChange = (e) => {
    const gid = e.target.value;
    setSelectedGroupId(gid);
    const group = groupData.find(g => g.groupId.toString() === gid);
    if (group) {
      const semesterList = group.selectedSemesters.split(",").map(s => s.trim());
      setSemesters(semesterList);
    }
  };

  const handleSubmit = () => {
    if (!selectedProgrammeId || !selectedGroupId || !selectedSemester) {
      alert("All fields are required");
      return;
    }
    onAssign({ courseId, programmeId: selectedProgrammeId, groupId: selectedGroupId, semester: selectedSemester });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Assign Course to Programme & Group</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="programmeSelect">
            <Form.Label>Course</Form.Label>
            <Form.Control as="select" value={selectedProgrammeId} onChange={handleProgrammeChange}>
              <option value="">-- Select Course --</option>
              {programmes.map(p => (
                <option key={p.programmeId} value={p.programmeId}>{p.programmeName}</option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="groupSelect" className="mt-3">
            <Form.Label>Group</Form.Label>
            <Form.Control as="select" value={selectedGroupId} onChange={handleGroupChange} disabled={!selectedProgrammeId}>
              <option value="">-- Select Group --</option>
              {filteredGroups.map(g => (
                <option key={g.groupId} value={g.groupId}>{g.groupName}</option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="semesterSelect" className="mt-3">
            <Form.Label>Semester</Form.Label>
            <Form.Control as="select" value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)} disabled={!selectedGroupId}>
              <option value="">-- Select Semester --</option>
              {semesters.map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Assign</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignCourseModal;
