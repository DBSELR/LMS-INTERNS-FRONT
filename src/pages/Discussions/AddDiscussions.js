import React, { useEffect, useState } from "react";
import HeaderTop from "../../components/HeaderTop";
import RightSidebar from "../../components/RightSidebar";
import LeftSidebar from "../../components/LeftSidebar";
import Footer from "../../components/Footer";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationPopup from "../../components/ConfirmationPopup"; // ✅ Import your reusable component
import API_BASE_URL from "../../config";

function AddDiscussions() {
  const [form, setForm] = useState({
    subjectId: "",
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const [subjectOptions, setSubjectOptions] = useState([]);

  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) return;

        const decoded = jwtDecode(token);
        const userId = decoded?.UserId;

        const response = await axios.get(
          `${API_BASE_URL}/Course/DiscussionForumSubjectByUserId/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSubjectOptions(response.data);
        console.log("📚 Subjects Loaded:", response.data);
      } catch (error) {
        console.error("❌ Failed to fetch subjects:", error);
        toast.error("Failed to load subject list.");
      }
    };

    fetchSubjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("jwt");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }

    const decoded = jwtDecode(token);
    const userId = decoded?.UserId;
    const examId = parseInt(form.subjectId);

    if (isNaN(examId)) {
      toast.warning("Please select a valid subject.");
      return;
    }

    const payload = {
      DId: 0,
      ExaminationId: examId,
      UserId: userId,
      ThreadTitle: form.title,
      ThreadContent: form.description,
      AttachmentUrl: null,
      OpenDate: form.startDate,
      CloseDate: form.endDate,
    };

    setPendingPayload(payload);
    setShowConfirmPopup(true); // ✅ Show confirmation popup
  };

  const handleConfirmCreate = async () => {
    setShowConfirmPopup(false);
    if (!pendingPayload) return;

    try {
      const token = localStorage.getItem("jwt");

      const response = await axios.post(
        `${API_BASE_URL}/Course/UpsertDiscussionForum`,
        pendingPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Discussion Created:", response.data);
      toast.success("Discussion created successfully!");

      setForm({
        subjectId: "",
        title: "",
        description: "",
        startDate: "",
        endDate: "",
      });
    } catch (error) {
      console.error("❌ Failed to create discussion:", error);
      toast.error("Failed to create discussion. Check console for details.");
    } finally {
      setPendingPayload(null);
    }
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="section-wrapper">
        <div className="page admin-dashboard pt-0">
        {/* Welcome Header */}
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
              <div className="jumbotron bg-light rounded shadow-sm mb-3  welcome-card dashboard-hero">
          <h2 className="page-title text-primary pt-0 dashboard-hero-title">
            <i className="fa-solid fa-comment"></i> Add Discussion
          </h2>
          <p className="text-muted mb-0 dashboard-hero-sub">
            Fill in the details below to create a discussion
          </p>
        </div>
          </div>
        </div>

        <div className="section-body mt-2">
          <div className="container-fluid">
            <div className="card welcome-card animate-welcome">
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {/* Subject & Title in one row */}
                  <div className="form-row row mb-3">
                    <div className="form-group col-md-6">
                      <label>
                        <strong>
                          Subject <span className="text-danger">*</span>
                        </strong>
                      </label>
                      <select
                        className="form-control"
                        name="subjectId"
                        value={form.subjectId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Select Subject --</option>
                        {subjectOptions.map((item) => (
                          <option
                            key={item.examinationId}
                            value={item.examinationId}
                          >
                            {item.subject}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group col-md-6">
                      <label>
                        <strong>
                          Title <span className="text-danger">*</span>
                        </strong>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Type your discussion title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="form-group mb-3">
                    <label>
                      <strong>Description</strong>
                    </label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Add description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Dates */}
                  <div className="form-row row mb-3">
                    <div className="form-group col-md-6">
                      <label>
                        <strong>
                          Start Date <span className="text-danger">*</span>
                        </strong>
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        name="startDate"
                        value={form.startDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group col-md-6">
                      <label>
                        <strong>
                          End Date <span className="text-danger">*</span>
                        </strong>
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        name="endDate"
                        value={form.endDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-light me-3"
                      onClick={() => window.history.back()}
                    >
                      BACK
                    </button>
                    <button type="submit" className="btn btn-dark">
                      CREATE
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

         
      </div>
      </div>

      {/* Toasts */}
      <ToastContainer />

      {/* ✅ Custom Reusable Confirmation Modal */}
      <ConfirmationPopup
        show={showConfirmPopup}
        message="Are you sure you want to create this discussion?"
        onConfirm={handleConfirmCreate}
        onCancel={() => {
          setShowConfirmPopup(false);
          setPendingPayload(null);
        }}
      />
    </div>
  );
}

export default AddDiscussions;
