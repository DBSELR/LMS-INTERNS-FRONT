import React, { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "../../config";

function SemesterFeeTemplateManager() {
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [installmentOptions, setinstallmentOptions] = useState([]);
  const [semOptions, setsemOptions] = useState([]);
  const [subjectFees, setSubjectFees] = useState([]);
  const [installmentFeeData, setInstallmentFeeData] = useState([]);
  const [dueDateSelected, setDueDateSelected] = useState(false);

  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedInstallment, setSelectedInstallment] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [installmentDueDate, setInstallmentDueDate] = useState(new Date());
  const [amount, setAmount] = useState("");

  const [feeHeads, setFeeHeads] = useState([]);
  const [selectedFeeHead, setSelectedFeeHead] = useState("");

  // Initial load of programmes and batch list
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Programme/All`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setCourseList(data);
      setBatchList([...new Set(data.map((p) => p.batchName))]);

      const feeHeadRes = await fetch(`${API_BASE_URL}/Fee/FeeHeads`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const feeHeadData = await feeHeadRes.json();
      setFeeHeads(feeHeadData);

      // Set default selected fee head to "Tuition Fee"
    const tuitionFee = feeHeadData.find(f => f.feeHead === "Tuition Fee");
    if (tuitionFee) {
      setSelectedFeeHead(tuitionFee.hid.toString());
    }

    } catch (err) {
      console.error("Failed to fetch  data", err);
      alert("Failed to fetch  data");
    }
  };

useEffect(() => {
  if (selectedBatch && selectedFeeHead) {
    fetchInstallmentWiseFees(selectedBatch, selectedCourse, selectedGroup);
  }
}, [selectedBatch, selectedCourse, selectedGroup, selectedInstallment, selectedFeeHead]);


  // Load groups when batch and course are selected
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
        });
    }
  }, [selectedBatch, selectedCourse]);

  // Fetch fee data when batch is selected
  useEffect(() => {
    if (selectedBatch) {
      fetchInstallmentWiseFees(selectedBatch);
    }
  }, [selectedBatch]);

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
};
  // const handleSubmit = async () => {
  //   const requestBody = {
  //     batch: selectedBatch,
  //     programmeId: selectedCourse || null,
  //     groupId: selectedGroup || null,
  //     installment: selectedInstallment ? parseInt(selectedInstallment) : null,
  //     semester: selectedSemester ? parseInt(selectedSemester) : null,
  //     dueDate: installmentDueDate.toISOString().split("T")[0],
  //      feeHeadId: selectedFeeHead ? parseInt(selectedFeeHead) : null,
  //      amount: amount ? parseFloat(amount) : null
  //   };

  // const handleSubmit = async () => {
  // const isTuitionFee = feeHeads.find(f => f.hid === parseInt(selectedFeeHead))?.feeHead === "Tuition Fee";

  // const requestBody = {
  //   batch: selectedBatch,
  //   programmeId: selectedCourse || null,
  //   groupId: selectedGroup || null,
  //   installment: isTuitionFee ? (selectedInstallment ? parseInt(selectedInstallment) : null) : null,
  //   semester: !isTuitionFee ? (selectedSemester ? parseInt(selectedSemester) : null) : null,
  //   dueDate: installmentDueDate.toISOString().split("T")[0],
  //   feeHeadId: selectedFeeHead ? parseInt(selectedFeeHead) : null,
  //   amount: !isTuitionFee ? (amount ? parseFloat(amount) : null) : null
  // };
const handleSubmit = async () => {
  const isTuitionFee = feeHeads.find(f => f.hid === parseInt(selectedFeeHead))?.feeHead === "Tuition Fee";

  const requestBody = {
    batch: selectedBatch,
    programmeId: selectedCourse || null,
    groupId: selectedGroup || null,
    installment: isTuitionFee ? (selectedInstallment ? parseInt(selectedInstallment) : null) : null,
    semester: !isTuitionFee ? (selectedSemester ? parseInt(selectedSemester) : null) : null,
    dueDate: dueDateSelected ? installmentDueDate.toISOString().split("T")[0] : null,
    feeHeadId: selectedFeeHead ? parseInt(selectedFeeHead) : null,
    amount: !isTuitionFee ? (amount ? parseFloat(amount) : null) : null
  };
    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(`${API_BASE_URL}/Fee/SaveInstallmentFee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const result = await response.json();
          fetchInstallmentWiseFees(selectedBatch);  
        toast.success(result.message);
      } else {
        const error = await response.json();
        alert("Error: " + (error.error || "Failed to save data"));
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const fetchInstallmentWiseFees = async (batch, programmeId, groupId) => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(`${API_BASE_URL}/Fee/Getinstallmentwisefeemaster`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        hid: selectedFeeHead ? parseInt(selectedFeeHead) : null, // ✅ Correct parameter name
        batch: batch,
        programmeId: programmeId === "0" || !programmeId ? null : parseInt(programmeId),
        groupId: groupId === "0" || !groupId ? null : parseInt(groupId),
        installment: selectedInstallment ? parseInt(selectedInstallment) : null
      })
    });

    if (response.ok) {
      const data = await response.json();
      const transformed = data.map((item) => ({
        feeHead : item.feeHead,
        batch: item.batch,
        programmeId: item.programmeId,
        pNAME: item.pname,
        groupId: item.groupId,
        gname: item.gname,
        installment: item.installments,
        amountDue: parseFloat(item.amountDue),
        totalFee: parseFloat(item.amountDue),
        dueDate: item.dueDate?.split("T")[0] || ""
      }));
      console.log("Transformed Installment Fee Data:", transformed);
      setInstallmentFeeData(transformed);
    } else {
      console.error("Failed to load installment fee data.");
    }
  } catch (err) {
    console.error("Error fetching installment fee data:", err);
  }
};


