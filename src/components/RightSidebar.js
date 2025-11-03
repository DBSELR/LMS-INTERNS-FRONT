import React from "react";

function RightSidebar() {
  return (
    // <div id="rightsidebar" className="right_sidebar">
    //   <a href="#" className="p-3 settingbar float-right">
    //     <i className="fa fa-close"></i>
    //   </a>
    //   <ul className="nav nav-tabs" role="tablist">
    //     <li className="nav-item">
    //       <a className="nav-link active" data-toggle="tab" href="#Settings">Settings</a>
    //     </li>
    //     <li className="nav-item">
    //       <a className="nav-link" data-toggle="tab" href="#activity">Activity</a>
    //     </li>
    //   </ul>

    //   <div className="tab-content">
    //     <div className="tab-pane fade show active" id="Settings">
    //       <div className="mb-4">
    //         <h6 className="font-14 font-weight-bold text-muted">Theme Color</h6>
    //         <ul className="choose-skin list-unstyled mb-0">
    //           <li data-theme="azure"><div className="azure"></div></li>
    //           <li data-theme="indigo"><div className="indigo"></div></li>
    //           <li data-theme="purple"><div className="purple"></div></li>
    //           <li data-theme="orange"><div className="orange"></div></li>
    //           <li data-theme="green"><div className="green"></div></li>
    //           <li data-theme="cyan"><div className="cyan"></div></li>
    //           <li className="active" data-theme="blush"><div className="blush"></div></li>
    //         </ul>
    //       </div>

    //       <div className="mb-4">
    //         <h6 className="font-14 font-weight-bold text-muted">Font Style</h6>
    //         <div className="custom-controls-stacked font_setting">
    //           {["font-muli", "font-montserrat", "font-poppins", "font-ptsans"].map((font, i) => (
    //             <label key={font} className="custom-control custom-radio custom-control-inline">
    //               <input
    //                 type="radio"
    //                 className="custom-control-input"
    //                 name="font"
    //                 defaultChecked={i === 0}
    //                 value={font}
    //               />
    //               <span className="custom-control-label">
    //                 {font.replace("font-", "").replace(/^\w/, c => c.toUpperCase())} Google Font
    //               </span>
    //             </label>
    //           ))}
    //         </div>
    //       </div>

    //       <div>
    //         <h6 className="font-14 font-weight-bold mt-4 text-muted">General Settings</h6>
    //         <ul className="setting-list list-unstyled mt-1 setting_switch">
    //           {[
    //             "Night Mode",
    //             "Fix Navbar top",
    //             "Header Dark",
    //             "Min Sidebar Dark",
    //             "Sidebar Dark",
    //             "Icon Color",
    //             "Gradient Color",
    //             "Box Shadow",
    //             "RTL Support",
    //             "Box Layout"
    //           ].map((label, i) => (
    //             <li key={i}>
    //               <label className="custom-switch">
    //                 <span className="custom-switch-description">{label}</span>
    //                 <input type="checkbox" className="custom-switch-input" />
    //                 <span className="custom-switch-indicator"></span>
    //               </label>
    //             </li>
    //           ))}
    //         </ul>
    //       </div>

    //       <hr />
    //       <div className="form-group">
    //         <label className="d-block">Storage <span className="float-right">77%</span></label>
    //         <div className="progress progress-sm">
    //           <div className="progress-bar" role="progressbar" style={{ width: "77%" }}></div>
    //         </div>
    //         <button type="button" className="btn btn-primary btn-block mt-3">Upgrade Storage</button>
    //       </div>
    //     </div>

    //     <div className="tab-pane fade" id="activity">
    //       <ul className="new_timeline mt-3">
    //         {[
    //           { time: "11:00am", title: "Attendance", subtitle: "Computer Class", color: "pink" },
    //           { time: "11:30am", title: "Added an interest", subtitle: "“Volunteer Activities”", color: "pink" },
    //           {
    //             time: "12:00pm",
    //             title: "Developer Team",
    //             subtitle: "Hangouts",
    //             color: "green",
    //             avatars: [1, 2, 3, 4]
    //           },
    //           { time: "2:00pm", title: "Responded to need", subtitle: "“In-Kind Opportunity”", color: "green" },
    //           { time: "1:30pm", title: "Lunch Break", color: "orange" },
    //           { time: "2:38pm", title: "Finish", subtitle: "Go to Home", color: "green" }
    //         ].map((item, i) => (
    //           <li key={i}>
    //             <div className={`bullet ${item.color}`}></div>
    //             <div className="time">{item.time}</div>
    //             <div className="desc">
    //               <h3>{item.title}</h3>
    //               {item.subtitle && <h4>{item.subtitle}</h4>}
    //               {item.avatars && (
    //                 <ul className="list-unstyled team-info margin-0 p-t-5">
    //                   {item.avatars.map((n) => (
    //                     <li key={n}><img src={`../assets/images/xs/avatar${n}.jpg`} alt="Avatar" /></li>
    //                   ))}
    //                 </ul>
    //               )}
    //             </div>
    //           </li>
    //         ))}
    //       </ul>
    //     </div>
    //   </div>
    // </div>

    <>
    </>
  );
}

export default RightSidebar;
