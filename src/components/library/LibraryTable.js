import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import ConfirmationPopup from "../ConfirmationPopup";
import API_BASE_URL from "../../config";

function LibraryTable({ books = [] }) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const requestDelete = (bookId) => {
    setPendingDeleteId(bookId);
    setShowConfirmPopup(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/library/books/${pendingDeleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("✅ Book deleted successfully");
        window.location.reload(); // Refresh after delete
      } else {
        toast.error("❌ Failed to delete book");
      }
    } catch (err) {
      console.error("❌ Delete failed", err);
      toast.error("Error deleting book");
    } finally {
      setShowConfirmPopup(false);
      setPendingDeleteId(null);
    }
  };

  const handleView = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  const handleClose = () => {
    setSelectedBook(null);
    setShowModal(false);
  };

  return (
    <>
      <div className="row">
        {books.map((book, index) => (
          <div key={index} className="col-lg-4 col-md-6 mb-4">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mr-3"
                      style={{ width: "50px", height: "50px", fontSize: "20px" }}
                    >
                      <i className="fa fa-book"></i>
                    </div>
                    <div>
                      <h6 className="mb-0 font-weight-bold">{book.title}</h6>
                      <small className="text-muted">{book.author}</small>
                    </div>
                  </div>
                  <i
                    className="fa fa-trash text-danger cursor-pointer"
                    style={{ fontSize: "18px" }}
                    title="Delete Book"
                    onClick={() => requestDelete(book.bookId)}
                  ></i>
                </div>

                <ul className="list-unstyled small mb-3">
                  <li><strong>ISBN:</strong> {book.isbn || book.iSBN}</li>
                  <li><strong>Category:</strong> {book.category}</li>
                  <li><strong>Author:</strong> {book.author}</li>
                </ul>

                {book.fileUrl ? (
                  <a
                    href={book.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-secondary mb-2"
                  >
                    <i className="fa fa-file-pdf-o mr-1"></i> View
                  </a>
                ) : (
                  <div className="text-muted small mb-2">No PDF available</div>
                )}

                <div className="mt-auto d-flex justify-content-between align-items-center">
                  {/* <button className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => handleView(book)}>
                    <i className="fa fa-eye mr-1"></i> View
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Book Details Modal */}
      {selectedBook && (
        <Modal show={showModal} onHide={handleClose} centered>
          <Modal.Header>
            <Modal.Title>Book Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><strong>Title:</strong> {selectedBook.title}</p>
            <p><strong>Author:</strong> {selectedBook.author}</p>
            <p><strong>ISBN:</strong> {selectedBook.isbn || selectedBook.iSBN}</p>
            <p><strong>Category:</strong> {selectedBook.category}</p>
            <p><strong>Status:</strong> {selectedBook.availableCopies > 0 ? "Available" : "Issued"}</p>
            {selectedBook.fileUrl ? (
              <p>
                <strong>PDF:</strong>{" "}
                <a href={selectedBook.fileUrl} target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              </p>
            ) : (
              <p className="text-muted">No PDF available</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmationPopup
        show={showConfirmPopup}
        message="Are you sure you want to delete this book?"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setShowConfirmPopup(false)}
        toastMessage="Book deleted"
      />
    </>
  );
}

export default LibraryTable;
