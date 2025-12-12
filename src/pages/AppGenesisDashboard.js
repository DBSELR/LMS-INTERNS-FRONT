// File: src/pages/AppGenesisDashboard.js
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

function AppGenesisDashboard() {
  console.log("=== AppGenesisDashboard: Component initialized ===");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [instructorName, setInstructorName] = useState("AppGenesis");

  // Summary fields based on sp_AppGenesis_GetDashboard
  const [summary, setSummary] = useState({
    studentsCount: 0,
    approved: 0,
    tobeApproved: 0,
  });

  useEffect(() => {
  let isMounted = true;
  const ac = new AbortController();

  (async () => {
    console.log("=== AppGenesisDashboard: Starting data fetch ===");
    
    const token = localStorage.getItem("jwt");
    console.log("Token retrieved from localStorage:", token ? "Token exists" : "No token found");
    
    if (!token) { 
      console.log("No JWT token found, stopping execution");
      if (isMounted) setLoading(false); 
      return; 
    }

    // decode safely
    let decoded;
    try { 
      decoded = jwtDecode(token); 
      console.log("JWT decoded successfully:", decoded);
    } catch (error) { 
      console.error("JWT decode failed:", error);
      if (isMounted) setLoading(false); 
      return; 
    }

    const role =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      decoded.role || "";
    const name = decoded["Username"] || decoded.name || "AppGenesis";
    const instructorId = decoded?.UserId ?? decoded?.id ?? 0;

    console.log("Extracted from JWT:", { role, name, instructorId });

    if (isMounted) setInstructorName(name);
    
    if (role !== "AppGenesis") {
      console.log(`Role check failed. Expected: 'AppGenesis', Found: '${role}'`);
      if (isMounted) setLoading(false); 
      return; 
    }
    
    if (!instructorId) {
      console.log("No instructorId found in JWT");
      if (isMounted) setLoading(false); 
      return; 
    }

    const headers = { Authorization: `Bearer ${token}` };
    console.log("Request headers prepared:", headers);

    try {
      const apiUrl = `${API_BASE_URL}/AdminSummary/AppGenesisdashboard`;
      console.log("Making API request to:", apiUrl);
      
      const res = await fetch(
        apiUrl,
        { method: "GET", headers, signal: ac.signal }
      );

      console.log("API response received:", {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        headers: Object.fromEntries(res.headers.entries())
      });

      if (!isMounted || ac.signal.aborted) {
        console.log("Component unmounted or request aborted before processing response");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        console.log("Raw API response data:", data);
        
        if (!isMounted || ac.signal.aborted) {
          console.log("Component unmounted or request aborted after parsing JSON");
          return;
        }

        const summaryData = {
          studentsCount: Number(data.studentsCount || data.StudentsCount) || 0,
          approved: Number(data.approved) || 0,
          tobeApproved: Number(data.tobeApproved) || 0,
        };
        
        console.log("Processed summary data:", summaryData);
        setSummary(summaryData);
      } else {
        const errorText = await res.text();
        console.error("API request failed:", {
          status: res.status,
          statusText: res.statusText,
          responseText: errorText
        });
      }
    } catch (err) {
      // Ignore fetch aborts; rethrow/log others
      if (err && (err.name === "AbortError" || err.code === 20)) {
        console.log("Request was aborted (this is normal during component unmount)");
      } else {
        console.error("Dashboard fetch error:", {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
      }
    } finally {
      console.log("Setting loading to false");
      if (isMounted) setLoading(false);
    }
  })();

  return () => {
    console.log("=== AppGenesisDashboard: Cleanup function called ===");
    isMounted = false;
    ac.abort();
  };
}, []);


  console.log("=== AppGenesisDashboard: Component render ===");
  console.log("Current summary state:", summary);
  console.log("Loading state:", loading);
  console.log("Instructor name:", instructorName);

  // Cards wired to proc fields
  const cards = [
    { label: "Total Students", value: summary.studentsCount, icon: "fa-users", link: "#" },
    { label: "Approved", value: summary.approved, icon: "fa-users", link: "#" },
    { label: "To be Approve", value: summary.tobeApproved, icon: "fa-users", link: "#" },
 
  ];

  console.log("Dashboard cards:", cards);

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader"></div>
        </div>
      )}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="AppGenesis" />

      <div className="section-wrapper">
        <div className="page admin-dashboard pt-0">
          <div className="section-body mt-3 pt-0">
            <div className="container-fluid">
              {/* Hero */}
              <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
                <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                  Welcome back, <strong>{instructorName}</strong> 👋
                </h2>
                <p className="text-muted mb-0 dashboard-hero-sub">
                  Here’s a quick snapshot of AppGenesis dashboard
                </p>
              </div>

              {/* Cards */}
              <div className="row">
                {cards.map((item, idx) => (
                  <div className="col-12 col-sm-6 col-lg-3 mb-3" key={idx}>
                    <div
                      className="welcome-card dashboard-card animate-welcome text-center"
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(item.link)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate(item.link)}
                      style={{ cursor: "pointer" }}
                      aria-label={`Open ${item.label}`}
                      title={`Go to ${item.label}`}
                    >
                      <i className={`fa ${item.icon} dashboard-icon text-primary`} />
                      <div className="dashboard-label text-muted">{item.label}</div>
                      <div className="dashboard-count text-dark fw-bold">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* If you want to reintroduce grading later, add it back here */}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default AppGenesisDashboard;
