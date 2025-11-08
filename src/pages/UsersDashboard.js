// File: src/pages/UsersDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";
import { useNavigate } from "react-router-dom";

function UsersDashboard() {
  const [summary, setSummary] = useState({
    students: 0,
    professors: 0,
    users: 0,
  });
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();
  const isMounted = useRef(true);

  // ---- helpers -------------------------------------------------------------
  const getInstructorIdFromToken = (decoded) => {
    // Try common claim keys for user/instructor id
    return (
      decoded?.InstructorId ||
      decoded?.instructorId ||
      decoded?.UserId ||
      decoded?.userId ||
      decoded?.Id ||
      decoded?.id ||
      decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
      decoded?.["http://schemas.microsoft.com/identity/claims/objectidentifier"] ||
      null
    );
  };

  const getRoleFromToken = (decoded) => {
    return (
      decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      decoded?.role ||
      decoded?.Role ||
      ""
    );
  };

  const getNameFromToken = (decoded) => {
    return decoded?.Username || decoded?.name || decoded?.Name || "Admin";
  };

  // ---- effect --------------------------------------------------------------
  useEffect(() => {
    isMounted.current = true;

    const run = async () => {
      const token = localStorage.getItem("jwt");
      if (!token) {
        console.warn("[UsersDashboard] No JWT present in localStorage");
        setLoading(false);
        return;
      }

      let decoded;
      try {
        decoded = jwtDecode(token);
      } catch (err) {
        console.error("[UsersDashboard] Token decode error:", err);
        setLoading(false);
        return;
      }

      const role = String(getRoleFromToken(decoded) || "").toLowerCase();
      const displayName = getNameFromToken(decoded);
      setAdminName(displayName);
      setUserRole(role);

      const allowed = new Set(["admin", "faculty", "college"]);
      if (!allowed.has(role)) {
        console.warn("[UsersDashboard] Role not allowed for this page:", role);
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const ac = new AbortController();

      try {
        let apiUrl = "";
        if (role === "college") {
          const instructorId = getInstructorIdFromToken(decoded);
          if (!instructorId) {
            console.error(
              "[UsersDashboard] Role=college but no instructorId found in token claims."
            );
            setLoading(false);
            return;
          }
          apiUrl = `${API_BASE_URL}/InstructorSummary/collegedashboard/${instructorId}`;
        } else {
          apiUrl = `${API_BASE_URL}/AdminSummary/dashboard`;
        }

        console.log("[UsersDashboard] Making API request to:", apiUrl);

        const res = await fetch(apiUrl, {
          method: "GET",
          headers,
          signal: ac.signal,
        });

        console.log("[UsersDashboard] API response:", {
          status: res.status,
          statusText: res.statusText,
          ok: res.ok,
          url: res.url,
          headers: Object.fromEntries(res.headers.entries()),
        });

        if (!isMounted.current || ac.signal.aborted) {
          console.log(
            "[UsersDashboard] Unmounted or aborted before processing response"
          );
          return;
        }

        if (!res.ok) {
          const errorText = await res.text().catch(() => "(no body)");
          console.error("[UsersDashboard] Request failed:", {
            status: res.status,
            statusText: res.statusText,
            responseText: errorText,
          });
          setLoading(false);
          return;
        }

        const data = await res.json().catch((e) => {
          console.error("[UsersDashboard] JSON parse failed:", e);
          return null;
        });

        if (!isMounted.current || ac.signal.aborted) {
          console.log(
            "[UsersDashboard] Unmounted or aborted after parsing JSON"
          );
          return;
        }

        console.log("[UsersDashboard] Raw API data:", data);

        // Normalize shapes:
        if (role === "college") {
          // Expected keys from collegedashboard:
          // studentCount, professorCount, courseCount, bookCount, liveClassCount, taskCount, examCount (various casings)
          const students =
            Number(data?.studentCount ?? data?.StudentCount ?? 0) || 0;
          const professors =
            Number(data?.professorCount ?? data?.ProfessorCount ?? 0) || 0;
          const users =
            Number(
              data?.userCount ?? data?.UserCount ?? data?.users ?? 0
            ) || 0; // fallback if backend adds it later

          const normalized = { students, professors, users };
          console.log("[UsersDashboard] Processed summary (college):", normalized);
          setSummary(normalized);
        } else {
          // AdminSummary/dashboard expected: students, professors, users (or similar)
          const students =
            Number(data?.students ?? data?.Students ?? data?.studentCount ?? 0) ||
            0;
          const professors =
            Number(
              data?.professors ?? data?.Professors ?? data?.professorCount ?? 0
            ) || 0;
          const users =
            Number(data?.users ?? data?.Users ?? data?.userCount ?? 0) || 0;

          const normalized = { students, professors, users };
          console.log("[UsersDashboard] Processed summary (admin/faculty):", normalized);
          setSummary(normalized);
        }
      } catch (err) {
        if (err?.name === "AbortError" || err?.code === 20) {
          console.log("[UsersDashboard] Request was aborted (normal on unmount)");
        } else {
          console.error("[UsersDashboard] Dashboard fetch error:", {
            name: err?.name,
            message: err?.message,
            stack: err?.stack,
          });
        }
      } finally {
        if (isMounted.current) {
          console.log("[UsersDashboard] Setting loading=false");
          setLoading(false);
        }
      }

      return () => ac.abort();
    };

    run();

    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader" />
        </div>
      )}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Admin" />

      <div className="section-wrapper">
        <div className="page admin-dashboard pt-0">
          <div className="section-body mt-3 pt-0">
            <div className="container-fluid">
              {/* Welcome Header */}
              <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
                <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                  <i className="fa-solid fa-user-secret" /> Manage Users
                </h2>
                <p className="text-muted mb-0 dashboard-hero-sub">
                  View and Manage all Users in LMS
                </p>
              </div>

              {/* Dashboard Cards */}
              <div className="row d-flex justify-content-center">
                {[
                  {
                    label: "Students",
                    value: summary.students,
                    icon: "fa-user",
                    link: "/students",
                  },
                  {
                    label: "Faculty",
                    value: summary.professors,
                    icon: "fa-user-tie",
                    link: "/professors",
                  },
                  // Only show Others card if role is not College
                  ...(String(userRole).toLowerCase() !== "college"
                    ? [
                        {
                          label: "Others",
                          value: summary.users,
                          icon: "fa-users",
                          link: "/admin-users",
                        },
                      ]
                    : []),
                ].map((item, idx) => (
                  <div className="col-12 col-sm-6 col-lg-3 mb-4" key={idx}>
                    <div
                      className="card-body text-center welcome-card animate-welcome"
                      onClick={() => navigate(item.link)}
                      role="button"
                    >
                      <div className="card-body text-center">
                        <i className={`fa ${item.icon} fa-3x mb-2 text-primary`} />
                      </div>
                      <h6 className="text-muted mb-1">{item.label}</h6>
                      <h3 className="text-dark fw-bold">{item.value}</h3>
                      <a
                        href={item.link}
                        className="badge text-primary px-3 py-2 rounded-pill mt-2 text-decoration-none"
                        onClick={(e) => e.preventDefault()}
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default UsersDashboard;
