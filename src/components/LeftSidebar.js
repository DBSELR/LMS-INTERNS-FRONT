// src/components/LeftSidebar.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../App.css";

function LeftSidebar({ role: propRole }) {
  /* ===== Debug helpers ===== */
  const DEBUG = true;
  const log = (...args) => DEBUG && console.log("[LeftSidebar]", ...args);
  const group = (label, fn) => {
    if (!DEBUG) return fn?.();
    console.groupCollapsed(`[LeftSidebar] ${label}`);
    try { fn?.(); } finally { console.groupEnd(); }
  };

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
      log("Mounted: small screen, sidebar CLOSED by default");
    } else {
      document.body.classList.add("sidebar-open"); // open by default on desktop
      log("Mounted: desktop, sidebar OPEN by default");
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
            log("Resize -> now MOBILE: closing sidebar by default");
          } else {
            document.body.classList.add("sidebar-open"); // open on desktop
            log("Resize -> now DESKTOP: opening sidebar by default");
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
      group("loadFromStorage()", () => {
        const token = localStorage.getItem("jwt");
        log("jwt present?", !!token);

        if (token) {
          try {
            const decoded = jwtDecode(token);
            log("decoded token:", decoded);

            const resolvedRole =
              decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
              decoded?.role ||
              "";
            const name =
              decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
              decoded?.Username ||
              decoded?.name ||
              "User";

            setRole(resolvedRole);
            setUserName(name);
            log("resolved role:", resolvedRole, "resolved name:", name);
          } catch (err) {
            console.error("[LeftSidebar] Token decode failed", err);
            setRole(propRole || "");
            setUserName("User");
          }
        } else {
          setRole(propRole || "");
          setUserName("User");
          log("no token; using propRole:", propRole || "");
        }

        const rawMenus = localStorage.getItem("menus");
        log("raw menus in storage:", rawMenus);

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
            log("normalized menus (sanitized):", normalized);
          } catch (e) {
            console.error("[LeftSidebar] Failed to parse menus from storage", e);
            setServerMenus([]);
          }
        } else {
          setServerMenus([]);
          log("no menus in storage; serverMenus cleared");
        }
      });
    };

    loadFromStorage();

    const onStorage = (evt) => {
      group("storage event", () => {
        log("key:", evt?.key, "oldValue:", evt?.oldValue, "newValue:", evt?.newValue);
        loadFromStorage();
      });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propRole]);

  /* ===== On route change: auto-close on small screens ===== */
  useEffect(() => {
    if (isSmallScreen()) {
      document.body.classList.remove("sidebar-open");
      log("route changed ->", location.pathname, "auto-closing sidebar on MOBILE");
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
        log("mobile: click outside sidebar -> closing");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    log("mounted click-outside listener (mobile only)");
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      log("unmounted click-outside listener");
    };
  }, []);

  /* ===== Keyboard: Esc closes on mobile ===== */
  useEffect(() => {
    const onKey = (e) => {
      if (!isSmallScreen()) return;
      if (e.key === "Escape") {
        document.body.classList.remove("sidebar-open");
        log("mobile: ESC pressed -> closing sidebar");
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
      log("menu item selected on MOBILE -> closing sidebar");
    }
  };

  return (
    <div id="left-sidebar" ref={sidebarRef} className="sidebar" style={{ paddingTop: "10px" }}>
      <div className="sidebar-header" style={{ padding: 0, paddingLeft: "20px" }}>
        <h5 className="brand-name d-flex align-items-center">
          <img src="/assets/5mantra.png" alt="logo" height="50" />
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

                DEBUG &&
                  console.debug(
                    "[LeftSidebar] render menu",
                    { idx: index, href: item.href, label: item.label },
                    "active?", active
                  );

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
