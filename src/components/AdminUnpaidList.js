import React, { useState } from "react";

export const AdminUnpaidList = () => {
  const allUnpaid = [
    {
      studentId: 101,
      name: "Alice Johnson",
      totalDue: 500,
      outstandingFees: [
        { semester: "Spring 2023", course: "Mathematics", amountDue: 300, feeStatus: "Unpaid" },
        { semester: "Spring 2023", course: "Science", amountDue: 200, feeStatus: "Unpaid" },
      ],
    },
    {
      studentId: 102,
      name: "Bob Smith",
      totalDue: 300,
      outstandingFees: [
        { semester: "Fall 2022", course: "English", amountDue: 300, feeStatus: "Unpaid" },
      ],
    },
    {
      studentId: 103,
      name: "Charlie Brown",
      totalDue: 400,
      outstandingFees: [
        { semester: "Winter 2023", course: "History", amountDue: 400, feeStatus: "Unpaid" },
      ],
    },
  ];

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredUnpaid = allUnpaid.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toString().includes(search)
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUnpaid = filteredUnpaid.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUnpaid.length / itemsPerPage);

  return (
    <div className="container-fluid">
      {/* Search */}
      <div className="d-flex justify-content-end mb-4">
        <input
          type="text"
          placeholder="🔍 Search by name or ID..."
          className="form-control w-50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid of Cards */}
      <div className="row">
        {currentUnpaid.length > 0 ? (
          currentUnpaid.map((student) => (
            <div key={student.studentId} className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 unpaid-card shadow-sm border-0">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0 text-primary">{student.name}</h6>
                    <span className="badge badge-danger">₹{student.totalDue}</span>
                  </div>

                  <p className="small mb-1">
                    <strong>ID:</strong> {student.studentId}
                  </p>

                  <details className="mt-2">
                    <summary className="text-dark cursor-pointer">
                      View Outstanding Dues
                    </summary>
                    <ul className="list-unstyled mt-2 ml-2">
                      {student.outstandingFees.map((f, idx) => (
                        <li key={idx} className="mb-2">
                          <small>
                            <strong>{f.semester}</strong> - {f.course}: 
                            <span className="text-danger ml-1">₹{f.amountDue}</span>
                          </small>
                          <span className="badge badge-danger ml-2">{f.feeStatus}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center text-muted py-5">
            <h5>No unpaid students found.</h5>
          </div>
        )}
      </div>

      {/* Pagination */}
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

export default AdminUnpaidList;
