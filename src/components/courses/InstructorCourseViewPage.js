// ✅ Final – Any-file modal WITH PROGRESS – InstructorCourseViewPage.js
import React, { useEffect, useState, useRef } from "react";
import HeaderTop from "../../components/HeaderTop";
import RightSidebar from "../../components/RightSidebar";
import LeftSidebar from "../../components/LeftSidebar";
import Footer from "../../components/Footer";
import { useParams, useLocation, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "../../config";
import UniversalFileViewerModal from "../UniversalFileViewerModal.jsx";

/* =========================
   Debug helpers (toggleable)
   ========================= */
const DEBUG = true;
const tag = "ICVP";
const mask = (str) =>
  typeof str === "string" && str.length > 12
    ? `${str.slice(0, 4)}…${str.slice(-4)}`
    : str;
const log = (...args) => DEBUG && console.log(`[${tag}]`, ...args);
const warn = (...args) => DEBUG && console.warn(`[${tag}]`, ...args);
const error = (...args) => DEBUG && console.error(`[${tag}]`, ...args);

/* =========================
   URL helpers
   ========================= */
function normalizeUrl(raw) {
  if (!raw) return "";
  let u = String(raw).trim();
  if (
    (u.startsWith('"') && u.endsWith('"')) ||
    (u.startsWith("'") && u.endsWith("'"))
  ) {
    u = u.slice(1, -1);
  }
  u = u.replace(/&amp;/g, "&");
  u = u.replace(/%22$/i, "");
  return u;
}
function isHttpUrl(u) {
  return /^https?:\/\//i.test(u || "");
}
function getApiOrigin() {
  try {
    const u = new URL(API_BASE_URL);
    const path = u.pathname.replace(/\/+$/, "");
    if (path.toLowerCase().endsWith("/api")) {
      const stripped = path.replace(/\/api$/i, "");
      return `${u.origin}${stripped || ""}`;
    }
    return u.origin;
  } catch {
    try {
      const u = new URL(window.location.origin);
      return u.origin;
    } catch {
      return "";
    }
  }
}
function toAbsoluteLocal(origin, pathOrUrl) {
  if (!pathOrUrl) return "";
  if (isHttpUrl(pathOrUrl)) return pathOrUrl;
  if (!origin) return pathOrUrl;
  if (pathOrUrl.startsWith("/")) return `${origin}${pathOrUrl}`;
  return `${origin}/${pathOrUrl}`;
}

async function safeFetchJson(
  url,
  options = {},
  { label = "", retries = 0, signal } = {}
) {
  const attempt = async () => {
    const res = await fetch(url, { ...options, signal });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(`[${tag}] Fetch failed${label ? " - " + label : ""}`, {
        url,
        status: res.status,
        body: text,
      });
      throw new Error(`HTTP ${res.status} ${label || ""}`.trim());
    }
    return res.json();
  };
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      return await attempt();
    } catch (e) {
      lastErr = e;
      if (i < retries) await new Promise((r) => setTimeout(r, 250 * (i + 1)));
    }
  }
  throw lastErr;
}

/* =========================
   Component
   ========================= */
