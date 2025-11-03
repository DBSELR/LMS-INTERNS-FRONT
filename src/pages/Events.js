import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import CalendarView from "../components/events/CalendarView";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";

function Events() {
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      console.log("✅ Decoded JWT:", decoded);
      const studentId = decoded["UserId"] || decoded.userId || decoded.nameid;
      console.log("👨‍🎓 Student ID from JWT:", studentId);

      const fetchClasses = fetch(`${API_BASE_URL}/LiveClass/Student/${studentId}`, {
          method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`, // ✅ Attach JWT token here
        },
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch live classes");
        return res.json();
      });

      const fetchExams = fetch(`${API_BASE_URL}/InstructorExam/StudentExam/${studentId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`, // ✅ Attach JWT token here
        },
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch exams");
        return res.json();
      });

      Promise.all([fetchClasses, fetchExams])
        .then(([classData, examData]) => {
          console.log("📥 Fetched Classes:", classData);
          console.log("📥 Fetched Exams:", examData);
          setClasses(Array.isArray(classData) ? classData.filter((cls) => cls !== null) : []);
          setExams(Array.isArray(examData) ? examData.filter((exam) => exam !== null) : []);
        })
        .catch((err) => {
          console.error("❌ Fetch error", err);
          toast.error("Error fetching events.");
        })
        .finally(() => setLoading(false));
    } catch (error) {
      console.error("❌ JWT decode error", error);
      toast.error("Invalid user token.");
      setLoading(false);
    }
  }, []);

  const getClassStatus = (cls) => {
    const now = new Date();
    const [year, month, day] = cls.liveDate.split("T")[0].split("-");
    const [startHour, startMinute] = cls.startTime.split(":").map(Number);
    const [endHour, endMinute] = cls.endTime.split(":").map(Number);

    const startDateTime = new Date(year, month - 1, day, startHour, startMinute);
    const endDateTime = new Date(year, month - 1, day, endHour, endMinute);
    const joinStartTime = new Date(startDateTime.getTime() - 10 * 60 * 1000);

    if (now < joinStartTime) return "Scheduled";
    if (now >= joinStartTime && now <= endDateTime) return "Live Now";
    return "Completed";
  };

  const classEvents = classes.map((cls) => {
    const status = getClassStatus(cls);
    const [year, month, day] = cls.liveDate.split("T")[0].split("-");
    const [startHour, startMinute] = cls.startTime.split(":").map(Number);
    const [endHour, endMinute] = cls.endTime.split(":").map(Number);

    const start = new Date(year, month - 1, day, startHour, startMinute);
    const end = new Date(year, month - 1, day, endHour, endMinute);

    const color =
      status === "Scheduled" ? "#ffc107" :
      status === "Live Now" ? "#28a745" :
      "#dc3545";

    return {
      id: `class-${cls.liveClassId}`,
      title: `${cls.className} (${status})`,
      start: start.toISOString(),
      end: end.toISOString(),
      backgroundColor: color,
      borderColor: color,
      extendedProps: {
        instructor: cls.instructorName,
        subject: `${cls.papercode} - ${cls.papername}`,
        meetingLink: cls.meetingLink,
        type: "Live Class",
        status: status,
        textColor: cls.color || "#000",
      },
    };
  });

  const examEvents = exams.map((exam) => {
    const examDate = new Date(exam.examDate);
    if (examDate.getHours() === 0 && examDate.getMinutes() === 0) {
      examDate.setHours(9);
      examDate.setMinutes(0);
    }
    const endDate = new Date(examDate.getTime() + exam.durationMinutes * 60000);

    const typeLabel = {
      MA: "MCQ Assignment",
      MT: "MCQ Theory",
      DA: "Descriptive Assignment",
      DT: "Descriptive Theory",
    }[exam.examType] || "Exam";

    const textColor = exam.cOLOR || "#000";

    return {
      id: `exam-${exam.examid}`,
      title: `${exam.title} (${typeLabel})`,
      start: examDate.toISOString(),
      end: endDate.toISOString(),
      backgroundColor: "#17a2b8",
      borderColor: "#17a2b8",
      extendedProps: {
        duration: exam.durationMinutes,
        type: typeLabel,
        examStatus: exam.examStatus, // ✅ use this for dot color logic
        textColor: textColor,
      },
    };
  });

  const allEvents = [...classEvents, ...examEvents];

  console.log("🟢 Class Events:", classEvents);
  console.log("🟠 Exam Events:", examEvents);
  console.log("📅 All Events:", allEvents);

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader"></div>
        </div>
      )}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Student" />

      <div className="section-wrapper">
             <div className="page admin-dashboard pt-0">
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
             <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
              <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                <i class="fa-solid fa-calendar"></i> Events Calendar
              </h2>
              <p className="text-muted mb-0 dashboard-hero-sub">
                View your Live classes and Exam schedule here
              </p>
            </div>

            <div className="card shadow-sm">
              <div className="card-header bg-success text-white d-flex align-items-center">
                <i className="fa fa-calendar-o mr-2"></i>
                <h6 className="mb-0">Your Live Class & Exam Calendar</h6>
              </div>

              <div className="card-body">
                {allEvents.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <h5>No events found in your schedule.</h5>
                  </div>
                ) : (
                  <CalendarView events={allEvents} />
                )}
              </div>
            </div>
          </div>
        </div>
         
      </div>
      </div>
    </div>
  );
}

export default Events;
