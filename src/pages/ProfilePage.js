import React, { useState, useEffect } from "react";
import ConfirmationPopup from "../components/ConfirmationPopup";
import HeaderTop from "../components/HeaderTop";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import Footer from "../components/Footer";

import API_BASE_URL from "../config";
import { jwtDecode } from "jwt-decode";

function ProfilePage() {
  /* =========================
     STATE
  ========================== */
  const [activeTab, setActiveTab] = useState("education");

  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [showPwdModal, setShowPwdModal] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const [userId, setUserId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [errorPopup, setErrorPopup] = useState({ show: false, message: "" });

  /* =========================
     DEBUG HELPERS
  ========================== */
  const DEBUG = true;
  const logGroup = (label, obj) => {
    if (!DEBUG) return;
    console.groupCollapsed(`[ProfilePage] ${label}`);
    console.log(obj);
    console.groupEnd();
  };

  if (DEBUG) {
    console.groupCollapsed("[ProfilePage] RENDER");
    console.log("profile =", profile);
    console.log("userId =", userId);
    console.log(
      profile
        ? "✅ We HAVE profile, UI should show real data"
        : "❌ No profile yet, UI will show 'Loading profile...'"
    );
    console.groupEnd();
  }

  /* =========================
     SYNC editProfile WHEN profile LOADED
  ========================== */
  useEffect(() => {
    if (profile) {
      logGroup("Sync editProfile from profile", profile);
      setEditProfile(profile);
    }
  }, [profile]);

  /* =========================
     READ JWT FROM localStorage -> EXTRACT userId
  ========================== */
  useEffect(() => {
    console.groupCollapsed("[ProfilePage] useEffect -> decode token");
    try {
      const token = localStorage.getItem("jwt");
      console.log("localStorage.jwt exists?", !!token);

      if (!token) {
        console.warn("[ProfilePage] No jwt in localStorage");
        console.groupEnd();
        return;
      }

      const decoded = jwtDecode(token);
      console.log("decoded token =", decoded);

      const possibleIds = [
        decoded?.UserId,
        decoded?.userId,
        decoded?.userid,
        decoded?.id,
        decoded?.Id,
        decoded?.[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ],
      ];

      const found = possibleIds.find(
        (v) => v !== undefined && v !== null && v !== ""
      );
      console.log("resolved userId =", found);

      if (found !== undefined && found !== null) {
        setUserId(found);
      } else {
        console.warn(
          "[ProfilePage] Could not resolve userId from token claims."
        );
      }
    } catch (err) {
      console.error("[ProfilePage] Failed to decode token", err);
    }
    console.groupEnd();
  }, []);

  /* =========================
     FETCH PROFILE ONCE WE KNOW userId
  ========================== */
  useEffect(() => {
    if (userId == null) return; // wait until we have userId

    const controller = new AbortController();

    const fetchProfile = async () => {
      const url = `${API_BASE_URL}/User/GetUserProfile?UserId=${userId}`;

      const token = localStorage.getItem("jwt");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      console.groupCollapsed("[ProfilePage] fetchProfile REQUEST");
      console.log("➡ GET URL:", url);
      console.log("➡ headers we are sending:", headers);
      console.log("➡ userId we are sending:", userId);
      console.log("➡ AbortController.signal:", controller.signal);
      console.groupEnd();

      try {
        const res = await fetch(url, {
          method: "GET",
          headers,
          signal: controller.signal,
        });

        console.groupCollapsed("[ProfilePage] fetchProfile RAW RESPONSE");
        console.log("⬅ res.ok =", res.ok);
        console.log("⬅ res.status =", res.status);
        console.log("⬅ res.statusText =", res.statusText);
        console.log("⬅ res.url =", res.url);
        console.log("⬅ res.redirected =", res.redirected);
        console.log("⬅ res.type =", res.type);
        console.log("⬅ res.headers (iterable):");
        res.headers.forEach((v, k) => {
          console.log("   ", k, ":", v);
        });
        console.groupEnd();

        const status = res.status;

        let data = null;
        try {
          data = await res.json();
        } catch (jsonErr) {
          console.warn(
            "[ProfilePage] fetchProfile: response JSON parse failed?",
            jsonErr
          );
        }

        console.groupCollapsed("[ProfilePage] fetchProfile BODY PARSED");
        console.log("Parsed data =", data);
        if (data && typeof data === "object") {
          console.log("  data.userId =", data.userId);
          console.log("  data.fullName =", data.fullName);
          console.log("  data.firstName =", data.firstName);
          console.log("  data.lastName =", data.lastName);
          console.log("  data.role =", data.role);
          console.log("  data.email =", data.email);
          console.log("  data.phoneNumber =", data.phoneNumber);
          console.log("  data.education =", data.education);
          console.log("  data.experience =", data.experience);
        }
        console.groupEnd();

        if (!res.ok) {
          setErrorPopup({
            show: true,
            message:
              (data && (data.message || data.error)) ||
              `Failed to load profile. HTTP ${status}`,
          });
          return;
        }

        const normalized = {
          userId: data?.userId ?? userId,
          fullName:
            (data && data.fullName) ||
            `${(data && data.firstName) || ""} ${
              (data && data.lastName) || ""
            }`.trim() ||
            "Unnamed User",
          firstName: (data && data.firstName) || "",
          lastName: (data && data.lastName) || "",
          role: (data && data.role) || "",
          email: (data && data.email) || "",
          phoneNumber: (data && data.phoneNumber) || "",
          education: (data && data.education) || "",
          experience: (data && data.experience) || "",
        };

        console.groupCollapsed("[ProfilePage] fetchProfile NORMALIZED");
        console.log("normalized profile object we will store =", normalized);
        console.groupEnd();

        setProfile(normalized);
      } catch (err) {
        if (err.name === "AbortError") {
          console.warn("[ProfilePage] fetchProfile aborted");
          return;
        }
        console.error("[ProfilePage] fetchProfile ERROR", err);
        setErrorPopup({
          show: true,
          message: "Unable to load profile from server.",
        });
      }
    };

    fetchProfile();

    return () => controller.abort();
  }, [userId, API_BASE_URL]);

  /* =========================
     EDIT FORM HANDLERS
  ========================== */
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editProfile || !userId) return;

    setUpdateLoading(true);

    const putUrl = `https://localhost:7099/api/User/${userId}`;
    const bodyPayload = {
      Role: editProfile.role,
      Status: "Active", // or real status
    };

    console.groupCollapsed("[ProfilePage] handleUpdateProfile START");
    console.log("PUT", putUrl);
    console.log("payload =", bodyPayload);
    console.groupEnd();

    try {
      const res = await fetch(putUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      console.groupCollapsed("[ProfilePage] handleUpdateProfile RESPONSE");
      console.log("status =", res.status);
      console.groupEnd();

      if (!res.ok) throw new Error("Failed to update profile");

      setProfile((prev) => ({ ...prev, role: editProfile.role }));
      setEditMode(false);

      setErrorPopup({
        show: true,
        message: "Profile updated successfully.",
      });
    } catch (err) {
      console.error("[ProfilePage] handleUpdateProfile ERROR", err);
      setErrorPopup({
        show: true,
        message: "Failed to update profile.",
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  /* =========================
     PASSWORD MODAL HANDLERS
  ========================== */
  const openPwdModal = () => {
    console.groupCollapsed("[ProfilePage] openPwdModal()");
    console.log("Opening Change Password modal");
    console.groupEnd();

    setOldPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setShowPwdModal(true);
  };

  const closePwdModal = () => {
    if (submitting) return;
    console.groupCollapsed("[ProfilePage] closePwdModal()");
    console.log("Closing Change Password modal");
    console.groupEnd();

    setShowPwdModal(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!userId) {
      setErrorPopup({
        show: true,
        message: "Cannot update password: UserId not found from token.",
      });
      return;
    }

    if (!oldPwd || !newPwd || !confirmPwd) {
      setErrorPopup({
        show: true,
        message: "Please fill all fields.",
      });
      return;
    }

    if (newPwd !== confirmPwd) {
      setErrorPopup({
        show: true,
        message: "New password and Confirm password do not match.",
      });
      return;
    }

    const payload = {
      UserId: userId,
      OldPassword: oldPwd,
      NewPassword: newPwd,
    };

    const url = `${API_BASE_URL}/Auth/ChangePassword`;
    const token = localStorage.getItem("jwt");

    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.groupCollapsed("[ProfilePage] handleChangePassword START");
    console.log("POST", url);
    console.log("payload =", payload);
    console.log("headers =", headers);
    console.groupEnd();

    try {
      setSubmitting(true);

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const status = res.status;
      let responseJson = null;
      try {
        responseJson = await res.json();
      } catch {
        responseJson = null;
      }

      console.groupCollapsed("[ProfilePage] handleChangePassword RESPONSE");
      console.log("status =", status);
      console.log("responseJson =", responseJson);
      console.groupEnd();

      if (!res.ok) {
        const errMsg =
          (responseJson &&
            (responseJson.message || responseJson.error)) ||
          `HTTP ${status}`;
        setErrorPopup({ show: true, message: errMsg });
      } else {
        const successMsg =
          (responseJson && responseJson.message) ||
          "Password updated successfully.";
        window.alert(successMsg);
        setShowPwdModal(false);
        setErrorPopup({ show: true, message: successMsg });
      }
    } catch (err) {
      console.error(
        "[ProfilePage] handleChangePassword FETCH ERROR:",
        err
      );
      setErrorPopup({
        show: true,
        message:
          "Something went wrong while updating password.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================
     RENDER WITH HEADER + ID CARD
  ========================== */
  return (
    <div id="main_content" className="font-muli theme-blush">
      {/* Styles for the ID card */}
      <style>{`
        .idcard-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 2rem 1rem 4rem;
          background: radial-gradient(circle at 20% 20%, #eef2ff 0%, #ffffff 60%);
        }

        .idcard-shell {
          background: #ffffff;
          border-radius: 1.25rem;
          box-shadow:
            0 20px 40px rgba(0,0,0,0.08),
            0 2px 4px rgba(0,0,0,0.04);
          width: 100%;
          max-width: 380px;
          border: 1px solid rgba(0,0,0,0.05);
          position: relative;
          overflow: hidden;
        }

        .idcard-header {
          background: linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%);
          color: #fff;
          padding: 1rem 1.25rem 3.5rem;
          position: relative;
        }

        .idcard-header-badge {
          font-size: .7rem;
          font-weight: 600;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.35);
          color: #fff;
          padding: .25rem .5rem;
          line-height: 1.1;
          border-radius: .5rem;
          display: inline-block;
          backdrop-filter: blur(4px);
        }

        .idcard-header-role {
          font-size: .8rem;
          font-weight: 500;
          color: #c7bfff;
          margin-top: .4rem;
          word-break: break-word;
        }

        .idcard-avatar-wrap {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: -2rem;
          width: 96px;
          height: 96px;
          border-radius: 0.75rem;
          background: #fff;
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
          border: 3px solid #fff;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .idcard-avatar-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .idcard-body {
          padding: 3rem 1.25rem 1rem;
          text-align: left;
        }

        .idcard-name {
          font-size: 1.05rem;
          font-weight: 600;
          color: #1f2937;
          text-align: center;
          line-height: 1.3;
        }

        .idcard-userid {
          text-align: center;
          font-size: .7rem;
          font-weight: 500;
          color: #6b7280;
          margin-top: .25rem;
        }

        .idcard-section-grid {
          margin-top: 1rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: .75rem;
          padding: .75rem .9rem;
          font-size: .8rem;
          line-height: 1.4;
          color: #374151;
        }

        .idcard-row {
          display: flex;
          flex-wrap: nowrap;
          align-items: flex-start;
          padding: .5rem 0;
          border-bottom: 1px dashed #e5e7eb;
          gap: .5rem;
        }
        .idcard-row:last-child {
          border-bottom: 0;
        }

        .idcard-label {
          min-width: 80px;
          font-weight: 600;
          font-size: .75rem;
          color: #6b7280;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: .4rem;
        }
        .idcard-value {
          font-size: .8rem;
          color: #1f2937;
          word-break: break-word;
          flex: 1;
        }

        .idcard-actions {
          display: flex;
          justify-content: center;
          gap: .5rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }
        .idcard-btn {
          border: 0;
          font-size: .75rem;
          line-height: 1.2;
          font-weight: 600;
          border-radius: .5rem;
          padding: .5rem .75rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 12px rgba(0,0,0,0.08);
        }
        .idcard-btn-edit {
          background-color: #fde68a;
          color: #78350f;
        }
        .idcard-btn-pass {
          background-color: #4f46e5;
          color: #fff;
        }

        .idcard-inline-editbox {
          margin-top: 1rem;
          background: #fff7ed;
          border: 1px solid #fdba74;
          border-radius: .75rem;
          padding: .75rem .9rem;
          box-shadow:
            0 8px 16px rgba(0,0,0,0.05),
            0 1px 2px rgba(0,0,0,0.03);
        }

        .idcard-inline-edit-head {
          font-size: .8rem;
          font-weight: 600;
          color: #9a3412;
          margin-bottom: .5rem;
          display: flex;
          align-items: center;
          gap: .5rem;
        }

        .idcard-footerband {
          border-top: 1px solid #e5e7eb;
          background: repeating-linear-gradient(
            -45deg,
            #4f46e5 0 10px,
            #6d28d9 10px 20px
          );
          color: #fff;
          padding: .75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          row-gap: .5rem;
        }

        .idcard-footer-left {
          display: flex;
          flex-direction: column;
          font-size: .6rem;
          line-height: 1.2;
          font-weight: 500;
          text-shadow: 0 1px 2px rgba(0,0,0,0.4);
          color: rgba(255,255,255,0.9);
        }
        .idcard-footer-left span:first-child {
          font-size: .7rem;
          font-weight: 600;
          color: #fff;
        }

        .idcard-footer-right {
          background: #fff;
          color: #111827;
          border-radius: .5rem;
          padding: .4rem .6rem;
          font-size: .6rem;
          line-height: 1.1;
          font-weight: 600;
          box-shadow: 0 4px 8px rgba(0,0,0,0.25);
          text-align: center;
          min-width: 80px;
        }

        @media (min-width: 480px) {
          .idcard-shell {
            max-width: 400px;
          }
          .idcard-name {
            font-size: 1.15rem;
          }
        }

        @media (min-width: 768px) {
          .idcard-shell {
            max-width: 460px;
            border-radius: 1.5rem;
          }
          .idcard-header {
            border-top-left-radius: 1.5rem;
            border-top-right-radius: 1.5rem;
          }
          .idcard-name {
            font-size: 1.2rem;
          }
        }

        @media (prefers-color-scheme: dark) {
          .idcard-wrapper {
            background: radial-gradient(circle at 20% 20%, #1f2937 0%, #111827 60%);
          }
          .idcard-shell {
            background: #1f2937;
            border-color: rgba(255,255,255,0.06);
            box-shadow:
              0 24px 48px rgba(0,0,0,0.9),
              0 2px 4px rgba(0,0,0,0.6);
          }
          .idcard-header {
            background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%);
          }
          .idcard-name {
            color: #f9fafb;
          }
          .idcard-userid {
            color: #9ca3af;
          }
          .idcard-section-grid {
            background: rgba(31,41,55,0.6);
            border-color: rgba(255,255,255,0.08);
            color: #e5e7eb;
          }
          .idcard-row {
            border-bottom-color: rgba(255,255,255,0.08);
          }
          .idcard-label {
            color: #9ca3af;
          }
          .idcard-value {
            color: #f1f5f9;
          }
          .idcard-footerband {
            border-top-color: rgba(255,255,255,0.1);
          }
          .idcard-footer-right {
            color: #111827;
          }
        }
      `}</style>

      {/* Page Loader */}
      <div className="page-loader-wrapper">
        <div className="loader"></div>
      </div>

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="page">
        {/* ====== YOUR REQUIRED HEADER BLOCK (kept exactly) ====== */}
        <div className="section-body mt-3">
          <div className="container-fluid">
            <div className="jumbotron bg-light p-4 rounded shadow-sm d-flex justify-content-between align-items-center flex-wrap">
              <div className="me-3">
                <h2
                  className="text-primary mb-2 d-flex align-items-center"
                  style={{ gap: "10px" }}
                >
                  <span role="img" aria-label="profile">
                    👤
                  </span>
                  <span>Profile Overview</span>
                </h2>
                <p className="text-muted mb-0">
                  Manage your education, experience, skills
                  and achievements.
                </p>
              </div>

              <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2 mt-3 mt-md-0 ms-auto">
                <button
                  className="btn btn-sm btn-warning fw-bold"
                  type="button"
                  onClick={openPwdModal}
                >
                  Change Password
                </button>

               
              </div>
            </div>

            {/* ====== ID CARD SECTION ====== */}
            <div className="idcard-wrapper">
              <div className="idcard-shell">
                {/* Card gradient header */}
                <div className="idcard-header">
                  
                  <div className="idcard-header-role">
                    
                  </div>

                  <div className="idcard-avatar-wrap">
                    {profile ? (
                      <img
                        src={"https://via.placeholder.com/150"}
                        alt="Profile"
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          fontSize: "0.65rem",
                          color: "#6b7280",
                          backgroundColor: "#f3f4f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          padding: "0.5rem",
                        }}
                      >
                        Loading…
                      </div>
                    )}
                  </div>
                </div>

                {/* Card body */}
                <div className="idcard-body">
                  <div className="idcard-name">
                    {profile ? profile.fullName : "Loading profile..."}
                  </div>
                  <div className="idcard-userid">
                    ID:{" "}
                    {profile && profile.userId !== undefined
                      ? profile.userId
                      : "—"}
                  </div>

                  <div className="idcard-section-grid">
                    <div className="idcard-row">
                      <div className="idcard-label">
                        <span role="img" aria-label="briefcase">
                          💼
                        </span>
                        <span>Role</span>
                      </div>
                      <div className="idcard-value">
                        {profile?.role || "—"}
                      </div>
                    </div>

                    <div className="idcard-row">
                      <div className="idcard-label">
                        <span role="img" aria-label="person">
                          🧑
                        </span>
                        <span>First</span>
                      </div>
                      <div className="idcard-value">
                        {profile?.firstName || "—"}
                      </div>
                    </div>

                    <div className="idcard-row">
                      <div className="idcard-label">
                        <span role="img" aria-label="person">
                          👤
                        </span>
                        <span>Last</span>
                      </div>
                      <div className="idcard-value">
                        {profile?.lastName || "—"}
                      </div>
                    </div>

                    <div className="idcard-row">
                      <div className="idcard-label">
                        <span role="img" aria-label="phone">
                          📞
                        </span>
                        <span>Phone</span>
                      </div>
                      <div className="idcard-value">
                        {profile?.phoneNumber || "—"}
                      </div>
                    </div>

                    <div className="idcard-row">
                      <div className="idcard-label">
                        <span role="img" aria-label="email">
                          📧
                        </span>
                        <span>Email</span>
                      </div>
                      <div className="idcard-value">
                        {profile?.email || "—"}
                      </div>
                    </div>

                    <div className="idcard-row">
                      <div className="idcard-label">
                        <span role="img" aria-label="exp">
                          🏆
                        </span>
                        <span>Exp</span>
                      </div>
                      <div className="idcard-value">
                        {profile?.experience || "—"}
                      </div>
                    </div>
                  </div>
<div className="idcard-header-badge" style={{background:'#5441e3'}}>
                    {profile?.role || "ROLE / STATUS"} - {profile?.education || "Education not available"}
                  </div>
                  {/* action buttons */}
                  <div className="idcard-actions">
                    {profile && !editMode && (
                      <button
                        className="idcard-btn idcard-btn-edit"
                        // onClick={() => setEditMode(true)}
                        // disabled={updateLoading}
                      >
                        ✏ Edit Profile
                      </button>
                    )}

                    <button
                      className="idcard-btn idcard-btn-pass"
                      onClick={openPwdModal}
                    >
                      🔐 Change Password
                    </button>
                  </div>

                  {/* inline edit role box */}
                  {profile && editMode && (
                    <form
                      onSubmit={handleUpdateProfile}
                      className="idcard-inline-editbox"
                    >
                      <div className="idcard-inline-edit-head">
                        <span role="img" aria-label="settings">
                          ⚙
                        </span>
                        <span>Edit Role</span>
                      </div>

                      <div className="mb-2">
                        <label
                          className="form-label"
                          style={{
                            fontSize: ".7rem",
                            fontWeight: 600,
                            color: "#78350f",
                            marginBottom: ".25rem",
                            display: "block",
                          }}
                        >
                          Role
                        </label>
                        <input
                          type="text"
                          name="role"
                          className="form-control"
                          style={{ fontSize: ".8rem" }}
                          value={editProfile.role || ""}
                          onChange={handleEditChange}
                        />
                      </div>

                      <div
                        className="d-flex"
                        style={{
                          display: "flex",
                          gap: ".5rem",
                          justifyContent: "flex-end",
                          flexWrap: "wrap",
                          marginTop: ".75rem",
                        }}
                      >
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{
                            fontSize: ".7rem",
                            lineHeight: 1.2,
                            padding: ".4rem .6rem",
                          }}
                          onClick={() => setEditMode(false)}
                          disabled={updateLoading}
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className="btn btn-warning btn-sm"
                          style={{
                            fontSize: ".7rem",
                            lineHeight: 1.2,
                            padding: ".4rem .6rem",
                            fontWeight: 600,
                            color: "#78350f",
                          }}
                          disabled={updateLoading}
                        >
                          {updateLoading ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* bottom security band */}
                <div className="idcard-footerband">
                  <div className="idcard-footer-left">
                    <span>Authorized Access Only</span>
                    <span>Learning Management System</span>
                    <span>Issued {new Date().getFullYear()}</span>
                  </div>
                  <div className="idcard-footer-right">
                    #{profile?.userId ?? "—"}
                    <br />
                    {profile?.role || "NO ROLE"}
                  </div>
                </div>
              </div>
            </div>

            {/* (You can still render future tabs below if you want) */}
            {/* <EducationTab /> etc */}
          </div>
        </div>

         
      </div>

      {/* PASSWORD MODAL */}
      {showPwdModal && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          tabIndex="-1"
          role="dialog"
        >
          <div
            className="modal-dialog modal-dialog-centered"
            role="document"
            style={{ maxWidth: "400px" }}
          >
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-warning text-dark">
                <h6 className="modal-title mb-0 fw-bold">
                  Change Password
                </h6>
                <button
                  type="button"
                  className="close btn btn-sm btn-light"
                  onClick={closePwdModal}
                  disabled={submitting}
                  style={{
                    lineHeight: "1",
                    fontSize: "16px",
                    borderRadius: "4px",
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleChangePassword}>
                <div className="modal-body">
                  <div className="form-group mb-3">
                    <label className="form-label small fw-bold">
                      Old Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={oldPwd}
                      onChange={(e) => setOldPwd(e.target.value)}
                      placeholder="Enter current password"
                      disabled={submitting}
                      required
                      style={{ fontSize: ".8rem" }}
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label small fw-bold">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      placeholder="Enter new password"
                      disabled={submitting}
                      required
                      style={{ fontSize: ".8rem" }}
                    />
                  </div>

                  <div className="form-group mb-1">
                    <label className="form-label small fw-bold">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPwd}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                      placeholder="Re-enter new password"
                      disabled={submitting}
                      required
                      style={{ fontSize: ".8rem" }}
                    />
                  </div>
{/* 
                  <div
                    className="text-muted mt-2"
                    style={{
                      fontSize: "11px",
                      wordBreak: "break-all",
                    }}
                  >
                    <div>
                      <strong>User ID:</strong>{" "}
                      {userId !== null ? userId : "not found"}
                    </div>
                    {DEBUG && (
                      <div>
                        <strong>API URL:</strong>{" "}
                        {`${API_BASE_URL}/Auth/ChangePassword`}
                      </div>
                    )}
                  </div> */}
                </div>

                <div className="modal-footer d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closePwdModal}
                    disabled={submitting}
                    style={{
                      fontSize: ".8rem",
                      lineHeight: 1.2,
                      padding: ".4rem .6rem",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-warning fw-bold"
                    disabled={submitting}
                    style={{
                      fontSize: ".8rem",
                      lineHeight: 1.2,
                      padding: ".4rem .6rem",
                    }}
                  >
                    {submitting ? "Saving..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* POPUP (errors / success) */}
      <ConfirmationPopup
        show={errorPopup.show}
        title="Profile Message"
        message={errorPopup.message}
        onConfirm={() => setErrorPopup({ show: false, message: "" })}
        onCancel={() => setErrorPopup({ show: false, message: "" })}
        singleButton={true}
      />
    </div>
  );
}

export default ProfilePage;
