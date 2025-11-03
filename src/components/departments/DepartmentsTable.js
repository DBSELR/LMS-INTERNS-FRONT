import React from "react";

function DepartmentsTable() {
  const departments = [
    {
      name: "Computer Science",
      head: "Dr. Emily Carter",
      phone: "(123) 456-7890",
      email: "cs@university.com",
      established: "2004",
      capacity: 120
    },
    {
      name: "Business Administration",
      head: "Prof. John Adams",
      phone: "(987) 654-3210",
      email: "ba@university.com",
      established: "1999",
      capacity: 100
    },
    {
      name: "Mechanical Engineering",
      head: "Dr. Sarah James",
      phone: "(456) 789-1230",
      email: "me@university.com",
      established: "2010",
      capacity: 90
    }
  ];

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h6 className="mb-0"><i className="fa fa-list mr-2"></i>Department Overview</h6>
      </div>

      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover table-striped align-middle mb-0">
            <thead className="thead-light">
              <tr>
                <th>Name</th>
                <th>Head</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Established</th>
                <th>Capacity</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, i) => (
                <tr key={i}>
                  <td>
                    <span className="font-weight-bold">{dept.name}</span>
                  </td>
                  <td>{dept.head}</td>
                  <td><i className="fa fa-phone mr-1 text-primary"></i> {dept.phone}</td>
                  <td><i className="fa fa-envelope mr-1 text-warning"></i> {dept.email}</td>
                  <td>
                    <span className="badge badge-info">{dept.established}</span>
                  </td>
                  <td>
                    <span className="badge badge-success">{dept.capacity} Students</span>
                  </td>
                  <td className="text-center">
                    <div className="btn-group btn-group-sm" role="group" aria-label="Actions">
                      <button className="btn btn-outline-success rounded-circle mr-1" title="View">
                        <i className="fa fa-eye"></i>
                      </button>
                      <button className="btn btn-outline-primary rounded-circle mr-1" title="Edit">
                        <i className="fa fa-edit"></i>
                      </button>
                      <button className="btn btn-outline-danger rounded-circle" title="Delete">
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No departments available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DepartmentsTable;
