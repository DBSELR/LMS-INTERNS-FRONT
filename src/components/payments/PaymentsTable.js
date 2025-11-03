// // File: components/payments/PaymentsTable.jsx
// import React, { useState, useEffect } from "react";

// function PaymentsTable({ data, onRefresh }) {
//   const [search, setSearch] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 6;
//   const [editingFeeId, setEditingFeeId] = useState(null);
//   const [editFields, setEditFields] = useState({});

//  const filteredPayments = data.filter(
//   (p) =>
//     (p.studentName || "").toLowerCase().includes(search.toLowerCase()) ||
//     (p.programme || "").toLowerCase().includes(search.toLowerCase()) ||
//     (p.feeStatus || "").toLowerCase().includes(search.toLowerCase()) ||
//     (p.paymentMethod || "").toLowerCase().includes(search.toLowerCase()) ||
//     p.feeId.toString().includes(search)
// );


//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

//   const handleEdit = (fee) => {
//     setEditingFeeId(fee.feeId);
//     setEditFields({
//       amountPaid: fee.amountPaid,
//       feeStatus: fee.feeStatus,
//       paymentMethod: fee.paymentMethod || "",
//       transactionId: fee.transactionId || ""
//     });
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setEditFields((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSave = async (feeId) => {
//     try {
//       const response = await fetch(`https://lmsapi.dbasesolutions.in/api/Fee/Update/${feeId}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(editFields)
//       });

//       if (!response.ok) throw new Error("Failed to update fee");
//       alert("✅ Fee updated successfully");
//       setEditingFeeId(null);
//       if (onRefresh) onRefresh();
//     } catch (err) {
//       console.error(err);
//       alert("❌ Failed to update fee");
//     }
//   };

//   return (
//     <div className="container-fluid">
//       <div className="d-flex justify-content-end mb-4">
//         <input
//           type="text"
//           placeholder="🔍 Search payments..."
//           className="form-control w-50"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//       </div>

//       <div className="row">
//         {currentPayments.length > 0 ? (
//           currentPayments.map((payment, index) => (
//             <div key={index} className="col-lg-4 col-md-6 mb-4">
//               <div className="card h-100 payment-card shadow-sm border-0">
//                 <div className="card-body d-flex flex-column">
//                   <div className="d-flex justify-content-between align-items-center mb-2">
//                     <h6 className="mb-0 text-primary">{payment.studentName}</h6>
//                     <span className={`badge ${payment.feeStatus === "Paid" ? "badge-success" : "badge-warning"}`}>
//                       {payment.feeStatus}
//                     </span>
//                   </div>

//                   {editingFeeId === payment.feeId ? (
//                     <>
//                       <label className="small">Amount Paid:</label>
//                       <input type="number" name="amountPaid" className="form-control mb-2" value={editFields.amountPaid} onChange={handleChange} />

//                       <label className="small">Fee Status:</label>
//                       <select name="feeStatus" className="form-control mb-2" value={editFields.feeStatus} onChange={handleChange}>
//                         <option>Paid</option>
//                         <option>Pending</option>
//                         <option>PartiallyPaid</option>
//                       </select>

//                       <label className="small">Payment Method:</label>
//                       <input name="paymentMethod" className="form-control mb-2" value={editFields.paymentMethod} onChange={handleChange} />

//                       <label className="small">Transaction ID:</label>
//                       <input name="transactionId" className="form-control mb-2" value={editFields.transactionId} onChange={handleChange} />

//                       <button className="btn btn-success btn-sm mr-2" onClick={() => handleSave(payment.feeId)}>
//                         Save
//                       </button>
//                       <button className="btn btn-secondary btn-sm" onClick={() => setEditingFeeId(null)}>
//                         Cancel
//                       </button>
//                     </>
//                   ) : (
//                     <>
//                       <p className="small mb-1"><strong>Programme:</strong> {payment.programme || "-"}</p>
//                       <p className="small mb-1"><strong>Semester:</strong> {payment.semester || "-"}</p>
//                       <p className="small mb-1"><strong>Payment Date:</strong> {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "-"}</p>
//                       <p className="small mb-1"><strong>Due:</strong> ₹{payment.amountDue.toLocaleString()}</p>
//                       <p className="small mb-1"><strong>Paid:</strong> ₹{payment.amountPaid.toLocaleString()}</p>
//                       <div className="mt-auto d-flex justify-content-between align-items-center pt-3 border-top">
//                         <span className="font-weight-bold">₹{(payment.amountPaid > 0 ? payment.amountPaid : payment.amountDue).toLocaleString()}</span>
//                         <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(payment)}>Edit</button>
//                       </div>
//                     </>
//                   )}

//                   <small className="text-muted">Fee ID #{payment.feeId}</small>
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="col-12 text-center text-muted py-5">
//             <h5>No matching payments found.</h5>
//           </div>
//         )}
//       </div>

//       {totalPages > 1 && (
//         <div className="d-flex justify-content-center mt-4">
//           <ul className="pagination">
//             {Array.from({ length: totalPages }, (_, i) => (
//               <li
//                 key={i}
//                 className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
//                 onClick={() => setCurrentPage(i + 1)}
//                 style={{ cursor: "pointer" }}
//               >
//                 <span className="page-link">{i + 1}</span>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }

// export default PaymentsTable;


import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "../../config";

function PaymentsTable({ onRefresh }) {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchFees = async (studentId, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/Fee/GetAllStudents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch fee details");
      const data = await res.json();
      setFees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error("Invalid token");
      return;
    }

    const studentId = decoded["UserId"] || decoded.userId || decoded.nameid;
    if (!studentId) return;

    fetchFees(studentId, token);
  }, [onRefresh]);

  // Filter and paginate fees
  const filteredFees = fees.filter(
    (fee) =>
      (fee.transactionId || "").toLowerCase().includes(search.toLowerCase()) ||
      (fee.installment || "").toString().includes(search) ||
      (fee.paymentDate || "").toLowerCase().includes(search)
  );

  const totalPages = Math.ceil(filteredFees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFees = filteredFees.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-end m-4">
        <input
          type="text"
          placeholder="🔍 Search payments..."
          className="form-control w-50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card mt-3">
        <div className="card-header">
          <h6 className="card-title">Payment History</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-hover table-striped table-sm">
              <thead className="dark-header">
                <tr style={{ fontSize: "13.5px" }}>
                  <th>S.No</th>
                  <th>Student Name</th>
                   <th>Fee Head</th>
                  <th>Installment</th>
                  {/* <th>Course Fee</th> */}
                  <th>Paid Amount</th>
                  {/* <th>Due Amount</th> */}
                  <th>Transaction ID</th>
                  <th>Transaction Date</th>
                </tr>
              </thead>
              <tbody className="text-center align-middle">
                {currentFees.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-muted py-3">
                      No fee records found.
                    </td>
                  </tr>
                ) : (
                  currentFees.map((fee, index) => (
                    <tr key={fee.feeId}>
                      <td>{indexOfFirstItem + index + 1}</td>
                       <td>{fee.studentName}</td>
                        <td>{fee.feeHead}</td>
                      <td>Installment {fee.installment}</td>
                      {/* <td>₹{fee.amountDue.toLocaleString()}</td> */}
                      <td>₹{fee.amountPaid.toLocaleString()}</td>
                      {/* <td>₹{(fee.amountDue - fee.amountPaid).toLocaleString()}</td> */}
                      <td className="text-break">{fee.transactionId || "-"}</td>
                      <td>
                        {fee.paymentDate
                          ? new Date(fee.paymentDate).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <ul className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <li
                key={i}
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
                style={{ cursor: "pointer" }}
              >
                <span className="page-link">{i + 1}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PaymentsTable;
