// UI updated per visual: inline form, flat list layout with required group list format
import React, { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";

function AdminGroupsPage() {
  const [groups, setGroups] = useState([]);
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgrammes();
    fetchGroups();
  }, []);

  const fetchProgrammes = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Programme/All`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setProgrammes(data);
    } catch (err) {
      console.error("Failed to fetch Courses", err);
    }
  };

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Group/All`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error("Failed to fetch groups", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProgrammeChange = (e) => {
    const selectedName = e.target.value;
    const selectedProgramme = programmes.find((p) => p.programmeName === selectedName);

    if (selectedProgramme) {
      setForm((prev) => ({
        ...prev,
        programmeName: selectedProgramme.programmeName,
        programmeId: selectedProgramme.programmeId,
        batchName: selectedProgramme.batchName,
        fee: selectedProgramme.fee,
        numberOfSemesters: selectedProgramme.numberOfSemesters,
        selectedSemesters: Array.from({ length: selectedProgramme.numberOfSemesters }, (_, i) => i + 1),
      }));
    }
  };

  const handleSubmit = async () => {
    const { groupCode, groupName, programmeName, programmeId, batchName, fee, numberOfSemesters, selectedSemesters, groupId } = form;
    if (!groupCode || !groupName || !programmeName || !batchName || !programmeId) {
      toast.error("All fields are required.");
      return;
    }

    const payload = {
      groupCode,
      groupName,
      programmeName,
      programmeId,
      batchName,
      fee: parseFloat(fee),
      numberOfSemesters,
      selectedSemesters: selectedSemesters.map(Number),
    };

    const method = groupId ? "PUT" : "POST";
    const endpoint = groupId
      ? `${API_BASE_URL}/Group/Update/${groupId}`
      : `${API_BASE_URL}/Group/Create`;

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" ,
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success(`Group ${groupId ? "updated" : "created"} successfully!`);
      setForm({ groupCode: "", groupName: "", programmeName: "", programmeId: "", batchName: "", fee: "", numberOfSemesters: 1, selectedSemesters: [], groupId: null });
      fetchGroups();
    } catch (err) {
      toast.error(err.message || "Failed to save group");
    }
  };

const handleEdit = (group) => {
  const programme = programmes.find((p) => p.programmeId === group.programmeId);

  const semestersArray = typeof group.selectedSemesters === "string"
    ? group.selectedSemesters.split(",").map(s => parseInt(s.trim(), 10))
    : Array.isArray(group.selectedSemesters)
      ? group.selectedSemesters
      : [];

  setForm({
    groupId: group.groupId,
    groupCode: group.groupCode,
    groupName: group.groupName,
    programmeName: programme?.programmeName || group.programmeName,
    programmeId: programme?.programmeId || group.programmeId,
    batchName: programme?.batchName || group.batchName,
    fee: programme?.fee || group.fee,
    numberOfSemesters: programme?.numberOfSemesters || group.numberOfSemesters,
    selectedSemesters: semestersArray,
  });
};


  const handleDelete = async (id) => {
    const token = localStorage.getItem("jwt");
    if (window.confirm("Are you sure you want to delete this group?")) {
      try {
        const res = await fetch(`${API_BASE_URL}/Group/Delete/${id}`, { method: "DELETE" ,
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success("Group deleted successfully");
        fetchGroups();
      } catch (err) {
        toast.error(err.message || "Failed to delete group");
      }
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4 p-4 border rounded bg-light">
        <h5 className="mb-3">Add / Edit Group</h5>
        <Form>
        
          <Form.Group>
            <Form.Label>Course</Form.Label>
            <Form.Control as="select" name="programmeName" value={form.programmeName} onChange={handleProgrammeChange} required>
              <option value="">Select Course</option>
              {[...new Set(programmes.map(p => p.programmeName))].map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </Form.Control>
          </Form.Group>
            <Form.Group>
            <Form.Label>Batch</Form.Label>
            <Form.Control as="select" name="batchName" value={form.batchName} onChange={handleChange} required>
              <option value="">Select Batch</option>
              {programmes.filter(p => p.programmeName === form.programmeName).map(p => (
                <option key={p.batchName} value={p.batchName}>{p.batchName}</option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Group Code</Form.Label>
            <Form.Control name="groupCode" value={form.groupCode} onChange={handleChange} required />
          </Form.Group>
          <Form.Group>
            <Form.Label>Group Name</Form.Label>
            <Form.Control name="groupName" value={form.groupName} onChange={handleChange} required />
          </Form.Group>
          <Form.Group>
            <Form.Label>Number of Semesters</Form.Label>
            <Form.Control type="number" name="numberOfSemesters" value={form.numberOfSemesters} onChange={handleChange} required />
          </Form.Group>
          <Form.Group>
            <Form.Label>Fee</Form.Label>
            <Form.Control type="number" name="fee" value={form.fee} onChange={handleChange} required />
          </Form.Group>
          <Button className="mt-3" variant="primary" onClick={handleSubmit}>
            {form.groupId ? "Update" : "Create"}
          </Button>
        </Form>
      </div>

      <h5 className="mb-3"><i className="fa fa-users mr-2"></i> Groups List</h5>
      {loading ? <p>Loading...</p> : (
        <div>
          {groups.map((group) => (
            <div key={group.groupId} className="border p-3 rounded mb-2">
              <strong>{group.batchName}</strong> | {group.groupCode} | <strong>{group.groupName}</strong> | Semesters: {group.numberOfSemesters} | Fee: ₹{group.fee}
              <div className="d-flex justify-content-end gap-2 mt-2">
                <button className="btn btn-sm btn-outline-info" onClick={() => handleEdit(group)}>
                  <FaEdit /> Edit
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(group.groupId)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminGroupsPage;
