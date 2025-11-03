import React, { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";
import API_BASE_URL from "../../config";


const CLASS_CODE_OPTIONS = [
  { display: "VI", value: "06" },
  { display: "VII", value: "07" },
  { display: "VIII", value: "08" },
  { display: "IX", value: "09" },
  { display: "X", value: "10" },
];

const GroupsTab = ({ isActive }) => {
  const [groups, setGroups] = useState([]);
  const [batchcourse, setBatchCourse] = useState([]);

  const [form, setForm] = useState({
    groupId: null,
    groupCode: "",
    groupName: "",
    batchName: "",
    courseValue: "",
    programmeId: "",
    programmeName: "",
    numberOfSemesters: 1,
    fee: "",
    installments: "",
    isNoGrp: false,
  });

  useEffect(() => {
    if (isActive) {
      fetchCoursesByBatch();
      fetchGroups();
    }
  }, [isActive]);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Group/All`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch {
      toast.dismiss();
      toast.error("❌ Failed to load groups");
    }
  };

  const fetchCoursesByBatch = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Group/GetCoursesByBatch`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBatchCourse(Array.isArray(data) ? data : []);
    } catch {
      toast.dismiss();
      toast.error("❌ Failed to fetch courses for batch");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "fee") {
      setForm((prev) => ({ ...prev, fee: value }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGroupCodeChange = (e) => {
    const code = e.target.value;
    const display = CLASS_CODE_OPTIONS.find((opt) => opt.value === code)?.display;
    setForm((prev) => ({
      ...prev,
      groupCode: code,
      groupName: prev.isNoGrp ? prev.groupName : code ? `Class - ${display}` : "",
    }));
  };

  const handleCourseChange = (e) => {
    const selected = e.target.value;
    if (selected) {
      const [programmeId, batchName] = selected.split("||");
      const course = batchcourse.find(
        (c) => String(c.programmeId) === String(programmeId) && c.batchName === batchName
      );

      if (course) {
        const noGrp = !!course.isNoGrp;
        setForm((prev) => ({
          ...prev,
          courseValue: selected,
          programmeId: course.programmeId,
          programmeName: course.programmeName,
          batchName: course.batchName,
          numberOfSemesters: course.numberOfSemesters ?? 1,
          fee: course.fee ?? "",
          installments: course.installments ?? "",
          isNoGrp: noGrp,
          groupCode: noGrp ? "00" : prev.groupCode,
          groupName: noGrp ? "---" : prev.groupName,
        }));
      }
    } else {
      setForm((prev) => ({
        ...prev,
        courseValue: "",
        programmeId: "",
        programmeName: "",
        batchName: "",
        numberOfSemesters: 1,
        fee: "",
        installments: "",
        isNoGrp: false,
        groupCode: "",
        groupName: "",
      }));
    }
  };

  const handleSave = async () => {
    toast.dismiss();

    const {
      groupId,
      groupCode,
      programmeId,
      programmeName,
      numberOfSemesters,
      fee,
      installments,
      isNoGrp,
      batchName,
    } = form;

    if (!programmeId) {
      toast.error("❌ Please select Board", { autoClose: 3000 });
      return;
    }

    if (!isNoGrp) {
      if (!groupCode) {
        toast.error("❌ Please select Class Code", { autoClose: 3000 });
        return;
      }

      const isDuplicate = groups.some(
        (g) =>
          g.groupCode === groupCode &&
          String(g.programmeId) === String(programmeId) &&
          g.groupId !== groupId
      );
      if (isDuplicate) {
        toast.error("❌ Duplicate Group Code not allowed for this Board", { autoClose: 3000 });
        return;
      }
    }

    if (!numberOfSemesters || !fee || !installments) {
      toast.error(
        "❌ Board must provide Semesters, Fee & Installments. Re-select the Board.",
        { autoClose: 3500 }
      );
      return;
    }

    const payload = {
      groupCode: isNoGrp ? "00" : groupCode,
      groupName: isNoGrp ? "---" : groupCode,
      programmeId,
      programmeName,
      numberOfSemesters: Number(numberOfSemesters),
      fee: parseFloat(fee),
      installments: parseInt(installments, 10),
      selectedSemesters: Array.from({ length: Number(numberOfSemesters) }, (_, i) => i + 1),
    };
    if (groupId) payload.groupId = groupId;

    const url = groupId
      ? `${API_BASE_URL}/Group/Update/${groupId}`
      : `${API_BASE_URL}/Group/Create`;
    const method = groupId ? "PUT" : "POST";

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const resultText = await res.text();
      if (!res.ok) throw new Error(resultText || "Unknown server error");

      toast.success(`✅ Class ${groupId ? "updated" : "created"} successfully`, {
        autoClose: 3000,
      });

      setForm({
        groupId: null,
        groupCode: "",
        groupName: "",
        courseValue: "",
        programmeId: "",
        programmeName: "",
        batchName: "",
        numberOfSemesters: 1,
        fee: "",
        installments: "",
        isNoGrp: false,
      });

      fetchGroups();
    } catch (err) {
      toast.error(`❌ ${err.message}`, { autoClose: 4000 });
      console.error("Group Save Error:", err.message);
    }
  };

  const handleDelete = async (groupId) => {
    toast.dismiss();
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Group/Delete/${groupId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("🗑️ Group deleted successfully");
      fetchGroups();
    } catch (err) {
      toast.error(err.message || "❌ Delete failed");
    }
  };

  const handleEdit = async (g) => {
    await fetchCoursesByBatch();
    const matchedCourse = batchcourse.find(
      (c) => c.programmeId === g.programmeId && c.batchName === g.batchName
    );
    const isNoGrp = !!matchedCourse?.isNoGrp;
    const normalizedName = isNoGrp ? "---" : g.groupName || g.groupCode || "";

    setForm({
      groupId: g.groupId,
      groupCode: isNoGrp ? "00" : g.groupCode,
      groupName: normalizedName,
      batchName: g.batchName,
      courseValue: `${g.programmeId}||${g.batchName}`,
      programmeId: g.programmeId,
      programmeName: g.programmeName,
      numberOfSemesters: g.numberOfSemesters,
      fee: g.fee,
      installments: g.installments,
      isNoGrp,
    });
  };

  const codeToDisplay = (code) =>
    CLASS_CODE_OPTIONS.find((o) => o.value === code)?.display || code || "";

  const classDisplay = (g) => {
    if (g.groupCode === "00" || g.groupName === "---") return "---";
    const disp = codeToDisplay(g.groupCode || g.groupName);
    return `Class - ${disp}`;
  };

  const cellPad = { padding: "6px 8px" };

  return (
    <div className="container py-0 pt-0 welcome-card animate-welcome">
      <div className="mb-0 bg-glass p-0 border">
        <h5 className="mb-0 mt-0 text-primary">Add / Edit Class</h5>

        <Form>
          <div className="groups-form-row">
            {/* Select Board */}
            <div className="groups-form-col">
              <Form.Group className="mb-0">
                <Form.Label>Select Board</Form.Label>
                <Form.Control
                  as="select"
                  name="courseValue"
                  value={form.courseValue}
                  onChange={handleCourseChange}
                  required
                >
                  <option value="">Select Board</option>
                  {batchcourse.map((c) => (
                    <option
                      key={`${c.programmeId}-${c.batchName}`}
                      value={`${c.programmeId}||${c.batchName}`}
                    >
                      {c.programmeCode} - {c.programmeName}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </div>

            {/* Class */}
            <div className="groups-form-col">
              <Form.Group className="mb-0">
                <Form.Label>Class</Form.Label>
                <Form.Control
                  as="select"
                  name="groupCode"
                  value={form.groupCode}
                  onChange={handleGroupCodeChange}
                  disabled={form.isNoGrp}
                >
                  <option value="">Select Class</option>
                  {CLASS_CODE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.display}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </div>

            {/* Total Fee */}
            <div className="groups-form-col">
              <Form.Group className="mb-0">
                <Form.Label>Total Fee</Form.Label>
                <Form.Control
                  name="fee"
                  value={form.fee}
                  onChange={handleChange}
                  disabled={form.isNoGrp}
                />
              </Form.Group>
            </div>

            {/* Save */}
            <div className="groups-form-col groups-form-save">
              <Button
                className="rounded-pill px-4 class-save-btn"
                variant="success"
                onClick={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                {form.groupId ? "Update" : "Save"}
              </Button>
            </div>
          </div>
        </Form>
      </div>

      <h5 className="mb-3">Classes List</h5>
      <div className="semester-panel-body">
        {groups.length === 0 ? (
          <p>No classes found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-hover table-bordered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ ...cellPad, whiteSpace: "nowrap" }}>Board</th>
                  <th style={{ ...cellPad, whiteSpace: "nowrap" }}>Class</th>
                  <th style={{ ...cellPad, whiteSpace: "nowrap" }}>Fee (₹)</th>
                  <th style={{ ...cellPad, width: 140, whiteSpace: "nowrap" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <tr key={`tbl-${g.groupId}`}>
                    <td style={{ ...cellPad, whiteSpace: "nowrap" }}>
                      {g.programmeCode} - {g.programmeName}
                    </td>
                    <td style={{ ...cellPad, whiteSpace: "nowrap" }}>{classDisplay(g)}</td>
                    <td style={{ ...cellPad, whiteSpace: "nowrap" }}>₹{g.fee}</td>
                    <td style={{ ...cellPad }} className="text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <Button
                          size="sm"
                          variant="info"
                          onClick={() => handleEdit(g)}
                          title="Edit"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(g.groupId)}
                          title="Delete"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {groups.length === 0 && (
                  <tr>
                    <td style={cellPad} colSpan={4} className="text-center text-muted">
                      No classes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsTab;
