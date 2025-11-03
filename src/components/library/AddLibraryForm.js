// File: components/library/AddLibraryForm.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config";

function AddLibraryForm() {
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    totalCopies: "",
    availableCopies: "",
    pdf: null,
  });

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
      const res = await fetch(`${API_BASE_URL}/Library/books/upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
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
    } catch (err) {
      console.error("Failed to add book", err);
      toast.error("Error adding book. Please try again.");
    }
  };

  return (
    <form className="library-form" onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="form-grid">
        <div className="form-group">
          <label>Title</label>
          <input type="text" name="title" required value={form.title} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Author</label>
          <input type="text" name="author" required value={form.author} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>ISBN</label>
          <input type="text" name="isbn" required value={form.isbn} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Category</label>
          <input type="text" name="category" required value={form.category} onChange={handleChange} />
        </div>
        <div className="form-group full-width">
          <label>Book PDF (optional)</label>
          <input type="file" name="pdf" accept="application/pdf" onChange={handleChange} />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit">Add Book</button>
      </div>
    </form>
  );
}

export default AddLibraryForm;
