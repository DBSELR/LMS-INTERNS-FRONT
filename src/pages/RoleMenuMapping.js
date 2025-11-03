// src/pages/RoleMenuMapping.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import API_BASE_URL from "../config";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import HeaderTop from "../components/HeaderTop";
import Footer from "../components/Footer";

const RoleMenu_API = `${API_BASE_URL}/rolemenu`;

/* ============================= DEBUG CONSOLE ============================= */
const DEBUG = true; // ⬅️ flip to false to silence all logs

function ts() {
  return new Date().toISOString();
}
function log(...args) {
  if (!DEBUG) return;
  console.log(`[ROLE-MENU ${ts()}]`, ...args);
}
function group(label) {
  if (!DEBUG) return { end: () => {} };
  console.groupCollapsed(`🧭 ${label}`);
  return { end: () => console.groupEnd() };
}
function logRequest(label, { url, method = "GET", headers, body }) {
  if (!DEBUG) return;
  console.groupCollapsed(`📤 ${label} REQUEST`);
  console.log("URL:", url);
  console.log("Method:", method);
  console.log("Headers:", headers);
  if (body !== undefined) {
    try {
      console.log("Body (parsed):", JSON.parse(body));
    } catch {
      console.log("Body (text):", body);
    }
  }
  console.groupEnd();
}
function logResponse(label, res, ms, textPeek) {
  if (!DEBUG) return;
  console.groupCollapsed(`📥 ${label} RESPONSE`);
  console.log("Status:", res.status, res.statusText);
  console.log("Duration:", `${ms.toFixed(1)} ms`);
  try {
    console.log("Peek (first 300 chars):", (textPeek || "").slice(0, 300));
  } catch {}
  console.groupEnd();
}
async function apiFetch(label, url, options = {}) {
  const start = performance.now();
  const outHeaders = options.headers || {};
  logRequest(label, { url, method: options.method || "GET", headers: outHeaders, body: options.body });

  let res;
  try {
    res = await fetch(url, options);
  } catch (err) {
    if (DEBUG) {
      console.groupCollapsed(`❌ ${label} NETWORK ERROR`);
      console.error(err);
      console.groupEnd();
    }
    throw err;
  }

  const clone = res.clone();
  const text = await clone.text().catch(() => "");
  const elapsed = performance.now() - start;
  logResponse(label, res, elapsed, text);

  let json;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {}
  return { res, json, text, elapsed };
}
/* =========================== END DEBUG CONSOLE =========================== */

