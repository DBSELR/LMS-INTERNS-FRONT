import React, { useEffect, useState, useRef } from "react";
import HeaderTop from "../../components/HeaderTop";
import LeftSidebar from "../../components/LeftSidebar";
import RightSidebar from "../../components/RightSidebar";
import Footer from "../../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faGraduationCap,
  faCheckCircle,
  faBriefcase,
  faLandmark,
  faPen,
  faTrash,
  faPrint
} from "@fortawesome/free-solid-svg-icons";
import API_BASE_URL from "../../config";

const StudentProfilePage = ({ studentId }) => {
  const [student, setStudent] = useState(null);
  const [educationList, setEducationList] = useState([]);
  const [professionalList, setProfessionalList] = useState([]);
  const [modalData, setModalData] = useState({});
  const [modalType, setModalType] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [studentInfoText, setStudentInfoText] = useState("");
  const idCardRef = useRef();

  useEffect(() => {
    if (studentId) {
      console.log("Fetching student data for ID:", studentId);
      fetchStudent();
      fetchEducation();
      fetchProfessional();
    }
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/students/details/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch student");
      const data = await res.json();
      setStudent(data);
      setStudentInfoText(`Fetched: ${data.firstName} ${data.lastName}`);
      console.log("Student data fetched:", data);
    } catch (err) {
      console.error("Student fetch error:", err.message);
    }
  };

  const fetchEducation = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/students/${studentId}/education`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setEducationList(data || []);
      console.log("Education data fetched:", data);
    } catch (err) {
      console.error("Education fetch error:", err.message);
    }
  };

  const fetchProfessional = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/students/${studentId}/professional`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setProfessionalList(data || []);
      console.log("Professional data fetched:", data);
    } catch (err) {
      console.error("Professional fetch error:", err.message);
    }
  };

  const openModal = (type, entry = null) => {
    console.log(`Opening ${type} modal`, entry);
    setModalType(type);
    setModalData(entry || {});
    setIsEditing(!!entry);
  };

  const closeModal = () => {
    setModalType(null);
    setModalData({});
    setIsEditing(false);
    console.log("Modal closed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("jwt");
      const url = `${API_BASE_URL}/students/${studentId}/${modalType}${isEditing ? `/${modalData.id}` : ""}`;
      const method = isEditing ? "PUT" : "POST";
      console.log("Submitting data to:", url, modalData);
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json"
          , Authorization: `Bearer ${token}`
         },
        body: JSON.stringify(modalData)
      });
      if (!res.ok) throw new Error("Save failed");

      modalType === "education" ? fetchEducation() : fetchProfessional();
      closeModal();
      console.log("Data saved successfully");
    } catch (err) {
      console.error("Submit error:", err.message);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/students/${studentId}/${type}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        type === "education" ? fetchEducation() : fetchProfessional();
        console.log(`${type} record deleted, ID:`, id);
      }
    } catch (err) {
      console.error("Delete error:", err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setModalData({ ...modalData, [name]: value });
  };

  const handlePrint = () => {
    const printContent = idCardRef.current?.innerHTML || "";
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <html><head><title>ID Card</title>
      <style>
        body { margin: 0; padding: 20px; background: #f5f5f5; font-family: sans-serif; }
      </style></head>
      <body>${printContent}</body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
    console.log("Print triggered");
  };

  if (!student) return <div className="p-5 text-center">Loading student data for ID: {studentId}...</div>;

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />
      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">

            {studentInfoText && (
              <div className="alert alert-info shadow-sm mb-4">
                <strong>Info:</strong> {studentInfoText}
              </div>
            )}

            <div className="row gx-4 gy-4">
              <div className="col-lg-4">
                <div className="card text-center shadow-sm">
                  <div ref={idCardRef}>
                    <div style={{
                      // width: '300px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      fontFamily: 'sans-serif',
                      background: '#fff',
                      textAlign: 'center',
                      boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{
                        background: 'linear-gradient(to right, #f15a29, #f15a29)',
                        color: '#fff',
                        padding: '20px 10px 40px',
                        position: 'relative'
                      }}>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>UNIVERSITY ID CARD</div>
                        <div style={{ fontSize: '12px' }}>Kalanki, Kathmandu | Estd. 1947</div>
                        <div style={{
                          position: 'absolute',
                          bottom: '-30px',
                          left: 0,
                          width: '100%',
                          height: '60px',
                          background: '#f15a29',
                          borderBottomLeftRadius: '50%',
                          borderBottomRightRadius: '50%'
                        }}></div>
                      </div>

                      <div style={{
                        marginTop: '-50px',
                        width: '80px',
                        height: '80px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '3px solid #fff'
                      }}>
                        <img
                          src={student.profilePhotoUrl || "./assets/default-avatar.png"}
                          alt="Profile"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      <div style={{ marginTop: '5px', fontWeight: 'bold', color: '#f15a29', fontSize: '18px' }}>
                        {`${student.firstName} ${student.lastName}`}
                      </div>

                      <div style={{ textAlign: 'left', padding: '0 20px', fontSize: '12px', marginTop: '8px' }}>
                        <div><strong>Father's Name</strong> : {student.fatherName || 'N/A'}</div>
                        <div><strong>Contact No.</strong> : {student.phoneNumber || 'N/A'}</div>
                        <div><strong>Blood Group</strong> : {student.bloodGroup || 'N/A'}</div>
                        <div><strong>Programme</strong> : {student.className || 'N/A'}</div>
                        <div><strong>Group</strong> : {student.section || 'N/A'}</div>
                        <div><strong>Valid Till</strong> : {student.expiryDate || 'N/A'}</div>
                      </div>

                      <div style={{ margin: '10px 20px' }}>
                        <div style={{
                          height: '1.5px',
                          background: '#000',
                          margin: '10px 0'
                        }}></div>
                        <div style={{
                          textAlign: 'right',
                          fontSize: '10px'
                        }}>
                          Principal Signature
                        </div>
                      </div>

                      <div style={{
                        background: '#f15a29',
                        color: '#fff',
                        fontSize: '10px',
                        padding: '3px 10px'
                      }}>
                        If found, please return it to the UNIVERSITY.
                      </div>
                    </div>
                  </div>

                  <div className="card-footer">
                    <button className="btn btn-outline-primary" onClick={handlePrint}>
                      <FontAwesomeIcon icon={faPrint} className="me-2" /> Print ID Card
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">General Information</h6>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" /> {student.city}
                      </li>
                      <li className="list-group-item">
                        <strong>Address:</strong> {student.address}
                      </li>
                      <li className="list-group-item">
                        <strong>State:</strong> {student.state}
                      </li>
                      <li className="list-group-item">
                        <strong>Zip Code:</strong> {student.zipCode}
                      </li>
                      <li className="list-group-item">
                        <strong>Country:</strong> {student.country}
                      </li>
                      <li className="list-group-item">
                        <strong>Date of Birth:</strong> {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : ""}
                      </li>
                      <li className="list-group-item">
                        <FontAwesomeIcon icon={faGraduationCap} className="me-2" /> {student.programme}
                      </li>
                      <li className="list-group-item">
                        <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                        <span className="badge bg-success">{student.status}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-md-6">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h6 className="d-flex justify-content-between">
                      <span><FontAwesomeIcon icon={faBriefcase} /> Professional Information</span>
                      <button className="btn btn-sm btn-primary" onClick={() => openModal("professional")}>Add</button>
                    </h6>
                    <ul className="list-group list-group-flush mt-2">
                      {professionalList.map(p => (
                        <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div><strong>{p.title}</strong> - {p.company}, {p.location}</div>
                          <div>
                            <FontAwesomeIcon icon={faPen} className="me-2 text-primary cursor-pointer" onClick={() => openModal("professional", p)} />
                            <FontAwesomeIcon icon={faTrash} className="text-danger cursor-pointer" onClick={() => handleDelete("professional", p.id)} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h6 className="d-flex justify-content-between">
                      <span><FontAwesomeIcon icon={faLandmark} /> Educational Information</span>
                      <button className="btn btn-sm btn-primary" onClick={() => openModal("education")}>Add</button>
                    </h6>
                    <ul className="list-group list-group-flush mt-2">
                      {educationList.map(e => (
                        <li key={e.id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div><strong>{e.degree}</strong> - {e.institute}, {e.year} ({e.grade})</div>
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
            </div>

            {modalType && (
              <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">{isEditing ? "Edit" : "Add"} {modalType}</h5>
                      <button type="button" className="btn-close" onClick={closeModal}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                      <div className="modal-body">
                        {modalType === "education" ? (
                          <>
                            <input name="degree" className="form-control mb-2" placeholder="Degree" value={modalData.degree || ""} onChange={handleChange} />
                            <input name="institute" className="form-control mb-2" placeholder="Institute" value={modalData.institute || ""} onChange={handleChange} />
                            <input name="year" className="form-control mb-2" placeholder="Year" value={modalData.year || ""} onChange={handleChange} />
                            <input name="grade" className="form-control mb-2" placeholder="Grade" value={modalData.grade || ""} onChange={handleChange} />
                          </>
                        ) : (
                          <>
                            <input name="title" className="form-control mb-2" placeholder="Title" value={modalData.title || ""} onChange={handleChange} />
                            <input name="company" className="form-control mb-2" placeholder="Company" value={modalData.company || ""} onChange={handleChange} />
                            <input name="location" className="form-control mb-2" placeholder="Location" value={modalData.location || ""} onChange={handleChange} />
                            <input name="experience" className="form-control mb-2" placeholder="Experience" value={modalData.experience || ""} onChange={handleChange} />
                          </>
                        )}
                      </div>
                      <div className="modal-footer">
                        <button className="btn btn-secondary" type="button" onClick={closeModal}>Cancel</button>
                        <button className="btn btn-primary" type="submit">Save</button>
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

export default StudentProfilePage;
