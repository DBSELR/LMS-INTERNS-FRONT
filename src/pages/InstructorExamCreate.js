// import * as XLSX from "xlsx";
// import React, { useEffect, useState } from "react";
// import { jwtDecode } from "jwt-decode";
// import HeaderTop from "../components/HeaderTop";
// import RightSidebar from "../components/RightSidebar";
// import LeftSidebar from "../components/LeftSidebar";
// import Footer from "../components/Footer";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import ConfirmationPopup from "../components/ConfirmationPopup";

// function InstructorExamCreate() {
//   const [exam, setExam] = useState({
//     title: "",
//     examDate: "",
//     durationMinutes: 60,
//     createdBy: 0,
//     examinationID: 0,
//     type: "MT",
//     file: null,
//     totalmarks: 0,
//     passingmarks: 0,
//   });

//   const [courses, setCourses] = useState([]);
//   const [file, setFile] = useState(null);
//   const [questions, setQuestions] = useState([
//     {
//       questionText: "",
//       optionA: "",
//       optionB: "",
//       optionC: "",
//       optionD: "",
//       correctOption: "A",
//       level: "",
//       topic: "",
//     },
//   ]);

//   const [showDeletePopup, setShowDeletePopup] = useState(false);
//   const [deleteIndex, setDeleteIndex] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem("jwt");
//     const decoded = jwtDecode(token);
//     const instructorId = decoded["UserId"] || decoded.userId;

//     fetch(`https://lmsapi.dbasesolutions.in/api/course/by-instructor/${instructorId}`)
//       .then((res) => res.json())
//       .then((data) => setCourses(data))
//       .catch((err) => toast.error("❌ Failed to fetch courses"));

//     setExam((prev) => ({
//       ...prev,
//       createdBy: instructorId,
//     }));
//   }, []);

//   const handleExamChange = (e) => {
//     const { name, value } = e.target;
//     if (name === "courseId") {
//       const selectedCourse = courses.find((c) => c.examinationID == value);
//       setExam((prev) => ({
//         ...prev,
//         courseId: selectedCourse?.courseId || 0,
//         examinationID: parseInt(value),
//       }));
//     } else {
//       setExam((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handletypeChange = (e) => {
//     setExam((prev) => ({ ...prev, type: e.target.value }));
//   };

//   const handleQuestionChange = (index, field, value) => {
//     const updated = [...questions];
//     updated[index][field] = value;
//     setQuestions(updated);
//   };

//   const addQuestion = () => {
//     setQuestions([
//       ...questions,
//       {
//         questionText: "",
//         optionA: "",
//         optionB: "",
//         optionC: "",
//         optionD: "",
//         correctOption: "A",
//         level: "",
//         topic: "",
//       },
//     ]);
//   };

//   const confirmRemoveQuestion = (index) => {
//     setDeleteIndex(index);
//     setShowDeletePopup(true);
//   };

//   const handleRemoveConfirmed = () => {
//     setQuestions(questions.filter((_, i) => i !== deleteIndex));
//     setShowDeletePopup(false);
//     toast.success("❌ Question removed");
//   };

//   const handleExcelUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (evt) => {
//       const bstr = evt.target.result;
//       const wb = XLSX.read(bstr, { type: "binary" });
//       const ws = wb.Sheets[wb.SheetNames[0]];
//       const data = XLSX.utils.sheet_to_json(ws, { defval: "" });

//       try {
//         const formatted = data.map((row, index) => {
//           const {
//             questionText,
//             optionA,
//             optionB,
//             optionC,
//             optionD,
//             correctOption,
//             topic,
//             level,
//           } = row;
//           if (
//             !questionText ||
//             !optionA ||
//             !optionB ||
//             !optionC ||
//             !optionD ||
//             !correctOption ||
//             !topic ||
//             !level
//           ) {
//             throw new Error(`Missing data in row ${index + 2}`);
//           }
//           return {
//             questionText,
//             optionA,
//             optionB,
//             optionC,
//             optionD,
//             correctOption: correctOption.toUpperCase(),
//             topic,
//             level,
//           };
//         });