function InstructorCourseViewPage() {
  const { courseId } = useParams();
  const location = useLocation();

  const courseName = location.state?.paperName || "Unknown courseName";
  const courseCode = location.state?.paperCode || "Unknown courseCode";
  const batchName = location.state?.batchName || "Unknown Batch";
  const courseDisplayName = location.state?.name || "Unknown Name";
  const semester = location.state?.semester || "Unknown Semester";
  const examId = location.state?.examinationID || "Unknown examination ID";
  const className = location.state?.class || "Unknown Class";

  const [rawContent, setRawContent] = useState([]);
  const [unitTitleByUnit, setUnitTitleByUnit] = useState({});

  const [materials, setMaterials] = useState([]);
  const [ebooks, setEBOOKS] = useState([]);
  const [webresources, setwebresources] = useState([]);
  const [faq, setfaq] = useState([]);
  const [misconceptions, setmisconceptions] = useState([]);
  const [practiceassignment, setpracticeassignment] = useState([]);
  const [studyguide, setstudyguide] = useState([]);
  const [videos, setVideos] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);

  // === Any-file viewer modal state ===
  const [viewerShow, setViewerShow] = useState(false);
  const [viewerUrl, setViewerUrl] = useState("");
  const [currentProgressKey, setCurrentProgressKey] = useState(null);
  const [progressVersion, setProgressVersion] = useState(0); // force re-render when progress changes

  const [activeUnit, setActiveUnit] = useState("");
  const [allUnits, setAllUnits] = useState([]);

  const sectionRefs = {
    ebooks: useRef(null),
    videos: useRef(null),
    faq: useRef(null),
    misconceptions: useRef(null),
    practiceassignment: useRef(null),
    studyguide: useRef(null),
    webresources: useRef(null),
  };

  const apiOrigin = getApiOrigin();
  const jwt = localStorage.getItem("jwt") || "";

  // Delete helpers
  function getContentId(obj) {
    return (
      obj?.contentId ??
      obj?.ContentId ??
      obj?.id ??
      obj?.Id ??
      obj?.cid ??
      obj?.Cid ??
      null
    );
  }
  const [deletingId, setDeletingId] = useState(null);

  function removeContentLocallyById(id) {
    const drop = (arr) =>
      Array.isArray(arr) ? arr.filter((x) => getContentId(x) !== id) : [];
    setEBOOKS((p) => drop(p));
    setVideos((p) => drop(p));
    setwebresources((p) => drop(p));
    setfaq((p) => drop(p));
    setmisconceptions((p) => drop(p));
    setpracticeassignment((p) => drop(p));
    setstudyguide((p) => drop(p));
    setMaterials((p) => drop(p));
  }

  async function handleDeleteContent(item, e) {
    if (e) e.stopPropagation();
    const id = getContentId(item);
    if (!id) {
      warn("Cannot delete: no content id on item", item);
      alert("Delete failed: content id not found.");
      return;
    }
    if (
      !window.confirm(
        "Are you sure you want to delete this content? This cannot be undone."
      )
    ) {
      return;
    }
    try {
      setDeletingId(id);
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Content/Delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const bodyText = await res.text().catch(() => "");
      log("DELETE Content response", {
        status: res.status,
        ok: res.ok,
        bodyText,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${bodyText || ""}`);

      // Clean cached progress keys (best effort)
      try {
        const fileUrlAbs = item?.fileUrl
          ? toAbsoluteLocal(apiOrigin, item.fileUrl)
          : "";
        [
          `webresource-progress-${fileUrlAbs}`,
          `faq-progress-${fileUrlAbs}`,
          `practiceassignment-progress-${fileUrlAbs}`,
          `studyguide-progress-${fileUrlAbs}`,
        ].forEach((k) => localStorage.removeItem(k));
      } catch {}

      removeContentLocallyById(id);
      alert("✅ Content deleted successfully.");
    } catch (e2) {
      error("Delete failed", e2);
      alert("❌ Delete failed. See console for details.");
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    log("Component mounted", {
      courseId,
      examId,
      courseName,
      courseCode,
      batchName,
      semester,
      courseDisplayName,
      apiOrigin,
      API_BASE_URL,
    });
    return () => log("Component unmounted");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
     File view + progress
     ========================= */
  const cleanPath = (u) =>
    String(u || "").replace(/^['"]|['"]$/g, "").replace(/&amp;/g, "&");

  const buildProgressKey = (sectionKey, fileUrlAbs) => {
    switch (sectionKey) {
      case "webresources":
        return `webresource-progress-${fileUrlAbs}`;
      case "faq":
        return `faq-progress-${fileUrlAbs}`;
      case "practiceassignment":
        return `practiceassignment-progress-${fileUrlAbs}`;
      case "studyguide":
        return `studyguide-progress-${fileUrlAbs}`;
      default:
        return `file-progress-${fileUrlAbs}`;
    }
  };

  const getProgressForItem = (sectionKey, item) => {
    const raw = cleanPath(item.fileUrl);
    if (!raw) return { value: 0, key: null };
    const fullUrl = raw.startsWith("http")
      ? raw
      : `${apiOrigin.replace(/\/+$/, "")}/${raw.replace(/^\/+/, "")}`;
    const key = buildProgressKey(sectionKey, fullUrl);
    const val = parseInt(localStorage.getItem(key), 10);
    const value = Number.isFinite(val) && val >= 0 && val <= 100 ? val : 0;
    return { value, key };
  };

  const handleViewFile = (sectionKey, item) => {
    const raw = cleanPath(item.fileUrl);
    if (!raw) return;
    const fullUrl = raw.startsWith("http")
      ? raw
      : `${apiOrigin.replace(/\/+$/, "")}/${raw.replace(/^\/+/, "")}`;

    const { key } = getProgressForItem(sectionKey, item);
    setCurrentProgressKey(key || buildProgressKey(sectionKey, fullUrl));

    setViewerUrl(fullUrl);
    setViewerShow(true);
  };

  const handleViewerHide = () => {
    // When user closes the viewer, mark this file as 100% complete
    if (currentProgressKey) {
      const existing = parseInt(localStorage.getItem(currentProgressKey), 10);
      const updated =
        Number.isFinite(existing) && existing > 0
          ? Math.max(existing, 100)
          : 100;
      localStorage.setItem(currentProgressKey, updated);
      setProgressVersion((v) => v + 1); // trigger re-render
    }
    setViewerShow(false);
    setViewerUrl("");
    setCurrentProgressKey(null);
  };

  /* =========================
     Auth / data loads
     ========================= */
  const [practiceExams, setPracticeExams] = useState([]);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const extractedUserId = parseInt(decoded?.UserId);
        const extractedRole =
          decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];
        log("JWT decoded", {
          userId: extractedUserId,
          role: extractedRole,
          token: `Bearer ${mask(token)}`,
        });
        setUserId(extractedUserId);
        setRole(extractedRole);
      } catch (err) {
        error("Error decoding JWT:", err);
      }
    } else {
      warn("No JWT found in localStorage");
    }
  }, []);

  useEffect(() => {
    const fetchPracticeExams = async () => {
      if (!activeUnit || !userId) return;
      const unitId = Number(String(activeUnit).split("-")[1]);
      const examinationId = parseInt(examId);
      const url = `${API_BASE_URL}/InstructorExam/StudentPracticeExams/?userId=${userId}&UnitId=${unitId}&examinationid=${examinationId}`;
      const token = localStorage.getItem("jwt");

      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) setPracticeExams(data);
        else setPracticeExams([]);
      } catch (err) {
        error("Error fetching practice exams:", err);
        setPracticeExams([]);
      }
    };
    fetchPracticeExams();
  }, [activeUnit, examId, userId]);

  const [adminPracticeTests, setAdminPracticeTests] = useState([]);
  useEffect(() => {
    const fetchAdminPracticeTests = async () => {
      if (!userId || !activeUnit || !examId) return;
      const unitId = Number(String(activeUnit).split("-")[1]);
      const examinationId = parseInt(examId);
      const url = `${API_BASE_URL}/AssignmentSubmission/GetPracticeExamsSubmissionsById/?instructorId=${userId}&UnitId=${unitId}&examinationid=${examinationId}`;
      const token = localStorage.getItem("jwt");

      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errorText = await res.text().catch(() => "");
          error("AdminPracticeTests API error", {
            status: res.status,
            url,
            responseText: errorText,
          });
          if (res.status === 500) {
            setAdminPracticeTests([]);
            return;
          }
          throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
        }
        const data = await res.json();
        if (Array.isArray(data)) setAdminPracticeTests(data);
        else setAdminPracticeTests([]);
      } catch (err) {
        error("Error fetching Admin Practice Tests:", err);
        setAdminPracticeTests([]);
      }
    };
    fetchAdminPracticeTests();
  }, [userId, activeUnit, examId]);

  useEffect(() => {
    if (!courseId) return;
    const token = localStorage.getItem("jwt");
    const headers = { Authorization: `Bearer ${token}` };
    const ac = new AbortController();

    (async () => {
      try {
        const [content, allAssignments, allLiveClasses] = await Promise.all([
          safeFetchJson(
            `${API_BASE_URL}/Content/Course/${courseId}`,
            { headers, signal: ac.signal },
            { label: "Content/Course", retries: 1 }
          ),
          safeFetchJson(
            `${API_BASE_URL}/Assignment/GetAllAssignments`,
            { headers, signal: ac.signal },
            { label: "Assignments", retries: 1 }
          ),
          safeFetchJson(
            `${API_BASE_URL}/LiveClass/All`,
            { headers, signal: ac.signal },
            { label: "LiveClass", retries: 1 }
          ),
        ]);

        setRawContent(Array.isArray(content) ? content : []);

        const ci = (v) => String(v || "").toLowerCase();
        setEBOOKS(content.filter((c) => ci(c.contentType) === "ebook"));
        setVideos(content.filter((c) => ci(c.contentType) === "video"));
        setwebresources(
          content.filter((c) => ci(c.contentType) === "webresources")
        );
        setfaq(content.filter((c) => ci(c.contentType) === "faq"));
        setmisconceptions(
          content.filter((c) => ci(c.contentType) === "misconceptions")
        );
        setpracticeassignment(
          content.filter((c) => ci(c.contentType) === "practiceassignment")
        );
        setstudyguide(
          content.filter((c) => ci(c.contentType) === "studyguide")
        );
        setMaterials(content.filter((c) => ci(c.contentType) === "pdf"));

        const cid = parseInt(courseId);
        setAssignments(
          (allAssignments || []).filter((a) => a.examinationid === cid)
        );
        setLiveClasses(
          (allLiveClasses || []).filter((lc) => lc.examinationID === cid)
        );
      } catch (err) {
        console.error("[ICVP] Content bundle load failed", err);
      }
    })();

    return () => ac.abort();
  }, [courseId]);

  useEffect(() => {
    const toStr = (v) => (v == null ? "" : String(v).trim());
    const getUnit = (it) => toStr(it.unit ?? it.Unit);
    const getTitle = (it) =>
      toStr(it.title ?? it.Title ?? it.unitTitle ?? it.UnitTitle);

    const unitSet = new Set();
    const titleMap = {};

    for (const it of rawContent || []) {
      const u = getUnit(it);
      if (!u) continue;
      unitSet.add(u);
      const t = getTitle(it);
      if (t && !titleMap[u]) titleMap[u] = t;
    }

    if (unitSet.size > 0) {
      const byUnit = {};
      for (const it of rawContent || []) {
        const u = getUnit(it);
        if (!u) continue;
        (byUnit[u] ||= []).push(it);
      }
      for (const u of unitSet) {
        if (!titleMap[u]) {
          const firstWithTitle = (byUnit[u] || []).find((x) => getTitle(x));
          if (firstWithTitle) titleMap[u] = getTitle(firstWithTitle);
        }
      }
    }

    const num = (u) => {
      const m = /(\d+)$/.exec(u.replace(/\s+/g, ""));
      return m ? parseInt(m[1], 10) : 0;
    };
    const sortedUnits = Array.from(unitSet).sort((a, b) => num(a) - num(b));

    setAllUnits(sortedUnits);
    setUnitTitleByUnit(titleMap);

    if (!activeUnit && sortedUnits.length > 0) {
      setActiveUnit(sortedUnits[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawContent]);

  const renderEmptyMessage = (label) => (
    <div className="text-muted text-center py-3">No {label} available.</div>
  );

  const filteredByUnit = (data) =>
    data.filter((item) => (item.unit || "").trim() === activeUnit);

  const filteredWebResources = filteredByUnit(webresources);
  const filteredFAQ = filteredByUnit(faq);
  const filteredPracticeAssignment = filteredByUnit(practiceassignment);
  const filteredStudyGuide = filteredByUnit(studyguide);

  const getProgressColor = (p) =>
    p < 30 ? "#e74c3c" : p < 70 ? "#f39c12" : "#27ae60";

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Instructor" />

      <div className="section-wrapper">
        <div className="page admin-dashboard pt-0">
          <div className="section-body mt-3 pt-0">
            <div className="container-fluid">
              <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div style={{ width: "150px" }}></div>
                  <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                    View Course Content
                  </h2>
                  <a
                    href="/my-courseware"
                    className="btn btn-outline-primary mt-3 mt-md-0"
                  >
                    <i className="fa fa-arrow-left mr-1"></i> Back to Courseware
                  </a>
                </div>
                <h5 className="text-muted mb-0 mt-0 dashboard-hero-sub">
                  <strong>{`${batchName} - ${className} - ${courseCode} - ${courseName} `}</strong>
                </h5>
              </div>
            </div>

            {/* Unit Tabs */}
            <div className="unit-tabs mb-4">
              {allUnits.map((unit) => {
                const titleForUnit = unitTitleByUnit[unit] || "No title found";
                return (
                  <button
                    key={unit}
                    className={`unit-tab ${
                      activeUnit === unit ? "active" : ""
                    }`}
                    onClick={() => setActiveUnit(unit)}
                    title={`${titleForUnit}`}
                  >
                    {unit}
                  </button>
                );
              })}

              <Link
                to="/discussionforum"
                state={{
                  examinationId: parseInt(courseId),
                  unitId: activeUnit
                    ? Number(String(activeUnit).split("-")[1])
                    : null,
                }}
              >
                <button className="unit-tab">Discussion Forum</button>
              </Link>

              <Link to="/recorded-classes">
                <button className="unit-tab">Recorded classes</button>
              </Link>
            </div>

            {activeUnit && (
              <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                <h5 className="mb-0">
                  <i className="fa fa-book text-primary me-2 mr-2"></i> Unit
                  Title: {unitTitleByUnit[activeUnit] || "No title found"}
                </h5>
                {role !== "Student" && (
                  <Link
                    to="/add-objective-subjective-assignment"
                    state={{
                      unitId: activeUnit,
                      batchName,
                      semester,
                      courseCode,
                      courseName,
                      examinationID: examId,
                    }}
                  >
                    <button className="btn btn-outline-primary">
                      <i className="fa fa-plus me-1"></i> Add Practice Test
                    </button>
                  </Link>
                )}
              </div>
            )}

            {/* Sections with progress */}
            {[
              {
                title: "Web Resources Materials",
                key: "webresources",
                data: filteredWebResources,
                ref: sectionRefs.webresources,
                color: "primary",
                icon: "fas fa-file",
              },
              {
                title: "Pre-Learning : FAQ",
                key: "faq",
                data: filteredFAQ,
                ref: sectionRefs.faq,
                color: "primary",
                icon: "fas fa-question-circle",
              },
              {
                title: "Practice Assignment",
                key: "practiceassignment",
                data: filteredPracticeAssignment,
                ref: sectionRefs.practiceassignment,
                color: "primary",
                icon: "fas fa-tasks",
              },
              {
                title: "Study Guide",
                key: "studyguide",
                data: filteredStudyGuide,
                ref: sectionRefs.studyguide,
                color: "primary",
                icon: "fas fa-book",
              },
            ].map((section) => (
              <div
                key={section.key}
                ref={section.ref}
                className={`card shadow-sm mb-4 section-card animate-section border-${section.color}`}
              >
                <div className={`card-header bg-${section.color} text-white`}>
                  <h6 className="mb-0">
                    <i className={`${section.icon} me-2 mr-2`}></i>
                    {section.title}
                  </h6>
                </div>
                <div className="card-body">
                  {section.data.length === 0 ? (
                    renderEmptyMessage(section.title)
                  ) : (
                    <div className="row">
                      {section.data.map((item, idx2) => {
                        // we use progressVersion in deps to force re-read from localStorage
                        const { value: progress } = getProgressForItem(
                          section.key,
                          item
                        );
                        const progressColor = getProgressColor(progress);

                        const idKey =
                          item.id ??
                          item.contentId ??
                          item.examid ??
                          `${section.key}-${idx2}`;
                        const thisItemId =
                          item.id ?? item.contentId ?? item.Id ?? item.ContentId;

                        return (
                          <div
                            className="col-md-6 col-lg-4 mb-3"
                            key={`${idKey}-${progressVersion}`}
                          >
                            <div
                              className="resource-card welcome-card animate-welcome h-100"
                              style={{ position: "relative" }}
                            >
                              {role !== "Student" && (
                                <button
                                  type="button"
                                  className="delete-btn text-danger btn btn-link p-0"
                                  title="Delete content"
                                  onClick={(e) =>
                                    handleDeleteContent(item, e)
                                  }
                                  disabled={deletingId === thisItemId}
                                  aria-label="Delete content"
                                  style={{ lineHeight: 0 }}
                                >
                                  <i
                                    className="fa fa-trash"
                                    aria-hidden="true"
                                  ></i>
                                </button>
                              )}

                              <div className="card-body d-flex flex-column">
                                <h6 className="fw-bold">{item.title}</h6>
                                <p className="text-muted flex-grow-1">
                                  {item.description}
                                </p>

                                <button
                                  className="btn btn-sm btn-outline-primary mt-auto"
                                  onClick={() =>
                                    handleViewFile(section.key, item)
                                  }
                                >
                                  View File
                                </button>

                                {/* Progress bar, same style as first page */}
                                <div style={{ marginTop: "12px" }}>
                                  <div
                                    style={{
                                      fontSize: "0.95rem",
                                      marginBottom: "2px",
                                    }}
                                  >
                                    <span>{section.title} Progress: </span>
                                    <span
                                      style={{
                                        color: progressColor,
                                        fontWeight: 600,
                                      }}
                                    >
                                      {progress}%
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      width: "100%",
                                      height: "8px",
                                      background: "#eee",
                                      borderRadius: "6px",
                                      overflow: "hidden",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: `${progress}%`,
                                        height: "100%",
                                        background: progressColor,
                                        transition: "width 0.5s",
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Student vs Admin Practice sections – unchanged */}
            {role === "Student" ? (
              <div className="container-fluid">
                <div className="card shadow-sm mb-5 section-card animate-section border-info">
                  <div className="card-header bg-info text-white">
                    <h6 className="mb-0">
                      <i className="fa fa-tools me-2 mr-2"></i> Student Practice
                      Exams
                    </h6>
                  </div>

                  <div className="card-body">
                    {practiceExams.length === 0 ? (
                      <div className="text-muted text-center py-3">
                        No practice exams available.
                      </div>
                    ) : (
                      <div className="row">
                        {practiceExams.map((exam) => {
                          const isSubjective =
                            (exam.examType || "").toUpperCase() === "DP";
                          const isAttendStatus =
                            (exam.examStatus || "").toLowerCase() ===
                            "attendexam";
                          const isMCQ = exam.examType === "MP";

                          return (
                            <div
                              className="col-md-6 col-lg-4 mb-3"
                              key={exam.examid}
                            >
                              <div className="resource-card welcome-card animate-welcome h-100">
                                <div
                                  className="card-body d-flex flex-column"
                                  style={{
                                    textAlign: "left",
                                    gap: "6px",
                                  }}
                                >
                                  <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                                    <i className="fa fa-book text-primary mr-2"></i>
                                    {exam.title}
                                  </h6>

                                  <p className="mb-2">
                                    <i className="fa fa-calendar-plus me-2 mr-2 text-success"></i>
                                    <strong>Created At:</strong>{" "}
                                    {new Date(
                                      exam.createdAt
                                    ).toLocaleString()}
                                  </p>

                                  <p className="mb-2">
                                    <i className="fa fa-clock me-2 mr-2 text-primary"></i>
                                    <strong>Duration:</strong>{" "}
                                    {exam.durationMinutes} min
                                  </p>

                                  <p className="mb-2">
                                    <i className="fa fa-star me-2 mr-2 text-warning"></i>
                                    <strong>Marks:</strong> {exam.totmrk} |{" "}
                                    <strong>Pass:</strong> {exam.passmrk}
                                  </p>

                                  <p className="mb-2">
                                    <i className="fa fa-layer-group me-2 mr-2 text-secondary"></i>
                                    <strong>Unit:</strong> {exam.unitId}
                                  </p>

                                  {exam.fileurl ? (
                                    <a
                                      href={toAbsoluteLocal(
                                        apiOrigin,
                                        exam.fileurl
                                      )}
                                      className="btn btn-sm btn-outline-primary"
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={() =>
                                        log("Opening exam attachment", {
                                          url: toAbsoluteLocal(
                                            apiOrigin,
                                            exam.fileurl
                                          ),
                                        })
                                      }
                                    >
                                      📄 View Attachment
                                    </a>
                                  ) : !isMCQ ? (
                                    <button
                                      className="btn btn-sm btn-outline-secondary"
                                      disabled
                                    >
                                      🚫 No Attachment
                                    </button>
                                  ) : null}

                                  {isMCQ && isAttendStatus && (
                                    <Link
                                      to={`/practice-exam/${exam.examid}`}
                                      state={{ exam }}
                                      className="mt-2"
                                    >
                                      <button className="btn btn-sm btn-success w-100">
                                        📝 Attend Practice Exam
                                      </button>
                                    </Link>
                                  )}

                                  {isSubjective && isAttendStatus && (
                                    <input
                                      type="file"
                                      accept=".pdf"
                                      onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f && userId) {
                                          const token =
                                            localStorage.getItem("jwt");
                                          const url = `${API_BASE_URL}/ExamSubmissions/PracticeExamSubjective?ExamId=${exam.examid}&studentId=${userId}`;
                                          const formData = new FormData();
                                          formData.append("file", f);
                                          fetch(url, {
                                            method: "POST",
                                            body: formData,
                                            headers: {
                                              Authorization: `Bearer ${token}`,
                                            },
                                          })
                                            .then(async (r) => {
                                              const t = await r.text();
                                              if (!r.ok) throw new Error(t);
                                              alert(
                                                "✅ Subjective practice exam submitted successfully!"
                                              );
                                            })
                                            .catch((err) => {
                                              error(
                                                "Failed to submit subjective practice exam",
                                                err
                                              );
                                              alert(
                                                "❌ Failed to submit subjective practice exam."
                                              );
                                            });
                                        }
                                      }}
                                      className="form-control mt-2"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="container-fluid">
                <div className="card shadow-sm mb-5 section-card animate-section border-info">
                  <div className="card-header bg-info text-white">
                    <h6 className="mb-0">
                      <i className="fa fa-tools me-2 mr-2"></i> View Practice
                      Tests
                    </h6>
                  </div>

                  <div className="card-body">
                    {adminPracticeTests.length === 0 ? (
                      <div className="text-muted text-center py-3">
                        No practice test records found.
                      </div>
                    ) : (
                      <div className="row">
                        {adminPracticeTests.map((test) => {
                          const isObjective =
                            (test.PracticeExamType || "").toLowerCase() ===
                            "objective";
                          const isSubjective =
                            (test.PracticeExamType || "").toLowerCase() ===
                            "subjective";

                          const typeBadge = isObjective ? (
                            <span className="badge bg-primary text-white px-2 py-1 rounded-pill">
                              <i className="fa fa-list me-1"></i> Objective
                            </span>
                          ) : isSubjective ? (
                            <span className="badge bg-warning text-dark px-2 py-1 rounded-pill">
                              <i className="fa fa-file-alt me-1"></i> Subjective
                            </span>
                          ) : (
                            <span className="badge bg-secondary text-white px-2 py-1 rounded-pill">
                              {test.PracticeExamType}
                            </span>
                          );

                          return (
                            <div
                              className="col-md-6 col-lg-4 mb-3"
                              key={test.examid}
                            >
                              <div className="resource-card welcome-card animate-welcome h-100">
                                <div
                                  className="card-body d-flex flex-column"
                                  style={{ textAlign: "left", gap: "6px" }}
                                >
                                  <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                                    <i className="fa fa-book text-primary"></i>
                                    {test.AssignmentTitle}
                                  </h6>

                                  <p className="mb-2">
                                    <i className="fa fa-user me-2 mr-2 text-dark"></i>
                                    {test.pname}
                                  </p>
                                  <p className="mb-2">
                                    <i className="fa fa-layer-group me-2 mr-2 text-secondary"></i>
                                    <strong>Unit:</strong> {activeUnit}
                                  </p>
                                  <p className="mb-2">
                                    <i className="fa fa-clock me-2 mr-2 text-primary"></i>
                                    <strong>Duration:</strong> {test.Duration}{" "}
                                    min
                                  </p>
                                  <p className="mb-2">
                                    <i className="fa fa-star me-2 mr-2 text-warning"></i>
                                    <strong>Marks:</strong> {test.totmrk} |{" "}
                                    <strong>Pass:</strong> {test.passmrk}
                                  </p>
                                  <p className="mb-2">
                                    <i className="fa fa-check-circle me-2 mr-2 text-success"></i>
                                    <strong>Attempted:</strong>{" "}
                                    {test.attempted ? "Yes" : "No"}
                                  </p>
                                  <p className="mb-2">
                                    <i className="fa fa-calendar-alt me-2 mr-2 text-danger"></i>
                                    <strong>From:</strong>{" "}
                                    {new Date(
                                      test.StartDate
                                    ).toLocaleDateString()}{" "}
                                    -{" "}
                                    {new Date(
                                      test.EndDate
                                    ).toLocaleDateString()}
                                  </p>

                                  <div className="mt-auto text-end">
                                    {typeBadge}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Viewer modal (any file) */}
      <UniversalFileViewerModal
        show={viewerShow}
        onHide={handleViewerHide}
        fileUrl={viewerUrl}
        apiOrigin={apiOrigin}
        jwt={jwt}
        title="View File"
      />

      <Footer />
    </div>
  );
}

export default InstructorCourseViewPage;
