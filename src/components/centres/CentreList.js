import React from "react";

function CentreList() {
  const centres = [
    {
      name: "Downtown Campus",
      location: "123 Main St, New York, NY",
      status: "Open",
      established: "2018-05-15",
      staffCount: 35,
      phone: "(212) 555-1234"
    },
    {
      name: "Westside Branch",
      location: "456 Elm St, Los Angeles, CA",
      status: "Closed",
      established: "2020-02-01",
      staffCount: 18,
      phone: "(310) 555-9876"
    },
    {
      name: "Lakeside Centre",
      location: "789 Lake Rd, Chicago, IL",
      status: "Open",
      established: "2019-09-23",
      staffCount: 27,
      phone: "(773) 555-6543"
    }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Centre List</h3>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover table-striped">
            <thead className="thead-light">
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Status</th>
                <th>Established</th>
                <th>Staff</th>
                <th>Phone</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {centres.map((centre, i) => (
                <tr key={i}>
                  <td>{centre.name}</td>
                  <td>{centre.location}</td>
                  <td>
                    <span className={`badge ${centre.status === "Open" ? "badge-success" : "badge-danger"}`}>
                      {centre.status}
                    </span>
                  </td>
                  <td>{centre.established}</td>
                  <td>{centre.staffCount}</td>
                  <td>{centre.phone}</td>
                  <td className="text-right">
                    <button className="btn btn-sm btn-outline-info mr-1"><i className="fa fa-eye"></i></button>
                    <button className="btn btn-sm btn-outline-warning mr-1"><i className="fa fa-edit"></i></button>
                    <button className="btn btn-sm btn-outline-danger"><i className="fa fa-trash"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CentreList;
