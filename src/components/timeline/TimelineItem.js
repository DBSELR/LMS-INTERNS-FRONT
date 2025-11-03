import React, { useState } from "react";
import CommentSection from "./CommentSection";

function TimelineItem({
  name,
  location,
  time,
  description,
  loveCount,
  commentCount,
  imageUrl,
}) {
  const [isCommentSectionVisible, setIsCommentSectionVisible] = useState(false);

  return (
    <div className="timeline_item">
      <img className="tl_avatar" src="../assets/images/xs/avatar1.jpg" alt="" />
      <span>
        <a href="javascript:void(0);">{name}</a> {location}{" "}
        <small className="float-right text-right">{time}</small>
      </span>
      <h6 className="font600">{description}</h6>
      <div className="msg">
        {imageUrl && (
          <div className="timeline_img mb-20">
            <img className="width100" src={imageUrl} alt="Awesome Image" />
          </div>
        )}
        <a href="javascript:void(0);" className="mr-20 text-muted">
          <i className="fa fa-heart text-pink"></i> {loveCount} Love
        </a>
        <a
          className="text-muted"
          role="button"
          data-toggle="collapse"
          href="#collapseExample"
          aria-expanded="false"
          aria-controls="collapseExample"
          onClick={() => setIsCommentSectionVisible(!isCommentSectionVisible)}
        >
          <i className="fa fa-comments"></i> {commentCount} Comment
        </a>
        {isCommentSectionVisible && <CommentSection />}
      </div>
    </div>
  );
}

export default TimelineItem;
