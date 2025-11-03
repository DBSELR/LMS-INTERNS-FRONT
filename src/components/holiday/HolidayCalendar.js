import React from "react";

function HolidayCalendar() {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Holiday Calendar</h3>
      </div>
      <div className="card-body">
        <div id="calendar" className="text-center p-5 text-muted">
          <strong>[ Calendar will be rendered here ]</strong>
        </div>
      </div>
    </div>
  );
}

export default HolidayCalendar;
