import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import ConfirmationPopup from "../components/ConfirmationPopup";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../MentorAssign.css";
import API_BASE_URL from "../config";

function MentorAssign() {
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedMentors, setSelectedMentors] = useState([]);
  const [studentMentorData, setStudentMentorData] = useState([]);

  const [popupShow, setPopupShow] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupAction, setPopupAction] = useState(() => () => {});

  useEffect(() => {
    fetchStudentCount();
    fetchMentorsList();
    fetchStudentMentorAssignments();
  }, []);

  const fetchStudentCount = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await axios.get(`${API_BASE_URL}/Student/studentcount`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      setStudents(res.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchMentorsList = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await axios.get(`${API_BASE_URL}/Student/mentorslist`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      setMentors(res.data);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    }
  };

  const fetchStudentMentorAssignments = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await axios.get(`${API_BASE_URL}/Student/studentformentors`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      setStudentMentorData(res.data);
    } catch (error) {
      console.error("Error fetching mentor assignments:", error);
    }
  };

  const handleStudentCheck = (index) => {
    const alreadySelected = selectedStudents.includes(index);
    let newSelectedStudents;

    if (alreadySelected) {
      newSelectedStudents = selectedStudents.filter((i) => i !== index);
    } else {
      newSelectedStudents = [...selectedStudents, index];
    }

    if (newSelectedStudents.length > 1 && selectedMentors.length > 1) {
      toast.error("You cannot select multiple students and multiple mentors at the same time.");
      return;
    }

    setSelectedStudents(newSelectedStudents);
  };

  const handleMentorCheck = (index) => {
    const alreadySelected = selectedMentors.includes(index);
    let newSelectedMentors;

    if (alreadySelected) {
      newSelectedMentors = selectedMentors.filter((i) => i !== index);
    } else {
      newSelectedMentors = [...selectedMentors, index];
    }

    if (newSelectedMentors.length > 1 && selectedStudents.length > 1) {
      toast.error("You cannot select multiple mentors and multiple students at the same time.");
      return;
    }

    setSelectedMentors(newSelectedMentors);
  };

  const handleAssignMentors = () => {
    if (
      selectedStudents.length === 0 ||
      selectedMentors.length === 0 ||
      (selectedStudents.length > 1 && selectedMentors.length > 1)
    ) {
      toast.error("Please select at least one row from each grid, but only one grid can have multiple selections.");
      return;
    }

    setPopupMessage("Are you sure you want to assign the selected mentors to the selected students?");
    setPopupAction(() => confirmAssignMentors);
    setPopupShow(true);
  };

  const confirmAssignMentors = async () => {
    setPopupShow(false);

    const payload = {
      Students: selectedStudents.map((i) => {
        const s = students[i];
        return {
          Batch: s.batchName,
          ProgrammeId: s.programmeId,
          GroupId: s.groupId,
          Semester: s.ssem,
          StudentCount: s.count || s.stdcnt
        };
      }),
      MentorIds: selectedMentors.map((i) => mentors[i].userid),
    };

    try {
      const token = localStorage.getItem("jwt");
      const res = await axios.post(`${API_BASE_URL}/Student/assign-mentors`, payload, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      toast.success(res.data.message || "Assignment successful.");
      fetchStudentCount();
      setSelectedStudents([]);
      setSelectedMentors([]);
      fetchStudentMentorAssignments();
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error("Assignment failed.");
    }
  };

  const handleDeleteAssignment = (item) => {
    setPopupMessage("Are you sure you want to delete this Mentor?");
    setPopupAction(() => () => confirmDeleteAssignment(item));
    setPopupShow(true);
  };

  const confirmDeleteAssignment = async (item) => {
    setPopupShow(false);

    const payload = {
      BatchName: item.batchName,
      ProgrammeId: item.programmeId,
      GroupId: item.groupId,
      Semester: item.ssem,
      MentorId: item.mentorid
    };

    try {
      const token = localStorage.getItem("jwt");
      const res = await axios.post(`${API_BASE_URL}/Student/delete-mentor-assign`, payload, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      toast.success(res.data.message || "Deleted successfully.");
      fetchStudentCount();
      setSelectedStudents([]);
      setSelectedMentors([]);
      fetchStudentMentorAssignments();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete assignment.");
    }
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="section-wrapper">
        <div className="page admin-dashboard pt-0">
        {/* Header styling */}
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
            <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
              <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                <i className="fa fa-chalkboard-teacher mr-2"></i> Manage Student Relationship Officers
              </h2>
              <p className="text-muted mb-0 dashboard-hero-sub">Assign, Manage, and Review SRO-Student Allocations</p>
            </div>
          </div>
        </div>

        <div className="container-fluid">
          <div className="row">
            {/* Students Card */}
            <div className="col-md-8 mb-4">
              <div className="card shadow-sm rounded">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Students</h5>
                  <span className="badge badge-light text-dark px-3 py-2">Total: {students.length}</span>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Select</th>
                          <th>Stream Details</th>
                          <th>Semester</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s, index) => (
                          <tr key={index}>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedStudents.includes(index)}
                                onChange={() => handleStudentCheck(index)}
                              />
                            </td>
                            <td>{s.course}</td>
                            <td>{s.ssem}</td>
                            <td>{s.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Mentors Card */}
            <div className="col-md-4 mb-4">
              <div className="card shadow-sm rounded">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">SRO's</h5>
                  <span className="badge badge-light text-dark px-3 py-2">Total: {mentors.length}</span>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Select</th>
                          <th>Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mentors.map((m, index) => (
                          <tr key={index}>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedMentors.includes(index)}
                                onChange={() => handleMentorCheck(index)}
                              />
                            </td>
                            <td>{m.username}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assign button */}
          <div className="text-center mt-4">
            <button className="btn btn-primary px-4 py-2" onClick={handleAssignMentors}>
              <i className="fa fa-user-check mr-1"></i> Assign SRO
            </button>
          </div>

          {/* Summary Table */}
          <div className="mt-5">
            <div className="card shadow-sm rounded">
              <div className="card-header bg-primary text-white">
                SRO-Student Assigned Summary
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Stream</th>
                        <th>Semester</th>
                        <th>Student Count</th>
                        <th>Assigned SRO</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentMentorData.map((item, index) => (
                        <tr key={index}>
                          <td>{item.course}</td>
                          <td>{item.ssem}</td>
                          <td>{item.count}</td>
                          <td>{item.mentor}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger rounded-pill"
                              onClick={() => handleDeleteAssignment(item)}
                            >
                              <i className="fa fa-trash mr-1"></i> Delete
                            </button>
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
      </div>

      <ConfirmationPopup
        show={popupShow}
        message={popupMessage}
        onConfirm={() => {
          popupAction();
        }}
        onCancel={() => setPopupShow(false)}
      />
    </div>
  );
}

export default MentorAssign;
