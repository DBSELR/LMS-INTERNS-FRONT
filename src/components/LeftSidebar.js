// src/components/LeftSidebar.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../App.css";

function LeftSidebar({ role: propRole }) {
  const isSmallScreen = () => (typeof window !== "undefined" ? window.innerWidth <= 767 : false);

  const location = useLocation();
  const sidebarRef = useRef(null);
  const [userName, setUserName] = useState("User");
  const [role, setRole] = useState(propRole || "");
  const [serverMenus, setServerMenus] = useState([]);
  const [mobile, setMobile] = useState(isSmallScreen());

  // Force dynamic-only menus (no fallback)
  const DYNAMIC_ONLY = true;

  /* ===== Mount: set initial open/close by screen size ===== */
  useEffect(() => {
    const mobileNow = isSmallScreen();
    setMobile(mobileNow);
    if (mobileNow) {
      document.body.classList.remove("sidebar-open"); // closed by default on mobile
    } else {
      document.body.classList.add("sidebar-open"); // open by default on desktop
    }
  }, []);

  /* ===== Handle window resize (debounced) to toggle default state ===== */
  useEffect(() => {
    let t;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const nowMobile = isSmallScreen();
        if (nowMobile !== mobile) {
          setMobile(nowMobile);
          if (nowMobile) {
            document.body.classList.remove("sidebar-open"); // switch to closed on mobile
          } else {
            document.body.classList.add("sidebar-open"); // open on desktop
          }
        }
      }, 120);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, [mobile]);

  /* ===== Load user + menus from storage (and on storage updates) ===== */
  useEffect(() => {
    const loadFromStorage = () => {
      const token = localStorage.getItem("jwt");

      if (token) {
        try {
          const decoded = jwtDecode(token);

          const resolvedRole =
            decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
            decoded?.role ||
            "";
          const tokenName =
            decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
            decoded?.Username ||
            decoded?.name ||
            "User";

          setRole(resolvedRole);
          setUserName(tokenName);
        } catch (err) {
          setRole(propRole || "");
          setUserName("User");
        }
      } else {
        setRole(propRole || "");
        setUserName("User");
      }

      const rawMenus = localStorage.getItem("menus");

      if (rawMenus) {
        try {
          const parsed = JSON.parse(rawMenus);

          // Normalize & sanitize menu items
          const normalized = (Array.isArray(parsed) ? parsed : [])
            .filter((m) => typeof m?.path === "string" && m.path.trim().length > 0)
            .map((m) => {
              let href = m.path.trim().replace(/\s+/g, " ");
              if (!href.startsWith("/")) href = "/" + href;
              href = href.replace(/\s+$/g, "");
              return {
                icon: m?.icon || "fa fa-circle",
                label: (m?.text || m?.mainMenuName || "Menu").toString().trim(),
                href,
                order: Number.isFinite(m?.order) ? m.order : 0,
              };
            })
            .sort((a, b) => a.order - b.order);

          setServerMenus(normalized);
        } catch (e) {
          setServerMenus([]);
        }
      } else {
        setServerMenus([]);
      }
    };

    loadFromStorage();

    const onStorage = () => {
      loadFromStorage();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propRole]);

  /* ===== On route change: auto-close on small screens ===== */
  useEffect(() => {
    if (isSmallScreen()) {
      document.body.classList.remove("sidebar-open");
    }
  }, [location.pathname]);

  /* ===== Click-outside to close on mobile only ===== */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isSmallScreen()) return;

      const sidebar = sidebarRef.current;
      const isInside = sidebar && sidebar.contains(event.target);
      const isMenuToggleClick = event.target.closest?.(".menu_toggle");
      if (!isInside && !isMenuToggleClick) {
        document.body.classList.remove("sidebar-open");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ===== Keyboard: Esc closes on mobile ===== */
  useEffect(() => {
    const onKey = (e) => {
      if (!isSmallScreen()) return;
      if (e.key === "Escape") {
        document.body.classList.remove("sidebar-open");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /* ===== Menus ===== */
  const menuItems = useMemo(() => (DYNAMIC_ONLY ? serverMenus : serverMenus), [serverMenus]);

  /* ===== Active route helpers ===== */
  const path = location.pathname;

  const isCoursewareActive =
    path === "/my-courseware" ||
    path.startsWith("/view-course-content") ||
    path.startsWith("/instructor/upload-course-content");

  const isManageUsersActive =
    path.startsWith("/students") ||
    path.startsWith("/professors") ||
    path.startsWith("/admin-users");

  // Treat item as active if the current path equals it OR starts with it (parent routes)
  const isPathActiveForItem = (itemHref) => {
    if (!itemHref) return false;
    if (path === itemHref) return true;
    // Avoid "/" matching everything
    if (itemHref !== "/" && path.startsWith(itemHref + "/")) return true;
    return false;
  };

  // Some menus act as "parents" for groups of routes; broaden active rules here.
  const isGroupedActive = (itemHref) => {
    // Any alias your dynamic "Manage Users" item might use:
    const manageUsersAliases = ["/users-dashboard", "/manage-users", "/users"];
    if (manageUsersAliases.includes(itemHref)) {
      return isManageUsersActive || isPathActiveForItem(itemHref);
    }
    if (itemHref === "/my-courseware") {
      return isCoursewareActive;
    }
    // Fallback: normal prefix match
    return isPathActiveForItem(itemHref);
  };

  // Close helper (used on menu click)
  const closeIfMobile = () => {
    if (isSmallScreen()) {
      document.body.classList.remove("sidebar-open");
    }
  };

  return (
    <div id="left-sidebar" ref={sidebarRef} className="sidebar" style={{ paddingTop: "10px" }}>
      <div className="sidebar-header" style={{ padding: 0, paddingLeft: "20px" }}>
        <h5 className="brand-name d-flex align-items-center">
          <img src="/assets/EdVedha-Logo.png" alt="logo" height="32" />
        </h5>
      </div>

      <div className="sidebar-welcome" style={{ padding: "0px" }}>
        <div
          className="welcome-card animate-welcome"
          style={{
            minHeight: "0px",
            margin: "auto",
            alignItems: "center",
            textAlign: "center",
            marginTop: "5px",
            marginBottom: "5px",
          }}
        >
          <div className="text-center" style={{ padding: "0px" }}>
            <div className="welcome-name">
              {userName} - ({role || "N/A"})
            </div>
          </div>
        </div>
      </div>

      <div>
        <nav className="sidebar-nav">
          <ul className="metismenu">
            {menuItems.length === 0 ? (
              <li className="text-muted px-3" style={{ opacity: 0.8 }}>
                No menus assigned to this role.
              </li>
            ) : (
              menuItems.map((item, index) => {
                const active = isGroupedActive(item.href);

                return (
                  <li key={`${item.href || "menu"}-${index}`}>
                    <NavLink
                      to={item.href || "#"}
                      className={`d-flex align-items-center ${active ? "fw-bold text-primary" : ""}`}
                      onClick={closeIfMobile}
                    >
                      <i className={`${item.icon || "fa fa-circle"} mr-2`} />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                );
              })
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default LeftSidebar;
