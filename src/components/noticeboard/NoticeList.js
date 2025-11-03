import React from "react";

function NoticeList() {
  const notices = [
    {
      title: "New Semester Notice",
      author: "Admin",
      date: "2024-04-10",
      content: "The new semester begins on April 20, 2024. Please be prepared."
    },
    {
      title: "Library Book Return Deadline",
      author: "Library",
      date: "2024-04-05",
      content: "All library books must be returned by April 15, 2024."
    },
    {
      title: "Guest Lecture on AI",
      author: "Faculty of Engineering",
      date: "2024-03-25",
      content: "Join the guest lecture on AI on March 30, 2024, in Auditorium 3."
    }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Notice List</h3>
      </div>
      <div className="card-body">
        <div className="list-group">
          {notices.map((notice, index) => (
            <div key={index} className="list-group-item">
              <h5>{notice.title}</h5>
              <p className="text-muted">By {notice.author} on {notice.date}</p>
              <p>{notice.content}</p>
              <div className="text-right">
                <button className="btn btn-sm btn-outline-info mr-2">
                  <i className="fa fa-eye"></i> View
                </button>
                <button className="btn btn-sm btn-outline-warning mr-2">
                  <i className="fa fa-edit"></i> Edit
                </button>
                <button className="btn btn-sm btn-outline-danger">
                  <i className="fa fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NoticeList;
