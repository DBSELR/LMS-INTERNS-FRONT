// import React, { useState } from "react";
// import HeaderTop from "../../../components/HeaderTop";
// import LeftSidebar from "../../../components/LeftSidebar";
// import RightSidebar from "../../../components/RightSidebar";
// import Footer from "../../../components/Footer";
// import TicketStatusBadge from "../../../components/supportTickets/TicketStatusBadge";

// const AdminTicketDetails = () => {
//   const [status, setStatus] = useState("Resolved");

//   const ticket = {
//     id: 216367,
//     subject: "Lab Submission & Viva Voice",
//     type: "Lab/Project query",
//     subType: "Lab related queries",
//     startDate: "2024-12-17",
//     description:
//       "Student missed the lab submission and viva session. Requested additional guidance and rescheduling.",
//     student: "Satya",
//     agent: "Rumana Afza",
//     status: status,
//     history: [
//       { date: "2024-12-15", message: "Ticket created by student." },
//       { date: "2024-12-16", message: "Instructor replied: Will reschedule viva and support." },
//     ],
//   };

//   const handleStatusUpdate = (newStatus) => {
//     setStatus(newStatus);
//     alert(`Ticket status updated to: ${newStatus}`);
//   };

//   return (
//     <div id="main_content" className="font-muli theme-blush">
//       <HeaderTop />
//       <RightSidebar />
//       <LeftSidebar role="Admin" />
//       <div className="page mt-4">
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h4>{ticket.subject}</h4>
//         </div>

//         <div className="card p-3 mb-4 shadow-sm">
//           <small className="text-uppercase text-muted mb-1">TICKET</small>
//           <p className="mb-0">{ticket.type}</p>
//           <small>{ticket.subType}</small>
//           <div className="d-flex justify-content-between align-items-center mt-2">
//             <span>{new Date(ticket.startDate).toLocaleDateString()}</span>
//             <TicketStatusBadge status={ticket.status} />
//           </div>
//         </div>

//         <div className="row">
//           {/* Ticket Details + Remarks */}
//           <div className="col-md-6">
//             <div className="card p-3 mb-4 shadow-sm">
//               <h5>
//                 <i className="fa fa-ticket mr-2"></i>Ticket Details
//               </h5>
//               <p className="mt-3">
//                 <i className="fa fa-calendar mr-2"></i>
//                 <strong>Start Date:</strong>{" "}
//                 {new Date(ticket.startDate).toLocaleDateString()}
//               </p>
//               <p>
//                 <i className="fa fa-align-left mr-2"></i>
//                 <strong>Description:</strong> {ticket.description}
//               </p>
//               <p>
//                 <i className="fa fa-user-circle mr-2"></i>
//                 <strong>Student:</strong> {ticket.student}
//               </p>
//               <p>
//                 <i className="fa fa-user mr-2"></i>
//                 <strong>Agent:</strong> {ticket.agent}
//               </p>
//             </div>

//             <div className="card p-3 shadow-sm">
//               <h6 className="mb-3">Add Your Remark</h6>
//               <textarea
//                 className="form-control mb-3"
//                 rows={3}
//                 placeholder="Description"
//               ></textarea>
//               <div className="form-group">
//                 <label className="d-block">Add Attachment :</label>
//                 <input type="file" className="form-control-file" />
//               </div>
//               <button className="btn btn-dark mt-2">SUBMIT</button>
//             </div>
//           </div>

//           {/* Ticket History */}
//           <div className="col-md-6">
//             <div className="card p-3 shadow-sm">
//               <h5>
//                 <i className="fa fa-history mr-2"></i>Ticket History
//               </h5>
//               <ul className="timeline list-unstyled mt-3">
//                 {ticket.history.map((entry, index) => (
//                   <li key={index} className="mb-4">
//                     <div className="d-flex align-items-start">
//                       <div className="mr-3">
//                         <i
//                           className="fa fa-map-marker"
//                           style={{ fontSize: "18px", color: "#4ab6d6" }}
//                         ></i>
//                       </div>
//                       <div>
//                         <strong>{new Date(entry.date).toLocaleDateString()}</strong>
//                         <p className="mb-0">
//                           {entry.message || "No additional message."}
//                         </p>
//                       </div>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>

//          
//       </div>
//     </div>
//   );
// };

// export default AdminTicketDetails;


import React from 'react'

const AdminTicketDetails = () => {
  return (
    <div>AdminTicketDetails</div>
  )
}

export default AdminTicketDetails