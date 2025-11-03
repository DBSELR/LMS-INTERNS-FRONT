import React from "react";

function RoomTable() {
  const rooms = [
    {
      block: "A",
      roomNo: "101",
      type: "Double",
      beds: 2,
      available: "Yes",
      cost: "$200"
    },
    {
      block: "B",
      roomNo: "202",
      type: "Single",
      beds: 1,
      available: "No",
      cost: "$150"
    },
    {
      block: "C",
      roomNo: "303",
      type: "Triple",
      beds: 3,
      available: "Yes",
      cost: "$250"
    }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Hostel Room List</h3>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover table-striped">
            <thead className="thead-light">
              <tr>
                <th>Block</th>
                <th>Room No.</th>
                <th>Type</th>
                <th>No of Beds</th>
                <th>Available</th>
                <th>Cost / Bed</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room, i) => (
                <tr key={i}>
                  <td>{room.block}</td>
                  <td>{room.roomNo}</td>
                  <td>{room.type}</td>
                  <td>{room.beds}</td>
                  <td>
                    <span className={`badge ${room.available === "Yes" ? "badge-success" : "badge-danger"}`}>
                      {room.available}
                    </span>
                  </td>
                  <td>{room.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RoomTable;
