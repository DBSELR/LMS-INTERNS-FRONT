// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import CourseFormModal from "../components/courses/CourseFormModal";
// import AssignCourseModal from "../pages/AssignCourseModal";
// import { Collapse } from "react-bootstrap";
// import { FaChevronDown, FaChevronUp, FaBookOpen } from "react-icons/fa";

// function AdminCoursesPage() {
//   const [groupedData, setGroupedData] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedCourse, setSelectedCourse] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [openSemesters, setOpenSemesters] = useState({});
//   const [showAssignModal, setShowAssignModal] = useState(false);
//   const [assigningCourseId, setAssigningCourseId] = useState(null);

//   useEffect(() => {
//     fetchProgrammes();
//   }, []);

//   const fetchProgrammes = async () => {
//     try {
//       const res = await fetch("https://lmsapi.dbasesolutions.in/api/Programme/ProgrammesWithSemesters");
//       const raw = await res.json();

//       const grouped = {};
//       raw.forEach(row => {
//         const prog = row.programmeName;
//         const sem = row.semester;

//         if (!grouped[prog]) grouped[prog] = {};
//         if (!grouped[prog][sem]) grouped[prog][sem] = [];

//         grouped[prog][sem].push({
//           courseId: row.courseId,
//           name: row.name,
//           courseCode: row.courseCode,
//           credits: row.credits,
//           courseDescription: row.courseDescription,
//           programme: row.programmeName,
//           semester: row.semester
//         });
//       });

//       const structured = Object.entries(grouped).map(([programmeName, semestersObj], index) => ({
//         programmeName,
//         programmeId: index + 1,
//         semesters: Object.entries(semestersObj).map(([semesterName], sIdx) => ({
//           semesterId: `${index + 1}-${sIdx + 1}`,
//           semesterName,
//           courses: semestersObj[semesterName]
//         }))
//       }));

//       setGroupedData(structured);
//     } catch (err) {
//       console.error("Failed to fetch programmes", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (course) => {
//     setSelectedCourse(course);
//     setShowModal(true);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this course?")) {
//       try {
//         const res = await fetch(`https://lmsapi.dbasesolutions.in/api/Course/Delete/${id}`, {
//           method: "DELETE",
//         });

//         if (!res.ok) throw new Error(await res.text());

//         fetchProgrammes();
//       } catch (err) {
//         alert(err.message || "Delete failed");
//       }
//     }
//   };

//   const handleSave = () => {
//     setShowModal(false);
//     setSelectedCourse(null);
//     fetchProgrammes();
//   };

//   const handleAssign = (courseId) => {
//     setAssigningCourseId(courseId);
//     setShowAssignModal(true);
//   };

//   const handleAssignSubmit = async ({ courseId, programmeId, groupId, semester }) => {
//     try {
//       const res = await fetch("https://lmsapi.dbasesolutions.in/api/Course/AssignCourseGroup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ courseId, programmeId, groupId, semester })
//       });

//       if (!res.ok) throw new Error(await res.text());

//       setShowAssignModal(false);
//       fetchProgrammes(); // Auto-refresh after assign
//     } catch (err) {
//       alert(err.message || "Assignment failed");
//     }
//   };

//   const toggleSemester = (programmeId, semesterId) => {
//     const key = `${programmeId}-${semesterId}`;
//     setOpenSemesters(prev => ({
//       ...prev,
//       [key]: !prev[key]
//     }));
//   };

//   return (
//     <div className="section-body mt-3">
//       <div className="container-fluid">
//         <div className="card shadow-sm">
//           <div className="card-body">
//             <div className="d-flex justify-content-end mb-4">
//               <button className="btn btn-dark" onClick={() => {
//                 setSelectedCourse(null);
//                 setShowModal(true);
//               }}>
//                 <i className="fa fa-plus mr-1"></i> Add New Subject
//               </button>
//             </div>

