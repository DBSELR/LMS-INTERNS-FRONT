import React from "react";

function CourseDetailsContent() {
  const syllabus = [
    { title: "Introduction to Web Development", duration: "1 Week" },
    { title: "HTML & CSS Basics", duration: "2 Weeks" },
    { title: "JavaScript Fundamentals", duration: "3 Weeks" },
    { title: "ReactJS Basics", duration: "2 Weeks" },
    { title: "Final Project & Review", duration: "1 Week" }
  ];

  const outcomes = [
    "Understand the structure of modern web applications.",
    "Build responsive web pages using HTML/CSS.",
    "Write JavaScript code to handle dynamic behaviors.",
    "Use ReactJS to create reusable UI components.",
    "Deploy a complete project from start to finish."
  ];

  return (
    <div className="card">
      <div className="card-body">
        {/* Course Description */}
        <h5>Course Description</h5>
        <p>
          This course is designed to introduce students to the fundamentals of
          web development. By the end of this course, participants will be able
          to build and deploy responsive websites using modern tools and
          frameworks like HTML, CSS, JavaScript, and React.
        </p>

        {/* Course Syllabus */}
        <h5 className="mt-4">Syllabus</h5>
        <ul className="list-group mb-4">
          {syllabus.map((item, index) => (
            <li className="list-group-item d-flex justify-content-between align-items-center" key={index}>
              {item.title}
              <span className="badge badge-primary badge-pill">{item.duration}</span>
            </li>
          ))}
        </ul>

        {/* Learning Outcomes */}
        <h5>Learning Outcomes</h5>
        <ul className="list-style-disc pl-4">
          {outcomes.map((point, i) => (
            <li key={i} className="mb-1">{point}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CourseDetailsContent;
