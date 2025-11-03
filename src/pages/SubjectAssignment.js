import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import API_BASE_URL from "../config";

const SubjectAssignment = () => {
  const [programmeList, setProgrammeList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);

  const [selectedProgramme, setSelectedProgramme] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  const [subjectBank, setSubjectBank] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    fetch(`${API_BASE_URL}/Programme/All`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setProgrammeList(data);
        setBatchList([...new Set(data.map(p => p.batchName))]);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (selectedProgramme && selectedBatch) {
      fetch(`${API_BASE_URL}/Course/Groups?programmeName=${encodeURIComponent(selectedProgramme)}&batchName=${encodeURIComponent(selectedBatch)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => setGroupList(data))
        .catch(err => {
          console.error(err);
          alert("Unable to fetch groups.");
        });

      const semesterChecks = Array.from({ length: 10 }, (_, i) => i + 1);
      Promise.all(
        semesterChecks.map(s =>
          fetch(`${API_BASE_URL}/Course/ByProgrammeAndSemester?programme=${encodeURIComponent(selectedProgramme)}&semester=${s}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
            .then(res => res.ok ? res.json() : [])
            .then(data => ({ semester: s, hasData: data.length > 0 }))
            .catch(() => ({ semester: s, hasData: false }))
        )
      ).then(results => {
        const validSemesters = results.filter(r => r.hasData).map(r => r.semester);
        setSemesterOptions(validSemesters);
      });
    }
  }, [selectedProgramme, selectedBatch]);

  useEffect(() => {
    if (!selectedProgramme || !selectedSemester) return;
    fetch(`${API_BASE_URL}/Course/ByProgrammeAndSemester?programme=${encodeURIComponent(selectedProgramme)}&semester=${selectedSemester}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setSubjectBank(data))
      .catch(err => {
        console.error(err);
        alert("Unable to load subjects.");
      });
  }, [selectedProgramme, selectedSemester]);

  const handleSelect = (subject) => {
    const exists = assignedSubjects.find(s => s.courseId === subject.courseId);
    if (exists) {
      setAssignedSubjects(prev => prev.filter(s => s.courseId !== subject.courseId));
    } else {
      setAssignedSubjects(prev => [...prev, subject]);
    }
  };

  const handleSave = async () => {
    const payload = {
      batch: selectedBatch,
      programme: selectedProgramme,
      group: selectedGroup,
      semester: selectedSemester,
      subjectIds: assignedSubjects.map(s => s.courseId)
    };

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Course/AssignSubjectsById`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      alert("Subjects assigned successfully....!");
    } catch (err) {
      alert(err.message);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(assignedSubjects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setAssignedSubjects(items);
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Subject Master Page - Course Module</h3>

      <div className="row mb-4 g-3 align-items-end">
        <div className="col-md-3">
          <label className="form-label fw-bold">Batch</label>
          <div className="input-group shadow-sm">
    
            <select className="form-select rounded-end" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
              <option value="">Select Batch</option>
              {batchList.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div className="col-md-3">
          <label className="form-label fw-bold">Programme</label>
          <div className="input-group shadow-sm">

            <select className="form-select rounded-end" value={selectedProgramme} onChange={e => setSelectedProgramme(e.target.value)}>
              <option value="">Select Programme</option>
              {[...new Set(programmeList.map(p => p.programmeName))].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
        {/* <div className="col-md-3">
          <label className="form-label fw-bold">Group</label>
          <div className="input-group shadow-sm">
 
            <select className="form-select rounded-end" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
              <option value="">Select Group</option>
              {groupList.map((g, idx) => <option key={idx} value={g}>{g}</option>)}
            </select>
          </div>
        </div> */}
        <div className="col-md-3">
          <label className="form-label fw-bold">Semester</label>
          <div className="input-group shadow-sm">
       
            <select className="form-select rounded-end" value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)}>
              <option value="">Select Semester</option>
              {semesterOptions.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <h5>Subject Bank</h5>
          <ul className="list-group">
            {subjectBank.map((subj) => (
              <li key={subj.courseId} className="list-group-item">
                <input
                  type="checkbox"
                  checked={assignedSubjects.find(s => s.courseId === subj.courseId)}
                  onChange={() => handleSelect(subj)}
                /> {subj.courseCode} - {subj.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="col-md-6">
          <h5>📌 Selected Subjects</h5>
         <DragDropContext onDragEnd={onDragEnd}>
  <Droppable droppableId="assignedSubjects">
    {(provided) => (
      <ul
        className="list-group"
        {...provided.droppableProps}
        ref={provided.innerRef}
      >
        {assignedSubjects.map((subj, index) => (
          <Draggable
            key={subj.courseId}
            draggableId={String(subj.courseId)}
            index={index}
          >
            {(provided) => (
              <li
                className="list-group-item d-flex justify-content-between"
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                {subj.courseCode} - {subj.name}
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleSelect(subj)}
                >
                  🗑
                </button>
              </li>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </ul>
    )}
  </Droppable>
</DragDropContext>

        </div>
      </div>

      <div className="text-center mt-4">
        <button className="btn btn-primary px-5" onClick={handleSave}>Save Subjects</button>
      </div>
    </div>
  );
};

export default SubjectAssignment;
