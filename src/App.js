import React, { useEffect, useRef, useState} from "react";
import ProtectedRoute from "./components/ProtectedRoute";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import * as signalR from "@microsoft/signalr";
import Error404 from "./pages/Error404"; // adjust the path if needed
import Error500 from "./pages/Error500";
import Unauthorized from "./pages/Unauthorized";
import ChatApp from "./pages/ChatApp";
import AppCompose from "./pages/AppCompose";
import AppContact from "./pages/AppContact";
import AppEmail from "./pages/AppEmail";
import AppEmailView from "./pages/AppEmailView";
import AppFileManager from "./pages/AppFileManager";
import AppSocial from "./pages/AppSocial";
import Attendance from "./pages/Attendance";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import Departments from "./pages/Departments";
import Events from "./pages/Events";
// import ForgotPassword from "./pages/ForgotPassword";
// import Gallery from "./pages/Gallery";
// import Holiday from "./pages/Holiday";
// import Hostel from "./pages/Hostel";
import Leave from "./pages/Leave";
import LeaveRequest from "./pages/LeaveRequest";
import Library from "./pages/Library";
import RoleMenuMapping from "./pages/RoleMenuMapping";
import Login from "./pages/Login";
import Noticeboard from "./pages/Noticeboard";
import OurCentres from "./pages/OurCentres";
import PageEmpty from "./pages/PageEmpty";
import Invoices from "./pages/Invoices";
import Inbox from "./pages/InboxPage";
import InvoiceDetail from "./components/invoices/InvoiceDetail";
import PricingPage from "./pages/PricingPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import TimelinePage from "./pages/TimelinePage";
import PaymentsPage from "./pages/PaymentsPage";
import ProfessorsPage from "./pages/ProfessorsPage";
import RegisterPage from "./pages/RegisterPage";
import SettingsPage from "./pages/SettingsPage";
import StaffPage from "./pages/StaffPage";
import StudentsPage from "./pages/StudentsPage";
import TaskboardPage from "./pages/TaskboardPage";
import TransportPage from "./pages/TransportPage";
import IndexPage from "./pages/IndexPage";
import StudentDashboard from "../src/pages/StudentDashboard";
import AdminDashboard from "../src/pages/AdminDashboard";
import StudentAssignments from "./pages/StudentAssignmentList";
import StudentFeeStatus from "./pages/StudentFeeStatus";
import { jwtDecode } from "jwt-decode";
import AdminUsers from "./pages/AdminUsers";
import { getLoggedInUserId } from "../src/utils/auth";
import AdminCourses from "./pages/AdminCourses";
import CourseDashboard from "./components/courses/CourseDashboard";
import AdminSemesters from "./pages/AdminSemesters";
import AdminFees from "./pages/AdminFees";
import AdminLiveClasses from "./pages/AdminLiveClasses";
import AdminAssignments from "./pages/AdminAssignments";
import AdminCourseDashboard from "./pages/AdminCourseDashboard";
import AdminQuestions from "./pages/AdminQuestions";
import StudentQuestions from "./pages/StudentQuestions";
import InstructorQuestions from "./pages/InstructorQuestions";
import AdminExams from "./pages/AdminExams";
import AdminSubmissions from "./pages/AdminSubmissions";
import StudentExamList from "./pages/StudentExamList";
import TakeExam from "./pages/TakeExam";
import StudentSubmissionHistory from "./pages/StudentSubmissionHistory";
import InstructorGradeList from "./pages/InstructorGradeList";
import InstructorGradeView from "./pages/InstructorGradeView";
import InstructorDashboard from "./pages/InstructorDashboard";
import InstructorExamCreate from "./pages/InstructorExamCreate";
import InstructorExamList from "./pages/InstructorExamList"; // ✅ make sure this import exists
import InstructorExamEdit from "./pages/InstructorExamEdit";
import InstructorExamAttachQuestions from "./pages/InstructorExamAttachQuestions";
import InstructorAssignmentCreate from "./pages/InstructorAssignmentCreate";
import InstructorAssignmentEdit from "./pages/InstructorAssignmentEdit";
import InstructorAssignmentList from "./pages/InstructorAssignmentList";