//         setQuestions(formatted);
//         toast.success("✅ Questions imported from Excel");
//       } catch (err) {
//         toast.error(err.message);
//       }
//     };
//     reader.readAsBinaryString(file);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (
//       (questions.length === 0 ||
//         questions.some(
//           (q) =>
//             !q.questionText ||
//             !q.optionA ||
//             !q.optionB ||
//             !q.optionC ||
//             !q.optionD
//         )) &&
//       exam.type !== "DT" &&
//       exam.type !== "DA"
//     ) {
//       toast.warning("⚠️ Please fill in all question fields");
//       return;
//     }

//     if (!exam.file && (exam.type === "DA" || exam.type === "DT")) {
//       toast.warning("⚠️ Please upload a file for descriptive exam");
//       return;
//     }

//     const payload = {
//       title: exam.title,
//       examDate: exam.examDate,
//       durationMinutes: parseInt(exam.durationMinutes),
//       totalmarks: parseInt(exam.totalmarks),
//       passingmarks: parseInt(exam.passingmarks),
//       createdBy: parseInt(exam.createdBy),
//       examinationID: parseInt(exam.examinationID),
//       type: exam.type,
//       questions: questions.map((q) => ({
//         questionText: q.questionText,
//         optionA: q.optionA,
//         optionB: q.optionB,
//         optionC: q.optionC,
//         optionD: q.optionD,
//         correctOption: q.correctOption,
//         difficultyLevel: q.level || "Medium",
//         topic: q.topic || "General",
//         suggestedMarks: parseInt(q.suggestedMarks) || 0,
//       })),
//     };

//     const formData = new FormData();
//     formData.append("examJson", JSON.stringify(payload));

//     if (exam.file instanceof File) {
//       formData.append("file", exam.file);
//     } else {
//       formData.append("file", new Blob([]), "empty.txt");
//     }

//     try {
//       const res = await fetch("https://lmsapi.dbasesolutions.in/api/Question/CreateFull", {
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) throw new Error("Upload failed");

//       toast.success("✅ Exam created successfully");
//       setExam({
//         title: "",
//         examinationID: "",
//         examDate: "",
//         durationMinutes: 60,
//         totalmarks: 60,
//         passingmarks: 60,
//         createdBy: exam.createdBy,
//         type: "MT",
//         file: null,
//       });

//       setQuestions([
//         {
//           questionText: "",
//           optionA: "",
//           optionB: "",
//           optionC: "",
//           optionD: "",
//           correctOption: "A",
//           level: "",
//           topic: "",
//           suggestedMarks: 1,
//         },
//       ]);
//     } catch (err) {
//       console.error("❌ Upload failed:", err);
//       toast.error("❌ Error creating exam");
//     }
//   };

//   const handleDownloadSampleCSV = () => {
//   const headers = [
//     "questionText",
//     "optionA",
//     "optionB",
//     "optionC",
//     "optionD",
//     "correctOption",
//     "Difficulty Level",
//     "Suggested Marks",
//     "topic"
//   ];

//   const sampleRow = [
//     "What is 2 + 2?",
//     "2",
//     "3",
//     "4",
//     "5",
//     "C",
//     "Easy",
//     "1",
//     "Unit-1"
//   ];

//   const csvContent =
//     [headers, sampleRow]
//       .map(row => row.map(field => `"${field}"`).join(","))
//       .join("\n");

//   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.href = url;
//   link.setAttribute("download", "sample_questions.csv");
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// };

//   return (
//     <div id="main_content" className="font-muli theme-blush">
//       <HeaderTop />
//       <RightSidebar />
//       <LeftSidebar role="Instructor" />

//       <div className="page">
//         <div className="section-body container-fluid mt-4">
//           <div className="jumbotron bg-light p-4 rounded shadow-sm mb-4">
//             <h2 className="mb-2">Create New Exam</h2>
//             <p className="text-muted">
//               Fill in the details below to set up a new examination for your
//               students.
//             </p>
//           </div>

