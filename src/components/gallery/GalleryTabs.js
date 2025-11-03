import React, { useState } from "react";
import GalleryGrid from "./GalleryGrid";

function GalleryTabs() {
  const tabs = ["All", "Social Media", "Package", "News"];
  const [activeTab, setActiveTab] = useState("All");

  return (
    <>
      <ul className="nav nav-tabs mb-3">
        {tabs.map((tab, index) => (
          <li className="nav-item" key={index}>
            <button
              className={`nav-link ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>

      <div className="tab-content">
        <div className="tab-pane fade show active">
          <GalleryGrid category={activeTab} />
        </div>
      </div>
    </>
  );
}

export default GalleryTabs;