import InstructorAssignmentGradeView from "./pages/InstructorAssignmentGradeView";
import StudentAssignmentSubmit from "./pages/StudentAssignmentSubmit";
import StudentAssignmentSubmittedList from "./pages/StudentAssignmentSubmittedList";
import InstructorAssignmentGradeList from "./pages/InstructorAssignmentGradeList";

import StudentFeeView from "./components/StudentFeeView";
import { AdminUnpaidList } from "./components/AdminUnpaidList";

import StudentLiveClassView from "./components/StudentLiveClassView";
import InstructorLiveClassManage from "./components/InstructorLiveClassManage";
import AdminLiveClassDashboard from "./components/AdminLiveClassDashboard";

import StudentAttendanceHistory from "./components/StudentAttendanceHistory";
import InstructorCourses from "./pages/InstructorCourses";
import AdminCourseViewPage from "./components/courses/AdminCourseViewPage";
import InstructorCourseViewPage from "./components/courses/InstructorCourseViewPage";
import InstructorCourseUploadPage from "./components/courses/InstructorCourseUploadPage";
import AdminCourseUploadPage from "./components/courses/AdminCourseUploadPage";
import CourseContentPage from "./components/courses/CourseContentPage";
import InstructorAttendanceView from "./components/InstructorAttendanceView";

import SubmitTicket from "./pages/SubmitTicket";
import AdminSupportTickets from "./pages/AdminSupportTickets";

import StudentProfilePage from "./components/students/StudentProfilePage";
import InstructorProfilePage from "./components/Instructor/InstructorProfilePage";
import AdminStudentOverview from "./pages/AdminStudentOverview";
import Notifications from "../src/pages/Notifications";
import ExamReportPage from "../src/pages/ExamReportPage";

import AdminProgrammes from "./pages/AdminProgrammes";
import AdminGroups from "./pages/AdminGroups";

import AdminExaminations from "./pages/AdminExaminations";
import AssignCourseModal from "./pages/AssignCourseModal";
import ReportsFeeDetails from "./components/Reports/ReportsFeeDetails";
import ReportsFacultyDetails from "./components/Reports/ReportsFacultyDetails";

import InstructorExaminations from "./pages/InstructorExaminations";

import StudentExaminations from "./pages/StudentExaminations";

import InstructorEnterMarks from "./pages/InstructorEnterMarks";
import AdminViewAllMarks from "./pages/AdminViewAllMarks";
import AdminDashboardTabs from "./pages/AdminDashboardTabs";
import AdminNoticeboardPage from "./pages/AdminNoticeboardPage";
import StudentNoticeboard from "./pages/StudentNoticeboard";
import AdminMeetingsPage from "./pages/AdminMeetingsPage";
import InstructorMeetingsPage from "./pages/InstructorMeetingsPage";
import ReportsStudentAdmission from "./components/Reports/ReportsStudentAdmission";
import AdminReportsDashboard from "./components/Reports/AdminReportsDashboard";
import StudentLibrary from "./components/library/StudentLibrary";

import "./style.css";
import StudentTickets from "./pages/supportTicketsPages/student/StudentTickets";
import StudentTicketDetails from "./pages/supportTicketsPages/student/StudentTicketDetails";
import StudentNewTicket from "./pages/supportTicketsPages/student/StudentNewTicket";
import InstructorTickets from "./pages/supportTicketsPages/instructor/InstructorTickets";
import InstructorTicketDetails from "./pages/supportTicketsPages/instructor/InstructorTicketDetails";
import AdminTickets from "./pages/supportTicketsPages/admin/AdminTickets";
import AdminTicketDetails from "./pages/supportTicketsPages/admin/AdminTicketDetails";
import MentorAssign from "./pages/MentorAssign";
import SRODashboard from "./pages/SroDashboard";
import AddDiscussions from "./pages/Discussions/AddDiscussions";
import DiscussionForum from "./pages/Discussions/DiscussionForum";
import ViewDiscussions from "./pages/Discussions/ViewDiscussions";
import UsersDashboard from "./pages/UsersDashboard";
import AdminManageAssignments from "./pages/AdminManageAssignments";
import AddObjectiveSubjectiveAssignment from "./components/courses/AddObjectiveSubjectiveAssignment";
import AdminPracticeTests from "./pages/AdminPracticeTests";
import PracticeExam from "./pages/PracticeExam";
import CaseStudy from "./pages/CaseStudy";
import Recordedclasses from "./components/courses/Recordedclasses";
 import API_BASE_URL from "./config";
