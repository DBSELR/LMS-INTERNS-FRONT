import React, { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "../../config";

function SemesterFeeTemplateManager() {
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [groupList, setGroupList] = useState([]);

  const [installmentFeeData, setInstallmentFeeData] = useState([]);
  const [dueDateSelected, setDueDateSelected] = useState(false);

  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [installmentDueDate, setInstallmentDueDate] = useState(new Date());

  // ----------------- initial data: Programmes & Batches -----------------
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Programme/ProgrammeBatch`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setCourseList(data);
      setBatchList([...new Set(data.map((p) => p.batchName))]);
    } catch (err) {
      console.error("Failed to fetch initial data", err);
      alert("Failed to fetch initial data");
    }
  };

  // ----------------- load groups when batch + course selected -----------------
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (selectedBatch && selectedCourse) {
      fetch(`${API_BASE_URL}/Group/All`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const filtered = data.filter(
            (g) =>
              g.batchName === selectedBatch &&
              g.programmeId === parseInt(selectedCourse)
          );
          setGroupList(filtered);
        })
        .catch((err) => console.error("Failed to load groups", err));
    }
  }, [selectedBatch, selectedCourse]);

  // ----------------- fetch tuition fee installment data -----------------
  useEffect(() => {
    if (selectedBatch) {
      fetchInstallmentWiseFees(selectedBatch, selectedCourse, selectedGroup);
    }
  }, [selectedBatch, selectedCourse, selectedGroup]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  // ----------------- Submit: Save Tuition Fee Template -----------------
  const handleSubmit = async () => {
    const requestBody = {
      batch: selectedBatch,
      programmeId: selectedCourse || null,
      // groupId is no longer used for insert; backend only takes Batch + ProgrammeId
      dueDate: dueDateSelected
        ? installmentDueDate.toISOString().split("T")[0]
        : null,
    };

    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(`${API_BASE_URL}/Fee/SaveInstallmentFee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        // reload data after insert/update
        fetchInstallmentWiseFees(selectedBatch, selectedCourse, selectedGroup);
        toast.success(result.message);
      } else {
        const error = await response.json();
        alert("Error: " + (error.error || "Failed to save data"));
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // ----------------- Get existing installment-wise fee (Tuition Fee, Hid=1, Installment=1) -----------------
  const fetchInstallmentWiseFees = async (batch, programmeId, groupId) => {
    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(
        `${API_BASE_URL}/Fee/Getinstallmentwisefeemaster`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            // 👇 fixed to Tuition Fee (Hid 1, Installment 1)
            hid: 1,
            batch: batch,
            programmeId:
              programmeId === "0" || !programmeId
                ? null
                : parseInt(programmeId),
            groupId:
              groupId === "0" || !groupId ? null : parseInt(groupId),
            installment: 1,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const transformed = data.map((item) => ({
          feeHead: item.feeHead,
          batch: item.batch,
          programmeId: item.programmeId,
          pNAME: item.pname,
          groupId: item.groupId,
          gname: item.gname,
          installment: item.installments,
          amountDue: parseFloat(item.amountDue),
          totalFee: parseFloat(item.amountDue),
          dueDate: item.dueDate?.split("T")[0] || "",
        }));
        setInstallmentFeeData(transformed);
      } else {
        console.error("Failed to load installment fee data.");
      }
    } catch (err) {
      console.error("Error fetching installment fee data:", err);
    }
  };

  // ========================== RENDER ==========================
  return (
    <div className="p-6">
      <div className="row mb-4">
        {/* Batch */}
        <div className="col-12 col-md-3 mb-2">
          <Form.Label>Batch</Form.Label>
          <Form.Control
            as="select"
            value={selectedBatch}
            onChange={(e) => {
              const batch = e.target.value;
              setSelectedBatch(batch);
              setSelectedCourse("");
              setSelectedGroup("");
            }}
          >
            <option value="">Select Batch</option>
            {batchList.map((b, i) => (
              <option key={i}>{b}</option>
            ))}
          </Form.Control>
        </div>

        {/* Course */}
        <div className="col-12 col-md-3 mb-2">
          <Form.Label>Course</Form.Label>
          <Form.Control
            as="select"
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setSelectedGroup("");
            }}
          >
            <option value="">Select Course</option>
            {courseList
              .filter((c) => c.batchName === selectedBatch)
              .map((c) => (
                <option key={c.programmeId} value={c.programmeId}>
                  {c.programmeCode}-{c.programmeName}
                </option>
              ))}
          </Form.Control>
        </div>

        {/* Group (still used for display & Getinstallmentwisefeemaster filter) */}
        {/* <div className="col-12 col-md-3 mb-2">
          <Form.Label>Group</Form.Label>
          <Form.Control
            as="select"
            value={selectedGroup}
            onChange={(e) => {
              const groupId = e.target.value;
              setSelectedGroup(groupId);
            }}
          >
            <option value="">Select Group</option>
            {groupList.map((g) => (
              <option key={g.groupId} value={g.groupId}>
                {g.groupCode}-{g.groupName}
              </option>
            ))}
          </Form.Control>
        </div> */}

        {/* Due Date */}
        <div className="col-12 col-md-2 mb-2">
          <Form.Label>Due Date</Form.Label>
          <input
            type="date"
            className="form-control"
            value={
              dueDateSelected
                ? installmentDueDate.toISOString().split("T")[0]
                : ""
            }
            onChange={(e) => {
              if (e.target.value === "") {
                setDueDateSelected(false);
              } else {
                setDueDateSelected(true);
                setInstallmentDueDate(new Date(e.target.value));
              }
            }}
          />
        </div>

        {/* Submit */}
        <div className="col-12 col-md-1 d-flex align-items-end mb-2">
          <Button
            style={{ height: "40px" }}
            variant="primary"
            className="w-100"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </div>

      {/* Table */}
      {installmentFeeData.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-hover table-striped table-sm">
            <thead className="dark-header bg-dark text-white text-center">
              <tr style={{ fontSize: "13.5px" }}>
                {/* <th>Fee Head</th> */}
                <th>Batch</th>
                <th>Course</th>
                {/* <th>Group</th> */}
                {/* <th>Installment</th> */}
                <th>Amount</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody className="text-center align-middle">
              {installmentFeeData.map((item, index) => (
                <tr key={index}>
                  {/* <td>{item.feeHead}</td> */}
                  <td>{item.batch}</td>
                  <td>{item.pNAME}</td>
                  {/* <td>{item.gname}</td> */}
                  {/* <td>{item.installment}</td> */}
                  <td>₹{parseFloat(item.totalFee || 0).toFixed(2)}</td>
                  <td>{formatDate(item.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SemesterFeeTemplateManager;
