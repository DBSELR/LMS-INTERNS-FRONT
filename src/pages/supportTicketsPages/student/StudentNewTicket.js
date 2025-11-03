import React from "react";
import TicketForm from "../../../components/supportTickets/TicketForm";
import HeaderTop from "../../../components/HeaderTop";
import LeftSidebar from "../../../components/LeftSidebar";
import RightSidebar from "../../../components/RightSidebar";
import Footer from "../../../components/Footer";
import API_BASE_URL from "../../../config";

const StudentNewTicket = () => {
  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Student" />
      <div className="page mt-4">
        <div className="jumbotron bg-light p-4 rounded shadow-sm mb-4">
          <h2 className="text-primary mb-2">Create New Support Ticket</h2>
          <p className="text-muted">Please fill out the form to submit your query.</p>
        </div>
        <TicketForm role="student" />
         
      </div>
    </div>
  );
};

export default StudentNewTicket;
