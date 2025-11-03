import React from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";


function Error404() {
  return (
    <div className="font-muli theme-blush">
       <HeaderTop />
      <RightSidebar />
      <LeftSidebar />
      
      <div className="auth option2">
        <div className="auth_left">
          <div className="card">
            <div className="card-body text-center">
              <div className="display-3 text-muted mb-5">
                <i className="si si-exclamation"></i> 404
              </div>
              <h1 className="h3 mb-3">Oops.. You just found an error page..</h1>
              <p className="h6 text-muted font-weight-normal mb-3">
                We are sorry but our service is currently not available…
              </p>
              <button className="btn btn-primary" onClick={() => window.history.back()}>
                <i className="fe fe-arrow-left mr-2"></i>Go back
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default Error404;