import BusinessExecutiveDashboard from "./pages/BusinessExecutiveDashboard";
// at the top of App.jsx
import Footer from "./components/Footer"; // adjust path if your Footer.jsx lives elsewhere



function App() {
  const loggedInStudentId = 1;
   const connectionRef = useRef(null);

// 👇 React state, so changes re-trigger useEffect
  const [token, setToken] = useState(() => localStorage.getItem("jwt"));

  const HUB_URL = API_BASE_URL.replace("/api", "/sessionhub");

  // 👇 Watch for login/logout updates in localStorage
  useEffect(() => {
    const syncToken = () => setToken(localStorage.getItem("jwt"));
    window.addEventListener("storage", syncToken);
    return () => window.removeEventListener("storage", syncToken);
  }, []);

  useEffect(() => {
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => localStorage.getItem("jwt"), // always fresh
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    const registerHandlers = () => {
      connection.on("forceLogout", () => {
        console.log("✅ Received forceLogout event");
        localStorage.removeItem("jwt");
        setToken(null); // 👈 update state so hub stops
        window.location.href = "/";
      });
    };

    registerHandlers();

    connection.onreconnected(() => {
      console.log("🔄 Reconnected to hub");
      registerHandlers();
    });

    connection
      .start()
      .then(() => console.log("⚡ SignalR connected"))
      .catch((err) => console.error("SignalR start error:", err));

    return () => {
      connection.stop();
    };
  }, [token]);

  return (
    <Router>
      <Routes>
        {/* Example of normal route */}
        {/* <Route path="/" element={<h1>Welcome to the Dashboard</h1>} /> */}
        {/* Catch-all route for 404 */}
         {/* Public routes */}
        <Route path="*" element={<Error404 />} />
        <Route path="/500" element={<Error500 />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/" element={<Login />} />

        {/* Protected routes */}
        <Route path="/chat" element={<ProtectedRoute><ChatApp /></ProtectedRoute>} />
        <Route path="/compose" element={<ProtectedRoute><AppCompose /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><AppContact /></ProtectedRoute>} />
        <Route path="/email" element={<ProtectedRoute><AppEmail /></ProtectedRoute>} />
        <Route path="/email-view" element={<ProtectedRoute><AppEmailView /></ProtectedRoute>} />
        <Route path="/filemanager" element={<ProtectedRoute><AppFileManager /></ProtectedRoute>} />
        <Route path="/social" element={<ProtectedRoute><AppSocial /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
        <Route path="/courses/details" element={<ProtectedRoute><CourseDetails /></ProtectedRoute>} />
        <Route path="/departments" element={<ProtectedRoute><Departments /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
        <Route
          path="/ReportsStudentAdmission"
          element={<ProtectedRoute><ReportsStudentAdmission /></ProtectedRoute>}
        />
        <Route
          path="/ReportsFeeDetails"
          element={<ProtectedRoute><ReportsFeeDetails /></ProtectedRoute>}
        />
        {/* <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/holiday" element={<Holiday />} />
        <Route path="/hostel" element={<Hostel />} /> */}
        <Route path="/leave" element={<ProtectedRoute><Leave /></ProtectedRoute>} />
        <Route path="/leave-request" element={<ProtectedRoute><LeaveRequest /></ProtectedRoute>} />
        <Route
          path="/ReportsFacultyDetails"
          element={<ProtectedRoute><ReportsFacultyDetails /></ProtectedRoute>}
        />
        <Route
          path="/AdminReportsDashboard"
          element={<ProtectedRoute><AdminReportsDashboard /></ProtectedRoute>}
        />
        <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
        <Route path="/role-menu-mapping" element={<ProtectedRoute><RoleMenuMapping /></ProtectedRoute>} />
        <Route path="/studentlibrary" element={<ProtectedRoute><StudentLibrary /></ProtectedRoute>} />

        <Route path="/noticeboard" element={<ProtectedRoute><Noticeboard /></ProtectedRoute>} />
        <Route path="/our-centres" element={<ProtectedRoute><OurCentres /></ProtectedRoute>} />
        <Route path="/page-empty" element={<ProtectedRoute><PageEmpty /></ProtectedRoute>} />
        <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
        <Route path="/invoice/:id" element={<ProtectedRoute><InvoiceDetail /></ProtectedRoute>} />
        <Route path="/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/timeline" element={<ProtectedRoute><TimelinePage /></ProtectedRoute>} />
        <Route path="/professors" element={<ProtectedRoute><ProfessorsPage /></ProtectedRoute>} />
        <Route path="/register" element={<ProtectedRoute><RegisterPage /></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute><StaffPage /></ProtectedRoute>} />
        <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
        <Route path="/taskboard" element={<ProtectedRoute><TaskboardPage /></ProtectedRoute>} />
        <Route path="/transport" element={<ProtectedRoute><TransportPage /></ProtectedRoute>} />
        {/* <Route path="/" element={<IndexPage />} /> */}
        <Route path="/student-dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/business-executive-dashboard" element={<ProtectedRoute><BusinessExecutiveDashboard /></ProtectedRoute>} />
        <Route path="/assignments" element={<ProtectedRoute><StudentAssignments /></ProtectedRoute>} />
        <Route path="/admin-users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
        <Route path="/users-dashboard" element={<ProtectedRoute><UsersDashboard /></ProtectedRoute>} />
        <Route path="/admin-courses" element={<ProtectedRoute><AdminCourses /></ProtectedRoute>} />
        <Route path="/AdminDashboardTabs" element={<ProtectedRoute><AdminDashboardTabs /></ProtectedRoute>} />
        <Route path="/admin-programmes" element={<ProtectedRoute><AdminProgrammes /></ProtectedRoute>} />
        <Route path="/admin-groups" element={<ProtectedRoute><AdminGroups /></ProtectedRoute>} />
        <Route path="/my-courseware" element={<ProtectedRoute><InstructorCourses /></ProtectedRoute>} />
        <Route path="/admin/semesters" element={<ProtectedRoute><AdminSemesters /></ProtectedRoute>} />
        <Route path="/admin/fees" element={<ProtectedRoute><AdminFees /></ProtectedRoute>} />
        <Route path="/live-classes" element={<ProtectedRoute><AdminLiveClasses /></ProtectedRoute>} />
        <Route path="/admin-assignments" element={<ProtectedRoute><AdminAssignments /></ProtectedRoute>} />
        <Route path="/admin-courseware" element={<ProtectedRoute><AdminCourseDashboard /></ProtectedRoute>} />
        <Route path="/admin-questions" element={<ProtectedRoute><AdminQuestions /></ProtectedRoute>} />
        <Route path="/student-questions" element={<ProtectedRoute><StudentQuestions /></ProtectedRoute>} />
        <Route
          path="/student-questions/:examid"
          element={<ProtectedRoute><StudentQuestions /></ProtectedRoute>}
        />
        <Route path="/instructor-questions" element={<ProtectedRoute><InstructorQuestions /></ProtectedRoute>} />
        <Route path="/admin-exams" element={<ProtectedRoute><AdminExams /></ProtectedRoute>} />
        <Route
          path="/admin-manage-assignments"
          element={<ProtectedRoute><AdminManageAssignments /></ProtectedRoute>}
        />
        Manage Assignments
        <Route path="/admin-submissions" element={<ProtectedRoute><AdminSubmissions /></ProtectedRoute>} />
        <Route
          path="/student-exams"
          element={<ProtectedRoute><StudentExamList key={window.location.pathname} /></ProtectedRoute>}
        />
        {/* <Route path="/student-exams/:id" element={<TakeExam />} /> */}
        <Route path="/take-exam/:id" element={<ProtectedRoute><TakeExam /></ProtectedRoute>} />
        <Route path="/practice-exam/:id" element={<ProtectedRoute><PracticeExam /></ProtectedRoute>} />
        <Route
          path="/student-submissions"
          element={<ProtectedRoute><StudentSubmissionHistory /></ProtectedRoute>}
        />
        <Route
          path="/instructor/grade-list"
          element={<ProtectedRoute><InstructorGradeList /></ProtectedRoute>}
        />
        <Route path="/instructor/grade/:id" element={<ProtectedRoute><InstructorGradeView /></ProtectedRoute>} />
        <Route
          path="/fee-status"
          element={<ProtectedRoute><StudentFeeStatus studentId={getLoggedInUserId()} /></ProtectedRoute>}
        />
        <Route path="/instructor-dashboard" element={<ProtectedRoute><InstructorDashboard /></ProtectedRoute>} />
        <Route path="/sro-dashboard" element={<ProtectedRoute><SRODashboard /></ProtectedRoute>} />
        <Route
          path="/instructor/exam-create"
          element={<ProtectedRoute><InstructorExamCreate /></ProtectedRoute>}
        />
        <Route path="/admin/exam-create" element={<ProtectedRoute><InstructorExamCreate /></ProtectedRoute>} />
        <Route path="/instructor/exams" element={<ProtectedRoute><InstructorExamList /></ProtectedRoute>} />
        <Route
          path="/instructor/exams/edit/:id"
          element={<ProtectedRoute><InstructorExamEdit /></ProtectedRoute>}
        />
        <Route
          path="/instructor/exams/:id/questions"
          element={<ProtectedRoute><InstructorExamAttachQuestions /></ProtectedRoute>}
        />
        <Route
          path="/instructor/assignments/create"
          element={<ProtectedRoute><InstructorAssignmentCreate /></ProtectedRoute>}
        />
        <Route
          path="/instructor/assignments/edit/:id"
          element={<ProtectedRoute><InstructorAssignmentEdit /></ProtectedRoute>}
        />
        <Route
          path="/instructor/assignments"
          element={<ProtectedRoute><InstructorAssignmentList /></ProtectedRoute>}
        />
        <Route
          path="/instructor/assignments/grade-list"
          element={<ProtectedRoute><InstructorAssignmentGradeList /></ProtectedRoute>}
        />
        <Route
          path="/instructor/assignments/grade/:id"
          element={<ProtectedRoute><InstructorAssignmentGradeView /></ProtectedRoute>}
        />
        <Route
          path="/student/assignments/submit/:id"
          element={<ProtectedRoute><StudentAssignmentSubmit /></ProtectedRoute>}
        />
        <Route
          path="/submitted-assignments"
          element={<ProtectedRoute><StudentAssignmentSubmittedList /></ProtectedRoute>}
        />
        <Route
          path="/instructor/assignment-submissions"
          element={<ProtectedRoute><InstructorAssignmentGradeList /></ProtectedRoute>}
        />
        <Route
          path="/fees/student"
          element={<ProtectedRoute><StudentFeeView studentId={loggedInStudentId} /></ProtectedRoute>}
        />
        <Route path="/fees/admin" element={<ProtectedRoute><AdminUnpaidList /></ProtectedRoute>} />
        {/* Live Class Management */}
        <Route
          path="/student/live-classes"
          element={<ProtectedRoute><StudentLiveClassView /></ProtectedRoute>}
        />
        <Route
          path="/instructor/live-classes"
          element={<ProtectedRoute><InstructorLiveClassManage /></ProtectedRoute>}
        />
        <Route
          path="/admin-live-classes"
          element={<ProtectedRoute><AdminLiveClassDashboard /></ProtectedRoute>}
        />
        {/* not using  */}
        <Route
          path="/student/attendance"
          element={<ProtectedRoute><StudentAttendanceHistory /></ProtectedRoute>}
        />
        <Route
          path="/instructor/attendance"
          element={<ProtectedRoute><InstructorAttendanceView /></ProtectedRoute>}
        />
        {/* <Route path="/instructor/courses" element={<InstructorCourses />} /> */}
        <Route
          path="/view-course-content/:courseId"
          element={<ProtectedRoute><InstructorCourseViewPage /></ProtectedRoute>}
        />

         <Route
          path="/recorded-classes"
          element={<ProtectedRoute><Recordedclasses /></ProtectedRoute>}
        />

        <Route
          path="/admin/view-course-content/:courseId"
          element={<ProtectedRoute><AdminCourseViewPage /></ProtectedRoute>}
        />
        <Route
          path="/instructor/upload-course-content/:courseId"
          element={<ProtectedRoute><InstructorCourseUploadPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/upload-course-content/:courseId"
          element={<ProtectedRoute><AdminCourseUploadPage /></ProtectedRoute>}
        />
        <Route
          path="/course-content/:courseId"
          element={<ProtectedRoute><CourseContentPage /></ProtectedRoute>}
        />
        AddObjectiveSubjectiveAssignment
        <Route
          path="/add-objective-subjective-assignment"
          element={<ProtectedRoute><AddObjectiveSubjectiveAssignment /></ProtectedRoute>}
        />
        AdminPracticeTests
        <Route path="/admin-practice-tests" element={<ProtectedRoute><AdminPracticeTests /></ProtectedRoute>} />
        {/* <Route path="/support-ticket" element={<SubmitTicket />} />
        <Route path="/admin/support" element={<AdminSupportTickets />} /> */}
        {/* Student Support Tickets */}
        <Route path="/student/support-tickets" element={<ProtectedRoute><StudentTickets /></ProtectedRoute>} />
        <Route
          path="/student/support-tickets/details/:id"
          element={<ProtectedRoute><StudentTicketDetails /></ProtectedRoute>}
        />
        <Route
          path="/student/support-tickets/new"
          element={<ProtectedRoute><StudentNewTicket /></ProtectedRoute>}
        />
        {/* Instructor Support Tickets */}
        <Route
          path="/instructor/support-tickets"
          element={<ProtectedRoute><InstructorTickets /></ProtectedRoute>}
        />
        <Route
          path="/instructor/support-tickets/details/:id"
          element={<ProtectedRoute><InstructorTicketDetails /></ProtectedRoute>}
        />
        {/* Admin Support Tickets */}
        <Route path="/admin/support-tickets" element={<ProtectedRoute><AdminTickets /></ProtectedRoute>} />
        <Route
          path="/admin/support-tickets/details/:id"
          element={<ProtectedRoute><AdminTicketDetails /></ProtectedRoute>}
        />
        <Route path="/CourseDashboard" element={<ProtectedRoute><CourseDashboard /></ProtectedRoute>} />
        <Route
          path="/student-profile"
          element={<ProtectedRoute><StudentProfilePage studentId={getLoggedInUserId()} /></ProtectedRoute>}
        />
        <Route
          path="/instructor-profile"
          element={<ProtectedRoute><InstructorProfilePage instructorId={getLoggedInUserId()} /></ProtectedRoute>}
        />
        <Route
          path="/AdminStudentOverview"
          element={<ProtectedRoute><AdminStudentOverview /></ProtectedRoute>}
        />
        <Route path="/Notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/exam-report/:examId" element={<ProtectedRoute><ExamReportPage /></ProtectedRoute>} />
        <Route path="/admin-examinations" element={<ProtectedRoute><AdminExaminations /></ProtectedRoute>} />
        <Route
          path="/instructor-examinations"
          element={<ProtectedRoute><InstructorExaminations /></ProtectedRoute>}
        />
        <Route path="/student-examinations" element={<ProtectedRoute><StudentExaminations /></ProtectedRoute>} />
        <Route
          path="/InstructorEnterMarks/:examId"
          element={<ProtectedRoute><InstructorEnterMarks /></ProtectedRoute>}
        />
        <Route path="/admin-all-marks" element={<ProtectedRoute><AdminViewAllMarks /></ProtectedRoute>} />
        <Route
          path="/AdminNoticeboardPage"
          element={<ProtectedRoute><AdminNoticeboardPage /></ProtectedRoute>}
        />
        <Route path="/StudentNoticeboard" element={<ProtectedRoute><StudentNoticeboard /></ProtectedRoute>} />
        <Route path="/AdminMeetingsPage" element={<ProtectedRoute><AdminMeetingsPage /></ProtectedRoute>} />
        <Route
          path="/InstructorMeetingsPage"
          element={<ProtectedRoute><InstructorMeetingsPage /></ProtectedRoute>}
        />
        <Route path="/AssignCourseModal" element={<ProtectedRoute><AssignCourseModal /></ProtectedRoute>} />
        <Route path="/mentor-assign" element={<ProtectedRoute><MentorAssign /></ProtectedRoute>} />
        <Route path="/adddiscussions" element={<ProtectedRoute><AddDiscussions /></ProtectedRoute>} />
        <Route path="/discussionforum" element={<ProtectedRoute><DiscussionForum /></ProtectedRoute>} />
        <Route path="/viewdiscussions" element={<ProtectedRoute><ViewDiscussions /></ProtectedRoute>} />
        <Route path="/casestudy" element={<ProtectedRoute><CaseStudy /></ProtectedRoute>} />

      </Routes>

      {/* ✅ Global footer */}
    <Footer />

    
      {/* ✅ Place this once globally */}
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        limit={1}
      />
    </Router>
  );
}

export default App;
