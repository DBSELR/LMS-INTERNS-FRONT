import React, { useState, useEffect } from "react";
import API_BASE_URL from "../../config";

// A table component to display live classes with Edit and Delete options
function LiveClassTable({ liveClasses, onEdit, onDelete }) {
  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Title</th>
          
            <th>Date & Time</th>
            <th>Instructor</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {liveClasses && liveClasses.length > 0 ? (
            liveClasses.map((liveClass) => (
              <tr key={liveClass.liveClassId}>
                <td>{liveClass.className}</td> {/* Make sure className exists */}
               
                <td>{new Date(liveClass.startTime).toLocaleString()}</td> {/* Ensure startTime is a valid date */}
                <td>{liveClass.instructorName || "Instructor Unknown"}</td> {/* Ensure instructorName exists */}
                <td>
                  <button className="btn btn-primary" onClick={() => onEdit(liveClass)}>
                    Edit
                  </button>
                  <button
                    className="btn btn-danger ml-2"
                    onClick={() => onDelete(liveClass.liveClassId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No live classes available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default LiveClassTable;
