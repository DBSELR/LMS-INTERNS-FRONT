import React from "react";

function GalleryCard({ photo }) {
  return (
    <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
      <div className="card shadow-sm">
        <img src={photo.image} alt="gallery" className="card-img-top" style={{ height: "180px", objectFit: "cover" }} />

        <div className="card-body p-2">
          <div className="media align-items-center">
            <img
              src={photo.avatar}
              alt="avatar"
              className="avatar avatar-sm mr-2"
              style={{ width: "32px", height: "32px" }}
            />
            <div className="media-body">
              <h6 className="mb-0 text-truncate" title={photo.author}>{photo.author}</h6>
              <small className="text-muted">{photo.date}</small>
            </div>
          </div>
        </div>

        <div className="card-footer d-flex justify-content-between align-items-center p-2 border-top">
          <span><i className="fa fa-eye mr-1"></i> {photo.views}</span>
          <span><i className="fa fa-heart mr-1 text-danger"></i> {photo.likes}</span>
        </div>
      </div>
    </div>
  );
}

export default GalleryCard;
