// File: src/pages/Courses Ware/BatchTab.jsx
import React, { useEffect, useState } from "react";
import { Form, Button, Table, Spinner, Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config";
const DEBUG = true;

/* ===================== Logging helpers ===================== */
async function readBody(res) {
  const text = await res.text().catch(() => "");
  let json;
  try { json = text ? JSON.parse(text) : undefined; } catch { json = undefined; }
  return { text, json };
}
function logRequest(label, { url, method, headers, body }) {
  if (!DEBUG) return;
  console.groupCollapsed(`📤 ${label} REQUEST`);
  console.log("URL:", url);
  console.log("Method:", method);
  console.log("Headers:", headers);
  if (body !== undefined) {
    try { console.log("Body (parsed):", JSON.parse(body)); } catch { console.log("Body (text):", body); }
  }
  console.groupEnd();
}
async function logResponse(label, res) {
  if (!DEBUG) return { text: "", json: undefined };
  const { text, json } = await readBody(res.clone());
  console.groupCollapsed(`📥 ${label} RESPONSE`);
  console.log("ok:", res.ok, "status:", res.status, res.statusText);
  console.log("Headers:");
  res.headers.forEach((v, k) => console.log(`  ${k}: ${v}`));
  console.log("Body (text):", text);
  if (json !== undefined) console.log("Body (json):", json);
  console.groupEnd();
  return { text, json };
}

/* ===================== Date utils (robust) ===================== */
const isIsoDate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}/.test(s);
const isSlashDate = (s) => typeof s === "string" && /^\d{2}[-/]\d{2}[-/]\d{4}$/.test(s);
const isMsAjaxDate = (s) => typeof s === "string" && /\/Date\(\d+\)\//.test(s);