//           <div className="card shadow-sm">
//             <div className="card-header bg-primary text-white">
//               <h5 className="mb-0">Exam Details</h5>
//             </div>
//             <div className="card-body">
//               <form onSubmit={handleSubmit}>
//                 <div className="row">
//                   <div className="col-md-6 mb-3">
//                     <label>Title</label>
//                     <input
//                       className="form-control"
//                       name="title"
//                       value={exam.title}
//                       onChange={handleExamChange}
//                       required
//                     />
//                   </div>
//                   <div className="col-md-6 mb-3">
//                     <label>Type</label>
//                     <select
//                       name="type"
//                       className="form-control"
//                       value={exam.type}
//                       onChange={handletypeChange}
//                     >
//                       <option value="MA">MCQ-Assignment</option>
//                       <option value="MT">MCQ-Theory</option>
//                       <option value="DA">Desc-Assignment</option>
//                       <option value="DT">Desc-Theory</option>
//                     </select>
//                   </div>
//                   <div className="col-md-6 mb-3">
//                     <label>Course</label>
//                     <select
//                       className="form-control"
//                       name="courseId"
//                       value={exam.examinationID}
//                       onChange={handleExamChange}
//                       required
//                     >
//                       <option value="">Select Course</option>
//                       {courses.map((course) => (
//                         <option
//                           key={course.examinationID}
//                           value={course.examinationID}
//                         >
//                           {course.paperCode}-{course.paperName} (
//                           {course.semester}/{course.batchName})
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div className="col-md-6 mb-3">
//                     <label>Date & Time</label>
//                     <input
//                       type="datetime-local"
//                       className="form-control"
//                       name="examDate"
//                       value={exam.examDate}
//                       onChange={handleExamChange}
//                       required
//                     />
//                   </div>
//                   <div className="col-md-6 mb-3">
//                     <label>Duration (minutes)</label>
//                     <input
//                       type="number"
//                       className="form-control"
//                       name="durationMinutes"
//                       value={exam.durationMinutes}
//                       onChange={handleExamChange}
//                       required
//                     />
//                   </div>
//                    <div className="col-md-6 mb-3">
//                     <label>Total Marks </label>
//                     <input
//                       type="number"
//                       className="form-control"
//                       name="totalmarks"
//                       value={exam.totalmarks}
//                       onChange={handleExamChange}
//                       required
//                     />
//                   </div>
//                    <div className="col-md-6 mb-3">
//                     <label>Passing Marks</label>
//                     <input
//                       type="number"
//                       className="form-control"
//                       name="passingmarks"
//                       value={exam.passingmarks}
//                       onChange={handleExamChange}
//                       required
//                     />
//                   </div>
//                   {(exam.type === "DA" || exam.type === "DT") && (
//                     <div className="col-md-6 mb-3">
//                       <label>Select File</label>
//                       <input
//                         type="file"
//                         className="form-control"
//                         onChange={(e) => {
//                           console.log("📁 File selected:", e.target.files[0]);
//                           setExam({ ...exam, file: e.target.files[0] });
//                         }}
//                       />
//                     </div>
//                   )}
//                 </div>

//                 {(exam.type === "MA" || exam.type === "MT") && (
//                   <>
//                     <div className="form-group mt-4">
//   <div className="d-flex justify-content-between align-items-center mb-2">
//     <label className="mb-0">Import Questions from Excel</label>
//     <button
//       type="button"
//       className="btn btn-sm btn-outline-secondary"
//       onClick={handleDownloadSampleCSV}
//     >
//       ⬇️ Download Sample
//     </button>
//   </div>
//   <input
//     type="file"
//     accept=".xlsx,.xls,.csv"
//     className="form-control-file"
//     onChange={handleExcelUpload}
//   />
//   <small className="form-text text-muted">
//     File must contain columns: <code>questionText, optionA, optionB, optionC, optionD, correctOption, Difficulty Level, Suggested Marks, topic</code>
//   </small>
// </div>


