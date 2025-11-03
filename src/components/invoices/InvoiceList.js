import React from "react";

function InvoiceList() {
  const invoices = [
    {
      id: "INV001",
      client: "John Doe",
      date: "2024-04-10",
      status: "Paid",
      total: "$500.00"
    },
    {
      id: "INV002",
      client: "Jane Smith",
      date: "2024-04-12",
      status: "Pending",
      total: "$750.00"
    },
    {
      id: "INV003",
      client: "Acme Corp",
      date: "2024-04-15",
      status: "Paid",
      total: "$1,200.00"
    }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Invoice List</h3>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover table-striped">
            <thead className="thead-light">
              <tr>
                <th>Invoice ID</th>
                <th>Client</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, i) => (
                <tr key={i}>
                  <td>{invoice.id}</td>
                  <td>{invoice.client}</td>
                  <td>{invoice.date}</td>
                  <td>
                    <span className={`badge ${invoice.status === "Paid" ? "badge-success" : "badge-warning"}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>{invoice.total}</td>
                  <td className="text-right">
                    <button className="btn btn-sm btn-outline-info mr-1">
                      <i className="fa fa-eye"></i> View
                    </button>
                    <button className="btn btn-sm btn-outline-warning mr-1">
                      <i className="fa fa-edit"></i> Edit
                    </button>
                    <button className="btn btn-sm btn-outline-danger">
                      <i className="fa fa-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default InvoiceList;
