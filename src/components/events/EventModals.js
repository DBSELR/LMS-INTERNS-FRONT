import React from "react";

function EventModals() {
  return (
    <>
      {/* Add New Event Modal */}
      <div className="modal fade" id="AddNewEvent" tabIndex="-1" role="dialog" aria-labelledby="AddNewEventLabel" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add New Draggable Event</h5>
              <button type="button" className="close" data-dismiss="modal"><span>&times;</span></button>
            </div>
            <div className="modal-body">
              <input type="text" className="form-control" placeholder="Event Name" />
              <select className="form-control mt-2">
                <option>Choose a color</option>
                <option value="bg-primary">Blue</option>
                <option value="bg-success">Green</option>
                <option value="bg-danger">Red</option>
                <option value="bg-warning">Yellow</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-dismiss="modal">Close</button>
              <button className="btn btn-primary">Add</button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Direct Event Modal */}
      <div className="modal fade" id="AddDirectEvent" tabIndex="-1" role="dialog" aria-labelledby="AddDirectEventLabel" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Direct Calendar Event</h5>
              <button type="button" className="close" data-dismiss="modal"><span>&times;</span></button>
            </div>
            <div className="modal-body">
              <input type="text" className="form-control mb-2" placeholder="Event Title" />
              <input type="datetime-local" className="form-control mb-2" />
              <textarea className="form-control" rows="3" placeholder="Event Description"></textarea>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-dismiss="modal">Cancel</button>
              <button className="btn btn-success">Add Event</button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Event Modal */}
      <div className="modal fade" id="EditEventModal" tabIndex="-1" role="dialog" aria-labelledby="EditEventModalLabel" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Event</h5>
              <button type="button" className="close" data-dismiss="modal"><span>&times;</span></button>
            </div>
            <div className="modal-body">
              <input type="text" className="form-control mb-2" placeholder="Event Title" />
              <textarea className="form-control" rows="3" placeholder="Event Description"></textarea>
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger">Delete</button>
              <button className="btn btn-secondary" data-dismiss="modal">Cancel</button>
              <button className="btn btn-primary">Update</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EventModals;
