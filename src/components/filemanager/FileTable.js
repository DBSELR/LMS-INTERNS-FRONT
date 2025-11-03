import React from "react";

function FileTable() {
  const tableFiles = [
    {
      icon: "fa-folder",
      color: "text-info",
      name: "Design Docs",
      owner: "Wendell Licon",
      size: "--",
      modified: "Jan 09, 2024",
      avatars: [1, 2],
    },
    {
      icon: "fa-file-pdf-o",
      color: "text-danger",
      name: "Company-Report.pdf",
      owner: "Marshall Nichols",
      size: "68KB",
      modified: "Jan 21, 2024",
      avatars: [3],
    },
    {
      icon: "fa-file-excel-o",
      color: "text-success",
      name: "Budget2024.xlsx",
      owner: "Emma Smith",
      size: "42KB",
      modified: "Feb 01, 2024",
      avatars: [4, 5],
    },
    {
      icon: "fa-file-word-o",
      color: "text-primary",
      name: "Agenda2024.docx",
      owner: "Robert Gray",
      size: "39KB",
      modified: "Mar 12, 2024",
      avatars: [6],
    },
  ];

  return (
    <table className="table table-hover table-vcenter text-nowrap table_custom spacing5 mb-0">
      <thead>
        <tr>
          <th>Name</th>
          <th>Owner</th>
          <th className="text-center">Size</th>
          <th className="text-center">Last Modified</th>
          <th className="text-center">Members</th>
        </tr>
      </thead>
      <tbody>
        {tableFiles.map((file, i) => (
          <tr key={i}>
            <td>
              <i className={`fa ${file.icon} ${file.color} mr-2`}></i>
              {file.name}
            </td>
            <td>{file.owner}</td>
            <td className="text-center">{file.size}</td>
            <td className="text-center">{file.modified}</td>
            <td className="text-center">
              <ul className="list-unstyled team-info mb-0 d-flex justify-content-center">
                {file.avatars.map((id) => (
                  <li key={id}>
                    <img src={`../assets/images/xs/avatar${id}.jpg`} alt="avatar" title={`Member ${id}`} />
                  </li>
                ))}
              </ul>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default FileTable;
