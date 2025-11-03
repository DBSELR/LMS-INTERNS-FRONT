import React from "react";

function EventList() {
  const events = [
    { label: "New Theme Release", color: "bg-primary" },
    { label: "My Event", color: "bg-success" },
    { label: "Meet Manager", color: "bg-info" },
    { label: "Create New Theme", color: "bg-danger" }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Draggable Events</h3>
      </div>
      <div className="card-body">
        <div id="event-list" className="external-events">
          {events.map((event, i) => (
            <div
              key={i}
              className={`fc-event ${event.color}`}
              style={{ padding: "5px 10px", color: "#fff", cursor: "move", marginBottom: "5px" }}
            >
              {event.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EventList;
