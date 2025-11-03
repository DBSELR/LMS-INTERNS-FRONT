import React from "react";

function ThemeSettings() {
  return (
    <div className="mb-4">
      <h6 className="font-14 font-weight-bold text-muted">Theme Color</h6>
      <ul className="choose-skin list-unstyled mb-0">
        <li data-theme="azure">
          <div className="azure"></div>
        </li>
        <li data-theme="indigo">
          <div className="indigo"></div>
        </li>
        <li data-theme="purple">
          <div className="purple"></div>
        </li>
        <li data-theme="orange">
          <div className="orange"></div>
        </li>
        <li data-theme="green">
          <div className="green"></div>
        </li>
        <li data-theme="cyan">
          <div className="cyan"></div>
        </li>
        <li data-theme="blush" className="active">
          <div className="blush"></div>
        </li>
      </ul>

      <h6 className="font-14 font-weight-bold text-muted">Font Style</h6>
      <div className="custom-controls-stacked font_setting">
        <label className="custom-control custom-radio custom-control-inline">
          <input type="radio" className="custom-control-input" name="font" value="font-muli" checked />
          <span className="custom-control-label">Muli Google Font</span>
        </label>
        <label className="custom-control custom-radio custom-control-inline">
          <input type="radio" className="custom-control-input" name="font" value="font-montserrat" />
          <span className="custom-control-label">Montserrat Google Font</span>
        </label>
        <label className="custom-control custom-radio custom-control-inline">
          <input type="radio" className="custom-control-input" name="font" value="font-poppins" />
          <span className="custom-control-label">Poppins Google Font</span>
        </label>
        <label className="custom-control custom-radio custom-control-inline">
          <input type="radio" className="custom-control-input" name="font" value="font-ptsans" />
          <span className="custom-control-label">PT Sans Google Font</span>
        </label>
      </div>
    </div>
  );
}

export default ThemeSettings;
