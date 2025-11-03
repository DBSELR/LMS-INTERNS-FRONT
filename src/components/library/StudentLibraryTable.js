import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import ConfirmationPopup from "../ConfirmationPopup";
import API_BASE_URL from "../../config";

const API_BASE = `${API_BASE_URL}/library`;

function StudentLibraryTable() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    console.log("📥 Fetching books...");
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE}/books`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log("✅ Books fetched:", data);
      setBooks(data);
    } catch (err) {
      console.error("❌ Failed to fetch books", err);
      toast.error("Failed to fetch books");
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

  // 🔎 Filter logic
  const filteredBooks = books.filter((book) => {
    const query = searchQuery.toLowerCase();
    return (
      (book.author && book.author.toLowerCase().includes(query)) ||
      (book.bookId && String(book.bookId).includes(query)) ||
      (book.category && book.category.toLowerCase().includes(query)) ||
      (book.iSBN && book.iSBN.toLowerCase().includes(query)) ||
      (book.title && book.title.toLowerCase().includes(query))
    );
  });

  return (
    <>

    <div className="card-header bg-primary text-white d-flex align-items-left"
    style={{margin:'auto',alignItems:'center',justifyContent:'space-between',marginBottom:'15px'}}>
                
                <h6 className="mb-0"><i className="fa fa-book mr-2"></i>Library Section</h6>

                 <input
                          type="text"
                          placeholder="Search by title, author, category, or ISBN..."
                          className="form-control w-50"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
              </div>
     
      {/* <div className="d-flex justify-content-end mb-3">
                       
                      </div> */}

      <div className="row">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book, index) => (
            <div key={index} className="col-lg-4 col-md-6 mb-4">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center mr-3"
                        style={{ width: "50px", height: "50px", fontSize: "20px" }}
                      >
                        <i className="fa fa-book"></i>
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{book.title}</h6>
                        <small className="text-muted">{book.author}</small>
                      </div>
                    </div>
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
                      <i className="fa fa-file-pdf-o mr-1"></i> View PDF
                    </a>
                  ) : (
                    <div className="text-muted small mb-2">No PDF available</div>
                  )}

                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    {/* You can add action buttons here */}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center text-muted">No books found</div>
        )}
      </div>
    </>
  );
}

export default StudentLibraryTable;
