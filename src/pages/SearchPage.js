import React, { useState } from "react";
import SearchResult from "../components/search/SearchResult";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const searchData = [
    { title: "Bootstrap 4 Admin", description: "Admin panel theme using Bootstrap 4." },
    { title: "React Dashboard", description: "A simple React Dashboard example." },
    { title: "Vue.js Admin", description: "Admin template with Vue.js." },
    { title: "Angular Dashboard", description: "Angular Admin Dashboard." },
    { title: "CSS Layout", description: "CSS grid layout tutorial." }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    const filtered = searchData.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <div className="page-loader-wrapper"><div className="loader"></div></div>

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="page">
        {/* Page Title */}
        <div className="section-body">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h2 className="page-title text-primary">Search Portal</h2>
                <p className="text-muted mb-0">Quickly find courses, tutorials, materials, and more.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="section-body mt-3">
          <div className="container-fluid">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0">Search Anything</h6>
              </div>
              <div className="card-body">
                <form onSubmit={handleSearch}>
                  <div className="row align-items-center">
                    <div className="col-md-10 mb-2 mb-md-0">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Type a keyword, e.g., React, Dashboard, Tutorial..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                    <div className="col-md-2 text-md-right">
                      <button type="submit" className="btn btn-primary btn-block">
                        <i className="fa fa-search mr-1"></i> Search
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="section-body mt-4">
          <div className="container-fluid">
            {query ? (
              <div className="card shadow-sm">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Showing results for <strong>"{query}"</strong></h6>
                  <span className="badge badge-primary">{results.length} Results</span>
                </div>
                <div className="card-body">
                  {results.length > 0 ? (
                    <SearchResult results={results} />
                  ) : (
                    <div className="text-center text-muted py-4">
                      <h5>No results found.</h5>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted py-5">
                <h5>Start typing to see search results...</h5>
              </div>
            )}
          </div>
        </div>

         
      </div>
    </div>
  );
}

export default SearchPage;
