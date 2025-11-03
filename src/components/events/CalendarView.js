import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Modal, Button } from "react-bootstrap";

function CalendarView({ events }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setShowModal(true);
  };

  const handleJoinClick = () => {
    if (selectedEvent.extendedProps.meetingLink) {
      const link = selectedEvent.extendedProps.meetingLink.startsWith("http")
        ? selectedEvent.extendedProps.meetingLink
        : `https://${selectedEvent.extendedProps.meetingLink}`;
      window.open(link, "_blank");
    }
  };

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek,dayGridDay",
        }}
        events={events}
        eventClick={handleEventClick}
        height="auto"
        dayMaxEventRows={3}
        moreLinkClick="popover"
        eventContent={(arg) => {
          const props = arg.event.extendedProps;
          let dotColor = "#999";

          // ✅ Class logic
          if (props.status === "Scheduled") dotColor = "#ffc107";
          else if (props.status === "Live Now") dotColor = "#28a745";
          else if (props.status === "Completed") dotColor = "#dc3545";

          // ✅ Exam logic
          if (props.examStatus === "Scheduled") dotColor = "#ffc107";
          else if (props.examStatus === "AttendExam") dotColor = "#28a745";
          else if (props.examStatus === "Completed") dotColor = "#dc3545";

          const textColor = props.textColor || "#000";

          return (
            <div className="calendar-event-content" style={{ color: textColor }}>
              <span
                className="calendar-event-dot"
                style={{ backgroundColor: dotColor }}
              ></span>
              <span className="calendar-event-title">{arg.event.title}</span>
            </div>
          );
        }}
      />

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header >
          <Modal.Title>Event Details</Modal.Title>
          <button
                    type="button"
                    className="close"
                    onClick={() => setShowModal(false)}
                  >
                    <span>&times;</span>
                  </button>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <>
              <h5 style={{ display: "flex", alignItems: "center" }}>
                {selectedEvent.extendedProps.status || selectedEvent.extendedProps.examStatus ? (
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      marginRight: 6,
                      backgroundColor:
                        selectedEvent.extendedProps.status === "Scheduled" || selectedEvent.extendedProps.examStatus === "Scheduled"
                          ? "#ffc107"
                          : selectedEvent.extendedProps.status === "Live Now" || selectedEvent.extendedProps.examStatus === "AttendExam"
                          ? "#28a745"
                          : selectedEvent.extendedProps.status === "Completed" || selectedEvent.extendedProps.examStatus === "Completed"
                          ? "#dc3545"
                          : "#999",
                    }}
                  />
                ) : null}
                {selectedEvent.title}
              </h5>
              {selectedEvent.extendedProps.instructor && (
                <p>
                  <strong>Instructor:</strong> {selectedEvent.extendedProps.instructor}
                </p>
              )}
              {selectedEvent.extendedProps.subject && (
                <p>
                  <strong>Subject:</strong> {selectedEvent.extendedProps.subject}
                </p>
              )}
              {selectedEvent.extendedProps.type && (
                <p>
                  <strong>Type:</strong> {selectedEvent.extendedProps.type}
                </p>
              )}
              {selectedEvent.extendedProps.status && (
                <p>
                  <strong>Status:</strong> {selectedEvent.extendedProps.status}
                </p>
              )}
              {selectedEvent.extendedProps.examStatus && (
                <p>
                  <strong>Exam Status:</strong> {selectedEvent.extendedProps.examStatus}
                </p>
              )}
              {selectedEvent.extendedProps.duration && (
                <p>
                  <strong>Duration:</strong> {selectedEvent.extendedProps.duration} minutes
                </p>
              )}
              <p>
                <strong>Start:</strong> {new Date(selectedEvent.start).toLocaleString()}
              </p>
              <p>
                <strong>End:</strong> {new Date(selectedEvent.end).toLocaleString()}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          {selectedEvent && selectedEvent.extendedProps.meetingLink && selectedEvent.extendedProps.status === "Live Now" && (
            <Button variant="success" onClick={handleJoinClick}>
              Join Class
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CalendarView;
