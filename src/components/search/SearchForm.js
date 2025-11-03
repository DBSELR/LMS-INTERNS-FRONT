import React from "react";

function SearchForm() {
  return (
    <div className="card">
      <div className="card-body">
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="What you want to find"
            aria-label="Search"
          />
          <div className="input-group-append">
            <button className="btn btn-outline-secondary" type="button">
              Search
            </button>
          </div>
        </div>
        <p className="mb-0">Search Result For "Bootstrap 4 admin"</p>
        <strong className="font-12">
          About 16,853 result ( 0.13 seconds)
        </strong>
      </div>
    </div>
  );
}

export default SearchForm;
