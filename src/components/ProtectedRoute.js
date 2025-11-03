import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("jwt");
  const location = useLocation();

  if (!token) {
    // Not logged in → redirect to login
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // ✅ Extract claims
    const roleName =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const allowedPaths = decoded.Menu
      ? Array.isArray(decoded.Menu)
        ? decoded.Menu
        : [decoded.Menu]
      : [];

    // ✅ Admin always has full access
    if (roleName?.toLowerCase() === "admin") {
      return children;
    }

    // ✅ Match dynamic route patterns
    const isAllowed = allowedPaths.some((path) => {
      if (path.includes(":")) {
        // Convert ":param" into regex matcher
        const regexPattern = new RegExp(
          "^" + path.replace(/:[^/]+/g, "[^/]+") + "$"
        );
        return regexPattern.test(location.pathname);
      }
      return path === location.pathname;
    });

    if (isAllowed) {
      return children;
    } else {
      return <Navigate to="/unauthorized" replace />;
    }
  } catch (err) {
    console.error("Invalid token:", err);
    localStorage.removeItem("jwt");
    return <Navigate to="/" replace />;
  }
}

export default ProtectedRoute;
