import React from "react";

function PricingCard({ planName, price, features, buttonText, cardClass }) {
  return (
    <div className="col-sm-12 col-lg-4">
      <div className={`card ${cardClass}`}>
        <div className="card-body text-center">
          <div className="card-category">{planName}</div>
          <div className="font-25 mb-4">{price}</div>
          <ul className="list-unstyled leading-loose">
            {features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
          <div className="mt-6">
            <button className="btn btn-default btn-block">{buttonText}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingCard;
    