import React from "react";

function ConferencesTab() {
  const conferences = [
    { name: "React Summit 2022", location: "New York", date: "May 2022" },
    { name: "Global Tech Conference", location: "San Francisco", date: "Sept 2023" }
  ];

  return (
    <div>
      <h5 className="mb-3 text-primary">Conferences & Workshops</h5>
      <ul className="list-group">
        {conferences.map((conf, index) => (
          <li key={index} className="list-group-item">
            <h6 className="mb-1">{conf.name}</h6>
            <p className="mb-0">{conf.location} | {conf.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ConferencesTab;
