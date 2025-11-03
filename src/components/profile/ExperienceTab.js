import React from "react";

function ExperienceTab() {
  const experienceData = [
    { role: "Software Developer", company: "Tech Solutions", years: "2020 - 2022" },
    { role: "Senior Developer", company: "InnovateX", years: "2022 - Present" }
  ];

  return (
    <div>
      <h5 className="mb-3 text-primary">Experience</h5>
      <ul className="list-group">
        {experienceData.map((exp, index) => (
          <li key={index} className="list-group-item">
            <h6 className="mb-1">{exp.role}</h6>
            <p className="mb-0">{exp.company} | {exp.years}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ExperienceTab;
