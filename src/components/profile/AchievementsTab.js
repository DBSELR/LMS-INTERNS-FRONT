import React from "react";

function AchievementsTab() {
  const achievements = [
    "Certified React Developer - 2021",
    "Best Employee Award - Tech Solutions (2022)",
    "Speaker at WebTech Summit 2023"
  ];

  return (
    <div>
      <h5 className="mb-3 text-primary">Achievements</h5>
      <ul className="list-group">
        {achievements.map((ach, index) => (
          <li key={index} className="list-group-item">
            {ach}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AchievementsTab;
