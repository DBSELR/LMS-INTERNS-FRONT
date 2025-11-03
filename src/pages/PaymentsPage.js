import React, { useEffect, useState } from "react";
import PaymentsTable from "../components/payments/PaymentsTable";
import HeaderTop from "../components/HeaderTop";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import Footer from "../components/Footer";
import AddFeeForm from "../components/payments/AddFeeForm";
import SemesterFeeTemplateManager from "../components/payments/SemesterFeeTemplateManager";
import API_BASE_URL from "../config";

function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [allFees, setAllFees] = useState([]);
  const [activeTab, setActiveTab] = useState("fees-list");

  const fetchAllFees = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(`${API_BASE_URL}/Fee/All`, {
        headers: {
          
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch fees");
      const data = await response.json();
      setAllFees(data);
    } catch (err) {
      console.error("Error fetching all fees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFees();
  }, []);

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader"></div>
        </div>
      )}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Admin" />

      <div className="section-wrapper">
        <div className="page admin-dashboard">
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
            <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
                          <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                           <i class="fa-solid fa-credit-card"></i> Fees & Payments
                          </h2>
                          <p className="text-muted mb-0 dashboard-hero-sub">
                            View, manage and configure fees and payments
                          </p>
                        </div>

            <div className="welcome-card animate-welcome">
              <div className="card-header border-bottom-0 pb-0 ">
                <ul className="nav nav-tabs px-3" style={{ borderBottom: "2px solid #ddd" }}>
                  <li className="nav-item">
                    <a
                      className={`nav-link fw-bold text-dark border-0 ${activeTab === "fees-list" ? "active" : ""}`}
                      href="#fees-list"
                      onClick={(e) => { e.preventDefault(); setActiveTab("fees-list"); }}
                      style={activeTab === "fees-list" ? { borderBottom: "3px solid #5a67d8" } : {}}
                    >
                      <i className="fa fa-list mr-1 text-primary"></i> Fee List
                    </a>
                  </li>
                  {/* Future Tab
                  <li className="nav-item">
                    <a
                      className={`nav-link fw-bold text-dark border-0 ${activeTab === "fees-receipt" ? "active" : ""}`}
                      href="#fees-receipt"
                      onClick={(e) => { e.preventDefault(); setActiveTab("fees-receipt"); }}
                      style={activeTab === "fees-receipt" ? { borderBottom: "3px solid #5a67d8" } : {}}
                    >
                      <i className="fa fa-file-text-o mr-1 text-primary"></i> Fee Receipts
                    </a>
                  </li>
                  */}
                  {/* Future Tab
                  <li className="nav-item">
                    <a
                      className={`nav-link fw-bold text-dark border-0 ${activeTab === "fees-add" ? "active" : ""}`}
                      href="#fees-add"
                      onClick={(e) => { e.preventDefault(); setActiveTab("fees-add"); }}
                      style={activeTab === "fees-add" ? { borderBottom: "3px solid #5a67d8" } : {}}
                    >
                      <i className="fa fa-plus mr-1 text-primary"></i> Add Fee
                    </a>
                  </li>
                  */}
                  <li className="nav-item">
                    <a
                      className={`nav-link fw-bold text-dark border-0 ${activeTab === "fee-template" ? "active" : ""}`}
                      href="#fee-template"
                      onClick={(e) => { e.preventDefault(); setActiveTab("fee-template"); }}
                      style={activeTab === "fee-template" ? { borderBottom: "3px solid #5a67d8" } : {}}
                    >
                      <i className="fa fa-cogs mr-1 text-primary"></i> Fee Templates
                    </a>
                  </li>
                </ul>
              </div>

              <div className="card-body">
                <div className="tab-content">
                  {activeTab === "fees-list" && (
                    <div className="tab-pane fade show active" id="fees-list">
                      <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white d-flex align-items-center">
                          <i className="fa fa-credit-card mr-2"></i>
                          <h6 className="mb-0">All Payments</h6>
                        </div>
                        <div className="card-body p-0">
                          <PaymentsTable data={allFees} />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "fees-receipt" && (
                    <div className="tab-pane fade show active" id="fees-receipt">
                      <div className="text-center py-5 text-muted">
                        <h5>📄 Fee Receipt Management Coming Soon...</h5>
                      </div>
                    </div>
                  )}

                  {activeTab === "fees-add" && (
                    <div className="tab-pane fade show active" id="fees-add">
                      <AddFeeForm />
                    </div>
                  )}

                  {activeTab === "fee-template" && (
                    <div className="tab-pane fade show active" id="fee-template">
                      <SemesterFeeTemplateManager />
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
         
      </div>

      </div>
    </div>
  );
}

export default PaymentsPage;
