import React from "react";
import { FaUniversity, FaBookOpen, FaCalendarAlt, FaGlobe } from "react-icons/fa";
import API_BASE_URL from "../../config";

const AcademicInfoCard = ({ academicInfo }) => {
  const {
    state = "-",
    programme = "-",
    semesterStart = "-",
    examType = "-",
    status = "-"
  } = academicInfo || {};

  return (
    <div className="card shadow-sm bg-white rounded mb-3">
      <div className="card-header bg-gradient-danger text-white">
        <h6 className="mb-0">🎓 Academic Information</h6>
      </div>
      <div className="card-body">
        <ul className="list-unstyled mb-0">
          <li className="mb-2">
            <FaUniversity className="text-danger mr-2" /> {state}
          </li>
          <li className="mb-2">
            <FaBookOpen className="text-danger mr-2" /> {programme}
          </li>
          <li className="mb-2">
            <FaCalendarAlt className="text-danger mr-2" /> {semesterStart}
          </li>
          <li className="mb-2">
            <FaGlobe className="text-danger mr-2" /> {examType}
          </li>
          <li className="mb-2">
            <span className="badge badge-pill badge-danger px-3 py-2 font-weight-bold">{status}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AcademicInfoCard;