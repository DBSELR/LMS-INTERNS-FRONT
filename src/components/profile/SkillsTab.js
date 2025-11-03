import React from "react";

function SkillsTab() {
  const skills = ["JavaScript", "React", "Node.js", "HTML5", "CSS3", "MongoDB"];

  return (
    <div>
      <h5 className="mb-3 text-primary">Skills</h5>
      <div className="d-flex flex-wrap">
        {skills.map((skill, index) => (
          <span key={index} className="badge badge-primary m-1 p-2">{skill}</span>
        ))}
      </div>
    </div>
  );
}

export default SkillsTab;
