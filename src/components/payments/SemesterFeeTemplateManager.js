import React, { useEffect, useState } from "react";
import { Form, Button, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "../../config";

function SemesterFeeTemplateManager() {
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [groupList, setGroupList] = useState([]);

  // University and College state
  const [universities, setUniversities] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");

  const [installmentFeeData, setInstallmentFeeData] = useState([]);
  const [dueDateSelected, setDueDateSelected] = useState(false);

  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [installmentDueDate, setInstallmentDueDate] = useState(new Date());
  const [feeAmount, setFeeAmount] = useState("");

  // ----------------- initial data: Programmes & Batches -----------------
  useEffect(() => {
    fetchInitialData();
    fetchUniversities();
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

  // Fetch universities function
  const fetchUniversities = async () => {
    setLoadingUniversities(true);
    try {
      const token = localStorage.getItem("jwt");
      const url = `${API_BASE_URL}/User/GetUniversity`;
      console.log("🔍 Fetching universities from:", url);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("📡 Universities API response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Universities data received:", data);
        setUniversities(data || []);
      } else {
        const errorText = await response.text();
        console.error("❌ Failed to fetch universities:", response.status, errorText);
        toast.error(`Failed to load universities: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error fetching universities:", error);
      toast.error("Error loading universities");
    } finally {
      setLoadingUniversities(false);
    }
  };

  // Fetch colleges function
  const fetchColleges = async (universityName) => {
    setLoadingColleges(true);
    try {
      const token = localStorage.getItem("jwt");
      const url = `${API_BASE_URL}/User/GetCollegebyUniversity?uname=${encodeURIComponent(universityName)}`;
      console.log("🔍 Fetching colleges from:", url);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("📡 Colleges API response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Colleges data received:", data);
        setColleges(data || []);
      } else {
        const errorText = await response.text();
        console.error("❌ Failed to fetch colleges:", response.status, errorText);
        toast.error(`Failed to load colleges: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error fetching colleges:", error);
      toast.error("Error loading colleges");
    } finally {
      setLoadingColleges(false);
    }
  };

  // Fetch colleges when university changes
  useEffect(() => {
    if (selectedUniversity && selectedUniversity !== "") {
      fetchColleges(selectedUniversity);
    } else {
      setColleges([]);
      setSelectedCollege("");
    }
  }, [selectedUniversity]);

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
    // Validation
    if (!selectedUniversity) {
      toast.error("Please select a university");
      return;
    }
    
    if (!selectedCollege) {
      toast.error("Please select a college");
      return;
    }
    
    if (!selectedBatch) {
      toast.error("Please select a batch");
      return;
    }
    
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }
    
    if (!feeAmount || parseFloat(feeAmount) <= 0) {
      toast.error("Please enter a valid fee amount");
      return;
    }

    // Get the selected college ID from the colleges array
    const selectedCollegeObj = colleges.find(c => 
      (c?.college || c?.cname || c?.collegeName || c?.name || c?.CollegeName || c) === selectedCollege
    );
    const colId = selectedCollegeObj ? selectedCollegeObj.id : null;

    if (!colId) {
      toast.error("Unable to find college ID. Please select a college again.");
      return;
    }

    const requestBody = {
      batch: selectedBatch,
      programmeId: selectedCourse || null,
      dueDate: dueDateSelected
        ? installmentDueDate.toISOString().split("T")[0]
        : null,
      fee: parseFloat(feeAmount),
      colId: colId
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
        // Reset form fields
        setFeeAmount("");
      } else {
        const error = await response.json();
        alert("Error: " + (error.error || "Failed to save data"));
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // ----------------- Delete Fee Record -----------------
  const handleDelete = async (item, index) => {
    if (!item.id) {
      toast.error("Unable to delete: No ID found for this record");
      return;
    }

    if (window.confirm("Are you sure you want to delete this fee record?")) {
      try {
        const token = localStorage.getItem("jwt");
        const response = await fetch(`${API_BASE_URL}/Fee/DeleteFeeById?id=${item.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok || response.status === 204) {
          // Remove from local state after successful API call
          const updatedData = installmentFeeData.filter((_, i) => i !== index);
          setInstallmentFeeData(updatedData);
          toast.success("Fee record deleted successfully!");
        } else {
          const errorText = await response.text();
          toast.error(`Failed to delete fee record: ${response.status}`);
          console.error("Delete error:", errorText);
        }
      } catch (err) {
        toast.error("Failed to delete fee record");
        console.error("Delete error:", err);
      }
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
          id: item.id, // Add ID for delete functionality
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
        {/* University */}
        <div className="col-12 col-md-3 mb-2">
          <Form.Label>
            UNIVERSITY <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            as="select"
            name="university"
            value={selectedUniversity}
            onChange={(e) => {
              setSelectedUniversity(e.target.value);
              setSelectedCollege("");
            }}
            disabled={loadingUniversities}
          >
            <option value="">
              {loadingUniversities ? "Loading universities..." : "Select University"}
            </option>
            {universities.map((university, index) => {
              // Handle different possible data structures - your API returns 'uname'
              const value = university?.uname || university?.universityName || university?.name || university?.UniversityName || university;
              const display = university?.uname || university?.universityName || university?.name || university?.UniversityName || university;
              
              return (
                <option key={index} value={value}>
                  {display}
                </option>
              );
            })}
          </Form.Control>
        </div>

        {/* College */}
        <div className="col-12 col-md-3 mb-2">
          <Form.Label>
            College <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            as="select"
            name="college"
            value={selectedCollege || ""}
            onChange={(e) => setSelectedCollege(e.target.value)}
            disabled={loadingColleges || !selectedUniversity}
          >
            <option value="">
              {!selectedUniversity 
                ? "Select University first" 
                : loadingColleges 
                ? "Loading colleges..." 
                : "Select College"
              }
            </option>
            {colleges.map((college, index) => {
              // Handle different possible data structures - your API returns 'college' and 'colcode'
              const value = college?.college || college?.cname || college?.collegeName || college?.name || college?.CollegeName || college;
              const display = college?.college || college?.cname || college?.collegeName || college?.name || college?.CollegeName || college;
              
              return (
                <option key={index} value={value}>
                  {display}
                </option>
              );
            })}
          </Form.Control>
        </div>

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

        <div className="col-12 col-md-3 mb-2">
          <Form.Label>Fee Amount <span className="text-danger">*</span></Form.Label>
          <input 
            type="number" 
            className="form-control" 
            placeholder="Enter Fee Amount" 
            value={feeAmount}
            onChange={(e) => setFeeAmount(e.target.value)}
            min="0"
            step="0.01"
          />
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
                <th>Delete</th>
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
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(item, index)}
                      title="Delete"
                    >
                      <i className="fa fa-trash" aria-hidden="true"></i>
                    </button>
                  </td>
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
