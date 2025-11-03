// AddFeeForm.js
import React, { useEffect, useState } from "react";
import API_BASE_URL from "../../config";

function AddFeeForm() {
  const [programmes, setProgrammes] = useState([]);
  const [selectedProgramme, setSelectedProgramme] = useState("");
  const [semester, setSemester] = useState("");
  const [amountDue, setAmountDue] = useState("");
  const [studentId, setStudentId] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    // Example: Hardcoded or fetch list of programmes from API
    setProgrammes(["Computer Science", "Business Admin", "Engineering"]);
  }, []);

  useEffect(() => {
    const fetchTemplateAmount = async () => {
      if (selectedProgramme && semester) {
        try {
          const token = localStorage.getItem("jwt");
          const response = await fetch(
            `${API_BASE_URL}/SemesterFeeTemplate?programme=${selectedProgramme}&semester=${semester}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!response.ok) throw new Error("Failed to fetch fee template");
          const data = await response.json();
          setAmountDue(data.amountDue);
        } catch (err) {
          console.error(err);
          setAmountDue("");
        }
      }
    };
    fetchTemplateAmount();
  }, [selectedProgramme, semester]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("jwt");
      const payload = {
        studentId,
        programme: selectedProgramme,
        semester: parseInt(semester),
        amountDue: parseFloat(amountDue)
      };

      const response = await fetch(`${API_BASE_URL}/Fee`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to add fee");
      setStatus("Fee added successfully.");
    } catch (err) {
      console.error(err);
      setStatus("Error adding fee.");
    }
  };

  return (
    <form className="p-4" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Student ID</label>
        <input
          type="text"
          className="form-control"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Programme</label>
        <select
          className="form-control"
          value={selectedProgramme}
          onChange={(e) => setSelectedProgramme(e.target.value)}
          required
        >
          <option value="">-- Select Programme --</option>
          {programmes.map((prog) => (
            <option key={prog} value={prog}>
              {prog}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Semester</label>
        <select
          className="form-control"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          required
        >
          <option value="">-- Select Semester --</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <option key={sem} value={sem}>
              {sem}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Amount Due</label>
        <input
          type="number"
          className="form-control"
          value={amountDue}
          onChange={(e) => setAmountDue(e.target.value)}
          required
          readOnly
        />
      </div>

      <button className="btn btn-primary" type="submit">
        Add Fee
      </button>
      {status && <div className="mt-3 text-info">{status}</div>}
    </form>
  );
}

export default AddFeeForm;
