

// File: src/pages/FeeSummary.jsx
import React, { useEffect, useMemo, useState } from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

function FeeSummary() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");


  useEffect(() => {
    const fetchFeeSummary = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const res = await fetch(`${API_BASE_URL}/AdminSummary/GetFeesummary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Failed to load fee summary", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeSummary();
  }, []);

  const total = (key) =>
    data.reduce((sum, x) => sum + Number(x[key] || 0), 0);

  const filteredData = useMemo(() => {
  if (!search) return data;

  const q = search.toLowerCase();

  return data.filter(x =>
    (x.colname && x.colname.toLowerCase().includes(q)) ||
    (x.programmeName && x.programmeName.toLowerCase().includes(q))
  );
}, [data, search]);


  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader" />
        </div>
      )}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Admin" />

      <div className="section-wrapper">
        <div className="page pt-0">
          <div className="section-body mt-3">
            <div className="container-fluid">

              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h4 className="mb-0 text-primary">
                    Batch-wise / College-wise Fee Summary
                  </h4>
                </div>

                <div className="card-body table-responsive">
                  <div className="row mb-3">
  <div className="col-md-4">
    <input
      type="text"
      className="form-control"
      placeholder="Search by College or Course"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>
</div>

                  <table className="table table-bordered table-hover table-sm">
                    <thead className="thead-dark">
                      <tr>
                        <th>Batch</th>
                        <th>Course</th>
                        <th>Fee Head</th>
                        <th>College Name</th>
                        <th className="text-center">Students</th>
                        <th className="text-end">Amount</th>
                        <th className="text-end">Total Amount</th>
                        <th className="text-end">Paid</th>
                        <th className="text-end">Due</th>
                      </tr>
                    </thead>
                    <tbody>
                     {filteredData.map((x, i) => (

                        <tr key={i}>
                          <td>{x.bATCHNAME}</td>
                          <td>{x.programmeName}</td>
                          <td>{x.feeHead}</td>
                          <td>{x.colname}</td>
                          <td className="text-center">{x.studentCount}</td>
                          <td className="text-end">₹{x.amountDue}</td>
                          <td className="text-end fw-bold">₹{x.totalAmount}</td>
                          <td className="text-end text-success">₹{x.paidAmount}</td>
                          <td className="text-end text-danger">₹{x.dueAmount}</td>
                        </tr>
                      ))}
                    </tbody>

                    {/* Grand Totals */}
                    {/* <tfoot className="bg-light fw-bold">
                      <tr>
                        <td colSpan="7" className="text-end">Grand Total</td>
                        <td className="text-end">₹{total("TotalAmount")}</td>
                        <td className="text-end text-success">₹{total("PaidAmount")}</td>
                        <td className="text-end text-danger">₹{total("DueAmount")}</td>
                      </tr>
                    </tfoot> */}
                  </table>
                </div>
              </div>

            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default FeeSummary;
