import React, { useState, useEffect } from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import LibraryTable from "../components/library/LibraryTable";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";

const Library_API = `${API_BASE_URL}/library`; // Backend API URL

function Library() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    totalCopies: "",
    availableCopies: "",
    pdf: null,
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setRefreshing(true);
      // 🔑 Get token (from AsyncStorage, localStorage, or however you're saving it)
    const token = localStorage.getItem("jwt"); 
    console.log("Token:", token);
      //const res = await fetch("https://lmsapi.dbasesolutions.in/api/library/books");
      const res = await fetch(`${Library_API}/books`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`, // ✅ Attach JWT token here
      },
    });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch books:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleOpenAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => setShowAddModal(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${Library_API}/books/upload`, {
        method: "POST",
        body: formData,
        headers: {
        "Authorization": `Bearer ${token}`, // ✅ Attach JWT token here
      },
      });

      if (!res.ok) throw new Error("Upload failed");

      toast.success("Book added successfully!");

      setForm({
        title: "",
        author: "",
        isbn: "",
        category: "",
        totalCopies: "",
        availableCopies: "",
        pdf: null,
      });

      handleCloseAddModal();
      fetchBooks();
    } catch (err) {
      console.error("Failed to add book", err);
      toast.error("Error adding book. Please try again.");
    }
  };

  const filteredBooks = books.filter((book) => {
    const term = searchTerm.toLowerCase();
    return (
      book.title?.toLowerCase().includes(term) ||
      book.author?.toLowerCase().includes(term) ||
      book.category?.toLowerCase().includes(term) ||
      book.iSBN?.toLowerCase().includes(term) ||
      book.publisher?.toLowerCase().includes(term) ||
      String(book.bookId).includes(term)
    );
  });

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="section-wrapper">
        <div className="page admin-dashboard pt-0">
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
            <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
                          <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                           <i class="fa-solid fa-archive"></i> Library Section
                          </h2>
                          <p className="text-muted mb-0 dashboard-hero-sub">
                            View and Manage library books
                          </p>
                        </div>

            <div className="card shadow-sm mb-4">
              <div
                className="card-header bg-primary text-white d-flex"
                style={{
                  margin: "auto",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "15px",
                }}
              >
                <h6 className="mb-0">
                  <i className="fa fa-book mr-2"></i>Library Section
                </h6>
                
              </div>

              <div className="card-body welcome-card animate-welcome">
                {refreshing && (
                  <div className="text-center my-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                  </div>
                )}
  <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
  <input
    type="text"
    placeholder="Search by title, author, category, or ISBN..."
    className="form-control"
    style={{ maxWidth: "400px" }}
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
  
  <button
    className="btn btn-primary mt-2 mt-md-0"
    // style={{ padding: "4px 12px", fontSize: "14px", lineHeight: "1.2" }}
    onClick={handleOpenAddModal}
  >
    <i className="fa fa-plus mr-1"></i> Add Book
  </button>
</div>


                <div className="mt-3">
                  <LibraryTable books={filteredBooks} />
                </div>
              </div>
            </div>
          </div>
        </div>

         
      </div>

      </div>

      {/* Add Book Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} size="lg" centered>
        <Modal.Header>
          <Modal.Title>Add New Book</Modal.Title>
          <button
                    type="button"
                    className="close"
                    onClick={handleCloseAddModal}
                  >
                    <span>&times;</span>
                  </button>
        </Modal.Header>
        <Modal.Body>
          <form className="library-form" onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Title</label>
                <input type="text" name="title" required value={form.title} onChange={handleChange} className="form-control" />
              </div>
              <div className="col-md-6 mb-3">
                <label>Author</label>
                <input type="text" name="author" required value={form.author} onChange={handleChange} className="form-control" />
              </div>
              <div className="col-md-6 mb-3">
                <label>ISBN</label>
                <input type="text" name="isbn" required value={form.isbn} onChange={handleChange} className="form-control" />
              </div>
              <div className="col-md-6 mb-3">
                <label>Category</label>
                <input type="text" name="category" required value={form.category} onChange={handleChange} className="form-control" />
              </div>
              {/* <div className="col-md-6 mb-3">
                <label>Total Copies</label>
                <input type="number" name="totalCopies" required value={form.totalCopies} onChange={handleChange} className="form-control" />
              </div>
              <div className="col-md-6 mb-3">
                <label>Available Copies</label>
                <input type="number" name="availableCopies" required value={form.availableCopies} onChange={handleChange} className="form-control" />
              </div> */}
              <div className="col-md-12 mb-3">
                <label>Book PDF (optional)</label>
                <input type="file" name="pdf" accept="application/pdf" onChange={handleChange} className="form-control" />
              </div>
            </div>
            <div className="text-end">
              <button type="submit" className="btn btn-success">
                Submit
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Library;
