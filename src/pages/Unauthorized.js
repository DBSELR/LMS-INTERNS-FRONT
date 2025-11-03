import React from "react";
import { useNavigate } from "react-router-dom";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";

function Unauthorized() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/"); // fallback to home if no history
    }
  };

  return (
    <div className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="auth option2">
        <div className="auth_left">
          <div className="card">
            <div className="card-body text-center">
              <div className="display-3 text-danger mb-5">
                <i className="si si-lock"></i> 403
              </div>
              <h1 className="h3 mb-3">Access Denied</h1>
              <p className="h6 text-muted font-weight-normal mb-3">
                Sorry, you are not authorized to view this page.
              </p>
              <button className="btn btn-primary" onClick={handleGoBack}>
                <i className="fe fe-arrow-left mr-2"></i> Go Back
              </button>
            </div>
          </div>
        </div>
      </div>

       
    </div>
  );
}

export default Unauthorized;
