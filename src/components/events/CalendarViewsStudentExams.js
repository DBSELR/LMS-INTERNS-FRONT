import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Modal, Button } from "react-bootstrap";

const CalendarViewsStudentExams = ({ events, active }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const calendarRef = useRef(null);

  // Refetch events when tab becomes active
  useEffect(() => {
    if (active && calendarRef.current) {
      calendarRef.current.getApi().render();
    }
  }, [active, events]);

  const handleEventClick = (clickInfo) => {
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
          if (props.status === "Open") dotColor = "#28a745";
          else if (props.status === "Upcoming") dotColor = "#ffc107";
          else if (props.status === "Closed") dotColor = "#dc3545";

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
        <Modal.Header closeButton>
          <Modal.Title>Exam Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <>
              <h5>{selectedEvent.title}</h5>
              <p>
                <strong>Type:</strong> {selectedEvent.extendedProps.type}
              </p>
              <p>
                <strong>Status:</strong> {selectedEvent.extendedProps.status}
              </p>
              <p>
                <strong>Duration:</strong> {selectedEvent.extendedProps.duration} minutes
              </p>
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
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CalendarViewsStudentExams;
