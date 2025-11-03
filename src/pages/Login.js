import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "../config";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      // IMPORTANT: backend route is /api/Auth/Login
      const response = await fetch(`${API_BASE_URL}/Auth/Login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.email,
          password: form.password,
        }),
      });

      // Handle 403 (overdue fees) or other non-OK statuses
      if (!response.ok) {
        let msg = "Login failed.";
        try {
          const maybeJson = await response.json();
          msg =
            maybeJson?.message ||
            maybeJson?.title ||
            maybeJson?.error ||
            msg;
        } catch {
          const text = await response.text();
          if (text) msg = text;
        }
        alert(msg);
        setSubmitting(false);
        return;
      }

      // Expected shape: { token, menus: [ { mmid, mainMenuName, text, icon, path, order } ] }
      const data = await response.json();
      const token = data?.token;
      if (!token) {
        alert("Invalid response from server (no token).");
        setSubmitting(false);
        return;
      }

      // Persist token (+ remember me)
      if (form.remember) {
        localStorage.setItem("jwt", token);
      } else {
        // still store in localStorage so existing app hooks keep working
        // but you could switch to sessionStorage here if you prefer
        localStorage.setItem("jwt", token);
      }

      // Persist server-driven menus if provided
      if (Array.isArray(data?.menus)) {
        localStorage.setItem("menus", JSON.stringify(data.menus));
      } else {
        localStorage.removeItem("menus");
      }

      // Notify other tabs/components
      window.dispatchEvent(new Event("storage"));

      // Decode token to route by role
      let role = "";
      try {
        const decoded = jwtDecode(token);
        role =
          decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
          decoded?.role ||
          decoded?.["roles"] || // sometimes frameworks use 'roles'
          "";
      } catch (err) {
        console.error("Token decode failed:", err);
      }

      // Navigate by role
      switch (role) {
        case "Admin":
          navigate("/admin-dashboard");
          break;
        case "Business_Executive":
          navigate("/business-executive-dashboard");
          break;
        case "Faculty":
          navigate("/instructor-dashboard");
          break;
        case "SRO":
          navigate("/sro-dashboard");
          break;
        case "Student":
          navigate("/student-dashboard");
          break;
        case "Parent":
          navigate("/parent-dashboard");
          break;
        case "Accountant":
          navigate("/accountant-dashboard");
          break;
        case "Director":
          navigate("/director-dashboard");
          break;
        default:
          alert("Unknown role in token. Please contact admin.");
          break;
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{ background: "#e4e9f0" }}
    >
      <div
        className="card shadow-lg border-0"
        style={{ maxWidth: "400px", width: "100%", borderRadius: "12px" }}
      >
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <img src="/assets/5mantra.png" alt="EdVedha" />
          </div>

          <form onSubmit={handleSubmit} noValidate>

            {/* <div className="form-group mb-3">
              <label htmlFor="email" className="font-weight-semibold">
                Username
              </label>
              <input
                type="text"
                className="form-control rounded-pill border-0 shadow-sm"
                id="email"
                name="email"
                placeholder="Enter your username"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="username"
                style={{ backgroundColor: "#f9f9f9" }}
              />
            </div> */}

            <div className="form-item">
        <input
          type="text"
          className="form-control mb-2"
          id="email"
                name="email"
                // placeholder="Enter your username"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="username"
          /* use defaultValue to keep it uncontrolled */
        />
        <label htmlFor="username">Username</label>
        </div>
            

            {/* <div className="form-group mb-4">
              <label htmlFor="password" className="font-weight-semibold">
                Password
              </label>
              <input
                type="password"
                className="form-control rounded-pill border-0 shadow-sm"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                style={{ backgroundColor: "#f9f9f9" }}
              />
            </div> */}

            <div className="form-item">
        <input
          type="password"
          className="form-control mb-2"
          id="password"
                name="password"
                // placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
          /* use defaultValue to keep it uncontrolled */
        />
        <label htmlFor="password">Password</label>
        </div>

            <div className="d-flex align-items-center mb-3 remember-me">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="remember" style={{ margin: 0 }}>
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-block rounded-pill py-2 w-100"
            >
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