function RoleMenuMapping() {
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // NEW: search queries
  const [roleQuery, setRoleQuery] = useState("");
  const [menuQuery, setMenuQuery] = useState("");

  // NEW: Menu ordering states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [mainMenus, setMainMenus] = useState([]);
  const [orderedMenus, setOrderedMenus] = useState([]);

  // NEW: master checkbox ref for tri-state
  const masterMenuRef = useRef(null);

  // small helper to build auth headers safely
  const authHeaders = () => {
    const token = localStorage.getItem("jwt");
    if (DEBUG) log("🔐 JWT present?", Boolean(token));
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ✅ Fetch roles
  const fetchRoles = async () => {
    const label = "Fetch Roles";
    try {
      const { res, json } = await apiFetch(label, `${RoleMenu_API}/roles`, {
        headers: { ...authHeaders() },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const list = Array.isArray(json) ? json : [];
      setRoles(list);
      if (DEBUG) {
        const g = group("Roles Loaded");
        console.table(list);
        g.end();
      }
    } catch (err) {
      console.error("Error fetching roles", err);
      toast.error("Error fetching roles");
    }
  };

  // ✅ Fetch menus
  const fetchMenus = async () => {
    const label = "Fetch Menus";
    try {
      const { res, json } = await apiFetch(label, `${RoleMenu_API}/menus`, {
        headers: { ...authHeaders() },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const list = Array.isArray(json) ? json : [];
      setMenus(list);
      if (DEBUG) {
        const g = group("Menus Loaded");
        console.table(list);
        g.end();
      }
    } catch (err) {
      console.error("Error fetching menus", err);
      toast.error("Error fetching menus");
    }
  };

  // ✅ Fetch mappings
  const fetchMappings = async () => {
    const label = "Fetch Role-Menu Mappings";
    try {
      const { res, json } = await apiFetch(label, `${RoleMenu_API}/rolemenumappings`, {
        headers: { ...authHeaders() },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const list = Array.isArray(json) ? json : [];
      setMappings(list);
      if (DEBUG) {
        const g = group("Mappings Loaded");
        console.table(list);
        g.end();
      }
    } catch (err) {
      console.error("Error fetching mappings", err);
      toast.error("Error fetching mappings");
    }
  };

  // ✅ Fetch main menus for ordering
  const fetchMainMenus = async () => {
    console.log("🚀 [DEBUG] fetchMainMenus called");
    const label = "Fetch Main Menus";
    try {
      console.log("🚀 [DEBUG] Making API call to GetMainMenu");
      console.log("🚀 [DEBUG] Auth headers:", authHeaders());
      
      const { res, json } = await apiFetch(label, "https://localhost:7099/api/RoleMenu/GetMainMenu", {
        headers: { ...authHeaders() },
      });
      
      console.log("🚀 [DEBUG] API response:", {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText
      });
      console.log("🚀 [DEBUG] Raw JSON response:", json);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const list = Array.isArray(json) ? json : [];
      console.log("🚀 [DEBUG] Converted to array, length:", list.length);
      console.log("🚀 [DEBUG] First few items:", list.slice(0, 3));
      
      // Sort by mord (menu order)
      const sortedList = list.sort((a, b) => a.mord - b.mord);
      console.log("🚀 [DEBUG] Sorted list, first few items:", sortedList.slice(0, 3));
      console.log("🚀 [DEBUG] Setting mainMenus and orderedMenus state");
      
      setMainMenus(sortedList);
      setOrderedMenus(sortedList);
      
      if (DEBUG) {
        const g = group("Main Menus Loaded");
        console.table(sortedList);
        g.end();
      }
      console.log("🚀 [DEBUG] fetchMainMenus completed successfully");
    } catch (err) {
      console.error("🚀 [DEBUG] Error in fetchMainMenus:", err);
      console.error("🚀 [DEBUG] Error stack:", err.stack);
      toast.error("Error fetching main menus");
    }
  };

  // ✅ Fetch details for edit
  const fetchMappingDetails = async (roleId) => {
    const label = `Fetch Mapping Details (roleId=${roleId})`;
    try {
      const { res, json } = await apiFetch(label, `${RoleMenu_API}/rolemenumapping/${roleId}`, {
        headers: { ...authHeaders() },
      });
      if (!res.ok) throw new Error("Failed to fetch mapping details");

      if (DEBUG) {
        const g = group("Mapping Details Raw");
        console.log(json);
        g.end();
      }

      setSelectedRole(json?.role?.roleId ?? "");
      const selectedIds = Array.isArray(json?.menus) ? json.menus.map((m) => m.menuId) : [];
      setSelectedMenus(selectedIds);

      // reset searches when opening
      setMenuQuery("");
      setRoleQuery("");

      setEditMode(true);
      setShowModal(true);

      if (DEBUG) {
        log("✏️ Entering EDIT MODE for roleId:", json?.role?.roleId);
        console.table(selectedIds.map((id) => ({ menuId: id })));
      }
    } catch (err) {
      console.error("Error fetching mapping details", err);
      toast.error("Error fetching mapping details");
    }
  };

  useEffect(() => {
    if (DEBUG) log("🔄 initial load…");
    fetchRoles();
    fetchMenus();
    fetchMappings();
  }, []);

  const handleMenuChange = (menuId) => {
    setSelectedMenus((prev) => {
      const next = prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId];
      if (DEBUG) {
        const g = group("Menu Selection Changed");
        console.log("Clicked menuId:", menuId);
        console.log("Prev count:", prev.length, "Next count:", next.length);
        console.table(next.map((id) => ({ menuId: id })));
        g.end();
      }
      return next;
    });
  };

  const openModal = (map = null) => {
    if (DEBUG) log("🪟 openModal called with:", map);
    if (map) {
      fetchMappingDetails(map.roleId);
    } else {
      setEditMode(false);
      setSelectedRole("");
      setSelectedMenus([]);
      setMenuQuery("");
      setRoleQuery("");
      setShowModal(true);
      if (DEBUG) log("➕ Entering ADD MODE");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }
    if (selectedMenus.length === 0) {
      toast.error("Please select at least one menu");
      return;
    }

    const payload = {
      roleId: parseInt(selectedRole, 10),
      menuIds: selectedMenus.join(","),
    };
    if (DEBUG) {
      const g = group("Submitting Mapping Payload");
      console.log(payload);
      g.end();
    }

    try {
      const { res } = await apiFetch(
        editMode ? "Update Mapping" : "Create Mapping",
        `${RoleMenu_API}/rolemenumapping`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to save mapping");

      toast.success(editMode ? "Mapping updated!" : "Mapping added!");
      setShowModal(false);
      setSelectedRole("");
      setSelectedMenus([]);
      fetchMappings();
    } catch (err) {
      console.error("Error saving mapping", err);
      toast.error("Error saving mapping");
    }
  };

  const handleDelete = async (roleId) => {
    if (!window.confirm("Are you sure you want to delete this mapping?")) return;
    if (DEBUG) log("🗑️ Deleting mapping for roleId:", roleId);

    try {
      const { res } = await apiFetch("Delete Mapping", `${RoleMenu_API}/rolemenumapping/${roleId}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });

      if (!res.ok) throw new Error("Failed to delete mapping");

      toast.success("Mapping deleted successfully!");
      fetchMappings();
    } catch (err) {
      console.error("Error deleting mapping", err);
      toast.error("Error deleting mapping");
    }
  };

  /* ======================= SEARCH / FILTER DERIVATIONS ======================= */
  const filteredRoles = useMemo(() => {
    const q = roleQuery.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => (r.roleName || "").toLowerCase().includes(q));
  }, [roles, roleQuery]);

  const filteredMenus = useMemo(() => {
    const q = menuQuery.trim().toLowerCase();
    if (!q) return menus;
    return menus.filter((m) => (m.menuName || "").toLowerCase().includes(q));
  }, [menus, menuQuery]);

  const visibleIds = useMemo(() => filteredMenus.map((m) => m.menuId), [filteredMenus]);

  const selectedVisibleCount = useMemo(
    () => visibleIds.filter((id) => selectedMenus.includes(id)).length,
    [visibleIds, selectedMenus]
  );

  const allVisibleSelected = filteredMenus.length > 0 && selectedVisibleCount === filteredMenus.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  // Tri-state master checkbox
  useEffect(() => {
    if (masterMenuRef.current) {
      masterMenuRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected]);

  const toggleSelectAllVisible = (checked) => {
    setSelectedMenus((prev) => {
      const set = new Set(prev);
      if (checked) {
        // add all visible
        visibleIds.forEach((id) => set.add(id));
      } else {
        // remove all visible
        visibleIds.forEach((id) => set.delete(id));
      }
      const next = Array.from(set);
      if (DEBUG) {
        const g = group(checked ? "Select ALL (visible) Menus" : "Clear ALL (visible) Menus");
        console.log("Visible count:", visibleIds.length);
        console.log("Result selected count:", next.length);
        g.end();
      }
      return next;
    });
  };

  const clearAllMenus = () => {
    setSelectedMenus([]);
    if (DEBUG) log("🧹 Cleared ALL menus");
  };

  // ✅ Handle drag and drop for menu ordering
  const handleMenuDragEnd = (result) => {
    console.log("🚀 [DEBUG] handleMenuDragEnd called with result:", result);
    
    if (!result.destination) {
      console.log("🚀 [DEBUG] No destination, returning early");
      return;
    }
    
    console.log("🚀 [DEBUG] Source index:", result.source.index);
    console.log("🚀 [DEBUG] Destination index:", result.destination.index);
    console.log("🚀 [DEBUG] Current orderedMenus length:", orderedMenus.length);
    
    const newOrderedMenus = Array.from(orderedMenus);
    console.log("🚀 [DEBUG] Created copy of orderedMenus");
    
    const [reorderedItem] = newOrderedMenus.splice(result.source.index, 1);
    console.log("🚀 [DEBUG] Removed item from source:", reorderedItem?.mainMenuName);
    
    newOrderedMenus.splice(result.destination.index, 0, reorderedItem);
    console.log("🚀 [DEBUG] Inserted item at destination");
    
    // Update the mord (menu order) based on new positions
    const updatedMenus = newOrderedMenus.map((menu, index) => ({
      ...menu,
      mord: index + 1
    }));
    
    console.log("🚀 [DEBUG] Updated menus with new order:", updatedMenus.map(m => ({ name: m.mainMenuName, mord: m.mord, mMId: m.mMId })));
    
    setOrderedMenus(updatedMenus);
    console.log("🚀 [DEBUG] Updated orderedMenus state");
    
    if (DEBUG) {
      log("🔄 Menu reordered:", reorderedItem.mainMenuName, "to position", result.destination.index + 1);
    }
  };

  // ✅ Open menu ordering modal
  const openMenuOrderModal = () => {
    console.log("🚀 [DEBUG] openMenuOrderModal called");
    console.log("🚀 [DEBUG] Current mainMenus length:", mainMenus.length);
    console.log("🚀 [DEBUG] Current orderedMenus length:", orderedMenus.length);
    
    fetchMainMenus();
    setShowOrderModal(true);
    
    console.log("🚀 [DEBUG] Modal state set to true");
    if (DEBUG) log("🪟 Opening menu order modal");
  };

  // ✅ Save menu order
  const saveMenuOrder = async () => {
    console.log("🚀 [DEBUG] saveMenuOrder called");
    console.log("🚀 [DEBUG] orderedMenus length:", orderedMenus.length);
    console.log("🚀 [DEBUG] orderedMenus:", orderedMenus);
    
    try {
      const updates = orderedMenus.map((menu, index) => ({
        mMId: menu.mMId,
        displayOrder: index + 1
      }));

      console.log("🚀 [DEBUG] Updates to be sent:", updates);
      console.log("🚀 [DEBUG] Number of updates:", updates.length);

      if (DEBUG) {
        const g = group("Saving Menu Order");
        console.table(updates);
        g.end();
      }

      // Update each menu's order with detailed logging
      console.log("🚀 [DEBUG] Starting Promise.all for updates...");
      
      const results = await Promise.all(
        updates.map(async (update, index) => {
          console.log(`🚀 [DEBUG] Processing update ${index + 1}/${updates.length}:`, update);
          
          const url = `https://localhost:7099/api/RoleMenu/UpdateMenuorder/${update.mMId}/${update.displayOrder}`;
          console.log(`🚀 [DEBUG] Request URL:`, url);
          console.log(`🚀 [DEBUG] Auth headers:`, authHeaders());
          
          try {
            const { res, json, text, elapsed } = await apiFetch(
              `Update Menu Order ${update.mMId}`,
              url,
              {
                method: "PUT",
                headers: { ...authHeaders() },
              }
            );
            
            console.log(`🚀 [DEBUG] Response for mMId ${update.mMId}:`, {
              status: res.status,
              statusText: res.statusText,
              ok: res.ok,
              elapsed,
              responseText: text,
              responseJson: json
            });
            
            if (!res.ok) {
              console.error(`🚀 [DEBUG] Failed response for mMId ${update.mMId}:`, {
                status: res.status,
                statusText: res.statusText,
                responseText: text
              });
              throw new Error(`Failed to update menu ${update.mMId} - Status: ${res.status} ${res.statusText}`);
            }
            
            console.log(`🚀 [DEBUG] Successfully updated mMId ${update.mMId}`);
            return { success: true, mMId: update.mMId };
          } catch (error) {
            console.error(`🚀 [DEBUG] Error updating mMId ${update.mMId}:`, error);
            throw error;
          }
        })
      );

      console.log("🚀 [DEBUG] All updates completed successfully:", results);
      toast.success("Menu order updated successfully!");
      setShowOrderModal(false);
      
      if (DEBUG) log("✅ Menu order saved successfully");
      console.log("🚀 [DEBUG] saveMenuOrder completed successfully");
      
    } catch (err) {
      console.error("🚀 [DEBUG] Error in saveMenuOrder:", err);
      console.error("🚀 [DEBUG] Error stack:", err.stack);
      console.error("🚀 [DEBUG] Error message:", err.message);
      toast.error(`Error saving menu order: ${err.message}`);
    }
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="section-wrapper">
        <div className="page admin-dashboard pt-0">
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid" style={{ paddingRight: "0px", paddingLeft: "0px" }}>
            {/* Jumbotron Header */}
            <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
              <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                <i className="fa-solid fa-diagram-project"></i> Role Menu Mapping
              </h2>
              <p className="text-muted mb-0 dashboard-hero-sub">Assign menus to roles and manage mappings</p>
            </div>

            {/* Card Section */}
            <div className="card shadow-sm mb-4">
              <div
                className="card-header bg-primary text-white d-flex"
                style={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "15px",
                }}
              >
                <h6 className="mb-0">
                  <i className="fa fa-list mr-2"></i> Role Menu Mapping
                </h6>
                <div className="d-flex gap-2">
                  <button className="btn btn-info btn-sm me-2" onClick={openMenuOrderModal}>
                    <i className="fa fa-arrows-alt"></i> Manage Menu Order
                  </button>
                  <button className="btn btn-light btn-sm" onClick={() => openModal()}>
                    <i className="fa fa-plus"></i> Add Mapping
                  </button>
                </div>
              </div>

              <div className="card-body">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Menus</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappings.length > 0 ? (
                      mappings.map((map) => (
                        <tr key={map.roleId}>
                          <td>{map.roleName}</td>
                          <td>{map.menus || "-"}</td>
                          <td>
                            <button
                              className="btn btn-warning btn-sm me-2"
                              onClick={() => openModal(map)}
                            >
                              <i className="fa fa-edit"></i> Edit
                            </button>
                            {/* <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(map.roleId)}
                            >
                              <i className="fa fa-trash"></i> Delete
                            </button> */}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center">
                          No mappings found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
         
      </div>

      </div>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header>
          <Modal.Title>{editMode ? "Edit Mapping" : "Assign Menus to Role"}</Modal.Title>
          <button className="close" onClick={() => setShowModal(false)}>
            <span>&times;</span>
          </button>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            {/* ======= Role Select (with search) ======= */}
            <div className="mb-3">
              <label>
                <b>Select Role</b>
              </label>

              <div className="input-group mb-2">
                <span className="input-group-text">
                  <i className="fa fa-search" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search role..."
                  value={roleQuery}
                  onChange={(e) => setRoleQuery(e.target.value)}
                  disabled={editMode} // cannot change role while editing mapping
                />
              </div>

              <select
                className="form-control"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                required
                disabled={editMode}
              >
                <option value="">-- Select Role --</option>
                {filteredRoles.map((r) => (
                  <option key={r.roleId} value={r.roleId}>
                    {r.roleName}
                  </option>
                ))}
              </select>
            </div>

            {/* ======= Menus (search + select-all) ======= */}
            <div className="mb-3">
              <label>
                <b>Select Menus</b>
              </label>

              {/* search + select all row */}
              <div className="d-flex align-items-center gap-2 mb-2">
                <div className="flex-grow-1">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fa fa-search" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search menus..."
                      value={menuQuery}
                      onChange={(e) => setMenuQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-check ms-2">
                  <input
                    ref={masterMenuRef}
                    type="checkbox"
                    className="form-check-input"
                    id="selectAllVisible"
                    checked={allVisibleSelected}
                    onChange={(e) => toggleSelectAllVisible(e.target.checked)}
                    disabled={filteredMenus.length === 0}
                  />
                  <label className="form-check-label" htmlFor="selectAllVisible">
                    Select all ({filteredMenus.length})
                  </label>
                </div>
              </div>

              {/* counts + clear all */}
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted">
                  Selected: <b>{selectedMenus.length}</b> / Total Menus: <b>{menus.length}</b>{" "}
                  {menuQuery && (
                    <>
                      &nbsp;|&nbsp; Visible selected: <b>{selectedVisibleCount}</b> /{" "}
                      <b>{filteredMenus.length}</b>
                    </>
                  )}
                </small>
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0"
                  onClick={clearAllMenus}
                  disabled={selectedMenus.length === 0}
                >
                  Clear all
                </button>
              </div>

              {/* menu list */}
              <div className="border rounded p-2" style={{ maxHeight: "250px", overflowY: "auto" }}>
                {filteredMenus.length === 0 ? (
                  <div className="text-muted small px-1">No menus match your search.</div>
                ) : (
                  filteredMenus.map((m) => (
                    <div key={m.menuId} className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`menu-${m.menuId}`}
                        checked={selectedMenus.includes(m.menuId)}
                        onChange={() => handleMenuChange(m.menuId)}
                      />
                      <label className="form-check-label" htmlFor={`menu-${m.menuId}`}>
                        {m.menuName}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="text-end">
              <button type="submit" className="btn btn-success">
                {editMode ? "Update Mapping" : "Save Mapping"}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Menu Order Modal */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} centered size="lg">
        <Modal.Header>
          <Modal.Title>
            <i className="fa fa-arrows-alt me-2"></i>
            Manage Menu Order
          </Modal.Title>
          <button className="close" onClick={() => setShowOrderModal(false)}>
            <span>&times;</span>
          </button>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <p className="text-muted">
              <i className="fa fa-info-circle me-1"></i>
              Drag and drop the menu items to reorder them. The new order will be saved when you click "Save Order".
            </p>
            <hr />
          </div>

          {/* Debug info */}
          <div className="mb-2 p-2 bg-light border rounded">
            <small className="text-muted">
              <strong>Debug Info:</strong> orderedMenus.length = {orderedMenus.length} | 
              mainMenus.length = {mainMenus.length} | 
              Modal visible = {showOrderModal.toString()}
            </small>
          </div>

          <DragDropContext onDragEnd={handleMenuDragEnd}>
            <Droppable droppableId="menuList">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                  className="border rounded p-2"
                >
                  {orderedMenus.length === 0 ? (
                    <div className="text-center text-muted p-4">
                      <i className="fa fa-spinner fa-spin me-2"></i>
                      Loading menus...
                    </div>
                  ) : (
                    orderedMenus.map((menu, index) => (
                      <Draggable
                        key={menu.mMId}
                        draggableId={String(menu.mMId)}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`d-flex align-items-center p-3 mb-2 border rounded ${
                              snapshot.isDragging ? "bg-light shadow" : "bg-white"
                            }`}
                            style={{
                              ...provided.draggableProps.style,
                              cursor: "grab",
                              transition: snapshot.isDragging ? "none" : "all 0.2s ease",
                            }}
                          >
                            <div className="me-3 text-muted">
                              <i className="fa fa-grip-vertical"></i>
                            </div>
                            <div className="me-3 fw-bold text-primary" style={{ minWidth: "40px" }}>
                              #{menu.mord}
                            </div>
                            <div className="flex-grow-1">
                              <span className="fw-semibold">{menu.mainMenuName}</span>
                            </div>
                            <div className="text-muted small">
                              ID: {menu.mMId}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="mt-4 d-flex justify-content-between align-items-center">
            <small className="text-muted">
              <i className="fa fa-lightbulb me-1"></i>
              Total menus: <strong>{orderedMenus.length}</strong>
            </small>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowOrderModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={saveMenuOrder}
                disabled={orderedMenus.length === 0}
              >
                <i className="fa fa-save me-1"></i>
                Save Order
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default RoleMenuMapping;
