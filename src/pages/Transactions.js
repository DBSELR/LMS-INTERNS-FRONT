import React, { useState, useEffect } from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import TransactionsTable from "../components/payments/TransactionsTable";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";



function Transactions() {
  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="section-wrapper">
        <div className="page admin-dashboard pt-0">
          <div className="section-body mt-3 pt-0">
            <div className="container-fluid">
              <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
                <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                  <i className="fa fa-exchange-alt mr-2"></i> Transactions
                </h2>
                <p className="text-muted mb-0 dashboard-hero-sub">
                  View and manage college-wise student fee transactions
                </p>
              </div>
              
              <TransactionsTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Transactions;
