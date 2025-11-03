import React from "react";

function EngagedUserCharts() {
  return (
    <>
      {/* Facebook Engaged Users Bar */}
      <div className="row clearfix">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Facebook Engaged Users</h3>
              <div className="card-options">
                <button type="button" className="btn btn-link p-0" onClick={() => console.log("Refresh clicked")}>
                  <i className="fa fa-refresh"></i>
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="chart-container" style={{ height: "300px" }}>
                <div id="chart-bar-facebook" className="chart-placeholder text-center p-5">
                  <small className="text-muted">[Chart placeholder - Facebook bar chart]</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* YouTube + LinkedIn Overview Cards */}
      <div className="row clearfix">
        {/* YouTube */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">YouTube Views</h3>
            </div>
            <div className="card-body">
              <div className="chart-container" style={{ height: "260px" }}>
                <div id="chart-youtube" className="chart-placeholder text-center p-5">
                  <small className="text-muted">[Chart placeholder - YouTube]</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LinkedIn */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">LinkedIn Overview</h3>
            </div>
            <div className="card-body">
              <div className="chart-container" style={{ height: "260px" }}>
                <div id="chart-linkedin" className="chart-placeholder text-center p-5">
                  <small className="text-muted">[Chart placeholder - LinkedIn]</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EngagedUserCharts;
