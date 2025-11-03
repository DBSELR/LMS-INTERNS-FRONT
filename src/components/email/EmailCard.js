import React from "react";

function EmailCard({ email }) {
  const { id, from, subject, message, avatar, time, unread } = email;

  return (
    <div className="card">
      <div className="card-header" id={`heading${id}`}>
        <h5 className="mb-0">
        <a
  className="collapsed w-100 d-flex justify-content-between align-items-center"
  data-toggle="collapse"
  data-target={`#collapse${id}`}
  aria-expanded="false"
  aria-controls={`collapse${id}`}
  href="#!"
  onClick={(e) => e.preventDefault()}
  style={{ textDecoration: "none" }}
>
  <div className="d-flex align-items-center">
    <img className="avatar mr-3" src={`../assets/images/xs/${avatar}`} alt="avatar" />
    <div>
      <h6 className={`mb-0 ${unread ? "font-weight-bold text-dark" : ""}`}>{from}</h6>
      <small className="text-muted d-block">{subject}</small>
    </div>
  </div>
  <div className="text-right text-nowrap ml-3">
    <small className="text-muted">{time}</small>
  </div>
</a>


        </h5>
      </div>

      <div
        id={`collapse${id}`}
        className="collapse"
        aria-labelledby={`heading${id}`}
        data-parent="#emailAccordion"
      >
        <div className="card-body">
          <p>{message}</p>
          <div className="text-right">
            <button className="btn btn-sm btn-primary mr-2">Reply</button>
            <button className="btn btn-sm btn-secondary mr-2">Archive</button>
            <button className="btn btn-sm btn-danger">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailCard;
