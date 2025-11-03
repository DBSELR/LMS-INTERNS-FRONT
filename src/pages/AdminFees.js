import React, { useEffect, useState } from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import FeeEditModal from "../components/fees/FeeEditModal";
import FeeAddModal from "../components/fees/FeeAddModal";
import API_BASE_URL from "../config";

function AdminFees() {
  const [fees, setFees] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);

  const fetchFees = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Fee/All`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        console.error("Fetch failed with status:", res.status);
        return;
      }
      const data = await res.json();
      setFees(data);
    } catch (err) {
      console.error("Failed to fetch fees", err);
    }
  };
  

  useEffect(() => {
    fetchFees();
  }, []);

  const handleEdit = (fee) => {
    setSelectedFee(fee);
    setEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this fee record?")) return;
    try {
      const token = localStorage.getItem("jwt");
      await fetch(`${API_BASE_URL}/Fee/Delete/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      fetchFees();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <div className="page-loader-wrapper"><div className="loader" /></div>

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="page">
        <div className="section-body">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center">
              <div className="header-action">
                <h1 className="page-title">Manage Fees</h1>
                <ol className="breadcrumb page-breadcrumb">
                  <li className="breadcrumb-item"><a href="#">LMS</a></li>
                  <li className="breadcrumb-item active">Fees</li>
                </ol>
              </div>
              <button className="btn btn-primary" onClick={() => setAddModal(true)}>
                <i className="fa fa-plus mr-1" /> Add Fee
              </button>
            </div>
          </div>
        </div>

        <div className="section-body mt-4">
          <div className="container-fluid">
            <div className="table-responsive">
              <table className="table table-hover table-striped">
                <thead className="thead-light">
                  <tr>
                    <th>ID</th>
                    <th>Student ID</th>
                    <th>Amount Due</th>
                    <th>Amount Paid</th>
                    <th>Status</th>
                    <th>Payment Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee) => (
                    <tr key={fee.feeId}>
                      <td>{fee.feeId}</td>
                      <td>{fee.studentId}</td>
                      <td>${fee.amountDue}</td>
                      <td>${fee.amountPaid}</td>
                      <td>{fee.feeStatus}</td>
                      <td>{fee.paymentDate?.split("T")[0]}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-info mr-2" onClick={() => handleEdit(fee)}>
                          <i className="fa fa-edit" />
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(fee.feeId)}>
                          <i className="fa fa-trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {fees.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center">No records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

         
      </div>

      {editModal && (
        <FeeEditModal
          show={editModal}
          onHide={() => setEditModal(false)}
          onSave={fetchFees}
          fee={selectedFee}
        />
      )}

      {addModal && (
        <FeeAddModal
          show={addModal}
          onHide={() => setAddModal(false)}
          onSave={fetchFees}
        />
      )}
    </div>
  );
}

export default AdminFees;
