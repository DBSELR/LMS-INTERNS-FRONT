import React from "react";

function TimelineTab() {
  const activities = [
    {
      date: "2024-04-01",
      description: "Completed project: Web Design for Client A.",
      type: "completed"
    },
    {
      date: "2024-03-28",
      description: "Uploaded new portfolio project on Web Development.",
      type: "update"
    },
    {
      date: "2024-03-20",
      description: "Received 5-star review from Client B.",
      type: "review"
    }
  ];

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="mb-4">Activity Timeline</h5>
        <div className="timeline">
          {activities.map((activity, index) => (
            <div key={index} className="timeline-item">
              <div className={`timeline-icon ${activity.type === "completed" ? "bg-success" : activity.type === "update" ? "bg-info" : "bg-warning"}`}></div>
              <div className="timeline-content">
                <p className="text-muted">{activity.date}</p>
                <p>{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TimelineTab;
