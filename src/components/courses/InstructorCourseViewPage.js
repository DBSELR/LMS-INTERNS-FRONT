import React, { useEffect, useState, useRef, useMemo } from "react";
import { Modal } from "react-bootstrap";
import HeaderTop from "../../components/HeaderTop";
import RightSidebar from "../../components/RightSidebar";
import LeftSidebar from "../../components/LeftSidebar";
import Footer from "../../components/Footer";
import { useParams, useLocation, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Document, Page, pdfjs } from "react-pdf";
import API_BASE_URL from "../../config";

// If you later want to switch to your watermark component inside the modal, it's ready.
// import VimeoWithWatermark from "../VimeoWithWatermark";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/* =========================
   Debug helpers (toggleable)
   ========================= */
const DEBUG = true; // set false to silence all logs
const tag = "ICVP"; // InstructorCourseViewPage
const mask = (str) =>
  typeof str === "string" && str.length > 12
    ? `${str.slice(0, 4)}…${str.slice(-4)}`
    : str;

const log = (...args) => DEBUG && console.log(`[${tag}]`, ...args);
const info = (...args) => DEBUG && console.info(`[${tag}]`, ...args);
const warn = (...args) => DEBUG && console.warn(`[${tag}]`, ...args);
const error = (...args) => DEBUG && console.error(`[${tag}]`, ...args);
const group = (title, obj) => {
  if (!DEBUG) return;
  console.groupCollapsed(`[${tag}] ${title}`);
  if (obj !== undefined) console.log(obj);
  console.groupEnd();
};

/* =========================
   URL helpers
   ========================= */
function normalizeUrl(raw) {
  if (!raw) return "";
  let u = String(raw).trim();
  if ((u.startsWith('"') && u.endsWith('"')) || (u.startsWith("'") && u.endsWith("'"))) {
    u = u.slice(1, -1);
  }
  u = u.replace(/&amp;/g, "&");
  u = u.replace(/%22$/i, "");
  return u;
}

/* =========================
   Watermark helpers
   ========================= */
   // Live clock (ticks every second)
function useLiveClock({ timeZone = 'Asia/Kolkata', intervalMs = 1000 } = {}) {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now.toLocaleString('en-IN', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true,
  });
}

// Extract only identity once (role + userId)
function getIdentityFromToken(storageKey = "jwt") {
  try {
    const token = localStorage.getItem(storageKey) || (storageKey !== "jwt" ? localStorage.getItem("jwt") : null);
    if (!token) return { role: "User", userId: "NA" };
    const claims = jwtDecode(token) || {};
    const role =
      claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      claims.role ||
      (Array.isArray(claims.roles) && claims.roles[0]) ||
      "User";
    const userId =
      claims.UserId ||
      claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
      claims.sub || claims.nameid || "NA";
    return { role, userId };
  } catch {
    return { role: "User", userId: "NA" };
  }
}

function getDisplayTextFromToken(storageKey = "jwt") {
  try {
    const token = localStorage.getItem(storageKey) || (storageKey !== "jwt" ? localStorage.getItem("jwt") : null);
    if (!token) return "User-NA";
    const claims = jwtDecode(token) || {};
    const role =
      claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      claims.role ||
      (Array.isArray(claims.roles) && claims.roles[0]) ||
      "User";
    const userId =
      claims.UserId ||
      claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
      claims.sub ||
      claims.nameid ||
      "NA";
    const loginDateTime =
      claims.loginDateTime ||
      (claims.iat ? new Date(claims.iat * 1000).toLocaleString() : new Date().toLocaleString());
    return `${role}-${userId} | ${loginDateTime}`;
  } catch {
    return "User-NA";
  }
}

function getApiOrigin() {
  // Accepts values like "https://host/api" or "https://host" or "https://host:port/api/"
  try {
    const u = new URL(API_BASE_URL);
    const path = u.pathname.replace(/\/+$/, "");
    if (path.toLowerCase().endsWith("/api")) {
      const stripped = path.replace(/\/api$/i, "");
      return `${u.origin}${stripped || ""}`;
    }
    return u.origin;
  } catch {
    // Fallback: if API_BASE_URL is a bare origin or something unexpected
    try {
      const u = new URL(window.location.origin);
      return u.origin;
    } catch {
      return "";
    }
  }
}

function isHttpUrl(u) {
  return /^https?:\/\//i.test(u || "");
}
function isVimeo(u) {
  return /vimeo\.com/i.test(u || "");
}
function isYouTube(u) {
  return /youtu\.be|youtube\.com/i.test(u || "");
}
function toAbsoluteLocal(origin, pathOrUrl) {
  if (!pathOrUrl) return "";
  if (isHttpUrl(pathOrUrl)) return pathOrUrl; // already absolute
  if (!origin) return pathOrUrl; // last resort
  if (pathOrUrl.startsWith("/")) return `${origin}${pathOrUrl}`;
  return `${origin}/${pathOrUrl}`;
}

/* =========================
   Robust fetch helper
   ========================= */
