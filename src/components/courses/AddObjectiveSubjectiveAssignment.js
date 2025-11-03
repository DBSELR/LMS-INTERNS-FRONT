import * as XLSX from "xlsx";
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import ConfirmationPopup from "../ConfirmationPopup";
import Footer from "../Footer";
import HeaderTop from "../HeaderTop";
import RightSidebar from "../RightSidebar";
import LeftSidebar from "../LeftSidebar";
import { useLocation } from "react-router-dom";
import API_BASE_URL from "../../config";

function AddObjectiveSubjectiveAssignment() {
  const [exam, setExam] = useState({
    title: "",
    examDate: "",
    durationMinutes: 60,
    createdBy: 0,
    examinationID: 0,
    type: "MP",
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

  const location = useLocation();
  const rawUnit = location.state?.unitId;
  const unitId = rawUnit?.split("-")[1] || "";

  const courseMeta = {
    batchName: location.state?.batchName,
    semester: location.state?.semester,
    courseCode: location.state?.courseCode,
    courseName: location.state?.courseName,
    unitId,
    examinationID: location.state?.examinationID,
  };

  console.log("📥 Received from navigation:", { unitId, courseMeta });

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem("jwt");
  const decoded = jwtDecode(token);
  const instructorId = decoded["UserId"] || decoded.userId;

  setExam((prev) => {
    const updated = {
      ...prev,
      createdBy: instructorId,
      examinationID: parseInt(location.state?.examinationID) || prev.examinationID,
      type: prev.type || "MP",
    };
    console.log("🛠 Initial exam set:", updated);
    return updated;
  });

  fetch(`${API_BASE_URL}/course/by-instructor/${instructorId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => setCourses(data))
    .catch((err) => toast.error("❌ Failed to fetch courses"));
}, []);


  const [totalSuggestedMarks, setTotalSuggestedMarks] = useState(0);

  const handleExamChange = (e) => {
    const { name, value } = e.target;
    console.log(`✏️ Changed field: ${name} ➝`, value);
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
        const total = formatted.reduce(
          (sum, q) => sum + (q.suggestedMarks || 0),
          0
        );
        setTotalSuggestedMarks(total);
        alert("✅ Questions imported from Excel successfully!");
      } catch (err) {
        alert(`❌ ${err.message}`);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for Objective: All question fields required
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
      exam.type !== "DP"
    ) {
      toast.warning("⚠️ Please fill in all question fields");
      return;
    }

    // Validation for Subjective: File required
    if (!exam.file && exam.type === "DP") {
      toast.warning("⚠️ Please upload a file for descriptive exam");
      return;
    }

    // ✅ Check if Suggested Marks match Total Marks
    if (
      exam.type === "MP" &&
      totalSuggestedMarks !== parseInt(exam.totalmarks)
    ) {
      toast.error(
        `❌ Total Suggested Marks (${totalSuggestedMarks}) must equal Total Marks (${exam.totalmarks})`
      );
      return;
    }

    const payload = {
      UnitId: unitId,
      title: exam.title,
      examDate: exam.examDate,
      durationMinutes: parseInt(exam.durationMinutes),
      totalmarks: parseInt(exam.totalmarks),
      passingmarks: parseInt(exam.passingmarks),
      createdBy: parseInt(exam.createdBy),
      examinationID:
        parseInt(exam.examinationID) || parseInt(courseMeta.examinationID), // ✅ fixed
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
    console.log("📦 Exam ID used:", payload.examinationID);

    console.log("🧾 Final Payload:", payload);

    const formData = new FormData();
    formData.append("examJson", JSON.stringify(payload));

    if (exam.file instanceof File) {
      formData.append("file", exam.file);
    } else {
      formData.append(
        "file",
        new Blob([], { type: "text/plain" }),
        "empty.txt"
      );
    }

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${API_BASE_URL}/Question/CreatePracticeExamsWithQuestions`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      toast.success("✅ Exam created successfully");

      // Reset form
      setExam({
        title: "",
        examinationID: exam.examinationID,
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
      setTotalSuggestedMarks(0); // Reset total
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
      "topic",
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
      "Unit-1",
    ];

    const csvContent = [headers, sampleRow]
      .map((row) => row.map((field) => `"${field}"`).join(","))
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
      <LeftSidebar role="Instructor" />
       
      <div className="section-wrapper">
      <div className="page admin-dashboard">
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
          <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
            <h2 className="page-title text-primary pt-0 dashboard-hero-title">Add Practice Test</h2>
            <p className="text-muted mb-0 dashboard-hero-sub">
              {courseMeta.batchName} - {courseMeta.semester} -{" "}
              {courseMeta.examinationID} - {courseMeta.courseCode} -{" "}
              {courseMeta.courseName} - Unit - {unitId}
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

          <div className="card shadow-sm">
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
                      <option value="MP">Objective</option>
                      <option value="DP">Subjective</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Course</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={`${courseMeta.courseCode}-${courseMeta.courseName} (${courseMeta.semester}/${courseMeta.batchName}) - Unit - ${unitId}`}
                      readOnly
                    />
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
                  {exam.type === "DP" && (
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

                {exam.type === "MP" && (
                  <>
                    <div className="form-group mt-4">
                      <div className="text-danger text-center">
                        Total Suggested Marks: {totalSuggestedMarks} / Total
                        Marks: {exam.totalmarks}
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="mb-0">
                          Import Questions from Excel
                        </label>
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
                        File must contain columns:{" "}
                        <code>
                          questionText, optionA, optionB, optionC, optionD,
                          correctOption, Difficulty Level, Suggested Marks,
                          topic
                        </code>
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

export default AddObjectiveSubjectiveAssignment;
