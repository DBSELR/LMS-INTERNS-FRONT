import React, { useEffect, useState } from "react";
import API_BASE_URL from "../../config";

function UpcomingEventsList() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const courseId = 1; // Replace with dynamic courseId if available
        const [calendarRes] = await Promise.all([
          fetch(`${API_BASE_URL}/CalendarEvent/ByCourse/${courseId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        ]);

        const calendarEvents = calendarRes.ok ? await calendarRes.json() : [];

        const formatted = calendarEvents.map(e => ({
          title: e.eventTitle,
          subject: e.eventType,
          start: e.startDate,
          end: e.endDate
        }));

        setEvents(formatted);
      } catch (err) {
        console.error("Failed to fetch events", err);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Upcoming Events</h3>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover table-striped">
            <thead className="thead-light">
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map((e, i) => (
                  <tr key={i}>
                    <td>{e.title}</td>
                    <td>{e.subject}</td>
                    <td>{new Date(e.start).toLocaleDateString()}</td>
                    <td>{new Date(e.end).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="text-center">No upcoming events</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UpcomingEventsList;
