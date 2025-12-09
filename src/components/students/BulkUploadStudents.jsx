import React, { useState } from "react";
import API_BASE_URL from "../../config";

const BulkUploadStudents = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("jwt");

  const handleDownloadTemplate = () => {
    // simple redirect to GET template
    window.location.href = `${API_BASE_URL}/student/register/sample-excel`;
  };

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
    setResult(null);
    setError("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an Excel file (.xlsx).");
      return;
    }

    setUploading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${API_BASE_URL}/student/register/bulk`,
        {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(
          data?.error ||
            data?.message ||
            `Bulk upload failed with status ${res.status}`
        );
      } else {
        setResult(data);
      }
    } catch (err) {
      console.error("Bulk upload error:", err);
      setError(err.message || "Bulk upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Bulk Upload Students</h3>
      <p className="text-muted">
        1) Download the sample Excel, 2) Fill student data, 3) Upload the file.
      </p>

      <div className="mb-3 d-flex gap-2">
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={handleDownloadTemplate}
        >
          Download Sample Excel
        </button>
      </div>

      <form onSubmit={handleUpload}>
        <div className="mb-3">
          <label className="form-label">Select Excel File (.xlsx)</label>
          <input
            type="file"
            accept=".xlsx,.xls"
            className="form-control"
            onChange={handleFileChange}
          />
        </div>

        {error && (
          <div className="alert alert-danger py-2">
            <strong>Error:</strong> {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-success"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload & Register Students"}
        </button>
      </form>

      {result && (
        <div className="mt-4">
          <h5>Upload Summary</h5>
          <ul>
            <li>Total: {result.total}</li>
            <li>Success: {result.success}</li>
            <li>Failed: {result.failed}</li>
          </ul>

          {result.rows && result.rows.length > 0 && (
            <div className="table-responsive mt-3">
              <table className="table table-sm table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Row</th>
                    <th>Username</th>
                    <th>Status</th>
                    <th>Error / Conflicts</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.rowNumber}</td>
                      <td>{r.username}</td>
                      <td>
                        {r.success ? (
                          <span className="text-success fw-bold">OK</span>
                        ) : (
                          <span className="text-danger fw-bold">FAILED</span>
                        )}
                      </td>
                      <td style={{ whiteSpace: "pre-wrap" }}>
                        {r.success
                          ? "-"
                          : r.error ||
                            (r.conflicts || [])
                              .map(
                                (c) =>
                                  `${c.conflictType ?? ""}: ${
                                    c.details ?? ""
                                  }`
                              )
                              .join("\n")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkUploadStudents;