//             {groupedData.map((programme) => (
//               <div key={programme.programmeId} className="mb-5">
//                 <h5 className="text-dark font-weight-bold border-bottom pb-2">{programme.programmeName}</h5>
//                 {programme.semesters.map((semester) => {
//                   const key = `${programme.programmeId}-${semester.semesterId}`;
//                   const isOpen = !!openSemesters[key];
//                   return (
//                     <div key={key} className="mb-4">
//                       <button
//                         className="w-100 text-white text-left px-3 py-2 d-flex justify-content-between align-items-center"
//                         style={{ backgroundColor: "#1c1c1c", border: "none", borderRadius: "25px", fontWeight: "bold" }}
//                         onClick={() => toggleSemester(programme.programmeId, semester.semesterId)}
//                         aria-controls={`collapse-${key}`}
//                         aria-expanded={isOpen}
//                       >
//                         <span><FaBookOpen /> {semester.semesterName} ({semester.courses.length} Subjects)</span>
//                         {isOpen ? <FaChevronUp /> : <FaChevronDown />}
//                       </button>
//                       <Collapse in={isOpen}>
//                         <div id={`collapse-${key}`} className="bg-white p-3 rounded border mt-2">
//                           {semester.courses.map(course => (
//                             <CourseCard key={course.courseId} course={course} onEdit={handleEdit} onDelete={handleDelete} onAssignClick={handleAssign} />
//                           ))}
//                         </div>
//                       </Collapse>
//                     </div>
//                   );
//                 })}
//               </div>
//             ))}
//           </div>
//         </div>

//         {showModal && (
//           <CourseFormModal
//             show={showModal}
//             onHide={() => setShowModal(false)}
//             onSave={handleSave}
//             course={selectedCourse}
//           />
//         )}

//         {showAssignModal && (
//           <AssignCourseModal
//             show={showAssignModal}
//             onHide={() => setShowAssignModal(false)}
//             onAssign={handleAssignSubmit}
//             courseId={assigningCourseId}
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// function CourseCard({ course, onEdit, onDelete, onAssignClick }) {
//   const [details, setDetails] = useState({ stats: {}, live: {}, assess: {} });
//   const navigate = useNavigate();

//   useEffect(() => {
//     const load = async () => {
//       const [assignmentRes, liveRes, examRes, contentRes] = await Promise.all([
//         fetch(`https://lmsapi.dbasesolutions.in/api/Assignment/count-by-course/${course.courseId}`),
//         fetch(`https://lmsapi.dbasesolutions.in/api/LiveClass/Upcoming/${course.courseId}`),
//         fetch(`https://lmsapi.dbasesolutions.in/api/Exam/latest-by-course/${course.courseId}`),
//         fetch(`https://lmsapi.dbasesolutions.in/api/Content/stats/${course.courseId}`)
//       ]);

//       const [assignmentCount, live, assess, content] = await Promise.all([
//         assignmentRes.ok ? assignmentRes.json() : { total: 0 },
//         liveRes.ok ? liveRes.json() : { hasUpcoming: false },
//         examRes.ok ? examRes.json() : { hasNewAssessment: false },
//         contentRes.ok ? contentRes.json() : { pdfCount: 0, videoCount: 0 }
//       ]);

//       setDetails({
//         stats: { assignmentCount: assignmentCount.total, ...content },
//         live,
//         assess
//       });
//     };
//     load();
//   }, [course.courseId]);

//   return (
//     <div className="p-4 mb-5 bg-light border rounded shadow-sm">
//       <h5 className="text-primary font-weight-bold mb-4 border-bottom pb-2">{course.name}</h5>
//       <div className="row g-4">
//         <div className="col-md-4">
//           <div className="card border rounded p-3 text-center h-100">
//             <h6 className="text-dark mb-2">📘 Courseware</h6>
//             <p className="mb-1">{details.stats.videoCount || 0} Video</p>
//             <p className="mb-1">{details.stats.pdfCount || 0} PDF</p>
//             <p className="mb-1">{details.stats.assignmentCount || 0} Assignment</p>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card border rounded p-3 text-center h-100">
//             <h6 className="text-dark mb-2">📡 Live Class</h6>
//             <p className="text-muted mb-0">{details.live?.message}</p>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card border rounded p-3 text-center h-100">
//             <h6 className="text-dark mb-2">📝 Continuous Assessment</h6>
//             <p className="text-muted mb-0">
//               {details.assess?.message || "No New Assessment Updated"}
//             </p>
//           </div>
//         </div>
//       </div>
//       <div className="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
//         <button className="btn btn-sm btn-outline-success" onClick={() => navigate(`/View-course-content/${course.courseId}`)}>
//           <i className="fa fa-eye"></i> View
//         </button>
//         <button className="btn btn-sm btn-outline-info" onClick={() => onEdit(course)}>
//           <i className="fa fa-edit"></i> Edit
//         </button>
//         <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(course.courseId)}>
//           <i className="fa fa-trash"></i> Delete
//         </button>
//         <button className="btn btn-sm btn-outline-primary" onClick={() => onAssignClick(course.courseId)}>
//           <i className="fa fa-link"></i> Assign Course & Groups
//         </button>
//       </div>
//     </div>
//   );
// }

