import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Modal, Button } from "react-bootstrap";
import API_BASE_URL from "../../config";

const CalendarViewsAdminLiveClass = ({ events, active }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    if (active && calendarRef.current) {
      calendarRef.current.getApi().render();
    }
  }, [active, events]);

  useEffect(() => {
    console.log("Calendar component received events:", events);
  }, [events]);

  const handleEventClick = (clickInfo) => {
    console.log("Event clicked:", clickInfo.event);
    setSelectedEvent(clickInfo.event);
    setShowModal(true);
  };

  return (
    <>
      <FullCalendar
        ref={calendarRef}
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
          let dotColor = "#999";
          const props = arg.event.extendedProps;

          if (props.status === "Scheduled") dotColor = "#ffc107";
          else if (props.status === "Live Now") dotColor = "#28a745";
          else if (props.status === "Completed") dotColor = "#dc3545";

          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                whiteSpace: "normal",
                fontWeight: "bold",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  backgroundColor: dotColor,
                  borderRadius: "50%",
                  marginRight: 5,
                  flexShrink: 0,
                }}
              ></span>
              <span style={{ flex: 1 }}>{arg.event.title}</span>
            </div>
          );
        }}
      />

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header >
          <Modal.Title>Class Details</Modal.Title>
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
              <h5>{selectedEvent.title}</h5>
              <p>
                <strong>Instructor:</strong> {selectedEvent.extendedProps.instructor}
              </p>
              <p>
                <strong>Course:</strong> {selectedEvent.extendedProps.course}
              </p>
              <p>
                <strong>Semester:</strong> {selectedEvent.extendedProps.semester}
              </p>
              <p>
                <strong>Status:</strong> {selectedEvent.extendedProps.status}
              </p>
              <p>
                <strong>Start:</strong> {new Date(selectedEvent.start).toLocaleString()}
              </p>
              <p>
                <strong>End:</strong> {new Date(selectedEvent.end).toLocaleString()}
              </p>
              {selectedEvent.extendedProps.meetingLink && (
                <Button
                  variant="success"
                  onClick={() =>
                    window.open(
                      selectedEvent.extendedProps.meetingLink.startsWith("http")
                        ? selectedEvent.extendedProps.meetingLink
                        : `https://${selectedEvent.extendedProps.meetingLink}`,
                      "_blank"
                    )
                  }
                  className="mt-2"
                >
                  Join Class
                </Button>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CalendarViewsAdminLiveClass;
