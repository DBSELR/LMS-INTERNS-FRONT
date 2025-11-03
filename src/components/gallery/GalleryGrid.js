import React from "react";
import GalleryCard from "./GalleryCard";

function GalleryGrid({ category }) {
  // Sample image data, ideally fetched based on `category`
  const photos = [
    {
      id: 1,
      image: "../assets/images/gallery/1.jpg",
      author: "Emily Brown",
      avatar: "../assets/images/xs/avatar1.jpg",
      date: "April 12, 2024",
      views: 135,
      likes: 27,
      category: "All"
    },
    {
      id: 2,
      image: "../assets/images/gallery/2.jpg",
      author: "Liam James",
      avatar: "../assets/images/xs/avatar2.jpg",
      date: "April 10, 2024",
      views: 89,
      likes: 14,
      category: "Social Media"
    },
    {
      id: 3,
      image: "../assets/images/gallery/3.jpg",
      author: "Sophia Chen",
      avatar: "../assets/images/xs/avatar3.jpg",
      date: "April 8, 2024",
      views: 202,
      likes: 43,
      category: "Package"
    },
    {
      id: 4,
      image: "../assets/images/gallery/4.jpg",
      author: "Noah Wilson",
      avatar: "../assets/images/xs/avatar4.jpg",
      date: "April 6, 2024",
      views: 310,
      likes: 50,
      category: "News"
    }
  ];

  const filteredPhotos = category === "All"
    ? photos
    : photos.filter(photo => photo.category === category);

  return (
    <div className="row clearfix">
      {filteredPhotos.map(photo => (
        <GalleryCard key={photo.id} photo={photo} />
      ))}
      {filteredPhotos.length === 0 && (
        <div className="col-12 text-center text-muted">
          <p>No photos in this category.</p>
        </div>
      )}
    </div>
  );
}

export default GalleryGrid;
