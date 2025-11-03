import React, { useState } from "react";

function CommentSection() {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([
    {
      user: "Donald Gardner",
      time: "Just now",
      text: "Lorem ipsum Veniam aliquip culpa laboris minim tempor",
    },
  ]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (comment.trim() !== "") {
      setComments([...comments, { user: "You", time: "Just now", text: comment }]);
      setComment(""); // Clear comment input
    }
  };

  return (
    <div className="collapse p-4 section-gray mt-2">
      <form className="well" onSubmit={handleCommentSubmit}>
        <div className="form-group">
          <textarea
            rows="2"
            className="form-control no-resize"
            placeholder="Enter here for tweet..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
        </div>
        <button className="btn btn-primary">Submit</button>
      </form>
      <ul className="recent_comments list-unstyled mt-4 mb-0">
        {comments.map((comment, index) => (
          <li key={index}>
            <div className="avatar_img">
              <img className="avatar" src="../assets/images/xs/avatar4.jpg" alt="" />
            </div>
            <div className="comment_body">
              <h5>
                {comment.user} <small className="float-right font-14">{comment.time}</small>
              </h5>
              <span>{comment.text}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CommentSection;
