import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Select from "react-select";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

function InstructorAttendanceView() {
  const [liveClasses, setLiveClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    console.log("🔐 Getting JWT from localStorage...");
    const token = localStorage.getItem("jwt");
    if (!token) {
      console.warn("⚠️ No JWT token found!");
      return;
    }

    const decoded = jwtDecode(token);
    const instructorId = decoded["UserId"] || decoded.userId || decoded.nameid;
    console.log("✅ Decoded Instructor ID:", instructorId);

    console.log("📡 Fetching live classes for instructor...");
    fetch(`${API_BASE_URL}/LiveClass/Instructor/${instructorId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        console.log("📥 Response received for live classes");
        if (!res.ok) throw new Error("Failed to load live classes");
        return res.json();
      })
      .then((data) => {
        console.log("✅ Live classes loaded:", data);
        setLiveClasses(data);
      })
      .catch((err) => console.error("❌ Failed to fetch classes", err));
  }, []);

  const handleSelectClass = (classId) => {
    const token = localStorage.getItem("jwt");
    console.log("📌 Selected class ID:", classId);
    const selected = liveClasses.find((lc) => lc.liveClassId == classId);

    if (!selected) {
      console.warn("⚠️ Selected class not found in liveClasses");
      return;
    }

    setSelectedClassId(classId);
    console.log("📡 Fetching students for course ID:", selected.courseId);

    fetch(`${API_BASE_URL}/course/${selected.courseId}/students`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        console.log("📥 Response received for students");
        if (!res.ok) throw new Error("Failed to fetch students");
        return res.json();
      })
      .then((data) => {
        console.log("✅ Students fetched:", data);
        const updated = data.map((student) => ({
          ...student,
          status: "Present",
        }));
        setStudents(updated);
        console.log("📋 Students initialized with status:", updated);
      })
      .catch((err) => {
        console.error("❌ Student fetch error:", err.message);
        alert("Error loading students: " + err.message);
      });
  };

  const handleCheckboxChange = (index) => {
    console.log(`📝 Toggling status for student at index ${index}`);
    const updated = [...students];
    updated[index].status =
      updated[index].status === "Present" ? "Absent" : "Present";
    setStudents(updated);
    console.log("✅ Updated students list:", updated);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("jwt");
      console.log("📤 Submitting attendance...");
      const payload = students.map((s) => ({
        studentId: s.studentId,
        courseId: s.courseId,
        status: s.status,
        date: new Date().toISOString(),
        liveClassId: selectedClassId,
      }));

      console.log("🧾 Payload:", payload);

      const res = await fetch(`${API_BASE_URL}/attendance/markbatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" 
          , Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        console.log("✅ Attendance submitted successfully");
        alert("✅ Attendance submitted successfully");
      } else {
        console.error("❌ Attendance submission failed");
        alert("❌ Failed to submit attendance");
      }
    } catch (err) {
      console.error("❌ Error submitting attendance:", err);
    }
  };

  const classOptions = liveClasses.map((lc) => ({
    value: lc.liveClassId,
    label: `${lc.className} - ${new Date(lc.startTime).toLocaleString()}`,
  }));

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">
            <div className="welcome-card animate-welcome mb-4">
              <div>
                <h2 className="text-primary mb-2">Attendance Management</h2>
                <p className="text-muted mb-0">
                  Mark attendance for your live classes easily.
                </p>
              </div>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="form-group">
                  <label><strong>Select Live Class:</strong></label>
                  <Select
                    options={classOptions}
                    onChange={(option) => {
                      console.log("🔍 Selected class from dropdown:", option);
                      handleSelectClass(option.value);
                    }}
                    placeholder="Search and select a class"
                  />
                </div>
              </div>
            </div>

            {students.length > 0 ? (
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">Student Attendance</h6>
                </div>
                <div className="card-body">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th className="text-center">Present</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, index) => (
                        <tr key={`${student.studentId}-${index}`}>
                          <td>{student.name}</td>
                          <td>{student.email}</td>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              checked={student.status === "Present"}
                              onChange={() => handleCheckboxChange(index)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              selectedClassId && (
                <div className="text-center text-muted py-5">
                  <h5>No students found for this class.</h5>
                </div>
              )
            )}

            {students.length > 0 && (
              <div className="d-flex justify-content-center mt-4">
                <button className="btn btn-primary" onClick={handleSubmit}>
                  Submit Attendance
                </button>
              </div>
            )}
          </div>
        </div>
         
      </div>
    </div>
  );
}

export default InstructorAttendanceView;
