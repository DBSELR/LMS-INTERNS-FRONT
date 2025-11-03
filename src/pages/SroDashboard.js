// File: src/pages/SRODashboard.jsx
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

function SRODashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    students: 0,
    programmes: 0,
    tasks: 0,
    leaves: 0,
    liveClasses: 0,
  });
  const [sroName, setSroName] = useState("SRO");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔄 SRO Dashboard useEffect triggered");
    const token = localStorage.getItem("jwt");
    if (!token) {
      console.log("❌ No JWT token found");
      setLoading(false);
      return;
    }
    console.log("✅ JWT token found, proceeding with decode");

    try {
      const decoded = jwtDecode(token);
      console.log("🔍 JWT Decoded:", decoded);
      
      const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      const name = decoded["Username"] || decoded.name || "SRO";
      
      // Extract userId from JWT token
      const extractedUserId = decoded["UserId"] || decoded.userId || decoded["user_id"] || decoded.id || decoded.sub;
      const finalUserId = !isNaN(Number(extractedUserId)) ? Number(extractedUserId) : extractedUserId;
      
      console.log("👤 User Details:", { role, name, extractedUserId, finalUserId });
      
      setSroName(name);
      setUserId(finalUserId);

      // if (role !== "SRO") {
      //   setLoading(false);
      //   navigate("/unauthorized");
      //   return;
      // }

      const fetchSummary = async () => {
        if (!finalUserId) {
          console.error("❌ UserId not found in token");
          setLoading(false);
          return;
        }

        console.log("🚀 Starting API call with UserId:", finalUserId);

        try {
          const token = localStorage.getItem("jwt");
          const apiUrl = `${API_BASE_URL}/SROSummary/dashboard/${finalUserId}`;
          console.log("📡 API URL:", apiUrl);
          
          const res = await fetch(apiUrl, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          
          console.log("📊 API Response Status:", res.status, res.statusText);
          
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          
          const data = await res.json();
          console.log("✅ API Response Data:", data);
          
          setSummary({
            students: data.students || 0,
            programmes: data.programmes || 0,
            tasks: data.tasks || 0,
            leaves: data.leaves || 0,
            liveClasses: data.liveClasses || 0,
          });
          
          console.log("📈 Summary State Updated:", {
            students: data.students || 0,
            programmes: data.programmes || 0,
            tasks: data.tasks || 0,
            leaves: data.leaves || 0,
            liveClasses: data.liveClasses || 0,
          });
        } catch (err) {
          console.error("❌ Failed to fetch dashboard summary", err);
        } finally {
          setLoading(false);
          console.log("🏁 Loading completed");
        }
      };

      fetchSummary();
    } catch (err) {
      console.error("❌ Token decode error", err);
      setLoading(false);
    }
  }, []);

  const cards = [
    { label: "Tickets", value: summary.students, icon: "fa-ticket", link: "/instructor/support-tickets" },
    { label: "Tasks", value: summary.tasks, icon: "fa-tasks", link: "/taskboard" },
  ];

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader" />
        </div>
      )}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="SRO" />

      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">

            {/* Welcome Header */}

            <div className="jumbotron bg-light p-4 rounded shadow-sm mb-4 welcome-card animate-welcome">
                          <h2 className="page-title text-primary">
                            Welcome back, <strong>{sroName}</strong> 👋
                          </h2>
                          <p className="text-muted mb-0">
                           Here’s a quick overview of your responsibilities.
                          </p>
                        </div>

            {/* Dashboard Cards */}
            <div className="row">
              {cards.map((item, idx) => (
                <div className="col-12 col-sm-6 col-lg-3 mb-4" key={idx}>
                  <div className="card-body text-center welcome-card animate-welcome">
                    <div className="card-body text-center">
                      <i className={`fa ${item.icon} fa-2x mb-2 text-primary`} />
                    </div>
                    <h6 className="text-muted mb-1">{item.label}</h6>
                    <h2 className="text-dark fw-bold">{item.value}</h2>
                    <a
                      href={item.link}
                      className="badge text-primary px-3 py-2 rounded-pill mt-2 text-decoration-none"
                    >
                      Manage {item.label} <i className="fa fa-arrow-right mr-1"></i>
                    </a>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
         
      </div>
    </div>
  );
}

export default SRODashboard;
