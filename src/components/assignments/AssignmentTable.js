import React from "react";

function AssignmentTable({ assignments, onEdit, onDelete ,role}) {
  return (
    <div className="row">
      {assignments.length === 0 ? (
        <div className="col-12 text-center text-muted py-5">
          <h5>No assignments found.</h5>
        </div>
      ) : (
        assignments.map((assignment) => (
          <div key={assignment.assignmentId} className="col-lg-6 col-md-12 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="text-primary">{assignment.title}</h5>
                <p className="text-muted">{assignment.description}</p>
                <p className="mb-1">
                  <strong>Due:</strong> {new Date(assignment.dueDate).toLocaleString()}
                </p>
                <p className="mb-3">
                  <strong>Max Grade:</strong> {assignment.maxGrade}
                </p>

                <div className="mt-auto d-flex justify-content-between">
                  
                  <button
                    className="btn btn-sm btn-outline-info"
                    onClick={() => onEdit(assignment)}
                  >
                    <i className="fa fa-edit mr-1"></i> Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => onDelete(assignment.assignmentId)}
                  >
                    <i className="fa fa-trash mr-1"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AssignmentTable;
