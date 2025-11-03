import React, { useState } from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    agreeToTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit form data
    console.log("Form submitted:", formData);
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <div className="page-loader-wrapper"><div className="loader"></div></div>

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="page">

      </div>
    <div className="auth option2">
      <div className="auth_left">
        <div className="card">
          <div className="card-body">
            <div className="text-center">
              <a className="header-brand" href="index.html">
                <i className="fa fa-graduation-cap brand-logo"></i>
              </a>
              <div className="card-title">Create new account</div>

              {/* Social login buttons */}
              <button type="button" className="btn btn-facebook">
                <i className="fa fa-facebook mr-2"></i> Facebook
              </button>
              <button type="button" className="btn btn-google">
                <i className="fa fa-google mr-2"></i> Google
              </button>
              <h6 className="mt-3 mb-3">Or</h6>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="custom-control custom-checkbox">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    className="custom-control-input"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                  />
                  <span className="custom-control-label">
                    Agree to the <a href="#">terms and policy</a>
                  </span>
                </label>
              </div>

              <div className="text-center">
                <button type="submit" className="btn btn-primary btn-block">
                  Create new account
                </button>
                <div className="text-muted mt-4">
                  Already have an account? <a href="login.html">Sign in</a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default RegisterPage;