function toIsoFromMsAjax(s) {
  try {
    const ms = Number((s.match(/\/Date\((\d+)\)\//) || [])[1]);
    if (!Number.isFinite(ms)) return "";
    const d = new Date(ms);
    return d.toISOString();
  } catch { return ""; }
}
function toIsoFromSlash(s) {
  const m = s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (!m) return "";
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}T00:00:00`;
}
const toInputDate = (s) => {
  if (!s) return "";
  if (isIsoDate(s)) return s.includes("T") ? s.split("T")[0] : s.substring(0, 10);
  if (isMsAjaxDate(s)) return toInputDate(toIsoFromMsAjax(s));
  if (isSlashDate(s)) return toInputDate(toIsoFromSlash(s));
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().substring(0, 10);
  return "";
};
const toIsoMidnight = (dateStr) => `${dateStr}T00:00:00`;

/* ===================== Shape-safe normalizer ===================== */
function ci(obj) {
  const map = {};
  Object.keys(obj || {}).forEach((k) => (map[k.toLowerCase()] = obj[k]));
  return (keyCandidates) => {
    for (const k of keyCandidates) {
      const v = map[k.toLowerCase()];
      if (v !== undefined && v !== null) return v;
    }
    return undefined;
  };
}
function looksLikeDateString(x) {
  if (typeof x !== "string") return false;
  return isIsoDate(x) || isSlashDate(x) || isMsAjaxDate(x) || !isNaN(new Date(x).getTime());
}
function normalizeFromArray(arr) {
  let bid = 0, batchName = "", startDate = "", endDate = "";
  if (!Array.isArray(arr)) return { bid, batchName, startDate, endDate };

  const idCandidate = arr.find((v) => typeof v === "number" && Number.isFinite(v));
  if (idCandidate !== undefined) bid = Number(idCandidate);

  const strings = arr.filter((v) => typeof v === "string");
  const dateCandidates = strings.filter(looksLikeDateString);
  if (dateCandidates[0]) startDate = dateCandidates[0];
  if (dateCandidates[1]) endDate = dateCandidates[1];

  const nameCandidate = strings.find((s) => s && !looksLikeDateString(s));
  if (nameCandidate) batchName = String(nameCandidate);

  if (!batchName && typeof arr[1] === "string") batchName = arr[1];
  if (!startDate && typeof arr[2] === "string") startDate = arr[2];
  if (!endDate && typeof arr[3] === "string") endDate = arr[3];

  return { bid, batchName, startDate, endDate };
}

/* ⚠️ KEY FIX: capture programmeId and classId */
function normalizeBatchDto(dto) {
  if (Array.isArray(dto)) return normalizeFromArray(dto);
  const get = ci(dto || {});
  const bid =
    get(["Bid", "BID", "bid", "Id", "ID"]) ?? 0;
  const batchName =
    get(["BatchName", "batchName", "Batch", "BATCH", "Name", "NAME", "Batch_Title", "Batch_Name", "batch"]) ?? "";
  const startDate =
    get(["StartDate", "startDate", "Start", "StartDt", "Start_Date", "FromDate", "From"]) ?? "";
  const endDate =
    get(["EndDate", "endDate", "End", "EndDt", "End_Date", "ToDate", "To"]) ?? "";

  const programmeId =
    get(["ProgrammeId", "programmeid", "ProgrammeID", "Pid", "pid"]) ?? "";
  const classId =
    get(["GroupId", "groupid", "GroupID", "Gid", "gid"]) ?? "";

  const programmeName =
    get(["programmeName", "ProgrammeName", "programName", "ProgramName"]) ?? "";
  const groupName =
    get(["groupName", "GroupName", "ClassName", "className"]) ?? "";
  const fee =
    get(["fee", "Fee", "totalFee", "TotalFee"]) ?? "";

  return {
    bid: Number(bid) || 0,
    batchName: String(batchName || ""),
    startDate,
    endDate,
    programmeId: programmeId !== "" ? String(programmeId) : "",
    classId: classId !== "" ? String(classId) : "",
    programmeName: String(programmeName || ""),
    groupName: String(groupName || ""),
    fee: String(fee || ""),
  };
}

/* ===================== API helpers ===================== */
async function postBatchArray(payloadArray, token) {
  const url = `${API_BASE_URL}/Programme/insertBatches`;
  const body = JSON.stringify(payloadArray);
  const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  logRequest("insertBatches", { url, method: "POST", headers, body });
  const res = await fetch(url, { method: "POST", headers, body });
  const { text, json } = await logResponse("insertBatches", res);
  if (!res.ok) throw new Error(text || (json && (json.title || json.message)) || `HTTP ${res.status}`);
  return json ?? text;
}
async function getAllBatches(token) {
  const url = `${API_BASE_URL}/Programme/GetAllBatch`;
  console.log("🔗 GetAllBatch URL:", url);
  const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  logRequest("GetAllBatch", { url, method: "GET", headers });
  const res = await fetch(url, { headers });
  const { text, json } = await logResponse("GetAllBatch", res);
  if (!res.ok) throw new Error(text || (json && (json.title || json.message)) || `HTTP ${res.status}`);

  let data;
  try { data = json ?? (text ? JSON.parse(text) : []); } catch { data = []; }

  if (!Array.isArray(data)) {
    const wrapper = (data && (data.data || data.result || data.items)) || [];
    if (!Array.isArray(wrapper)) throw new Error("GetAllBatch did not return an array");
    return wrapper;
  }
  return data;
}
async function getBatchById(bid, token) {
  const url = `${API_BASE_URL}/Programme/GetBatchById?Bid=${bid}`;
  const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  logRequest("GetBatchById", { url, method: "GET", headers });
  const res = await fetch(url, { headers });
  const { text, json } = await logResponse("GetBatchById", res);
  if (!res.ok) throw new Error(text || (json && (json.title || json.message)) || `HTTP ${res.status}`);
  return json ?? (text ? JSON.parse(text) : {});
}
async function deleteBatchById(bid, token) {
  const url = `${API_BASE_URL}/Programme/DeleteBatchById?Bid=${bid}`;
  const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  logRequest("DeleteBatchById(DELETE)", { url, method: "DELETE", headers });
  let res = await fetch(url, { method: "DELETE", headers });
  let out = await logResponse("DeleteBatchById(DELETE)", res);

  if (!res.ok) {
    logRequest("DeleteBatchById(GET fallback)", { url, method: "GET", headers });
    res = await fetch(url, { method: "GET", headers });
    out = await logResponse("DeleteBatchById(GET fallback)", res);
    if (!res.ok) throw new Error(out.text || (out.json && (out.json.title || out.json.message)) || `HTTP ${res.status}`);
  }
  return out.json ?? out.text;
}

/* ===================== Component ===================== */
const BatchTab = () => {
  const [form, setForm] = useState({
    batchName: "",
    startDate: "",
    endDate: "",
    bid: 0,
    programmeId: "",
    classId: "",
    fee: "",
  });
  const [saving, setSaving] = useState(false);

  const [batches, setBatches] = useState([]);
  const [boards, setBoards] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState("");

  const isEditMode = Number(form.bid) > 0;

  useEffect(() => {
    refreshList();
    fetchBoards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBoards = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Group/GetCoursesByBatch`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const normalized = Array.isArray(data)
        ? data.map((b) => ({
            programmeId: b.programmeId != null ? String(b.programmeId) : "",
            programmeCode: b.programmeCode,
            programmeName: b.programmeName,
            fee: b.fee || "",
          }))
        : [];
      console.log("📋 Boards loaded with fee data:", normalized);
      setBoards(normalized);
    } catch {
      toast.error("❌ Failed to load boards");
    }
  };

  const fetchClasses = async (programmeId) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${API_BASE_URL}/Programme/GetGroupByProgrammes?pid=${encodeURIComponent(programmeId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Error fetching classes for programmeId ${programmeId}:`, errorText);
        toast.error(`❌ Failed to load classes: ${res.statusText}`);
        setClasses([]);
        return;
      }

      const data = await res.json();
      const normalized = Array.isArray(data)
        ? data.map((g) => ({
            groupId: g.groupId != null ? String(g.groupId) : "",
            groupName: g.groupName,
          }))
        : [];

      setClasses(normalized);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("❌ Failed to load classes");
      setClasses([]);
    }
  };

  async function refreshList() {
    setLoadingList(true);
    setListError("");
    try {
      const token = localStorage.getItem("jwt");
      const rows = await getAllBatches(token);
      const normalized = rows.map(normalizeBatchDto).map((r, i) => {
        if (DEBUG && (!r.batchName || r.batchName === "")) {
          console.warn("⚠️ Row missing batchName, raw:", rows[i], "normalized:", r);
        }
        return r;
      });
      if (DEBUG) console.log("✅ Normalized batches:", normalized);
      setBatches(normalized);
    } catch (err) {
      setListError(err.message || "Failed to load batches.");
      if (DEBUG) console.error("❌ getAllBatches:", err);
    } finally {
      setLoadingList(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (DEBUG) console.log(`✏️ handleChange ${name}=`, value);
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleBoardChange = (e) => {
    const programmeId = e.target.value;
    if (programmeId) {
      const selectedBoard = boards.find(board => board.programmeId === programmeId);
      const boardFee = selectedBoard?.fee || "";
      console.log("🔄 Board changed:", { programmeId, selectedBoard, boardFee });
      setForm((prev) => ({ 
        ...prev, 
        programmeId, 
        classId: "",
        fee: boardFee
      }));
      fetchClasses(programmeId);
    } else {
      setForm((prev) => ({ 
        ...prev, 
        programmeId: "", 
        classId: "",
        fee: ""
      }));
      setClasses([]);
    }
  };

  const handleEdit = (row) => {
    const programmeId = row.programmeId ? String(row.programmeId) : "";
    const classId = row.classId ? String(row.classId) : "";
    setForm({
      batchName: row.batchName || "",
      startDate: toInputDate(row.startDate),
      endDate: toInputDate(row.endDate),
      bid: Number(row.bid) || 0,
      programmeId,
      classId,
      fee: row.fee || "",
    });
    if (programmeId) {
      fetchClasses(programmeId).then(() => {
        setForm((prev) => ({ ...prev, classId }));
      });
    }
    toast.info("✏️ Edit mode");
  };

  const handleCancelEdit = () => {
    setForm({ batchName: "", startDate: "", endDate: "", bid: 0, programmeId: "", classId: "", fee: "" });
    toast.dismiss();
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete batch "${row.batchName || "(no name)"}" (Bid=${row.bid})?`)) return;
    try {
      const token = localStorage.getItem("jwt");
      await deleteBatchById(row.bid, token);
      toast.success("🗑️ Deleted");
      await refreshList();
      if (isEditMode && Number(form.bid) === Number(row.bid)) handleCancelEdit();
    } catch (err) {
      console.error("❌ Delete failed:", err);
      toast.error(`❌ Delete failed: ${err.message}`);
    }
  };

  const handleSave = async () => {
    const { batchName, startDate, endDate, bid, programmeId, classId, fee } = form;

    if (DEBUG) console.log("🧾 handleSave form:", form);

    if (!batchName || !startDate || !endDate || !programmeId || !classId) {
      toast.error("Please fill all required fields, including Programme and Class.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start Date cannot be after End Date");
      return;
    }

    const dto = {
      Bid: Number(bid) || 0,
      BatchName: batchName,
      StartDate: toIsoMidnight(startDate),
      EndDate: toIsoMidnight(endDate),
      Pid: Number(programmeId),
      Gid: Number(classId),
      Fee: fee ? Number(fee) : 0,
    };

    try {
      setSaving(true);
      const token = localStorage.getItem("jwt");
      await postBatchArray([dto], token);
      toast.success(isEditMode ? "✅ Batch updated successfully" : "✅ Batch created successfully");
      await refreshList();
      setForm({ batchName: "", startDate: "", endDate: "", bid: 0, programmeId: "", classId: "", fee: "" });
    } catch (err) {
      console.error("❌ Save failed:", err);
      toast.error(`❌ Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-0 pt-0 welcome-card animate-welcome">
      {/* Form Card */}
      <div className="mb-0 bg-glass p-3 rounded">
        <h5 className="mb-3 text-primary">Add / Edit Batch</h5>
        <Form onSubmit={(e) => e.preventDefault()}>
          <div className="row g-3">
            {/* Select Board */}
            <div className="col-12 col-md-6 col-lg-4">
              <Form.Group>
                <Form.Label>Select Board</Form.Label>
                <Form.Control
                  as="select"
                  name="programmeId"
                  value={form.programmeId}
                  onChange={handleBoardChange}
                  required
                >
                  <option value="">Select Board</option>
                  {boards.map((board) => (
                    <option key={board.programmeId} value={board.programmeId}>
                      {board.programmeCode} - {board.programmeName}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </div>

            {/* Class */}
            <div className="col-12 col-md-6 col-lg-4">
              <Form.Group>
                <Form.Label>Class</Form.Label>
                <Form.Control
                  as="select"
                  name="classId"
                  value={form.classId}
                  onChange={(e) => setForm((prev) => ({ ...prev, classId: e.target.value }))}
                  disabled={!form.programmeId}
                >
                  <option value="">Select Class</option>
                  {(Array.isArray(classes) ? classes : []).map((cls) => (
                    <option key={cls.groupId} value={cls.groupId}>
                      {cls.groupName}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </div>

            {/* Batch */}
            <div className="col-12 col-md-6 col-lg-4">
              <Form.Group>
                <Form.Label>Batch</Form.Label>
                <Form.Control
                  name="batchName"
                  placeholder="e.g., AUG-25(1)"
                  value={form.batchName}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>

            {/* Total Fee */}
            <div className="col-12 col-md-6 col-lg-4">
              <Form.Group>
                <Form.Label>Fee</Form.Label>
                <Form.Control
                  name="fee"
                  value={form.fee}
                  onChange={handleChange}
                  placeholder={form.programmeId ? "Fee auto-filled from board" : ""}
                  type="number"
                />
              </Form.Group>
            </div>

            {/* Start Date */}
            <div className="col-12 col-md-6 col-lg-4">
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>

            {/* End Date */}
            <div className="col-12 col-md-6 col-lg-4">
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>

            {/* Actions (Save / Cancel) */}
            <div className="col-12 col-md-6 col-lg-4 d-flex align-items-end">
              <div className="d-grid d-lg-flex gap-2 w-100">
                <Button
                  className="rounded-pill px-4"
                  variant={isEditMode ? "warning" : "success"}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSave();
                  }}
                  disabled={saving}
                >
                  {saving
                    ? isEditMode
                      ? "Updating..."
                      : "Saving..."
                    : isEditMode
                    ? "Update"
                    : "Save"}
                </Button>

                {isEditMode && (
                  <Button
                    variant="outline-secondary"
                    className="px-4"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Form>
      </div>

      {/* List Card */}
      <div className="p-4 mt-3 rounded bg-white border shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">📋 Batches</h5>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={refreshList}
            disabled={loadingList}
          >
            {loadingList ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {listError && (
          <Alert variant="warning" className="mb-3">
            Couldn’t load from server: {listError}
          </Alert>
        )}

        <div className="p-0 overflow-auto custom-scrollbar flex-grow-1">
          {loadingList ? (
            <div className="py-3 text-center">
              <Spinner animation="border" role="status" />
            </div>
          ) : batches.length === 0 ? (
            <p className="mb-0">No batches found.</p>
          ) : (
            <div className="batch-table-scroll">
              <Table bordered hover responsive size="sm" className="mb-0">
                <thead>
                  <tr className="bg-light">
                    <th style={{ width: 180 }}>Board</th>
                    <th style={{ width: 80 }}>Class</th>
                    <th style={{ width: 120 }}>Batch</th>
                    <th style={{ width: 120 }}>Start Date</th>
                    <th style={{ width: 120 }}>End Date</th>
                    <th style={{ width: 100 }}>Fee</th>
                    <th style={{ width: 120 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((b, idx) => {
                    const start = toInputDate(b.startDate);
                    const end = toInputDate(b.endDate);
                    return (
                      <tr key={b.bid || idx}>
                        <td data-label="Board" className="text-start">
                          {b.programmeName || <em>(no board)</em>}
                        </td>
                        <td data-label="Class" className="text-center">
                          {b.groupName || <em>(no class)</em>}
                        </td>
                        <td data-label="Batch" className="text-start">
                          {b.batchName || <em>(no name)</em>}
                        </td>
                        <td data-label="Start Date">{start}</td>
                        <td data-label="End Date">{end}</td>
                        <td data-label="Fee" className="text-end">
                          {b.fee ? `₹${b.fee}` : <em>(no fee)</em>}
                        </td>
                        <td
                          data-label="Actions"
                          className="d-flex gap-2"
                          style={{ margin: "auto", alignItems: "center", textAlign: "center", justifyContent: "center" }}
                        >
                          <Button
                            size="sm"
                            variant="outline-info"
                            onClick={() => handleEdit(b)}
                            type="button"
                            style={{ marginTop: "0px", marginBottom: "0px" }}
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(b)}
                            type="button"
                            style={{ marginTop: "0px", marginBottom: "0px" }}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchTab;