// const isTuitionFee =
//   feeHeads.find((f) => f.hid === parseInt(selectedFeeHead))?.feeHead ===
//   "Tuition Fee";
const isTuitionFee = feeHeads.find((f) => f.hid === parseInt(selectedFeeHead))?.feeHead === "Tuition Fee";
const isFeeHeadSelected = !!selectedFeeHead;

  return (
    <div className="p-6">
      <div className="row mb-4">
      <div className="col-12 col-md-2 mb-2">
  <Form.Label>Fee Head</Form.Label>
  <Form.Control
    as="select"
    value={selectedFeeHead}
    onChange={(e) => setSelectedFeeHead(e.target.value)}
  >
    <option value="">Select Fee Head</option>
    {feeHeads.map((fh) => (
      <option key={fh.hid} value={fh.hid}>
        {fh.feeHead}
      </option>
    ))}
  </Form.Control>
</div>
  <div className="col-12 col-md-2 mb-2">
    <Form.Label>Batch</Form.Label>
    <Form.Control
      as="select"
      value={selectedBatch}
      onChange={(e) => {
        const batch = e.target.value;
        setSelectedBatch(batch);
        setSelectedCourse("");
        setSelectedGroup("");
        setSubjectFees([]);

        const course = courseList.find((c) => c.batchName === batch);
        const totalInstallments = course?.installments || 6;
        setinstallmentOptions(
          Array.from({ length: totalInstallments }, (_, i) => i + 1)
        );

        const sem = courseList.find((c) => c.batchName === batch);
        const totalsems = sem?.NumberOfSemesters || 6;
        setsemOptions(
          Array.from({ length: totalsems }, (_, i) => i + 1)
        );
      }}
    >
      <option value="">Select Batch</option>
      {batchList.map((b, i) => (
        <option key={i}>{b}</option>
      ))}
    </Form.Control>
  </div>

  <div className="col-12 col-md-2 mb-2">
    <Form.Label>Programme</Form.Label>
    <Form.Control
      as="select"
      value={selectedCourse}
      onChange={(e) => {
        setSelectedCourse(e.target.value);
        setSelectedGroup("");
        setSubjectFees([]);
      }}
    >
      <option value="">Select Programme</option>
      {courseList
        .filter((c) => c.batchName === selectedBatch)
        .map((c) => (
          <option key={c.programmeId} value={c.programmeId}>
            {c.programmeCode}-{c.programmeName}
          </option>
        ))}
    </Form.Control>
  </div>

  <div className="col-12 col-md-2 mb-2">
    <Form.Label>Group</Form.Label>
    <Form.Control
      as="select"
      value={selectedGroup}
      onChange={(e) => {
        const groupId = e.target.value;
        setSelectedGroup(groupId);
        const selectedGroupData = groupList.find(
          (g) => g.groupId.toString() === groupId
        );
        const totalInstallments = selectedGroupData?.installments || 6;
        setinstallmentOptions(
          Array.from({ length: totalInstallments }, (_, i) => i + 1)
        );
       
        const totalsems = selectedGroupData?.NumberOfSemesters || 6;
        setsemOptions(
          Array.from({ length: totalsems }, (_, i) => i + 1)
        );
      }}
    >
      <option value="">Select Group</option>
      {groupList.map((g) => (
        <option key={g.groupId} value={g.groupId}>
          {g.groupCode}-{g.groupName}
        </option>
      ))}
    </Form.Control>
  </div>

  {/* Installments - Only for Tuition Fee */}
{isFeeHeadSelected && isTuitionFee && (
  <div className="col-12 col-md-2 mb-2">
    <Form.Label>Installments</Form.Label>
    <Form.Control
      as="select"
      value={selectedInstallment}
      onChange={(e) => setSelectedInstallment(e.target.value)}
    >
      <option value="">Select Installment</option>
      {installmentOptions.map((num) => (
        <option key={num} value={num}>
          Installment {num}
        </option>
      ))}
    </Form.Control>
  </div>
)}

{/* Semester - Only for other Fee Heads */}
{isFeeHeadSelected && !isTuitionFee && (
  <div className="col-12 col-md-2 mb-2">
    <Form.Label>Semester</Form.Label>
    <Form.Control
      as="select"
      value={selectedSemester}
      onChange={(e) => setSelectedSemester(e.target.value)}
    >
      <option value="">Select Semester</option>
      {semOptions.map((num) => (
        <option key={num} value={num}>
          Semester {num}
        </option>
      ))}
    </Form.Control>
  </div>
)}

{/* Amount - Only for other Fee Heads */}
{isFeeHeadSelected && !isTuitionFee && (
  <div className="col-12 col-md-2 mb-2">
    <Form.Label>Amount</Form.Label>
    <Form.Control
      type="number"
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
      placeholder="Enter amount"
    />
  </div>
)}

  {/* <div className="col-12 col-md-2 mb-2">
    <Form.Label>Installments</Form.Label>
    <Form.Control
      as="select"
      value={selectedInstallment}
      onChange={(e) => setSelectedInstallment(e.target.value)}
    >
      <option value="">Select Installment</option>
      {installmentOptions.map((num) => (
        <option key={num} value={num}>
          Installment {num}
        </option>
      ))}
    </Form.Control>
  </div> */}

  

  {/* <div className="col-12 col-md-2 mb-2">
    <Form.Label>Semester</Form.Label>
    <Form.Control
      as="select"
      value={selectedSemester}
      onChange={(e) => setSelectedSemester(e.target.value)}
    >
      <option value="">Select Semester</option>
      {semOptions.map((num) => (
        <option key={num} value={num}>
          semester {num}
        </option>
      ))}
    </Form.Control>
  </div>

  <div className="col-12 col-md-2 mb-2">
  <Form.Label>Amount</Form.Label>
  <Form.Control
    type="number"
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
    placeholder="Enter amount"
  />
</div> */}

  <div className="col-12 col-md-2 mb-2">
    {/* <Form.Label>Due Date</Form.Label>
    <input
      type="date"
      className="form-control"
      value={installmentDueDate.toISOString().split("T")[0]}
      onChange={(e) => setInstallmentDueDate(new Date(e.target.value))}
    /> */}

    <Form.Label>Due Date</Form.Label>
<input
  type="date"
  className="form-control"
  value={dueDateSelected ? installmentDueDate.toISOString().split("T")[0] : ""}
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


  <div className="col-12 col-md-2 d-flex align-items-end mb-2">
   <Button
  style={{ height: "40px", paddingTop: "-3px" }}
  variant="primary"
  className="w-100"
  onClick={handleSubmit}
>
      Submit
    </Button>
  </div>
</div>


      {installmentFeeData.length > 0 && (
        <>
           <div className="table-responsive">
  <table className="table table-bordered table-hover table-striped table-sm">
    <thead className="dark-header bg-dark text-white text-center">
      <tr style={{ fontSize: "13.5px" }}>
        <th>Fee Head</th>
        <th>Batch</th>
        <th>Programme </th>
        <th>Group </th>
        <th>Installment/Semester</th>
        <th>Amount</th>
        <th>Due Date</th>
      </tr>
    </thead>
    <tbody className="text-center align-middle">
      {installmentFeeData.map((item, index) => (
        <tr key={index}>
          <td>{item.feeHead}</td>
          <td>{item.batch}</td>
          <td>{item.pNAME}</td>
          <td>{item.gname}</td>
          <td>{item.installment}</td>
          <td>₹{parseFloat(item.totalFee || 0).toFixed(2)}</td>
          <td>{formatDate(item.dueDate)}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

        </>
      )}
    </div>
  );
}

export default SemesterFeeTemplateManager;
