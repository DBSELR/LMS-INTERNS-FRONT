import React from "react";

function TaskCard({ task }) {
  return (
    <div className="task-card">
      <div className="task-card-header">
        <h5>{task.title}</h5>
      </div>
      <div className="task-card-body">
        <p>{task.description}</p>
      </div>
      <div className="task-card-footer">
        <button className="btn btn-primary">View</button>
        <button className="btn btn-danger">Delete</button>
      </div>
    </div>
  );
}

export default TaskCard;