async function safeFetchJson(url, options = {}, { label = "", retries = 0, signal } = {}) {
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

   // NEW: keep raw content and a unit -> title map
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
  const [exams, setExams] = useState([]); // kept in case you map exams later
  const [liveClasses, setLiveClasses] = useState([]);

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [isVimeoUrl, setIsVimeoUrl] = useState(false);
  const [isYouTubeUrl, setIsYouTubeUrl] = useState(false);
  const [currentVideoProgress, setCurrentVideoProgress] = useState(0);

  const [showFileModal, setShowFileModal] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [fileProgress, setFileProgress] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [visitedPages, setVisitedPages] = useState(new Set());

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

  const lastLoggedVideoPct = useRef(-1);
  
  // Watermark refs and displayText
  // Watermark refs and displayText (live ticking time)
  const { role: wmRole, userId: wmUserId } = useMemo(() => getIdentityFromToken("jwt"), []);
  const liveTime = useLiveClock({ timeZone: 'Asia/Kolkata', intervalMs: 1000 });
  const displayText = `${wmRole}-${wmUserId} | ${liveTime}`;

  const wmVideoRef = useRef(null);
  const wmPdfRef = useRef(null);
  // Animation state for watermarks
  const videoWmStateRef = useRef({
    x: 20,
    y: 20,
    vx: 40 * 0.7, // speed * 0.7
    vy: 40 * 0.3, // speed * 0.3
    lastT: 0,
    nextJitterAt: 0,
  });
  
  const pdfWmStateRef = useRef({
    x: 50,
    y: 50,
    vx: 35 * 0.8,
    vy: 35 * 0.4,
    lastT: 0,
    nextJitterAt: 0,
  });
  
  const apiOrigin = getApiOrigin();

  // === Delete helpers ===
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
    const drop = (arr) => (Array.isArray(arr) ? arr.filter((x) => getContentId(x) !== id) : []);
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
    if (!window.confirm("Are you sure you want to delete this content? This cannot be undone.")) {
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
      log("DELETE Content response", { status: res.status, ok: res.ok, bodyText });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${bodyText || ""}`);

      // best-effort: clean cached progress keys
      try {
        const fileUrlAbs = item?.fileUrl ? toAbsoluteLocal(apiOrigin, item.fileUrl) : "";
        const vurl = normalizeUrl(item?.vurl || "");
        const playableUrl = isHttpUrl(vurl) ? vurl : fileUrlAbs;
        [
          `video-progress-${playableUrl}`,
          `ebook-progress-${fileUrlAbs}`,
          `webresource-progress-${fileUrlAbs}`,
          `faq-progress-${fileUrlAbs}`,
          `misconception-progress-${fileUrlAbs}`,
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

  // Enhanced right-click and developer tools blocking
  useEffect(() => {
    const root = document.getElementById("main_content");
    if (!root) return;
    
    // Prevent right-click context menu
    const preventCtx = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    
    // Prevent common developer shortcuts
    const preventDevTools = (e) => {
      // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+Shift+C
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    
    // Prevent text selection
    const preventSelection = (e) => {
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        return false;
      }
    };
    
    // Add event listeners
    root.addEventListener("contextmenu", preventCtx);
    document.addEventListener("keydown", preventDevTools);
    document.addEventListener("keydown", preventSelection);
    
    // Disable drag and drop
    root.addEventListener("dragstart", preventCtx);
    root.addEventListener("drop", preventCtx);
    
    return () => {
      root.removeEventListener("contextmenu", preventCtx);
      document.removeEventListener("keydown", preventDevTools);
      document.removeEventListener("keydown", preventSelection);
      root.removeEventListener("dragstart", preventCtx);
      root.removeEventListener("drop", preventCtx);
    };
  }, []);

  // Watermark animation effect
  useEffect(() => {
    let rafId = null;
    
    const animateWatermark = (wmRef, stateRef, containerId) => {
      const wm = wmRef.current;
      const container = document.querySelector(containerId);
      if (!wm || !container) return;

      const getBounds = () => {
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        const ww = wm.offsetWidth;
        const wh = wm.offsetHeight;
        return { cw, ch, ww, wh };
      };

      const pickJitter = (speed = 40) => {
        const now = performance.now();
        stateRef.current.nextJitterAt = now + 1500 + Math.random() * 2000;
        const angle = Math.random() * 0.9 - 0.45; // ~±26°
        const { vx, vy } = stateRef.current;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        let nvx = vx * cos - vy * sin;
        let nvy = vx * sin + vy * cos;
        const mag = Math.hypot(nvx, nvy) || 1;
        stateRef.current.vx = (nvx / mag) * speed;
        stateRef.current.vy = (nvy / mag) * speed;
      };

      const step = (t) => {
        const s = stateRef.current;
        if (!s.lastT) s.lastT = t;
        const dt = Math.min(0.05, (t - s.lastT) / 1000);
        s.lastT = t;

        if (t >= s.nextJitterAt) pickJitter();

        let { x, y, vx, vy } = s;
        x += vx * dt;
        y += vy * dt;

        const { cw, ch, ww, wh } = getBounds();

        if (x <= 0) { x = 0; vx = Math.abs(vx); }
        else if (x + ww >= cw) { x = cw - ww; vx = -Math.abs(vx); }

        if (y <= 0) { y = 0; vy = Math.abs(vy); }
        else if (y + wh >= ch) { y = ch - wh; vy = -Math.abs(vy); }

        s.x = x; s.y = y; s.vx = vx; s.vy = vy;
        if (wm) {
          wm.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }

        rafId = requestAnimationFrame(step);
      };

      stateRef.current.nextJitterAt = performance.now() + 1500;
      return step;
    };

    // Start animation when modals are open
    if (showVideoModal) {
      const step = animateWatermark(wmVideoRef, videoWmStateRef, '.video-wrapper');
      rafId = requestAnimationFrame(step);
    } else if (showFileModal) {
      const step = animateWatermark(wmPdfRef, pdfWmStateRef, '.relative-wrap');
      rafId = requestAnimationFrame(step);
    }

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [showVideoModal, showFileModal]);

  // Enhanced modal security - Block right-click when modals are open
  useEffect(() => {
    if (!showVideoModal && !showFileModal) return;

    const preventAll = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const preventDevToolsStrict = (e) => {
      // Block all developer shortcuts when modal is open
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.key === 'S') || // Block Ctrl+S (Save As)
        (e.ctrlKey && e.shiftKey && e.key === 'S') || // Block Ctrl+Shift+S
        (e.ctrlKey && e.key === 'P') // Block Ctrl+P (Print)
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Add strict event listeners when modal is open
    document.addEventListener("contextmenu", preventAll, true);
    document.addEventListener("selectstart", preventAll, true);
    document.addEventListener("dragstart", preventAll, true);
    document.addEventListener("keydown", preventDevToolsStrict, true);
    
    // Disable print screen
    document.addEventListener("keyup", (e) => {
      if (e.key === "PrintScreen") {
        e.preventDefault();
        return false;
      }
    }, true);

    return () => {
      document.removeEventListener("contextmenu", preventAll, true);
      document.removeEventListener("selectstart", preventAll, true);
      document.removeEventListener("dragstart", preventAll, true);
      document.removeEventListener("keydown", preventDevToolsStrict, true);
    };
  }, [showVideoModal, showFileModal]);

  useEffect(() => {
    info("Component mounted", {
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
    if (!apiOrigin) {
      warn("apiOrigin is empty. Check API_BASE_URL:", API_BASE_URL);
    }
    return () => info("Component unmounted");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
     Video open/close
     ========================= */
  function getPlayableVideoUrl(item) {
    // Prefer local fileUrl if present; else use vurl
    const vurlClean = normalizeUrl(item.vurl || "");
    const chosen = item.fileUrl ? toAbsoluteLocal(apiOrigin, item.fileUrl) : vurlClean;
    return chosen;
  }

  const handleWatchVideo = (item) => {
    const chosen = getPlayableVideoUrl(item);
    const vimeo = isVimeo(chosen);
    const ytb = isYouTube(chosen);

    group("Open Video – Payload", {
      item,
      normalized: {
        fileUrl: item.fileUrl,
        vurl: normalizeUrl(item.vurl || ""),
      },
      chosenUrl: chosen,
      classification: { vimeo, youTube: ytb, absolute: isHttpUrl(chosen) },
      apiOrigin,
      progressKey: `video-progress-${chosen}`,
    });

    if (!chosen) {
      error("No playable URL found for video item");
      return;
    }

    setIsVimeoUrl(vimeo);
    setIsYouTubeUrl(ytb);
    setVideoUrl(chosen);
    setShowVideoModal(true);

    const progress = parseInt(localStorage.getItem(`video-progress-${chosen}`)) || 0;
    log("Loaded stored video progress", { progress, key: `video-progress-${chosen}` });
    setCurrentVideoProgress(progress);
  };

  const handleCloseVideo = () => {
    log("Closing video modal");
    setShowVideoModal(false);
    setVideoUrl("");
    setCurrentVideoProgress(0);
    lastLoggedVideoPct.current = -1;
    setIsVimeoUrl(false);
    setIsYouTubeUrl(false);
  };

  /* =========================
     File open/close (PDF etc.)
     ========================= */
  const handleViewFile = (urlOrPath) => {
    const fullUrl = toAbsoluteLocal(apiOrigin, urlOrPath);
    group("Open File – Payload", { raw: urlOrPath, fullUrl, apiOrigin, progressKey: `ebook-progress-${fullUrl}` });
    setFileUrl(fullUrl);
    setShowFileModal(true);
    const progress = parseInt(localStorage.getItem(`ebook-progress-${fullUrl}`)) || 0;
    log("Loaded stored file progress", { progress, key: `ebook-progress-${fullUrl}` });
    setFileProgress(progress);
  };

  const handleCloseFile = () => {
    log("Closing file modal");
    setShowFileModal(false);
    setFileUrl("");
    setFileProgress(0);
    setPageNumber(1);
    setNumPages(null);
    setVisitedPages(new Set());
  };

  const handlePageChange = (newPage) => {
    log("PDF page change", { from: pageNumber, to: newPage, numPages });
    setPageNumber(newPage);

    setVisitedPages((prev) => {
      const updated = new Set(prev);
      updated.add(newPage);

      let percent = Math.round((updated.size / numPages) * 100);
      if (newPage === numPages) percent = 100;

      const storedProgress = parseInt(localStorage.getItem(`ebook-progress-${fileUrl}`)) || 0;
      const updatedProgress = Math.max(percent, storedProgress);

      setFileProgress(updatedProgress);
      localStorage.setItem(`ebook-progress-${fileUrl}`, updatedProgress);

      log("PDF progress updated", {
        visitedPages: Array.from(updated).sort((a, b) => a - b),
        percent,
        storedProgress,
        updatedProgress,
        key: `ebook-progress-${fileUrl}`,
      });

      return updated;
    });
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
          decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        group("JWT decoded", {
          userId: extractedUserId,
          role: extractedRole,
          raw: { ...decoded, token: `Bearer ${mask(token)}` },
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

  // Practice exam submit
  const submitSubjectivePracticeExam = async (examId, studentId, file) => {
    const token = localStorage.getItem("jwt");
    const url = `${API_BASE_URL}/ExamSubmissions/PracticeExamSubjective?ExamId=${examId}&studentId=${studentId}`;
    const headers = { Authorization: `Bearer ${token}` };
    const formData = new FormData();
    formData.append("file", file);

    group("Submitting Subjective Practice Exam – Payload", {
      url,
      headers: { ...headers, Authorization: `Bearer ${mask(token)}` },
      examId,
      studentId,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
    });

    try {
      console.time(`[${tag}] POST PracticeExamSubjective`);
      const res = await fetch(url, { method: "POST", body: formData, headers });
      const result = await res.text();
      console.timeEnd(`[${tag}] POST PracticeExamSubjective`);
      log("PracticeExamSubjective response", { status: res.status, ok: res.ok, result });
      if (!res.ok) throw new Error(result);
      alert("✅ Subjective practice exam submitted successfully!");
    } catch (err) {
      error("Failed to submit subjective practice exam", err);
      alert("❌ Failed to submit subjective practice exam.");
    }
  };

  // Fetch practice exams for student
  useEffect(() => {
    const fetchPracticeExams = async () => {
      if (!activeUnit || !userId) {
        warn("Skipping fetch: activeUnit or userId is missing", { activeUnit, userId });
        return;
      }
      const unitId = Number(activeUnit.split("-")[1]);
      const examinationId = parseInt(examId);
      const url = `${API_BASE_URL}/InstructorExam/StudentPracticeExams/?userId=${userId}&UnitId=${unitId}&examinationid=${examinationId}`;
      const token = localStorage.getItem("jwt");

      group("Fetch Practice Exams – Payload", {
        url,
        query: { userId, unitId, examinationId },
        headers: { Authorization: `Bearer ${mask(token)}` },
      });

      try {
        console.time(`[${tag}] GET PracticeExams`);
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        console.timeEnd(`[${tag}] GET PracticeExams`);
        log("PracticeExams response status", res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          log("PracticeExams array length", data.length);
          DEBUG && console.table(data);
          setPracticeExams(data);
        } else {
          warn("PracticeExams: API response is not an array", data);
          setPracticeExams([]);
        }
      } catch (err) {
        error("Error fetching practice exams:", err);
        setPracticeExams([]);
      }
    };
    fetchPracticeExams();
  }, [activeUnit, examId, userId]);

  // Fetch admin practice tests
  const [adminPracticeTests, setAdminPracticeTests] = useState([]);
  useEffect(() => {
    const fetchAdminPracticeTests = async () => {
      if (!userId || !activeUnit || !examId) {
        warn("Skipping admin tests fetch; missing userId/activeUnit/examId", {
          userId,
          activeUnit,
          examId,
        });
        return;
      }
      const unitId = Number(activeUnit.split("-")[1]);
      const examinationId = parseInt(examId);
      const url = `${API_BASE_URL}/AssignmentSubmission/GetPracticeExamsSubmissionsById/?instructorId=${userId}&UnitId=${unitId}&examinationid=${examinationId}`;
      const token = localStorage.getItem("jwt");

      group("Fetch Admin Practice Tests – Payload", {
        url,
        query: { instructorId: userId, unitId, examinationId },
        headers: { Authorization: `Bearer ${mask(token)}` },
      });

      try {
        console.time(`[${tag}] GET AdminPracticeTests`);
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        console.timeEnd(`[${tag}] GET AdminPracticeTests`);
        log("AdminPracticeTests response status", res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          log("AdminPracticeTests array length", data.length);
          DEBUG && console.table(data);
          setAdminPracticeTests(data);
        } else {
          warn("AdminPracticeTests: expected array, got", data);
          setAdminPracticeTests([]);
        }
      } catch (err) {
        error("Error fetching Admin Practice Tests:", err);
        setAdminPracticeTests([]);
      }
    };
    fetchAdminPracticeTests();
  }, [userId, activeUnit, examId]);

  // Fetch content bundle (stable, with abort + retries)
  useEffect(() => {
    if (!courseId) return;
    const token = localStorage.getItem("jwt");
    const headers = { Authorization: `Bearer ${token}` };
    const ac = new AbortController();

    (async () => {
      try {
        console.time("[ICVP] GET Content bundle");
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
        console.timeEnd("[ICVP] GET Content bundle");

         // ★ Keep the raw list for unit tabs (even when contentType is null)
        setRawContent(Array.isArray(content) ? content : []);

        // ---- case-insensitive contentType filter
        const ci = (v) => String(v || "").toLowerCase();
        setEBOOKS(content.filter((c) => ci(c.contentType) === "ebook"));
        setVideos(content.filter((c) => ci(c.contentType) === "video"));
        setwebresources(content.filter((c) => ci(c.contentType) === "webresources"));
        setfaq(content.filter((c) => ci(c.contentType) === "faq"));
        setmisconceptions(content.filter((c) => ci(c.contentType) === "misconceptions"));
        setpracticeassignment(content.filter((c) => ci(c.contentType) === "practiceassignment"));
        setstudyguide(content.filter((c) => ci(c.contentType) === "studyguide"));
        setMaterials(content.filter((c) => ci(c.contentType) === "pdf"));

        const cid = parseInt(courseId);
        setAssignments((allAssignments || []).filter((a) => a.examinationid === cid));
        setLiveClasses((allLiveClasses || []).filter((lc) => lc.examinationID === cid));
      } catch (err) {
        console.error("[ICVP] Content bundle load failed", err);
        // Optional: show a toast or set an error state
      }
    })();

    return () => ac.abort();
  }, [courseId]);

  // NEW: Build unit tabs from rawContent (keeps units even with null content)
 // Build unit tabs from the raw content (handles Title/title casing)
// and keep a map of unit -> title for display (even if some rows are null)
useEffect(() => {
  const toStr = (v) => (v == null ? "" : String(v).trim());

  // be liberal about keys coming from the API
  const getUnit = (it) => toStr(it.unit ?? it.Unit);
  const getTitle = (it) =>
    toStr(
      it.title ??
      it.Title ??
      it.unitTitle ??
      it.UnitTitle
    );

  const unitSet = new Set();
  const titleMap = {};

  for (const it of rawContent || []) {
    const u = getUnit(it);
    if (!u) continue;

    unitSet.add(u);

    const t = getTitle(it);
    // remember the first non-empty title we see for this unit
    if (t && !titleMap[u]) titleMap[u] = t;
  }

  // If a unit still has no title, try a second pass:
  // pick any non-empty title from any row that shares the same unit number (defensive)
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

  // Sort "Unit-3" before "Unit-10"
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


  // // Scroll to section when loaded
  // useEffect(() => {
  //   const scrollTo = location.state?.scrollTo;
  //   if (scrollTo && sectionRefs[scrollTo]?.current) {
  //     log("Scrolling to section", scrollTo);
  //     setTimeout(() => {
  //       sectionRefs[scrollTo].current.scrollIntoView({ behavior: "smooth", block: "start" });
  //     }, 500);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [ebooks, videos, faq, misconceptions, practiceassignment, studyguide, webresources]);

  // // Compute units (from any content type, not only ebooks)
  // useEffect(() => {
  //   const gatherUnits = (arr) => arr.map((item) => item.unit?.trim()).filter(Boolean);
  //   const all = [
  //     ...gatherUnits(ebooks),
  //     ...gatherUnits(videos),
  //     ...gatherUnits(webresources),
  //     ...gatherUnits(faq),
  //     ...gatherUnits(misconceptions),
  //     ...gatherUnits(practiceassignment),
  //     ...gatherUnits(studyguide),
  //   ];
  //   const uniqueUnits = Array.from(new Set(all)).sort((a, b) => {
  //     const getUnitNumber = (u) => parseInt(u?.split("-")[1]) || 0;
  //     return getUnitNumber(a) - getUnitNumber(b);
  //   });

  //   log("Units computed", { uniqueUnits });
  //   setAllUnits(uniqueUnits);
  //   if (uniqueUnits.length > 0 && !activeUnit) {
  //     log("Setting initial activeUnit", uniqueUnits[0]);
  //     setActiveUnit(uniqueUnits[0]);
  //   }
  // }, [ebooks, videos, webresources, faq, misconceptions, practiceassignment, studyguide]); // include videos etc.

  const renderEmptyMessage = (label) => (
    <div className="text-muted text-center py-3">No {label} available.</div>
  );

  const filteredByUnit = (data) => data.filter((item) => item.unit?.trim() === activeUnit);

  const filteredEbooks = filteredByUnit(ebooks);
  const filteredVideos = filteredByUnit(videos);
  const filteredWebResources = filteredByUnit(webresources);
  const filteredFAQ = filteredByUnit(faq);
  const filteredMisconceptions = filteredByUnit(misconceptions);
  const filteredPracticeAssignment = filteredByUnit(practiceassignment);
  const filteredStudyGuide = filteredByUnit(studyguide);

  return (
    <div 
      id="main_content" 
      className="font-muli theme-blush"
      onContextMenu={(e) => e.preventDefault()}
      onSelectStart={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={{userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none'}}
    >
      
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
              <h2 className="page-title text-primary pt-0 dashboard-hero-title">View Course Content</h2>
              <a href="/my-courseware" className="btn btn-outline-primary mt-3 mt-md-0">
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
              // const titleForUnit =
              //   (ebooks.find((ebook) => ebook.unit?.trim() === unit)?.title) ||
              //   (videos.find((v) => v.unit?.trim() === unit)?.title) ||
              //   "No title found";

              return (
                <button
                  key={unit}
                  className={`unit-tab ${activeUnit === unit ? "active" : ""}`}
                  onClick={() => {
                    log("Unit tab clicked", { from: activeUnit, to: unit });
                    setActiveUnit(unit);
                  }}
                  title={`${titleForUnit}`}
                >
                  {unit}
                </button>
              );
            })}

            {/* Pass both examinationId and unitId */}
            <Link
              to="/discussionforum"
              state={{
                examinationId: parseInt(courseId),
                unitId: activeUnit ? Number(activeUnit.split("-")[1]) : null,
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
                <i className="fa fa-book text-primary me-2 mr-2"></i> Unit Title:{" "}
                 {unitTitleByUnit[activeUnit] || "No title found"}
                {/* {filteredEbooks[0]?.title || filteredVideos[0]?.title || "No title found"} */}
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

          {/* If you want an always-mounted watermark layer, keep your component here */}
          {/* <VimeoWithWatermark tokenStorageKey="jwt" opacity={0.16} speed={35} /> */}

          {/* Section Mapping */}
          {[
            { title: "Videos", key: "videos", data: filteredVideos, ref: sectionRefs.videos, color: "info", icon: "fas fa-video" },
            { title: "EBOOK Materials", key: "ebooks", data: filteredEbooks, ref: sectionRefs.ebooks, color: "primary", icon: "fas fa-file-pdf" },
            { title: "Web Resources Materials", key: "webresources", data: filteredWebResources, ref: sectionRefs.webresources, color: "primary", icon: "fas fa-file-pdf" },
            { title: "Pre-Learning : FAQ", key: "faq", data: filteredFAQ, ref: sectionRefs.faq, color: "primary", icon: "fas fa-file-pdf" },
            { title: "Pre-Learning : Misconceptions", key: "misconceptions", data: filteredMisconceptions, ref: sectionRefs.misconceptions, color: "primary", icon: "fas fa-file-pdf" },
            { title: "Practice Assignment", key: "practiceassignment", data: filteredPracticeAssignment, ref: sectionRefs.practiceassignment, color: "primary", icon: "fas fa-file-pdf" },
            { title: "Study Guide", key: "studyguide", data: filteredStudyGuide, ref: sectionRefs.studyguide, color: "primary", icon: "fas fa-file-pdf" },
          ].map((section, idx) => (
            <div key={section.key} ref={section.ref} className={`card shadow-sm mb-4 section-card animate-section border-${section.color}`}>
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
                      // Decide a storage key based on final absolute URL (for consistent progress)
                      const playableUrl =
                        section.key === "videos"
                          ? getPlayableVideoUrl(item)
                          : toAbsoluteLocal(apiOrigin, item.fileUrl);

                      const idKey =
                        item.id ?? item.contentId ?? item.examid ?? playableUrl ?? idx2;

                      let progressKey = "";
                      if (section.key === "videos") progressKey = `video-progress-${playableUrl}`;
                      else if (section.key === "ebooks") progressKey = `ebook-progress-${playableUrl}`;
                      else if (section.key === "webresources") progressKey = `webresource-progress-${playableUrl}`;
                      else if (section.key === "faq") progressKey = `faq-progress-${playableUrl}`;
                      else if (section.key === "misconceptions") progressKey = `misconception-progress-${playableUrl}`;
                      else if (section.key === "practiceassignment") progressKey = `practiceassignment-progress-${playableUrl}`;
                      else if (section.key === "studyguide") progressKey = `studyguide-progress-${playableUrl}`;
                      else if (section.key === "liveclass") progressKey = `liveclass-progress-${playableUrl}`;
                      else if (section.key === "assignments") progressKey = `assignment-progress-${playableUrl}`;
                      else if (section.key === "exams") progressKey = `exam-progress-${playableUrl}`;
                      else if (section.key === "discussionforum") progressKey = `discussion-progress-${playableUrl}`;

                      const progress = parseInt(localStorage.getItem(progressKey)) || 0;
                      const progressColor =
                        progress < 30 ? "#e74c3c" : progress < 70 ? "#f39c12" : "#27ae60";

                      const thisItemId = (item.id ?? item.contentId ?? item.Id ?? item.ContentId);

                      return (
                        <div className="col-md-6 col-lg-4 mb-3" key={idKey}>
                          <div className="resource-card welcome-card animate-welcome h-100" style={{ position: "relative" }}>
                            {/* Delete icon (only for non-students) */}
                            {role !== "Student" && (
                              <button
                                type="button"
                                className="delete-btn text-danger btn btn-link p-0"
                                title="Delete content"
                                onClick={(e) => handleDeleteContent(item, e)}
                                disabled={deletingId === thisItemId}
                                aria-label="Delete content"
                                style={{ lineHeight: 0 }}
                              >
                                <i className="fa fa-trash" aria-hidden="true"></i>
                              </button>
                            )}

                            <div className="card-body d-flex flex-column">
                              <h6 className="fw-bold">{item.title}</h6>
                              <p className="text-muted flex-grow-1">{item.description}</p>

                              {section.key === "videos" ? (
                                <button
                                  className="btn btn-sm btn-outline-info mt-auto"
                                  onClick={() => handleWatchVideo(item)}
                                >
                                  Watch Video
                                </button>
                              ) : (
                                <button
                                  className="btn btn-sm btn-outline-primary mt-auto"
                                  onClick={() => handleViewFile(item.fileUrl)}
                                >
                                  View File
                                </button>
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
          ))}
        </div>

        {role === "Student" ? (
          <div className="container-fluid">
            <div className="card shadow-sm mb-5 section-card animate-section border-info">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">
                  <i className="fa fa-tools me-2 mr-2"></i> Student Practice Exams
                </h6>
              </div>

              <div className="card-body">
                {practiceExams.length === 0 ? (
                  <div className="text-muted text-center py-3">No practice exams available.</div>
                ) : (
                  <div className="row">
                    {practiceExams.map((exam) => {
                      const isSubjective = exam.examType?.toUpperCase() === "DP";
                      const isAttendStatus = exam.examStatus?.toLowerCase() === "attendexam";
                      const isMCQ = exam.examType === "MP";

                      return (
                        <div className="col-md-6 col-lg-4 mb-3" key={exam.examid}>
                          <div className="resource-card welcome-card animate-welcome h-100">
                            <div className="card-body d-flex flex-column" style={{ textAlign: "left", gap: "6px" }}>
                              <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                                <i className="fa fa-book text-primary mr-2"></i>
                                {exam.title}
                              </h6>

                              <p className="mb-2">
                                <i className="fa fa-calendar-plus me-2 mr-2 text-success"></i>
                                <strong>Created At:</strong> {new Date(exam.createdAt).toLocaleString()}
                              </p>

                              <p className="mb-2">
                                <i className="fa fa-clock me-2 mr-2 text-primary"></i>
                                <strong>Duration:</strong> {exam.durationMinutes} min
                              </p>

                              <p className="mb-2">
                                <i className="fa fa-star me-2 mr-2 text-warning"></i>
                                <strong>Marks:</strong> {exam.totmrk} | <strong>Pass:</strong> {exam.passmrk}
                              </p>

                              <p className="mb-2">
                                <i className="fa fa-layer-group me-2 mr-2 text-secondary"></i>
                                <strong>Unit:</strong> {exam.unitId}
                              </p>

                              {exam.fileurl ? (
                                <a
                                  href={toAbsoluteLocal(apiOrigin, exam.fileurl)}
                                  className="btn btn-sm btn-outline-primary"
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={() =>
                                    log("Opening exam attachment", { url: toAbsoluteLocal(apiOrigin, exam.fileurl) })
                                  }
                                >
                                  📄 View Attachment
                                </a>
                              ) : !isMCQ ? (
                                <button className="btn btn-sm btn-outline-secondary" disabled>
                                  🚫 No Attachment
                                </button>
                              ) : null}

                              {isMCQ && isAttendStatus && (
                                <Link to={`/practice-exam/${exam.examid}`} state={{ exam }} className="mt-2">
                                  <button className="btn btn-sm btn-success w-100">📝 Attend Practice Exam</button>
                                </Link>
                              )}

                              {isSubjective && isAttendStatus && (
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f && userId) submitSubjectivePracticeExam(exam.examid, userId, f);
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
                  <i className="fa fa-tools me-2 mr-2"></i> View Practice Tests
                </h6>
              </div>

              <div className="card-body">
                {adminPracticeTests.length === 0 ? (
                  <div className="text-muted text-center py-3">No practice test records found.</div>
                ) : (
                  <div className="row">
                    {adminPracticeTests.map((test) => {
                      const isObjective = (test.PracticeExamType || "").toLowerCase() === "objective";
                      const isSubjective = (test.PracticeExamType || "").toLowerCase() === "subjective";

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
                        <div className="col-md-6 col-lg-4 mb-3" key={test.examid}>
                          <div className="resource-card welcome-card animate-welcome h-100">
                            <div className="card-body d-flex flex-column" style={{ textAlign: "left", gap: "6px" }}>
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
                                <strong>Duration:</strong> {test.Duration} min
                              </p>

                              <p className="mb-2">
                                <i className="fa fa-star me-2 mr-2 text-warning"></i>
                                <strong>Marks:</strong> {test.totmrk} | <strong>Pass:</strong> {test.passmrk}
                              </p>

                              <p className="mb-2">
                                <i className="fa fa-check-circle me-2 mr-2 text-success"></i>
                                <strong>Attempted:</strong> {test.attempted ? "Yes" : "No"}
                              </p>

                              <p className="mb-2">
                                <i className="fa fa-calendar-alt me-2 mr-2 text-danger"></i>
                                <strong>From:</strong> {new Date(test.StartDate).toLocaleDateString()} -{" "}
                                {new Date(test.EndDate).toLocaleDateString()}
                              </p>

                              <div className="mt-auto text-end">{typeBadge}</div>
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

      

      {/* VIDEO MODAL */}
      <Modal 
        show={showVideoModal} 
        onHide={handleCloseVideo} 
        centered 
        size="lg"
        onContextMenu={(e) => e.preventDefault()}
        onSelectStart={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        <Modal.Header closeButton onContextMenu={(e) => e.preventDefault()}>
          <Modal.Title>Video Playback</Modal.Title>
        </Modal.Header>
        <Modal.Body 
          onContextMenu={(e) => e.preventDefault()}
          onSelectStart={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          style={{userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none'}}
        >
          <div className="relative-wrap">
            {/* If Vimeo/YouTube URL -> iframe; else HTML5 video */}
            {isVimeoUrl || isYouTubeUrl ? (
              <>
                <div className="video-wrapper">
                  <iframe
                    src={videoUrl}
                    title="Video player"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    sandbox="allow-scripts allow-same-origin"
                    onLoad={() => log("Iframe loaded for external video", { videoUrl })}
                  />
                </div>

                {/* Watermark overlay */}
                <div className="wm-overlay" aria-hidden="true" onContextMenu={(e) => e.preventDefault()}>
                  {/* Animated main watermark */}
                  <div ref={wmVideoRef} className="wm-chip" onContextMenu={(e) => e.preventDefault()}>
                    {displayText}
                  </div>
                </div>

                <div className="text-muted mt-2" style={{ fontSize: "0.9rem" }}>
                  Playing external video via iframe. Progress tracking is not available for iframes here.
                </div>
              </>
            ) : (
              <>
                <div className="video-wrapper">
                  <video
                    controls
                    controlsList="nodownload"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                    onTimeUpdate={(e) => {
                      const video = e.target;
                      if (video.duration > 0) {
                        const percent = Math.round((video.currentTime / video.duration) * 100);
                        const storedProgress = parseInt(localStorage.getItem(`video-progress-${videoUrl}`)) || 0;
                        const updatedProgress = Math.max(percent, storedProgress);
                        setCurrentVideoProgress(updatedProgress);
                        localStorage.setItem(`video-progress-${videoUrl}`, updatedProgress);
                        const bucket = Math.floor(updatedProgress / 10) * 10;
                        if (bucket !== lastLoggedVideoPct.current) {
                          lastLoggedVideoPct.current = bucket;
                          log("Video progress updated", { percent, storedProgress, updatedProgress, key: `video-progress-${videoUrl}` });
                        }
                      }
                    }}
                    onLoadedMetadata={(e) => {
                      const video = e.target;
                      const percent = parseInt(localStorage.getItem(`video-progress-${videoUrl}`)) || 0;
                      if (video.duration > 0 && percent > 0) {
                        video.currentTime = (percent / 100) * video.duration;
                        log("Seek video to stored position", { percent, seekTo: video.currentTime });
                      } else {
                        log("No stored position; start from 0");
                      }
                    }}
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support HTML5 video.
                  </video>

                  {/* Watermark overlay */}
                  <div className="wm-overlay" aria-hidden="true" onContextMenu={(e) => e.preventDefault()}>
                    {/* Animated main watermark */}
                    <div ref={wmVideoRef} className="wm-chip" onContextMenu={(e) => e.preventDefault()}>
                      {displayText}
                    </div>
                  </div>
                </div>

                
              </>
            )}
          </div>
        </Modal.Body>
      </Modal>

      {/* FILE MODAL */}
      <Modal 
        show={showFileModal} 
        onHide={handleCloseFile} 
        centered 
        size="lg"
        onContextMenu={(e) => e.preventDefault()}
        onSelectStart={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        <Modal.Header closeButton onContextMenu={(e) => e.preventDefault()}>
          <Modal.Title>View PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body 
          onContextMenu={(e) => e.preventDefault()}
          onSelectStart={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          style={{userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none'}}
        >
          <div className="relative-wrap">
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
                log("PDF loaded", { numPages, fileUrl });
              }}
              onLoadError={(err) => error("PDF load error", err)}
            >
              <Page pageNumber={pageNumber} width={600} onContextMenu={(e) => e.preventDefault()} />
            </Document>

            {/* Watermark overlay */}
            <div className="wm-overlay" aria-hidden="true" onContextMenu={(e) => e.preventDefault()}>
              {/* Animated main watermark */}
              <div ref={wmPdfRef} className="wm-chip" onContextMenu={(e) => e.preventDefault()}>
                {displayText}
              </div>
            </div>
          </div>

          {numPages && (
            <div className="d-flex justify-content-between mt-3">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={pageNumber <= 1}
                onClick={() => handlePageChange(pageNumber - 1)}
              >
                Prev
              </button>
              <span>
                Page {pageNumber} of {numPages}
              </span>
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={pageNumber >= numPages}
                onClick={() => handlePageChange(pageNumber + 1)}
              >
                Next
              </button>
            </div>
          )}

          
        </Modal.Body>
      </Modal>
      
    </div>
  );
}



export default InstructorCourseViewPage;
