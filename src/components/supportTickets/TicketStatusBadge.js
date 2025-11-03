import React from "react";

const TicketStatusBadge = ({ status }) => {
  let badgeClass = "badge-secondary";
  if (status === "Resolved") badgeClass = "badge-success";
  else if (status === "Open") badgeClass = "badge bg-danger" ;
  else if (status === "Closed") badgeClass = "badge-dark";

  return <span className={`badge ${badgeClass}`}>{status}</span>;
};

export default TicketStatusBadge;
