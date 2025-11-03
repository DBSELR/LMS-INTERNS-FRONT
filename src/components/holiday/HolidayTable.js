import React from "react";

function HolidayTable() {
  const holidays = [
    {
      title: "Christmas Day",
      subject: "Religious Holiday",
      start: "2024-12-25",
      end: "2024-12-25"
    },
    {
      title: "New Year",
      subject: "Public Holiday",
      start: "2025-01-01",
      end: "2025-01-01"
    },
    {
      title: "Summer Break",
      subject: "Vacation",
      start: "2025-06-01",
      end: "2025-06-15"
    }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Holiday List</h3>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover table-striped">
            <thead className="thead-light">
              <tr>
                <th>Title</th>
                <th>Subject</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((h, i) => (
                <tr key={i}>
                  <td>{h.title}</td>
                  <td>{h.subject}</td>
                  <td>{h.start}</td>
                  <td>{h.end}</td>
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

export default HolidayTable;
