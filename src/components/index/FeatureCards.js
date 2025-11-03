import React from "react";

function FeatureCards() {
  const features = [
    {
      title: "Easy Task Management",
      description: "Organize your tasks and stay on top of your work.",
      icon: "fa fa-tasks",
    },
    {
      title: "Real-Time Updates",
      description: "Get updates in real-time and stay informed.",
      icon: "fa fa-sync",
    },
    {
      title: "User-Friendly Interface",
      description: "A clean and easy-to-use interface for all users.",
      icon: "fa fa-cogs",
    },
  ];

  return (
    <div className="feature-cards">
      <div className="container">
        <div className="row">
          {features.map((feature, index) => (
            <div className="col-md-4" key={index}>
              <div className="card">
                <div className="card-body text-center">
                  <i className={`card-icon ${feature.icon}`}></i>
                  <h5 className="card-title">{feature.title}</h5>
                  <p className="card-text">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FeatureCards;
