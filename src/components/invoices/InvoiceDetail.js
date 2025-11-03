import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function InvoiceDetail() {
  const { id } = useParams(); // Get the invoice ID from URL params

  const invoices = [
    {
      id: "INV001",
      client: "John Doe",
      address: "1234 Elm Street, Springfield, IL",
      date: "2024-04-10",
      status: "Paid",
      items: [
        { description: "Web Design", quantity: 1, price: "$200.00" },
        { description: "SEO Optimization", quantity: 2, price: "$150.00" },
        { description: "Hosting", quantity: 1, price: "$50.00" }
      ],
      total: "$500.00",
      paymentMethod: "Credit Card",
      paidDate: "2024-04-12"
    },
    // More invoice entries...
  ];

  const [invoiceDetail, setInvoiceDetail] = useState(null);

  useEffect(() => {
    if (id) {
      const selectedInvoice = invoices.find((invoice) => invoice.id === id);
      if (selectedInvoice) {
        setInvoiceDetail(selectedInvoice);
      } else {
        setInvoiceDetail("not-found");
      }
    }
  }, [id]);

  if (invoiceDetail === null) {
    return <div>Loading...</div>;
  }

  if (invoiceDetail === "not-found") {
    return <div className="alert alert-danger">Invoice not found.</div>;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Invoice Details</h3>
      </div>
      <div className="card-body">
        <div className="mb-4">
          <h5>Invoice ID: {invoiceDetail.id}</h5>
          <p><strong>Client:</strong> {invoiceDetail.client}</p>
          <p><strong>Address:</strong> {invoiceDetail.address}</p>
          <p><strong>Date:</strong> {invoiceDetail.date}</p>
          <p><strong>Status:</strong> 
            <span className={`badge ${invoiceDetail.status === "Paid" ? "badge-success" : "badge-warning"}`}>
              {invoiceDetail.status}
            </span>
          </p>
        </div>

        <h5 className="mb-3">Items:</h5>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {invoiceDetail.items.map((item, index) => (
              <tr key={index}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3">
          <p><strong>Total:</strong> {invoiceDetail.total}</p>
          <p><strong>Payment Method:</strong> {invoiceDetail.paymentMethod}</p>
          <p><strong>Paid Date:</strong> {invoiceDetail.paidDate}</p>
        </div>

        <div className="mt-4 text-right">
          <button className="btn btn-primary">Download PDF</button>
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetail;
