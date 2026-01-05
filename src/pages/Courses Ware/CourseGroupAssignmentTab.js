// File: src/pages/Courses Ware/CourseGroupAssignmentTab.jsx

import React, { useEffect, useState } from "react";
import { Form, Button, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ConfirmationPopup from "../../components/ConfirmationPopup";
import API_BASE_URL from "../../config";

const CourseGroupAssignmentTab = () => {
  const [batchList, setBatchList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);

  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("1"); // 🔒 always "1"

  const [subjectBank, setSubjectBank] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        "https://uginternsapi.dbasesolutions.in/api/Programme/GetUniqueBatches",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("📤 GetUniqueBatches REQUEST");
      console.log("URL: https://uginternsapi.dbasesolutions.in/api/Programme/GetUniqueBatches");
      console.log("Method: GET");
      console.log("Headers:", { Authorization: `Bearer ${token}` });

      const data = await res.json();
      console.log("📥 GetUniqueBatches RESPONSE:", data);

      // Store both batch and batch in batchList
      setBatchList(data.map((p) => ({ batch: p.batch, batch: p.batch })));
      console.log(
        "✅ Extracted batchList:",
        data.map((p) => ({ batch: p.batch, batch: p.batch }))
      );
    } catch (error) {
      console.error("❌ Error fetching batches:", error);
      toast.error("Failed to load batches");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (selectedBatch) {
      console.log("🔍 Selected Batch (batch):", selectedBatch); // Log selectedBatch for debugging

      // Fetch programmes for the selected batch using batch
      fetch(
        `https://uginternsapi.dbasesolutions.in/api/Programme/GetProgrammesByBatchName?batch=${selectedBatch}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
        .then((res) => {
          if (res.status === 404) {
            console.warn("⚠️ No programmes found for the selected batch.");
            toast.warn("No programmes available for the selected batch.");
            setCourseList([]); // Clear courseList if no data
            return [];
          }
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (!data) {
            console.warn("⚠️ No programmes found for the selected batch.");
            toast.warn("No programmes available for the selected batch.");
            setCourseList([]);
            return;
          }

          // Handle both single object and array responses
          const programmes = Array.isArray(data) ? data : [data];

          console.log("📥 GetProgrammesByBatch RESPONSE:", programmes);
          setCourseList(programmes);
        })
        .catch((error) => {
          console.error("❌ Error fetching programmes:", error);
          toast.error("Failed to load programmes");
        });
    }
  }, [selectedBatch]);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (selectedCourse) {
      // Find the programme ID from the selected programme name
      const programme = courseList.find(
        (c) => c.programmeName === selectedCourse
      );
      const programmeId = programme?.programmeid;

      if (programmeId) {
        // Fetch groups for the selected programme using programme ID
        fetch(`https://uginternsapi.dbasesolutions.in/api/Group/ByProgramme/${programmeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("📥 ByProgramme RESPONSE:", data);
            setGroupList(data); // Update groupList with the fetched groups
          })
          .catch((error) => {
            console.error("❌ Error fetching groups:", error);
            toast.error("Failed to load groups");
          });
      }
    }
  }, [selectedCourse, courseList]);

  useEffect(() => {
    if (selectedCourse && courseList.length > 0) {
      // Semesters (we still compute but force use of "1")
      const course = courseList.find((c) => c.programmeName === selectedCourse);
      const totalSems = course?.numberOfSemesters || 6;
      setSemesterOptions(Array.from({ length: totalSems }, (_, i) => i + 1));

      // 🔒 Force semester to "1"
      setSelectedSemester("1");
    }
  }, [selectedCourse, courseList]);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    
    // Load existing assigned subjects when batch, course and groups are available
    if (selectedBatch && selectedCourse && groupList.length > 0 && selectedSemester) {
      const course = courseList.find((c) => c.programmeName === selectedCourse);
      const programmeId = course?.programmeid;
      const batch = batchList.find((b) => b.batch == selectedBatch);
      const batchName = batch?.batch;
      const defaultGroupId = groupList[0]?.groupId; // Use first available group

      if (programmeId && batchName && defaultGroupId) {
        // 🔒 selectedSemester is always "1"
        fetch(
          `${API_BASE_URL}/Examination/GetAssignSubjects?Batch=${batchName}&ProgrammeId=${programmeId}&GroupId=${defaultGroupId}&Semester=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
          .then((res) => res.json())
          .then((data) => {
            const formatted = data.map((item) => ({
              ...item,
              examinationId: item.examinationid,
            }));
            setSelectedSubjects(
              formatted.sort((a, b) => a.displayOrder - b.displayOrder)
            );
          })
          .catch((error) => {
            console.log("No existing assignments found or error:", error);
            // This is expected if no assignments exist yet
          });
      }
    }

    // Load subject bank when course is selected (Group not required)
    if (selectedBatch && selectedCourse) {
      fetch(
        `${API_BASE_URL}/Course/ByProgrammeAndSemester`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("📚 Subject Bank API Response:", data);
          setSubjectBank(data || []);
        })
        .catch((error) => {
          console.error("❌ Error fetching subject bank:", error);
          toast.error("Failed to load subject bank");
          setSubjectBank([]);
        });
    }
  }, [
    selectedBatch,
    selectedCourse,
    selectedGroup,
    selectedSemester,
    courseList,
    batchList,
    groupList,
  ]);

  const handleSubjectSelect = (subject) => {
    const exists = selectedSubjects.find(
      (s) => s.examinationId === subject.examinationId
    );
    if (exists) {
      setSubjectToDelete(subject);
      setShowPopup(true);
    } else {
      setSelectedSubjects((prev) => [
        ...prev,
        {
          ...subject,
          examinationid: subject.examinationId,
          subjectAssignmentId: null,
          displayOrder: prev.length + 1,
        },
      ]);
    }
  };

  const confirmDelete = () => {
    setSelectedSubjects((prev) =>
      prev.filter((s) => s.examinationId !== subjectToDelete.examinationId)
    );
    setShowPopup(false);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const updated = Array.from(selectedSubjects);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);
    const reordered = updated.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
    }));
    setSelectedSubjects(reordered);
  };

  const resetAssignmentForm = () => {
    setSelectedBatch("");
    setSelectedCourse("");
    setSelectedGroup("");
    setSelectedSemester("1"); // keep "1"
    setGroupList([]);
    setSemesterOptions([]);
    setSubjectBank([]);
    setSelectedSubjects([]);
  };

  const handleSave = async () => {
    const toastOptions = {
      toastId: "assign-toast",
      autoClose: 3000,
      pauseOnHover: true,
    };

    // Validate required fields
    if (!selectedBatch || !selectedCourse) {
      toast.error("Please select Batch and Course", toastOptions);
      return;
    }

    const course = courseList.find((c) => c.programmeName === selectedCourse);
    if (!course) {
      toast.error("Invalid course selection", toastOptions);
      return;
    }

    const mergedSubjects = selectedSubjects.map((subject, index) => ({
      ...subject,
      displayOrder: index + 1,
    }));

    if (mergedSubjects.length === 0) {
      toast.error("Please select at least one subject", toastOptions);
      return;
    }

    const batch = batchList.find((b) => b.batch == selectedBatch);
    const batchName = batch?.batch;

    // Since Group is hidden, we'll use a default group (first available group or 1)
    const defaultGroupId = groupList.length > 0 ? groupList[0].groupId : 1;

    const payload = {
      programmeId: course.programmeid,
      batchName: batchName,
      groupId: parseInt(defaultGroupId),
      semester: 1, // 🔒 always 1
      subjectIds: mergedSubjects.map((s) => s.examinationId),
    };

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Course/AssignSubjectsById`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(
        "✅ Subjects assigned/Ordered successfully",
        toastOptions
      );
      resetAssignmentForm();
    } catch (err) {
      toast.error(`❌ Save failed: ${err.message}`, toastOptions);
    }

    const existingSubjects = mergedSubjects.filter(
      (s) => s.subjectAssignmentId
    );
    if (existingSubjects.length > 0) {
      try {
        const token = localStorage.getItem("jwt");
        await Promise.all(
          existingSubjects.map((s) =>
            fetch(
              `${API_BASE_URL}/Examination/UpdatePno/${s.subjectAssignmentId}/${s.displayOrder}`,
              {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
              }
            )
          )
        );
      } catch {
        toast.error("❌ Reorder failed", {
          toastId: "reorder-error",
          autoClose: 3000,
          pauseOnHover: true,
        });
      }
    }
  };

  return (
    <div className="container py-0 pt-0 welcome-card animate-welcome">
      <div className="mb-0 p-0 rounded">
        <h5 className="mb-0 mt-0 text-primary">
          Assign Subjects to Course + Class
        </h5>
        <Form>
          <div className="row mb-3 subject-assignment-buttons">
            <div className="col-md-4">
              <Form.Label>Batch</Form.Label>
              <Form.Control
                as="select"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
              >
                <option value="">Select Batch</option>
                {batchList.map((b, i) => (
                  <option key={i} value={b.batch}>
                    {b.batch}
                  </option>
                ))}
              </Form.Control>
            </div>

            <div className="col-md-4">
              <Form.Label>Course</Form.Label>
              <Form.Control
                as="select"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">Select Course</option>
                {courseList.map((c, i) => (
                  <option key={i} value={c.programmeName}>
                    {c.programmeCode}-{c.programmeName}
                  </option>
                ))}
              </Form.Control>
            </div>
          </div>
        </Form>
      </div>

      <div className="p-4 mt-2 rounded bg-white border shadow-sm batch-list-card">
        <div className="row">
          {/* Subject Bank (left) */}
          <div className="col-md-6">
            <h5 className="text-dark mb-2">📚 Subject Bank</h5>
            <div
              className="table-responsive"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              <Table bordered hover size="sm" className="mb-0">
                <thead>
                  <tr className="bg-light">
                    <th style={{ width: 40 }}></th>
                    <th style={{ width: 130 }}>Subject Code</th>
                    <th>Subject Name</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectBank.map((s) => (
                    <tr key={s.examinationId}>
                      {/* <td className="text-center">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedSubjects.some(
                      (sub) => sub.examinationId === s.examinationId
                    )}
                    onChange={() => handleSubjectSelect(s)}
                  />
                </td> */}

                      <td
                        className="text-center align-middle"
                        style={{ width: 42 }}
                      >
                        <div
                          className="d-flex justify-content-center align-items-center"
                          style={{ minHeight: "1.75rem" }}
                        >
                          <input
                            type="checkbox"
                            className="form-check-input m-0"
                            checked={selectedSubjects.some(
                              (sub) => sub.examinationId === s.examinationId
                            )}
                            onChange={() => handleSubjectSelect(s)}
                          />
                        </div>
                      </td>

                      <td>{s.paperCode}</td>
                      <td className="text-start">{s.paperName}</td>
                    </tr>
                  ))}
                  {subjectBank.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center text-muted">
                        No subjects available
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>

          {/* Selected (right) — preserves drag & drop */}
          <div className="col-md-6">
            <h5 className="text-dark mb-2">📦 Selected Subjects</h5>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="selectedSubjects">
                {(provided) => (
                  <div
                    className="table-responsive"
                    style={{ maxHeight: "400px", overflowY: "auto" }}
                  >
                    <Table bordered hover size="sm" className="mb-0">
                      <thead>
                        <tr className="bg-light">
                          <th style={{ width: 42 }} title="Drag to reorder">
                            ⇅
                          </th>
                          <th style={{ width: 100 }}>#</th>
                          <th style={{ width: 130 }}>Sub Code</th>
                          <th style={{ width: 200 }}>Subject Name</th>
                          <th style={{ width: 92 }}>Actions</th>
                        </tr>
                      </thead>

                      <tbody
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {selectedSubjects.map((s, index) => (
                          <Draggable
                            key={s.examinationId}
                            draggableId={String(s.examinationId)}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <tr
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={
                                  snapshot.isDragging ? "table-active" : ""
                                }
                              >
                                {/* drag handle cell */}
                                <td
                                  {...provided.dragHandleProps}
                                  className="text-center"
                                  style={{ cursor: "grab" }}
                                >
                                  ≡
                                </td>
                                <td>{index + 1}</td>
                                <td>{s.paperCode}</td>
                                <td className="text-start">{s.paperName}</td>
                                <td className="text-center">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleSubjectSelect(s)}
                                  >
                                    ❌
                                  </button>
                                </td>
                              </tr>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {selectedSubjects.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center text-muted">
                              Nothing selected
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <Button
          type="button"
          variant="success"
          className="rounded-pill px-5 py-2 shadow mb-2"
          style={{
            fontSize: "1.1rem",
            minWidth: "220px",
            background:
              "linear-gradient(90deg, rgba(29,161,242,1) 0%, rgba(0,212,255,1) 100%)",
            border: "none",
          }}
          onClick={handleSave}
          disabled={!selectedBatch || !selectedCourse || selectedSubjects.length === 0}
        >
          💾 Save Assignments
        </Button>
        
        {selectedSubjects.length === 0 && selectedBatch && selectedCourse && (
          <div className="text-muted mt-2 small">
            <i className="fas fa-info-circle"></i> Please select subjects from the Subject Bank to save
          </div>
        )}
      </div>

      <ConfirmationPopup
        show={showPopup}
        message={`Are you sure you want to remove "${subjectToDelete?.paperCode} - ${subjectToDelete?.paperName}"?`}
        toastMessage="Subject removed"
        onConfirm={confirmDelete}
        onCancel={() => setShowPopup(false)}
      />
    </div>
  );
};

export default CourseGroupAssignmentTab;