//                     {questions.map((q, index) => (
//                       <div key={index} className="border rounded p-3 mb-4 shadow-sm">
//                         <h6>Question {index + 1}</h6>
//                         <div className="form-group">
//                           <label>Topic</label>
//                           <input className="form-control" value={q.topic} onChange={(e) => handleQuestionChange(index, "topic", e.target.value)} />
//                         </div>
//                         <div className="form-group">
//                         <label>Suggested Marks</label>
//                         <input
//                           type="number"
//                           min="1"
//                           className="form-control"
//                           value={q.suggestedMarks || ""}
//                           onChange={(e) => handleQuestionChange(index, "suggestedMarks", parseInt(e.target.value) || 0)}
//                         />
//                       </div>
//                         <div className="form-group">
//                           <label>Difficulty Level</label>
//                           <select className="form-control" value={q.level} onChange={(e) => handleQuestionChange(index, "level", e.target.value)}>
//                             <option value="">Select</option>
//                             <option value="Easy">Easy</option>
//                             <option value="Medium">Medium</option>
//                             <option value="Hard">Hard</option>
//                           </select>
//                         </div>
//                         <div className="form-group">
//                           <label>Question Text</label>
//                           <textarea className="form-control" value={q.questionText} onChange={(e) => handleQuestionChange(index, "questionText", e.target.value)} required />
//                         </div>
//                         <div className="row">
//                           {["A", "B", "C", "D"].map((opt) => (
//                             <div className="col-md-6 mb-3" key={opt}>
//                               <label>Option {opt}</label>
//                               <input className="form-control" value={q[`option${opt}`] || ""} onChange={(e) => handleQuestionChange(index, `option${opt}`, e.target.value)} required />
//                             </div>
//                           ))}
//                         </div>
//                         <div className="form-group">
//                           <label>Correct Option</label>
//                           <select className="form-control" value={q.correctOption} onChange={(e) => handleQuestionChange(index, "correctOption", e.target.value)}>
//                             <option value="A">A</option>
//                             <option value="B">B</option>
//                             <option value="C">C</option>
//                             <option value="D">D</option>
//                           </select>
//                         </div>
//                         {questions.length > 1 && (
//                           <button type="button" className="btn btn-danger btn-sm mt-2" onClick={() => confirmRemoveQuestion(index)}>
//                             Remove Question
//                           </button>
//                         )}
//                       </div>
//                     ))}

//                     <button type="button" className="btn btn-secondary mb-3" onClick={addQuestion}>
//                       + Add Another Question
//                     </button>
//                   </>
//                 )}

//                 <div className="text-center mt-4">
//                   <button type="submit" className="btn btn-primary px-5">
//                     Create Exam
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>

//          
//       </div>

//       <ConfirmationPopup
//         show={showDeletePopup}
//         message="Are you sure you want to remove this question?"
//         onConfirm={handleRemoveConfirmed}
//         onCancel={() => setShowDeletePopup(false)}
//         toastMessage="Question removed"
//       />

//       <ToastContainer position="bottom-center" autoClose={3000} />
//     </div>
//   );
// }

// export default InstructorExamCreate;




import * as XLSX from "xlsx";
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationPopup from "../components/ConfirmationPopup";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

