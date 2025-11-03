import React, { useState, useEffect } from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import LiveClassTable from "../components/LiveClasses/LiveClassTable";
import LiveClassFormModal from "../components/LiveClasses/LiveClassFormModal";
import API_BASE_URL from "../config";

function AdminLiveClasses() {
  const [liveClasses, setLiveClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLiveClass, setSelectedLiveClass] = useState(null);

  // Fetch live classes from API
  const fetchLiveClasses = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(`${API_BASE_URL}/LiveClass/All`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setLiveClasses(data);
    } catch (err) {
      console.error("Failed to fetch live classes", err);
    }
  };

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  // Edit Live Class
  const handleEdit = (liveClass) => {
    setSelectedLiveClass(liveClass);
    setShowModal(true);
  };

  // Delete Live Class
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this live class?")) {
      try {
        const token = localStorage.getItem("jwt");
        await fetch(`${API_BASE_URL}/LiveClass/Delete/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        fetchLiveClasses();
      } catch (err) {
        console.error("Failed to delete live class", err);
      }
    }
  };

  // Save or update live class
  const handleSave = async () => {
    setShowModal(false);
    setSelectedLiveClass(null);
    fetchLiveClasses();
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <div className="page-loader-wrapper">
        <div className="loader"></div>
      </div>

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="page">
        <div className="section-body">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center">
              <div className="header-action">
                <h1 className="page-title">Manage Live Classes</h1>
                <ol className="breadcrumb page-breadcrumb">
                  <li className="breadcrumb-item">
                    <a href="#">LMS</a>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Live Classes
                  </li>
                </ol>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedLiveClass(null);
                  setShowModal(true);
                }}
              >
                <i className="fa fa-plus mr-1" /> Add Live Class
              </button>
            </div>
          </div>
        </div>

        <div className="section-body mt-4">
          <div className="container-fluid">
            <LiveClassTable
              liveClasses={liveClasses}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>

         
      </div>

      {showModal && (
        <LiveClassFormModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onSave={handleSave}
          liveClass={selectedLiveClass}
        />
      )}
    </div>
  );
}

export default AdminLiveClasses;
