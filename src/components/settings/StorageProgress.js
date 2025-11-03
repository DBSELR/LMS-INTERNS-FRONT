import React from "react";

function StorageProgress() {
  return (
    <div className="form-group">
      <label className="d-block">Storage <span className="float-right">77%</span></label>
      <div className="progress progress-sm">
        <div className="progress-bar" role="progressbar" aria-valuenow="77" aria-valuemin="0" aria-valuemax="100" style={{ width: "77%" }}></div>
      </div>
      <button type="button" className="btn btn-primary btn-block mt-3">
        Upgrade Storage
      </button>
    </div>
  );
}

export default StorageProgress;
