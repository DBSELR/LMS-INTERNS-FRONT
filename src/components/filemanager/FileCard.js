import React from "react";

function FileCard() {
  const files = [
    { icon: "fa-folder", color: "text-info", label: "Work Files", type: "folder", updated: "2 days ago" },
    { icon: "fa-folder", color: "text-success", label: "UI Design", type: "folder", updated: "5 days ago" },
    { icon: "fa-file-pdf-o", color: "text-danger", label: "Report2023.pdf", type: "pdf", updated: "1 day ago" },
    { icon: "fa-file-excel-o", color: "text-success", label: "Budget.xlsx", type: "excel", updated: "3 days ago" },
    { icon: "fa-file-word-o", color: "text-primary", label: "Agenda.docx", type: "word", updated: "Today" },
  ];

  return (
    <>
      {files.map((file, index) => (
        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-4" key={index}>
          <div className="card h-100">
            <div className="file text-center p-3 d-flex flex-column justify-content-center h-100">
              <a href="#" className="hover d-block" onClick={(e) => e.preventDefault()}>
                <div className="icon mb-3">
                  <i className={`fa ${file.icon} ${file.color} fa-2x`}></i>
                </div>
                <div className="file-name">
                  <p className="mb-1 text-dark font-weight-bold">{file.label}</p>
                  <small className="text-muted">Last Update: {file.updated}</small>
                </div>
              </a>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default FileCard;