function InstructorExamCreate() {
  const [exam, setExam] = useState({
    title: "",
    examDate: "",
    durationMinutes: 60,
    createdBy: 0,
    examinationID: 0,
    type: "MT",
    file: null,
    totalmarks: 0,
    passingmarks: 0,
  });

  const [courses, setCourses] = useState([]);
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "A",
      level: "",
      topic: "",
    },
  ]);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const decoded = jwtDecode(token);
    const instructorId = decoded["UserId"] || decoded.userId;

    fetch(`${API_BASE_URL}/course/by-instructor/${instructorId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => toast.error("❌ Failed to fetch courses"));

    setExam((prev) => ({
      ...prev,
      createdBy: instructorId,
    }));
  }, []);

  const handleExamChange = (e) => {
    const { name, value } = e.target;
    if (name === "courseId") {
      const selectedCourse = courses.find((c) => c.examinationID == value);
      setExam((prev) => ({
        ...prev,
        courseId: selectedCourse?.courseId || 0,
        examinationID: parseInt(value),
      }));
    } else {
      setExam((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handletypeChange = (e) => {
    setExam((prev) => ({ ...prev, type: e.target.value }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctOption: "A",
        level: "",
        topic: "",
      },
    ]);
  };

  const confirmRemoveQuestion = (index) => {
    setDeleteIndex(index);
    setShowDeletePopup(true);
  };

  const handleRemoveConfirmed = () => {
    setQuestions(questions.filter((_, i) => i !== deleteIndex));
    setShowDeletePopup(false);
    toast.success("❌ Question removed");
  };

  const handleExcelUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    const bstr = evt.target.result;
    const wb = XLSX.read(bstr, { type: "binary" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws, { defval: "" });

    try {
      const formatted = data.map((row, index) => {
        const {
          questionText,
          optionA,
          optionB,
          optionC,
          optionD,
          correctOption,
          topic,
          "Difficulty Level": level,
          "Suggested Marks": suggestedMarks,
        } = row;

        if (
          !questionText ||
          !optionA ||
          !optionB ||
          !optionC ||
          !optionD ||
          !correctOption ||
          !topic ||
          !level
        ) {
          throw new Error(`Missing data in row ${index + 2}`);
        }

        return {
          questionText,
          optionA,
          optionB,
          optionC,
          optionD,
          correctOption: correctOption.toUpperCase(),
          topic,
          level,
          suggestedMarks: parseInt(suggestedMarks) || 0,
        };
      });

      setQuestions(formatted);
      alert("✅ Questions imported from Excel successfully!");
    } catch (err) {
      alert(`❌ ${err.message}`);
    }
  };
  reader.readAsBinaryString(file);
};



const handleSubmit = async (e) => {
  e.preventDefault();

  if (
    (questions.length === 0 ||
      questions.some(
        (q) =>
          !q.questionText ||
          !q.optionA ||
          !q.optionB ||
          !q.optionC ||
          !q.optionD
      )) &&
    exam.type !== "DT" &&
    exam.type !== "DA"
  ) {
    toast.warning("⚠️ Please fill in all question fields");
    return;
  }

  if (!exam.file && (exam.type === "DA" || exam.type === "DT")) {
    toast.warning("⚠️ Please upload a file for descriptive exam");
    return;
  }

  // 🔍 Validate suggested marks against total marks
  if (exam.type === "MA" || exam.type === "MT") {
    const totalSuggestedMarks = questions.reduce(
      (sum, q) => sum + (parseInt(q.suggestedMarks) || 0),
      0
    );

    if (totalSuggestedMarks !== parseInt(exam.totalmarks)) {
      toast.error(`❌ Total Suggested Marks (${totalSuggestedMarks}) must equal Total Marks (${exam.totalmarks})`);
      return;
    }
  }

    const payload = {
      title: exam.title,
      examDate: exam.examDate,
      durationMinutes: parseInt(exam.durationMinutes),
      totalmarks: parseInt(exam.totalmarks),
      passingmarks: parseInt(exam.passingmarks),
      createdBy: parseInt(exam.createdBy),
      examinationID: parseInt(exam.examinationID),
      type: exam.type,
      questions: questions.map((q) => ({
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        difficultyLevel: q.level || "Medium",
        topic: q.topic || "General",
        suggestedMarks: parseInt(q.suggestedMarks) || 0,
      })),
    };

    const formData = new FormData();
    formData.append("examJson", JSON.stringify(payload));

    if (exam.file instanceof File) {
      formData.append("file", exam.file);
    } else {
      formData.append("file", new Blob([]), "empty.txt");
    }

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Question/CreateFull`, {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Upload failed");

      toast.success("✅ Exam created successfully");
      setExam({
        title: "",
        examinationID: "",
        examDate: "",
        durationMinutes: 60,
        totalmarks: 60,
        passingmarks: 60,
        createdBy: exam.createdBy,
        type: "MT",
        file: null,
      });

      setQuestions([
        {
          questionText: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctOption: "A",
          level: "",
          topic: "",
          suggestedMarks: 1,
        },
      ]);
    } catch (err) {
      console.error("❌ Upload failed:", err);
      toast.error("❌ Error creating exam");
    }
  };

  const handleDownloadSampleCSV = () => {
  const headers = [
    "questionText",
    "optionA",
    "optionB",
    "optionC",
    "optionD",
    "correctOption",
    "Difficulty Level",
    "Suggested Marks",
    "topic"
  ];

  const sampleRow = [
    "What is 2 + 2?",
    "2",
    "3",
    "4",
    "5",
    "C",
    "Easy",
    "1",
    "Unit-1"
  ];

  const csvContent =
    [headers, sampleRow]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "sample_questions.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Faculty" />

      <div className="section-wrapper">
      <div className="page admin-dashboard">
        <div className="section-body mt-3 pt-0">
        <div className="container-fluid">
         <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
              <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                <i class="fa-solid fa-pen"></i> Create Exam
              </h2>
              <p className="text-muted mb-0 dashboard-hero-sub">
                Fill in the details below to set up a new exam for your
                students.
              </p>
            </div>
          </div>
            <div className="container-fluid mb-3">
          <div className="d-flex justify-content-end">
           <button
            className="btn btn-outline-primary mb-3"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          </div>
        </div>

          <div className="card shadow-sm" style={{ padding: "20px" }}>
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Exam Details</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label>Title</label>
                    <input
                      className="form-control"
                      name="title"
                      value={exam.title}
                      onChange={handleExamChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Type</label>
                    <select
                      name="type"
                      className="form-control"
                      value={exam.type}
                      onChange={handletypeChange}
                    >
                      <option value="MA">MCQ-Assignment</option>
                      <option value="MT">MCQ-Theory</option>
                      <option value="DA">Desc-Assignment</option>
                      <option value="DT">Desc-Theory</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Course</label>
                    <select
                      className="form-control"
                      name="courseId"
                      value={exam.examinationID}
                      onChange={handleExamChange}
                      required
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option
                          key={course.examinationID}
                          value={course.examinationID}
                        >
                          {course.paperCode}-{course.paperName} (
                          {course.semester}/{course.batchName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label>Date & Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="examDate"
                      value={exam.examDate}
                      onChange={handleExamChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Duration (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="durationMinutes"
                      value={exam.durationMinutes}
                      onChange={handleExamChange}
                      required
                    />
                  </div>
                   <div className="col-md-6 mb-3">
                    <label>Total Marks </label>
                    <input
                      type="number"
                      className="form-control"
                      name="totalmarks"
                      value={exam.totalmarks}
                      onChange={handleExamChange}
                      required
                    />
                  </div>
                   <div className="col-md-6 mb-3">
                    <label>Passing Marks</label>
                    <input
                      type="number"
                      className="form-control"
                      name="passingmarks"
                      value={exam.passingmarks}
                      onChange={handleExamChange}
                      required
                    />
                  </div>
                  {(exam.type === "DA" || exam.type === "DT") && (
                    <div className="col-md-6 mb-3">
                      <label>Select File</label>
                      <input
                        type="file"
                        className="form-control"
                        onChange={(e) => {
                          console.log("📁 File selected:", e.target.files[0]);
                          setExam({ ...exam, file: e.target.files[0] });
                        }}
                      />
                    </div>
                  )}
                </div>

                {(exam.type === "MA" || exam.type === "MT") && (
                  <>
                    <div className="form-group mt-4">
  <div className="d-flex justify-content-between align-items-center mb-2">
    <label className="mb-0">Import Questions from Excel</label>
    <button
      type="button"
      className="btn btn-sm btn-outline-secondary"
      onClick={handleDownloadSampleCSV}
    >
      ⬇️ Download Sample
    </button>
  </div>
  <input
    type="file"
    accept=".xlsx,.xls,.csv"
    className="form-control-file"
    onChange={handleExcelUpload}
  />
  <small className="form-text text-muted">
    File must contain columns: <code>questionText, optionA, optionB, optionC, optionD, correctOption, Difficulty Level, Suggested Marks, topic</code>
  </small>
</div>


                   {questions.length > 0 && (
  <div className="table-responsive mt-3">
    <table className="table table-bordered table-hover shadow-sm">
      <thead className="thead-light">
        <tr>
          <th>#</th>
          <th>Topic</th>
          <th>Suggested Marks</th>
          <th>Difficulty</th>
          <th>Question</th>
          <th>Option A</th>
          <th>Option B</th>
          <th>Option C</th>
          <th>Option D</th>
          <th>Correct Option</th>
        </tr>
      </thead>
      <tbody>
        {questions.map((q, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{q.topic}</td>
            <td>{q.suggestedMarks || 0}</td>
            <td>{q.level}</td>
            <td>{q.questionText}</td>
            <td>{q.optionA}</td>
            <td>{q.optionB}</td>
            <td>{q.optionC}</td>
            <td>{q.optionD}</td>
            <td>{q.correctOption}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

                  </>
                )}

                <div className="text-center mt-4">
                  <button type="submit" className="btn btn-primary px-5">
                    Create Exam
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

         
      </div>
      </div>

      <ConfirmationPopup
        show={showDeletePopup}
        message="Are you sure you want to remove this question?"
        onConfirm={handleRemoveConfirmed}
        onCancel={() => setShowDeletePopup(false)}
        toastMessage="Question removed"
      />

      <ToastContainer position="bottom-center" autoClose={3000} />
    </div>
  );
}

export default InstructorExamCreate;