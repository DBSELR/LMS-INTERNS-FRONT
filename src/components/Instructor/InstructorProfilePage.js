import React, { useEffect, useState, useRef } from "react";
import HeaderTop from "../../components/HeaderTop";
import LeftSidebar from "../../components/LeftSidebar";
import RightSidebar from "../../components/RightSidebar";
import Footer from "../../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faGraduationCap,
  faCalendarAlt,
  faCheckCircle,
  faBriefcase,
  faLandmark,
  faPen,
  faTrash,
  faPrint,
  faLock,
  faEnvelope,
  faPhone,
  faBook
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config";

const InstructorProfilePage = ({ instructorId }) => {
  const [instructor, setInstructor] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "" });
  const idCardRef = useRef();

  const fetchInstructor = async () => {
    const token = localStorage.getItem("jwt");
    const res = await fetch(`${API_BASE_URL}/instructor/details/${instructorId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setInstructor(data);
  };

  useEffect(() => {
    if (instructorId) fetchInstructor();
  }, [instructorId]);

  const openModal = (type, entry = null) => {
    setModalType(type);
    setModalData(entry || {});
    setIsEditing(!!entry);
  };

  const closeModal = () => {
    setModalType(null);
    setModalData(null);
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
     const token = localStorage.getItem("jwt");
    const url = `${API_BASE_URL}/instructor/${instructorId}/${modalType}${isEditing ? `/${modalData.id}` : ""}`;
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(modalData)
    });

    if (res.ok) {
      toast.success(`${modalType} ${isEditing ? "updated" : "added"} successfully`);
      fetchInstructor();
      closeModal();
    }
  };

  const handleDelete = async (type, id) => {
    const token = localStorage.getItem("jwt");
    if (!window.confirm("Are you sure?")) return;
    const res = await fetch(`${API_BASE_URL}/instructor/${instructorId}/${type}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      toast.success(`${type} deleted`);
      fetchInstructor();
    }
  };

  const handleChange = (e) => {
    setModalData({ ...modalData, [e.target.name]: e.target.value });
  };

  const handlePrint = () => {
    const printContent = idCardRef.current.innerHTML;
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`<html><head><title>ID Card</title><style>body{font-family:sans-serif;margin:0;padding:20px;}img{border-radius:50%;width:100px;height:100px;object-fit:cover;}h5{margin-bottom:5px;}p{margin:2px 0;}</style></head><body>${printContent}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const handlePasswordChange = async () => {
    const token = localStorage.getItem("jwt");
    const res = await fetch(`${API_BASE_URL}/account/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(passwordData)
    });
    if (res.ok) {
      toast.success("Password updated successfully");
      setPasswordData({ oldPassword: "", newPassword: "" });
      closeModal();
    } else {
      toast.error("Failed to change password");
    }
  };

  if (!instructor) return <div className="p-4">Loading...</div>;

  const { user, professor, education, assignedCourses } = instructor;

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />
      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">
            <div className="row gx-4 gy-4">
              {/* Profile Info */}
              <div className="col-lg-4">
                <div className="card text-center shadow-sm border-0">
                  <div className="card-body">
                    <div ref={idCardRef}>
                      <img src={user.profilePhotoUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="Profile" className="rounded-circle shadow mb-3" style={{ width: 100, height: 100, objectFit: "cover" }} />
                      <h5 className="fw-bold">{user.firstName} {user.lastName}</h5>
                      <p className="text-muted mb-1">{user.email}</p>
                      <p className="text-muted mb-1">{user.phoneNumber}</p>
                      <p className="text-muted">{user.gender}, {user.country}</p>
                    </div>
                    <div className="d-flex justify-content-around mt-3">
                      <button className="btn btn-sm btn-outline-primary" onClick={handlePrint}>
                        <FontAwesomeIcon icon={faPrint} /> Print
                      </button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => openModal("password")}>
                        <FontAwesomeIcon icon={faLock} /> Change Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div className="col-lg-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Personal Information</h6>
                    <ul className="list-group list-group-flush small">
                      <li className="list-group-item"><FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-muted" /> {professor.officeLocation}</li>
                      <li className="list-group-item"><FontAwesomeIcon icon={faGraduationCap} className="me-2 text-muted" /> {professor.department}</li>
                      <li className="list-group-item"><FontAwesomeIcon icon={faCheckCircle} className="me-2 text-muted" /> <span className={`badge ${user.status === "Active" ? "bg-success" : "bg-danger"}`}>{user.status}</span></li>
                      <li className="list-group-item"><FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-muted" /> Joined: {professor.createdAt ? new Date(professor.createdAt).toLocaleDateString() : "N/A"}</li>
                      <li className="list-group-item"><FontAwesomeIcon icon={faEnvelope} className="me-2 text-muted" /> {user.email}</li>
                      <li className="list-group-item"><FontAwesomeIcon icon={faPhone} className="me-2 text-muted" /> {user.phoneNumber}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Assigned Courses */}
              <div className="col-lg-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3"><FontAwesomeIcon icon={faBook} className="me-2" /> Assigned Courses</h6>
                    {assignedCourses?.length > 0 ? (
                      <ul className="list-group small list-group-flush">
                        {assignedCourses.map(course => (
                          <li key={course.courseId} className="list-group-item">
                            {course.courseCode} - {course.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted small">No courses assigned.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Educational Info */}
            <div className="row mt-4">
              <div className="col-md-12">
                <div className="card shadow-sm">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <h6 className="mb-0"><FontAwesomeIcon icon={faLandmark} className="me-2" /> Educational Information.....</h6>
                    <button className="btn btn-sm btn-primary" onClick={() => openModal("education")}>Add</button>
                  </div>
                  <ul className="list-group list-group-flush">
                    {education?.map(e => (
                      <li key={e.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span><strong>{e.degree}</strong> - {e.institute}, {e.year} ({e.grade})</span>
                        <div>
                          <FontAwesomeIcon icon={faPen} className="me-2 text-primary cursor-pointer" onClick={() => openModal("education", e)} />
                          <FontAwesomeIcon icon={faTrash} className="text-danger cursor-pointer" onClick={() => handleDelete("education", e.id)} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Modals */}
            {modalType && (
              <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">{modalType === "password" ? "Change Password" : `${isEditing ? "Edit" : "Add"} ${modalType}`}</h5>
                      <button className="btn-close" onClick={closeModal}></button>
                    </div>
                    <form onSubmit={modalType === "password" ? (e) => { e.preventDefault(); handlePasswordChange(); } : handleSubmit}>
                      <div className="modal-body">
                        {modalType === "education" && (
                          <>
                            <input name="degree" className="form-control mb-2" placeholder="Degree" value={modalData.degree || ""} onChange={handleChange} />
                            <input name="institute" className="form-control mb-2" placeholder="Institute" value={modalData.institute || ""} onChange={handleChange} />
                            <input name="year" className="form-control mb-2" placeholder="Year" value={modalData.year || ""} onChange={handleChange} />
                            <input name="grade" className="form-control mb-2" placeholder="Grade" value={modalData.grade || ""} onChange={handleChange} />
                          </>
                        )}
                        {modalType === "password" && (
                          <>
                            <input type="password" name="oldPassword" className="form-control mb-2" placeholder="Current Password" value={passwordData.oldPassword} onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })} />
                            <input type="password" name="newPassword" className="form-control mb-2" placeholder="New Password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                          </>
                        )}
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
         
      </div>
    </div>
  );
};

export default InstructorProfilePage;
