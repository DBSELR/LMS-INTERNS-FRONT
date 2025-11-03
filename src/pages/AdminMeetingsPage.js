// File: pages/AdminMeetingsPage.jsx
import React, { useEffect, useState } from "react";
import HeaderTop from "../components/HeaderTop";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [programmes, setProgrammes] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    meetingType: "Online",
    meetingLink: "",
    meetingLocation: "",
    targetProgramme: "",
    targetSemester: "",
    targetCourse: ""
  });

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/Meeting`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setMeetings(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/Programme/ProgrammesWithSemesters`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!Array.isArray(data)) throw new Error("Invalid data format");

      const programmeNames = data.map(p => p.programmeName);
      const semesterNames = data.flatMap(p =>
        (p.semesters || []).map(s => s.semesterName)
      );

      const allCourses = data.flatMap(p =>
        (p.semesters || []).flatMap(s =>
          (s.courses || []).map(c => ({
            programmeName: p.programmeName,
            semester: s.semesterName,
            courseId: c.courseId,
            name: c.name,
            courseCode: c.courseCode,
            credits: c.credits,
            courseDescription: c.courseDescription
          }))
        )
      );

      setProgrammes([...new Set(programmeNames)]);
      setSemesters([...new Set(semesterNames)]);
      setCourses(allCourses);
    } catch (err) {
      console.error("Dropdown data fetch error:", err);
    }
  };

  useEffect(() => {
    fetchMeetings();
    fetchDropdownData();
  }, []);

  const handleInput = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const selectedCourse = courses.find(c => c.courseId.toString() === form.targetCourse);

      const res = await fetch(`${API_BASE_URL}/Meeting/Create`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          targetCourse: selectedCourse ? selectedCourse.name : ""
        })
      });

      if (res.ok) {
        fetchMeetings();
        setForm({
          title: "",
          description: "",
          scheduledAt: "",
          meetingType: "Online",
          meetingLink: "",
          meetingLocation: "",
          targetProgramme: "",
          targetSemester: "",
          targetCourse: ""
        });
      }
    } catch (err) {
      console.error("Create failed:", err);
    }
  };

  const deleteMeeting = async id => {
    if (!window.confirm("Delete this meeting?")) return;
    const token = localStorage.getItem("jwt");
    if (!token) return;
    await fetch(`${API_BASE_URL}/Meeting/Delete/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    fetchMeetings();
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && <div className="page-loader-wrapper"><div className="loader" /></div>}
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Admin" />
      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">
            <div className="jumbotron bg-light p-4 rounded shadow-sm mb-4">
              <h2 className="text-primary mb-2">Manage Meetings</h2>
              <p className="text-muted mb-0">Create and manage academic meetings</p>
            </div>

            <div className="card mb-4 shadow-sm">
              <div className="card-header bg-primary text-white"><h6>Create Meeting</h6></div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <label>Title</label>
                      <input type="text" className="form-control" name="title" value={form.title} onChange={handleInput} required />
                    </div>
                    <div className="col-md-6">
                      <label>Date & Time</label>
                      <input type="datetime-local" className="form-control" name="scheduledAt" value={form.scheduledAt} onChange={handleInput} required />
                    </div>
                    <div className="col-md-12 mt-2">
                      <label>Description</label>
                      <textarea className="form-control" name="description" value={form.description} onChange={handleInput} />
                    </div>
                    <div className="col-md-4 mt-2">
                      <label>Meeting Type</label>
                      <select className="form-control" name="meetingType" value={form.meetingType} onChange={handleInput}>
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                      </select>
                    </div>
                    {form.meetingType === "Online" && (
                      <div className="col-md-8 mt-2">
                        <label>Meeting Link</label>
                        <input type="url" className="form-control" name="meetingLink" value={form.meetingLink} onChange={handleInput} required />
                      </div>
                    )}
                    {form.meetingType === "Offline" && (
                      <div className="col-md-8 mt-2">
                        <label>Meeting Location</label>
                        <input type="text" className="form-control" name="meetingLocation" value={form.meetingLocation} onChange={handleInput} required />
                      </div>
                    )}
                    <div className="col-md-4 mt-2">
                      <label>Target Programme</label>
                      <select className="form-control" name="targetProgramme" value={form.targetProgramme} onChange={handleInput}>
                        <option value="">-- All --</option>
                        {programmes.map((p, idx) => <option key={idx} value={p}>{p}</option>)}
                      </select>
                    </div>
                    {/* <div className="col-md-4 mt-2">
                      <label>Target Semester</label>
                      <select className="form-control" name="targetSemester" value={form.targetSemester} onChange={handleInput}>
                        <option value="">-- All --</option>
                        {semesters.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4 mt-2">
                      <label>Target Course</label>
                      <select className="form-control" name="targetCourse" value={form.targetCourse} onChange={handleInput}>
                        <option value="">-- All --</option>
                        {courses.map((c) => (
                          <option key={c.courseId} value={c.courseId}>
                            {`${c.programmeName} / Sem ${c.semester} / ${c.name}`}
                          </option>
                        ))}
                      </select>
                    </div> */}
                  </div>
                  <button type="submit" className="btn btn-primary mt-3">Create Meeting</button>
                </form>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white"><h6>Scheduled Meetings</h6></div>
              <div className="card-body p-0">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Title</th><th>Date</th><th>Type</th><th>Target</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meetings.map(m => (
                      <tr key={m.meetingId}>
                        <td>{m.title}</td>
                        <td>{new Date(m.scheduledAt).toLocaleString()}</td>
                        <td>{m.meetingType}</td>
                        <td>{[m.targetProgramme, m.targetSemester, m.targetCourse].filter(Boolean).join(" / ") || "All"}</td>
                        <td>
                          <button onClick={() => deleteMeeting(m.meetingId)} className="btn btn-sm btn-danger">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
         
      </div>
    </div>
  );
}

export default AdminMeetingsPage;
