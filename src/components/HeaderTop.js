// import React, { useEffect, useState } from "react";
// import { jwtDecode } from "jwt-decode";

// function HeaderTop() {
//   const [role, setRole] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem("jwt");
//     const user = JSON.parse(localStorage.getItem("user")) || {};

//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         const userRole = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role;
//         setRole(userRole);
//       } catch (err) {
//         console.error("JWT decode error", err);
//       }
//     }
//   }, []);

//   return (
//     <div id="header_top" className="header_top">
//       <div className="container">
//         <div className="hleft">
//           <a className="header-brand" href="/"><i className="fa fa-graduation-cap brand-logo"></i></a>
//           <div className="dropdown">
//             <a href="#" className="nav-link icon menu_toggle"><i className="fe fe-align-center"></i></a>

//             {/* Restrict Profile Link for Students */}
//             {role == "Instructor" && (
//               <a href="/instructor-profile" className="nav-link icon xs-hide">
//                 <i className="fe fe-user" title="Profile"></i>
//               </a>
//             )}
//                  {role == "Student" && (
//               <a href="/student-profile" className="nav-link icon xs-hide">
//                 <i className="fe fe-user" title="Profile"></i>
//               </a>
//             )}

//             {/* <a href="/search" className="nav-link icon"><i className="fe fe-search" title="Search..."></i></a> */}
//             <a href="/inbox" className="nav-link icon app_inbox"><i className="fe fe-inbox" title="Inbox"></i></a>
//             {/* <a href="/social" className="nav-link icon xs-hide"><i className="fe fe-share-2" title="Social Media"></i></a> */}
//           </div>
//         </div>
//         <div className="hright">
//           {/* <a href="#" className="nav-link icon right_tab"><i className="fe fe-align-right"></i></a> */}
//           <a href="/" className="nav-link icon settingbar"><i className="fe fe-power" title="Logout"></i></a>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default HeaderTop;
// File: components/HeaderTop.jsx
// File: components/HeaderTop.jsx
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

function HeaderTop({ notificationCount = 0 }) {
  const [role, setRole] = useState(null);
  const [dashboardLink, setDashboardLink] = useState("/");

  useEffect(() => {
    const token = localStorage.getItem("jwt");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userRole =
          decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ] || decoded.role;
        setRole(userRole);

        let link = "/";
        if (userRole === "Admin") link = "/admin-dashboard";
        else if (userRole === "Instructor") link = "/instructor-dashboard";
        else if (userRole === "Student") link = "/student-dashboard";

        setDashboardLink(link);
      } catch (err) {
        console.error("JWT decode error", err);
      }
    }
  }, []);

  const handleToggleSidebar = (e) => {
    e.preventDefault();
    document.body.classList.toggle("sidebar-open");
  };

  return (
    <div id="header_top" className="header_top">
      <div className="container">
        <div className="hleft">
          <a
            className="header-brand d-flex align-items-center"
            href={dashboardLink}
            style={{ textDecoration: "none" }}
          >
            <img
              src="/assets/images.jpg"
              alt="DBS Logo"
              style={{
                background: "#f5f5f5",
                height: "40px",
                width: "40px",
                borderRadius: "50%",
                padding: "5px",
                margin: "5px",
                marginLeft: "10px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                objectFit: "contain",
              }}
            />
          </a>

          <div className="dropdown">
            <a
              href="#"
              className="nav-link icon menu_toggle"
              onClick={(e) => {
                e.preventDefault();
                document.body.classList.toggle("sidebar-open");
              }}
            >
              <i className="fe fe-align-justify" title="Toggle Menu"></i>
            </a>

            {/* Profile icon for all users */}
            <a href="/profile" className="nav-link icon xs-hide">
              <i className="fe fe-user" title="Profile"></i>
            </a>

            {role !== "Student" && (
              <a href="/inbox" className="nav-link icon app_inbox">
                <i className="fe fe-mail" title="Inbox"></i>
              </a>
            )}

            {role === "Admin" && (
              <a href="/AdminNoticeboardPage" className="nav-link icon">
                <i className="fe fe-clipboard" title="Noticeboard"></i>
              </a>
            )}

            {role === "Student" && (
              <a href="/StudentNoticeboard" className="nav-link icon">
                <i className="fe fe-book-open" title="Noticeboard"></i>
              </a>
            )}

            <a
              href="/Notifications"
              className="nav-link icon position-relative"
            >
              <i className="fe fe-bell" title="Notifications"></i>
              {notificationCount > 0 && (
                <span
                  className="badge badge-danger"
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-30px",
                    fontSize: "0.7rem",
                    borderRadius: "12px",
                    padding: "2px 8px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Notification
                </span>
              )}
            </a>
          </div>
        </div>

        <div className="hright">
          <a
            href="#"
            className="nav-link icon settingbar"
            onClick={(e) => {
              e.preventDefault();
              localStorage.removeItem("jwt");
              localStorage.removeItem("user");
              window.location.href = "/";
            }}
          >
            <i className="fe fe-power" title="Logout"></i>
          </a>
        </div>
      </div>
    </div>
  );
}

export default HeaderTop;
