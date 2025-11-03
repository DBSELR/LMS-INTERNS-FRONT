// File: src/pages/Departments.jsx
import React, { useEffect, useState } from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import DepartmentFormModal from "../components/departments/DepartmentFormModal";
import {
  FaEdit,
  FaTrash,
  FaExternalLinkAlt,
  FaUniversity,
} from "react-icons/fa";

import ConfirmationPopup from "../components/ConfirmationPopup"; // Reusable
import API_BASE_URL from "../config";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Department`, {
        method: "GET",
        headers: {
          
          "Authorization": `Bearer ${token}`, // ✅ Attach JWT token here
        },
      });
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (department) => {
    setSelectedDepartment(department);
    setShowModal(true);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleConfirmedDelete = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${API_BASE_URL}/Department/${deleteId}`,
        {
          method: "DELETE",
          headers: {
            
            "Authorization": `Bearer ${token}`, // ✅ Attach JWT token here
          },
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      fetchDepartments();
    } catch (err) {
    } finally {
      setShowConfirm(false);
    }
  };

  const handleSave = () => {
    setShowModal(false);
    setSelectedDepartment(null);
    fetchDepartments();
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <ConfirmationPopup
        show={showConfirm}
        message="Are you sure you want to delete this department?"
        onConfirm={handleConfirmedDelete}
        onCancel={() => setShowConfirm(false)}
      />

      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader" />
        </div>
      )}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Admin" />

      <div className="section-wrapper">
        <div className="page departments-page">
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
            <div className="jumbotron bg-light p-0 rounded shadow-sm mb-3 welcome-card animate-welcome">
              <h2 className="page-title text-primary pt-0">
                <FaUniversity className="me-2 mb-1" /> Manage Departments
              </h2>
              <p className="text-muted mb-0">
                Add, edit, and manage department information easily
              </p>
            </div>

            <div className="d-flex justify-content-end mb-4">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedDepartment(null);
                  setShowModal(true);
                }}
              >
                <i className="fa fa-plus me-2"></i> Add New Department
              </button>
            </div>

            <div className="row">
              {departments.length > 0 ? (
                departments.map((department) => (
                  <div
                    key={department.id}
                    className="col-12 col-md-6 col-lg-4 mb-4"
                  >
                    <div className="card shadow-sm h-100 border-0 rounded">
                      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">{department.name}</h6>
                        <button
                          className="btn btn-sm btn-light"
                          onClick={() => handleEdit(department)}
                        >
                          <FaEdit />
                        </button>
                      </div>
                      <div className="card-body">
                        <ul className="list-unstyled mb-0">
                          <li>
                            <strong>Head:</strong>{" "}
                            {department.headOfDepartment || "N/A"}
                          </li>
                          <li>
                            <strong>Code:</strong> {department.code}
                          </li>
                          <li>
                            <strong>Faculty:</strong> {department.facultyCount}
                          </li>
                          <li>
                            <strong>Email:</strong> {department.contactEmail}
                          </li>
                          <li>
                            <strong>Phone:</strong>{" "}
                            {department.contactPhone || "N/A"}
                          </li>
                          <li>
                            <strong>Location:</strong> {department.location}
                          </li>
                          <li>
                            <strong>Established:</strong>{" "}
                            {department.establishedYear}
                          </li>
                          <li>
                            <strong>Website:</strong>{" "}
                            {department.websiteUrl ? (
                              <a
                                href={department.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary"
                              >
                                <FaExternalLinkAlt className="ms-1" />{" "}
                                {department.websiteUrl}
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </li>
                        </ul>
                      </div>
                      <div className="card-footer bg-white border-top d-flex justify-content-end">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => confirmDelete(department.id)}
                        >
                          <FaTrash className="me-1" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center text-muted py-4">
                  <p>No departments available.</p>
                </div>
              )}
            </div>
          </div>
        </div>

         

        {showModal && (
          <DepartmentFormModal
            show={showModal}
            onHide={() => setShowModal(false)}
            onSave={handleSave}
            department={selectedDepartment}
          />
        )}
      </div>

      </div>

    </div>
  );
}

export default Departments;
