import React, { useState } from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import TransactionsTable from "../components/payments/TransactionsTable";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";

function Transactions() {
  // ===== Test PhonePe modal state =====
  const [showTestModal, setShowTestModal] = useState(false);
  const [testName, setTestName] = useState("");
  const [testMobile, setTestMobile] = useState("");
  const [testAmount, setTestAmount] = useState(2499);
  const [testSubmitting, setTestSubmitting] = useState(false);

  const openTestModal = () => setShowTestModal(true);
  const closeTestModal = () => {
    if (testSubmitting) return;
    setShowTestModal(false);
  };

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    if (testSubmitting) return;

    if (!testMobile) {
      toast.warn("Please enter Mobile Number for test payment.");
      return;
    }

    const amountValue = Number(testAmount) || 0;
    if (amountValue <= 0) {
      toast.warn("Please enter a valid amount.");
      return;
    }

    const name = (testName || "").trim() || "Test User";
    const username = `TEST_${Date.now()}`;

    try {
      setTestSubmitting(true);

      const res = await fetch(`${API_BASE_URL}/payments/phonepe/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          mobileNumber: testMobile,
          amount: amountValue,
          name,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Test PhonePe initiate failed", txt);
        toast.error("Test payment initiation failed. Check backend logs.");
        return;
      }

      const data = await res.json();
      console.log("Test PhonePe initiate result", data);

      const redirectUrl = data.redirectUrl;
      if (!redirectUrl) {
        console.error("Test PhonePe redirectUrl missing", data);
        toast.error("Test payment URL missing in response.");
        return;
      }

      // Close modal & redirect to PhonePe
      setShowTestModal(false);
      window.location.href = redirectUrl;
    } catch (err) {
      console.error("Test payment error", err);
      toast.error("Error while testing PhonePe payment.");
    } finally {
      setTestSubmitting(false);
    }
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="section-wrapper">
        <div className="page admin-dashboard pt-0">
          <div className="section-body mt-3 pt-0">
            <div className="container-fluid">
              <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="page-title text-primary pt-0 dashboard-hero-title mb-1">
                    <i className="fa fa-exchange-alt mr-2"></i> Transactions
                  </h2>
                  <p className="text-muted mb-0 dashboard-hero-sub">
                    View and manage college-wise student fee transactions
                  </p>
                </div>

                {/* Test PhonePe button */}
                {/* <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={openTestModal}
                >
                  <i className="fa fa-credit-card mr-1" />
                  Test PhonePe Payment
                </button> */}
              </div>

              <TransactionsTable />
            </div>
          </div>
        </div>
      </div>

      {/* Test PhonePe Modal */}
      {/* <Modal show={showTestModal} onHide={closeTestModal} centered>
        <Form onSubmit={handleTestSubmit}>
          <Modal.Header closeButton={!testSubmitting}>
            <Modal.Title>Test PhonePe Payment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="testName" className="mb-3">
              <Form.Label>Name (optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Test User"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                disabled={testSubmitting}
              />
            </Form.Group>

            <Form.Group controlId="testMobile" className="mb-3">
              <Form.Label>Mobile Number *</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter mobile number"
                value={testMobile}
                onChange={(e) => setTestMobile(e.target.value)}
                disabled={testSubmitting}
                required
              />
            </Form.Group>

            <Form.Group controlId="testAmount" className="mb-0">
              <Form.Label>Amount (₹)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                step="1"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                disabled={testSubmitting}
              />
              <small className="text-muted">
                Default is ₹2499. Change only if you want to test with a
                different amount.
              </small>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={closeTestModal}
              disabled={testSubmitting}
            >
              Close
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={testSubmitting}
            >
              {testSubmitting ? "Starting Payment..." : "Start Test Payment"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal> */}

      <Footer />
    </div>
  );
}

export default Transactions;
