import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Modal, Button } from "react-bootstrap";

const CalendarViewLiveClasses = ({ events, active }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const calendarRef = useRef(null);

  // Fix blank issue on tab switch
  useEffect(() => {
    if (active && calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.updateSize();
    }
  }, [active]);

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
          const props = arg.event.extendedProps;
          let dotColor = "#999";
          if (props.status === "Scheduled") dotColor = "#ffc107";
          else if (props.status === "Live Now") dotColor = "#28a745";
          else if (props.status === "Completed") dotColor = "#dc3545";

          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontWeight: "bold",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
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
              <h5 style={{ display: "flex", alignItems: "center" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    marginRight: 6,
                    backgroundColor:
                      selectedEvent.extendedProps.status === "Scheduled"
                        ? "#ffc107"
                        : selectedEvent.extendedProps.status === "Live Now"
                        ? "#28a745"
                        : selectedEvent.extendedProps.status === "Completed"
                        ? "#dc3545"
                        : "#999",
                  }}
                />
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
              {selectedEvent.extendedProps.status && (
                <p>
                  <strong>Status:</strong> {selectedEvent.extendedProps.status}
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
};

export default CalendarViewLiveClasses;
