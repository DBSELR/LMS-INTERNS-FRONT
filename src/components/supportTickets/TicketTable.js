import React from "react";
import TicketStatusBadge from "./TicketStatusBadge";

const TicketTable = ({ tickets }) => {
  return (
    <div className="table-responsive">
      <table className="table table-hover table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>ID</th>
            <th>Subject</th>
            <th>Type</th>
            <th>Sub Type</th>
            <th>Start Date</th>
            <th>Agent</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>{ticket.id}</td>
              <td>{ticket.subject}</td>
              <td>{ticket.type}</td>
              <td>{ticket.subType}</td>
              <td>{new Date(ticket.startDate).toLocaleDateString()}</td>
              <td>{ticket.agent}</td>
              <td><TicketStatusBadge status={ticket.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;
