import React from "react";
import TimelineItem from "../components/timeline/TimelineItem";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

function TimelinePage() {
  return (
    <div id="main_content" className="font-muli theme-blush">
    <div className="page-loader-wrapper"><div className="loader"></div></div>

    <HeaderTop />
    <RightSidebar />
    <LeftSidebar />

    <div className="page">
      <div className="section-body">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="page-title">Timeline</h1>
            <ol className="breadcrumb page-breadcrumb">
              <li className="breadcrumb-item">
                <a href="#">Pages</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Timeline
              </li>
            </ol>
          </div>
        </div>
      </div>

      <div className="section-body mt-4">
        <div className="container-fluid">
          <div className="row clearfix">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Timeline Activity</h3>
                </div>
                <div className="card-body">
                  {/* Rendering multiple timeline items */}
                  <TimelineItem
                    name="Elisse Joson"
                    location="San Francisco, CA"
                    time="20-April-2024 - Today"
                    description="I'm speaking with myself, number one, because I have a very good brain and I've said a lot of things."
                    loveCount={12}
                    commentCount={1}
                  />
                  <TimelineItem
                    name="Dessie Parks"
                    location="Oakland, CA"
                    time="19-April-2024 - Yesterday"
                    description="Well we have good budget for the project."
                    loveCount={23}
                    commentCount={2}
                    imageUrl="../assets/images/gallery/1.jpg"
                  />
                  <TimelineItem
                    name="Rochelle Barton"
                    location="San Francisco, CA"
                    time="12-April-2024"
                    description="An Engineer Explains Why You Should Always Order the Larger Pizza."
                    loveCount={7}
                    commentCount={1}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default TimelinePage;
