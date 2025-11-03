import React from "react";
import PricingCard from "../components/pricing/PricingCard";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import API_BASE_URL from "../config";

function PricingPage() {
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
            <h1 className="page-title">Page Pricing</h1>
            <ol className="breadcrumb page-breadcrumb">
              <li className="breadcrumb-item"><a href="#">Pages</a></li>
              <li className="breadcrumb-item active" aria-current="page">Pricing</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="section-body mt-4">
        <div className="container">
          <div className="row">
            <PricingCard
              planName="Free"
              price="$0"
              features={["3 Users", "Sharing Tools", "No Design Tools", "No Private Messages", "No Twitter API"]}
              buttonText="Choose Plan"
              cardClass="card-default"
            />
            <PricingCard
              planName="Premium"
              price="$49"
              features={["10 Users", "Sharing Tools", "Design Tools", "No Private Messages", "No Twitter API"]}
              buttonText="Choose Plan"
              cardClass="card-success"
            />
            <PricingCard
              planName="Enterprise"
              price="$99"
              features={["100 Users", "Sharing Tools", "Design Tools", "Private Messages", "Twitter API"]}
              buttonText="Choose Plan"
              cardClass="card-primary"
            />
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default PricingPage;
