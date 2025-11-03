import React from "react";

function ContactAddNewTab() {
  return (
    <div className="row clearfix">
      <div className="col-lg-8 col-md-12 col-sm-12">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Add New Contact</h3>
          </div>
          <div className="card-body">
            <form>
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" className="form-control" placeholder="First name" />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" className="form-control" placeholder="Last name" />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="text" className="form-control" placeholder="Phone Number" />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" className="form-control" placeholder="Email" />
                  </div>
                </div>
                <div className="col-sm-12">
                  <div className="form-group">
                    <label>Address</label>
                    <input type="text" className="form-control" placeholder="Address" />
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Add Contact</button>
              <button type="reset" className="btn btn-outline-secondary ml-2">Cancel</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactAddNewTab;
