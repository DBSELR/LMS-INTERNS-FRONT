import React, { useEffect, useState } from "react";
import { Form, Collapse } from "react-bootstrap";
import {
  FaChevronDown,
  FaChevronUp,
  FaFilePdf,
  FaVideo,
  FaClipboardList,
} from "react-icons/fa";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config";

const SubjectsListTab = ({ isActive }) => {
  const [batchList, setBatchList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);

  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [subjectDetails, setSubjectDetails] = useState({});
  const [open, setOpen] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isActive) {
      fetchInitialData();
    }
  }, [isActive]);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Programme/All`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setCourseList(data);
      setBatchList([...new Set(data.map((p) => p.batchName))]);
    } catch (err) {
      console.error("Failed to fetch programme data", err);
      toast.error("Failed to fetch programme data");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (selectedBatch && selectedCourse) {
      fetch(`${API_BASE_URL}/Group/All`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const filtered = data.filter(
            (g) =>
              g.batchName === selectedBatch &&
              g.programmeName === selectedCourse
          );
          setGroupList(filtered);
        });

      const course = courseList.find(
        (c) =>
          c.batchName === selectedBatch && c.programmeName === selectedCourse
      );
      const totalSems = course?.numberOfSemesters || 6;
      setSemesterOptions(Array.from({ length: totalSems }, (_, i) => i + 1));
    }
  }, [selectedBatch, selectedCourse]);

  useEffect(() => {
    const loadSubjectsAndDetails = async () => {
      if (selectedBatch && selectedCourse && selectedGroup && selectedSemester) {
        const course = courseList.find(
          (c) =>
            c.batchName === selectedBatch && c.programmeName === selectedCourse
        );
        const ProgrammeId = course?.programmeId;
        const GroupId = parseInt(selectedGroup);
        const Semester = parseInt(selectedSemester);

        if (!ProgrammeId || !GroupId || !Semester) return;

        const url = `${API_BASE_URL}/Examination/GetAssignSubjects?Batch=${selectedBatch}&ProgrammeId=${ProgrammeId}&GroupId=${GroupId}&Semester=${Semester}`;
        const token = localStorage.getItem("jwt");

        setLoading(true);
        try {
          const res = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          setAssignedSubjects(data);

          const detailsObj = {};

          // Fetch details for each subject (PDF, video, assignments)
          await Promise.all(
            data.map(async (subject) => {
              const id = subject.examinationid;
              try {
                const [assignmentRes, contentRes] = await Promise.all([
                  fetch(`${API_BASE_URL}/Assignment/count-by-course/${id}`, {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }),
                  fetch(`${API_BASE_URL}/Content/stats/${id}`, {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }),
                ]);

                const assignmentData = assignmentRes.ok ? await assignmentRes.json() : { total: 0 };
                const contentData = contentRes.ok ? await contentRes.json() : { pdfCount: 0, videoCount: 0 };

                detailsObj[id] = {
                  assignmentCount: assignmentData.total || 0,
                  pdfCount: contentData.pdfCount || 0,
                  videoCount: contentData.videoCount || 0,
                };
              } catch (err) {
                console.error(`Failed to fetch details for subject ${id}`, err);
                detailsObj[id] = { assignmentCount: 0, pdfCount: 0, videoCount: 0 };
              }
            })
          );

          setSubjectDetails(detailsObj);
        } catch (err) {
          console.error("Failed to fetch assigned subjects", err);
          toast.error("Failed to fetch assigned subjects");
        } finally {
          setLoading(false);
        }
      }
    };

    loadSubjectsAndDetails();
  }, [selectedBatch, selectedCourse, selectedGroup, selectedSemester]);

  const toggle = (id) => {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="container py-4">
      <div className="mb-4 p-4 rounded">
        <h5 className="mb-3 text-primary">
          Filter Subjects by Programme + Group + Semester
        </h5>
        <Form>
          <div className="row mb-3">
            <div className="col-md-3">
              <Form.Label>Batch</Form.Label>
              <Form.Control
                as="select"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
              >
                <option value="">Select Batch</option>
                {batchList.map((b, i) => (
                  <option key={i}>{b}</option>
                ))}
              </Form.Control>
            </div>

            <div className="col-md-3">
              <Form.Label>Programme</Form.Label>
              <Form.Control
                as="select"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">Select Programme</option>
                {courseList
                  .filter((c) => c.batchName === selectedBatch)
                  .map((c, i) => (
                    <option key={i} value={c.programmeName}>
                      {c.programmeCode}-{c.programmeName}
                    </option>
                  ))}
              </Form.Control>
            </div>

            <div className="col-md-3">
              <Form.Label>Group</Form.Label>
              <Form.Control
                as="select"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value="">Select Group</option>
                {groupList.map((g) => (
                  <option key={g.groupId} value={g.groupId}>
                    {g.groupCode}-{g.groupName}
                  </option>
                ))}
              </Form.Control>
            </div>

            <div className="col-md-3">
              <Form.Label>Semester</Form.Label>
              <Form.Control
                as="select"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                <option value="">Select Semester</option>
                {semesterOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Form.Control>
            </div>
          </div>
        </Form>
      </div>

      <div className="p-2">
        <h5 className="mb-3">📚 Subjects List</h5>
        {loading ? (
          <p>Loading...</p>
        ) : assignedSubjects.length === 0 ? (
          <p className="text-muted">
            No subjects found for the selected inputs.
          </p>
        ) : (
          assignedSubjects.map((subject) => {
            const id = subject.examinationid;
            const details = subjectDetails[id] || { pdfCount: "-", videoCount: "-", assignmentCount: "-" };
            return (
              <div key={id} className="mb-2">
                <button
                  className="w-100 text-white text-left px-3 py-2 d-flex justify-content-between align-items-center"
                  style={{
                    backgroundColor: "#5a67d8",
                    border: "none",
                    borderRadius: "25px",
                    fontWeight: "bold",
                  }}
                  onClick={() => toggle(id)}
                >
                  <span>
                    {subject.batchName} - Sem {subject.semester} - {subject.paperCode} - {subject.paperName}
                  </span>
                  <div className="d-flex align-items-center gap-3">
                    <span className="text-white">
                      <FaFilePdf /> {details.pdfCount}
                    </span>
                    <span className="text-white">
                      <FaVideo /> {details.videoCount}
                    </span>
                    <span className="text-white">
                      <FaClipboardList /> {details.assignmentCount}
                    </span>
                    {open[id] ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                </button>
                <Collapse in={!!open[id]}>
                  <div
                    id={`collapse-${id}`}
                    className="bg-white border rounded p-3 mt-1"
                  >
                    <p>
                      <FaFilePdf className="text-danger" /> <strong>PDFs:</strong> {details.pdfCount}
                    </p>
                    <p>
                      <FaVideo className="text-primary" /> <strong>Videos:</strong> {details.videoCount}
                    </p>
                    <p>
                      <FaClipboardList className="text-success" /> <strong>Assignments:</strong> {details.assignmentCount}
                    </p>
                  </div>
                </Collapse>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SubjectsListTab;
