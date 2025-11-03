import React, { useEffect, useState } from "react";
import CourseCard from "./CourseCard";
import API_BASE_URL from "../../config";

function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    fetch(`${API_BASE_URL}/Course/All`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((course) => ({
          name: course.name,
          description: course.courseDescription,
          duration: course.semester || "TBD",
          fees: course.credits ? `$${course.credits * 100}` : "$N/A",
          students: course.students || Math.floor(Math.random() * 100 + 1),
          instructor: course.instructor || "Instructor Unknown",
          image: "../assets/images/course/course1.jpg" // placeholder or dynamic later
        }));
        setCourses(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load courses", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading courses...</div>;
  if (!courses.length) return <div>No courses available.</div>;

  return (
    <div className="row clearfix">
      {courses.map((course, index) => (
        <CourseCard key={index} course={course} />
      ))}
    </div>
  );
}

export default CoursesList;
