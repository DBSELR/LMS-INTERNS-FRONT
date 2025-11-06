import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer fixed-footer">
      <div className="container-fluid">
        <div className="row justify-content-end">
          <div className="col-auto text-center">
            Developed by
            <span className="d-none d-md-inline"> - D Base Solutions Private Limited (DBS) &copy; 2025</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