// export default AdminCoursesPage;
// Updated AdminCoursesPage.js to add Upload button (mirroring Instructor)

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseFormModal from "../components/courses/CourseFormModal";
import AssignCourseModal from "../pages/AssignCourseModal";
import { Collapse } from "react-bootstrap";
import { FaChevronDown, FaChevronUp, FaBookOpen } from "react-icons/fa";
import API_BASE_URL from "../config";

function AdminCoursesPage() {
  const [groupedData, setGroupedData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSemesters, setOpenSemesters] = useState({});
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningCourseId, setAssigningCourseId] = useState(null);

  useEffect(() => {
    fetchProgrammes();
  }, []);

  const fetchProgrammes = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Programme/ProgrammesWithSemesters`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const raw = await res.json();

      const grouped = {};
      raw.forEach(row => {
        const prog = row.programmeName;
        const sem = row.semester;

        if (!grouped[prog]) grouped[prog] = {};
        if (!grouped[prog][sem]) grouped[prog][sem] = [];

        grouped[prog][sem].push({
          courseId: row.courseId,
          name: row.name,
          courseCode: row.courseCode,
          credits: row.credits,
          courseDescription: row.courseDescription,
          programme: row.programmeName,
          semester: row.semester
        });
      });

      const structured = Object.entries(grouped).map(([programmeName, semestersObj], index) => ({
        programmeName,
        programmeId: index + 1,
        semesters: Object.entries(semestersObj).map(([semesterName], sIdx) => ({
          semesterId: `${index + 1}-${sIdx + 1}`,
          semesterName,
          courses: semestersObj[semesterName]
        }))
      }));

      setGroupedData(structured);
    } catch (err) {
      console.error("Failed to fetch programmes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        const token = localStorage.getItem("jwt");
        const res = await fetch(`${API_BASE_URL}/Course/Delete/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(await res.text());

        fetchProgrammes();
      } catch (err) {
        alert(err.message || "Delete failed");
      }
    }
  };

  const handleSave = () => {
    setShowModal(false);
    setSelectedCourse(null);
    fetchProgrammes();
  };

  const handleAssign = (courseId) => {
    setAssigningCourseId(courseId);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async ({ courseId, programmeId, groupId, semester }) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Course/AssignCourseGroup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId, programmeId, groupId, semester })
      });

      if (!res.ok) throw new Error(await res.text());

      setShowAssignModal(false);
      fetchProgrammes();
    } catch (err) {
      alert(err.message || "Assignment failed");
    }
  };

  const toggleSemester = (programmeId, semesterId) => {
    const key = `${programmeId}-${semesterId}`;
    setOpenSemesters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="section-body mt-3">
      <div className="container-fluid">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-end mb-4">
              <button className="btn btn-dark" onClick={() => {
                setSelectedCourse(null);
                setShowModal(true);
              }}>
                <i className="fa fa-plus mr-1"></i> Add New Subject
              </button>
            </div>

            {groupedData.map((programme) => (
              <div key={programme.programmeId} className="mb-5">
                <h5 className="text-dark font-weight-bold border-bottom pb-2">{programme.programmeName}</h5>
                {programme.semesters.map((semester) => {
                  const key = `${programme.programmeId}-${semester.semesterId}`;
                  const isOpen = !!openSemesters[key];
                  return (
                    <div key={key} className="mb-4">
                      <button
                        className="w-100 text-white text-left px-3 py-2 d-flex justify-content-between align-items-center"
                        style={{ backgroundColor: "#1c1c1c", border: "none", borderRadius: "25px", fontWeight: "bold" }}
                        onClick={() => toggleSemester(programme.programmeId, semester.semesterId)}
                        aria-controls={`collapse-${key}`}
                        aria-expanded={isOpen}
                      >
                        <span><FaBookOpen /> {semester.semesterName} ({semester.courses.length} Subjects)</span>
                        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                      <Collapse in={isOpen}>
                        <div id={`collapse-${key}`} className="bg-white p-3 rounded border mt-2">
                          {semester.courses.map(course => (
                            <CourseCard
                              key={course.courseId}
                              course={course}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              onAssignClick={handleAssign}
                            />
                          ))}
                        </div>
                      </Collapse>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {showModal && (
          <CourseFormModal
            show={showModal}
            onHide={() => setShowModal(false)}
            onSave={handleSave}
            course={selectedCourse}
          />
        )}

        {showAssignModal && (
          <AssignCourseModal
            show={showAssignModal}
            onHide={() => setShowAssignModal(false)}
            onAssign={handleAssignSubmit}
            courseId={assigningCourseId}
          />
        )}
      </div>
    </div>
  );
}

function CourseCard({ course, onEdit, onDelete, onAssignClick }) {
  const [details, setDetails] = useState({ stats: {}, live: {}, assess: {} });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const load = async () => {
      const [assignmentRes, liveRes, examRes, contentRes] = await Promise.all([
        fetch(`${API_BASE_URL}/Assignment/count-by-course/${course.courseId}`, {
          
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/LiveClass/Upcoming/${course.courseId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/Exam/latest-by-course/${course.courseId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/Content/stats/${course.courseId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }),

      ]);

      const [assignmentCount, live, assess, content] = await Promise.all([
        assignmentRes.ok ? assignmentRes.json() : { total: 0 },
        liveRes.ok ? liveRes.json() : { message: "No upcoming live class" },
        examRes.ok ? examRes.json() : { message: "No new assessment" },
        contentRes.ok ? contentRes.json() : { pdfCount: 0, videoCount: 0 }
      ]);

      setDetails({
        stats: { assignmentCount: assignmentCount.total, ...content },
        live,
        assess
      });
    };
    load();
  }, [course.courseId]);

  return (
    <div className="p-4 mb-5 bg-light border rounded shadow-sm">
      <h5 className="text-primary font-weight-bold mb-4 border-bottom pb-2">{course.name}</h5>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card border rounded p-3 text-center h-100">
            <h6 className="text-dark mb-2">📘 Courseware</h6>
            <p className="mb-1">{details.stats.videoCount || 0} Video</p>
            <p className="mb-1">{details.stats.pdfCount || 0} PDF</p>
            <p className="mb-1">{details.stats.assignmentCount || 0} Assignment</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border rounded p-3 text-center h-100">
            <h6 className="text-dark mb-2">📡 Live Class</h6>
            <p className="text-muted mb-0">{details.live?.message}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border rounded p-3 text-center h-100">
            <h6 className="text-dark mb-2">📝 Continuous Assessment</h6>
            <p className="text-muted mb-0">{details.assess?.message || "No New Assessment Updated"}</p>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
        <button className="btn btn-sm btn-outline-success" onClick={() => navigate(`/view-course-content/${course.courseId}`)}>
          <i className="fa fa-eye"></i> View
        </button>
        <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/admin/upload-course-content/${course.courseId}`)}>
          <i className="fa fa-upload"></i> Upload
        </button>
        <button className="btn btn-sm btn-outline-info" onClick={() => onEdit(course)}>
          <i className="fa fa-edit"></i> Edit
        </button>
        <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(course.courseId)}>
          <i className="fa fa-trash"></i> Delete
        </button>
        <button className="btn btn-sm btn-outline-secondary" onClick={() => onAssignClick(course.courseId)}>
          <i className="fa fa-link"></i> Assign Course & Groups
        </button>
      </div>
    </div>
  );
}

export default AdminCoursesPage;

