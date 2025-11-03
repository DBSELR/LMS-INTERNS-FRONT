// File: src/components/ConfirmationPopup.jsx
import React, { useEffect, useRef } from "react";
import { toast } from "react-toastify";

const ConfirmationPopup = ({
  show,
  message,
  onConfirm,
  onCancel,
  toastMessage, // ← no default value
  singleButton = false // new prop: if true, show only OK
}) => {
  const popupRef = useRef(null);

  useEffect(() => {
    if (show && popupRef.current) {
      popupRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [show]);

  if (!show) return null;

  const handleConfirm = () => {
    if (toastMessage) toast.success(toastMessage); // only if explicitly passed
    onConfirm();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box" ref={popupRef}>
        <h5>Confirm Action</h5>
        <p>{message}</p>
        <div className="popup-actions mt-3">
          {singleButton ? (
            <button className="btn btn-primary" onClick={onConfirm}>
              OK
            </button>
          ) : (
            <>
              <button className="btn btn-danger" onClick={handleConfirm}>
                Yes
              </button>
              <button className="btn btn-secondary ms-2" onClick={onCancel}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


export default ConfirmationPopup;
