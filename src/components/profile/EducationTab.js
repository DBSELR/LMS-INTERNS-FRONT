import React from "react";

function EducationTab() {
  const educationData = [
    { degree: "B.Sc. Computer Science", institution: "ABC University", year: "2015 - 2018" },
    { degree: "M.Sc. Software Engineering", institution: "XYZ Institute", year: "2018 - 2020" }
  ];

  return (
    <div>
      <h5 className="mb-3 text-primary">Education</h5>
      <ul className="list-group">
        {educationData.map((edu, index) => (
          <li key={index} className="list-group-item">
            <h6 className="mb-1">{edu.degree}</h6>
            <p className="mb-0">{edu.institution} | {edu.year}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EducationTab;
