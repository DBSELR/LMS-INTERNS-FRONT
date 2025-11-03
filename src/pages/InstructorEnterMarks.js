// // File: src/pages/InstructorEnterMarks.jsx
// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import HeaderTop from "../components/HeaderTop";
// import RightSidebar from "../components/RightSidebar";
// import LeftSidebar from "../components/LeftSidebar";
// import Footer from "../components/Footer";
// import { Button, Table, Form } from "react-bootstrap";
// import { toast } from "react-toastify";

// function InstructorEnterMarks() {
//   const { examId } = useParams();
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [marks, setMarks] = useState({});

//   useEffect(() => {
//     fetch(`https://lmsapi.dbasesolutions.in/api/Course/${examId}/students`)
//       .then(res => res.json())
//       .then(data => {
//         setStudents(data);
//         const initialMarks = {};
//         data.forEach(s => {
//           initialMarks[s.studentId] = {
//             internal: "",
//             theory: "",
//             total: ""
//           };
//         });
//         setMarks(initialMarks);
//       })
//       .catch(err => toast.error("Failed to fetch students"))
//       .finally(() => setLoading(false));
//   }, [examId]);

//   const handleChange = (studentId, field, value) => {
//     setMarks(prev => ({
//       ...prev,
//       [studentId]: {
//         ...prev[studentId],
//         [field]: value
//       }
//     }));
//   };

//   const handleSubmit = async () => {
//     const payload = Object.entries(marks).map(([studentId, entry]) => ({
//       examinationId: Number(examId),
//       studentId: Number(studentId),
//       internalMarks: Number(entry.internal),
//       theoryMarks: Number(entry.theory),
//       totalMarks: Number(entry.total)
//     }));

//     try {
//       const res = await fetch("https://lmsapi.dbasesolutions.in/api/Marks/Enter", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload)
//       });
//       if (!res.ok) throw new Error("Submission failed");
// alert("Marks submitted successfully!");

//     } catch (err) {
//   alert("Failed to submit marks");
//     }
//   };

//   return (
//     <div id="main_content" className="font-muli theme-blush">
//       {loading && <div className="page-loader-wrapper"><div className="loader"></div></div>}
//       <HeaderTop />
//       <RightSidebar />
//       <LeftSidebar role="Instructor" />

//       <div className="page">
//         <div className="section-body mt-3">
//           <div className="container-fluid">
//             <h3 className="mb-4 text-primary">Enter Marks for Exam #{examId}</h3>
//             <Table bordered hover responsive>
//               <thead className="thead-dark">
//                 <tr>
//                   <th>Student ID</th>
//                   <th>Name</th>
//                   <th>Email</th>
//                   <th>Internal</th>
//                   <th>Theory</th>
//                   <th>Total</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {students.map(s => (
//                   <tr key={s.studentId}>
//                     <td>{s.studentId}</td>
//                     <td>{s.name}</td>
//                     <td>{s.email}</td>
//                     <td>
//                       <Form.Control
//                         type="number"
//                         value={marks[s.studentId]?.internal || ""}
//                         onChange={e => handleChange(s.studentId, "internal", e.target.value)}
//                       />
//                     </td>
//                     <td>
//                       <Form.Control
//                         type="number"
//                         value={marks[s.studentId]?.theory || ""}
//                         onChange={e => handleChange(s.studentId, "theory", e.target.value)}
//                       />
//                     </td>
//                     <td>
//                       <Form.Control
//                         type="number"
//                         value={marks[s.studentId]?.total || ""}
//                         onChange={e => handleChange(s.studentId, "total", e.target.value)}
//                       />
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </Table>
//             <div className="d-flex justify-content-end">
//               <Button variant="primary" onClick={handleSubmit}>Submit Marks</Button>
//             </div>
//           </div>
//         </div>
//          
//       </div>
//     </div>
//   );
// }

// export default InstructorEnterMarks;
// File: src/pages/InstructorEnterMarks.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import { Button, Table, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";

function InstructorEnterMarks() {
  const { examId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marks, setMarks] = useState({});

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const examRes = await fetch( `${API_BASE_URL}/Examination/${examId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!examRes.ok) throw new Error("Failed to fetch exam");
        const exam = await examRes.json();
        const courseId = exam.courseId;


        const studentsRes = await fetch(`${API_BASE_URL}/Course/${courseId}/students`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!studentsRes.ok) throw new Error("Failed to fetch students");
        const data = await studentsRes.json();

        setStudents(data);
        const initialMarks = {};
        data.forEach(s => {
          initialMarks[s.studentId] = {
            internal: "",
            theory: "",
            total: ""
          };
        });
        setMarks(initialMarks);
      } catch (err) {
        console.error(err);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [examId]);

  const handleChange = (studentId, field, value) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    const payload = Object.entries(marks).map(([studentId, entry]) => ({
      examinationId: Number(examId),
      studentId: Number(studentId),
      internalMarks: Number(entry.internal),
      theoryMarks: Number(entry.theory),
      totalMarks: Number(entry.total)
    }));

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Marks/Enter`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
         },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Submission failed");
      alert("Marks submitted successfully!");
    } catch (err) {
      alert("Failed to submit marks");
    }
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && <div className="page-loader-wrapper"><div className="loader"></div></div>}
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Instructor" />

      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">
            <h3 className="mb-4 text-primary">Enter Marks for Exam #{examId}</h3>
            <Table bordered hover responsive>
              <thead className="thead-dark">
                <tr>
                  <th>Student ID</th>
                  {/* <th>Name</th> */}
                  <th>Email</th>
                  <th>Internal</th>
                  <th>Theory</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.studentId}>
                    {/* <td>{s.studentId}</td> */}
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>
                      <Form.Control
                        type="number"
                        value={marks[s.studentId]?.internal || ""}
                        onChange={e => handleChange(s.studentId, "internal", e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        value={marks[s.studentId]?.theory || ""}
                        onChange={e => handleChange(s.studentId, "theory", e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        value={marks[s.studentId]?.total || ""}
                        onChange={e => handleChange(s.studentId, "total", e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="d-flex justify-content-end">
              <Button variant="primary" onClick={handleSubmit}>Submit Marks</Button>
            </div>
          </div>
        </div>
         
      </div>
    </div>
  );
}

export default InstructorEnterMarks;
