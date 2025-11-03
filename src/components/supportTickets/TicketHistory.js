import React from "react";

const TicketHistory = ({ history }) => {
  return (
    <div className="card mb-4">
      <div className="card-header bg-secondary text-white">
        <h5 className="mb-0">Ticket History</h5>
      </div>
      <div className="card-body">
        {history.length === 0 ? (
          <p className="text-muted">No history available yet.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {history.map((entry, index) => (
              <li key={index} className="list-group-item">
                <small className="text-muted">{new Date(entry.date).toLocaleString()}</small>
                <p className="mb-0">{entry.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TicketHistory;
