import React from "react";
import { jwtDecode } from "jwt-decode";
import HeroSection from "../components/index/HeroSection";
import FeatureCards from "../components/index/FeatureCards";
import Footer from "../components/Footer";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import API_BASE_URL from "../config";

function StudentDashboard() {
  return <div className="container">Welcome Student</div>;
}

function AdminDashboard() {
  return <div className="container">Welcome Admin</div>;
}

function ParentDashboard() {
  return <div className="container">Welcome Parent</div>;
}

function InstructorDashboard() {
  return <div className="container">Welcome Instructor</div>;
}

function AccountantDashboard() {
  return <div className="container">Welcome Accountant</div>;
}

function DirectorDashboard() {
  return <div className="container">Welcome Director</div>;
}

function IndexPage() {
  const token = localStorage.getItem("jwt");
  let role = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role;
    } catch (err) {
      console.error("Token decode error", err);
    }
  }

  const renderDashboard = () => {
    switch (role) {
      case "Student": return <StudentDashboard />;
      case "Admin": return <AdminDashboard />;
      case "Parent": return <ParentDashboard />;
      case "Instructor": return <InstructorDashboard />;
      case "Accountant": return <AccountantDashboard />;
      case "Director": return <DirectorDashboard />;
      default: return (
        <>
          <HeroSection />
          <FeatureCards />
           
        </>
      );
    }
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <div className="page-loader-wrapper"><div className="loader"></div></div>
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />
      <div className="page">
        {renderDashboard()}
      </div>
    </div>
  );
}

export default IndexPage;
