import React from "react";

function SocialMediaCard() {
  const cards = [
    {
      platform: "Instagram",
      icon: "fa-instagram",
      color: "bg-pink",
      followers: "25,634",
      growth: "+12.5%",
      trend: "up"
    },
    {
      platform: "Twitter",
      icon: "fa-twitter",
      color: "bg-info",
      followers: "13,554",
      growth: "+5.4%",
      trend: "up"
    },
    {
      platform: "Facebook",
      icon: "fa-facebook",
      color: "bg-primary",
      followers: "45,002",
      growth: "-1.8%",
      trend: "down"
    },
    {
      platform: "LinkedIn",
      icon: "fa-linkedin",
      color: "bg-blue",
      followers: "18,221",
      growth: "+7.2%",
      trend: "up"
    }
  ];

  return (
    <div className="row clearfix">
      {cards.map((card, index) => (
        <div className="col-lg-3 col-md-6" key={index}>
          <div className={`card ${card.color} text-center`}>
            <div className="card-body">
              <i className={`fa ${card.icon} text-white fa-2x mb-2`}></i>
              <h6 className="text-white mb-0">{card.platform}</h6>
              <h4 className="text-white font-30 font-weight-bold mt-2 mb-0">{card.followers}</h4>
              <span className={`text-white small ${card.trend === "down" ? "text-danger" : "text-success"}`}>
                {card.growth}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SocialMediaCard;
