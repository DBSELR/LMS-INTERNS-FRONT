import React from "react";


function ActivityTimeline() {
  return (
    <div>
      <h6 className="font-14 font-weight-bold text-muted">Activity</h6>
      <ul className="new_timeline mt-3">
        <li>
          <div className="bullet pink"></div>
          <div className="time">11:00am</div>
          <div className="desc">
            <h3>Attendance</h3>
            <h4>Computer Class</h4>
          </div>
        </li>
        <li>
          <div className="bullet green"></div>
          <div className="time">12:00pm</div>
          <div className="desc">
            <h3>Developer Team</h3>
            <h4>Hangouts</h4>
          </div>
        </li>
        <li>
          <div className="bullet orange"></div>
          <div className="time">1:00pm</div>
          <div className="desc">
            <h3>Lunch Break</h3>
          </div>
        </li>
      </ul>
    </div>
  );
}

export default ActivityTimeline;
