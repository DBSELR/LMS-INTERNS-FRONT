import React from "react";

function TransportTable() {
  const transports = [
    {
      driverName: "Alan Johnson",
      phone: "404-447-6013",
      licenseNo: "GHT-25-5845",
      vehicleNo: "UXS 111",
      routeName: "Botanic to Brooklyn",
    },
    {
      driverName: "Ken Smith",
      phone: "404-447-8563",
      licenseNo: "GHT-25-1599",
      vehicleNo: "UXS 494",
      routeName: "Botanic to Brooklyn",
    },
    // Add more data as needed
  ];

  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped table-vcenter text-nowrap">
        <thead>
          <tr>
            <th>#</th>
            <th>Driver Name</th>
            <th>Mobile</th>
            <th>License No</th>
            <th>Vehicle No</th>
            <th>Route Name</th>
            <th>Map</th>
          </tr>
        </thead>
        <tbody>
          {transports.map((transport, index) => (
            <tr key={index}>
              <td>
                <img className="avatar" src="../assets/images/xs/avatar1.jpg" alt="avatar" />
              </td>
              <td>{transport.driverName}</td>
              <td>{transport.phone}</td>
              <td>{transport.licenseNo}</td>
              <td>{transport.vehicleNo}</td>
              <td>{transport.routeName}</td>
              <td>
                <button type="button" className="btn btn-icon btn-sm" title="Map">
                  <i className="fa fa-map"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransportTable;
