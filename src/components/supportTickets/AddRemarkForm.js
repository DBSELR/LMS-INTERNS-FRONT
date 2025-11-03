// import React, { useState } from "react";

// const AddRemarkForm = () => {
//   const [remark, setRemark] = useState("");
//   const [file, setFile] = useState(null);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     alert(`Remark submitted: ${remark}\nAttachment: ${file ? file.name : "None"}`);
//     setRemark("");
//     setFile(null);
//   };

//   return (
//     <div className="card mb-4">
//       <div className="card-header bg-info text-white">
//         <h5 className="mb-0">Add Remark</h5>
//       </div>
//       <div className="card-body">
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <textarea
//               className="form-control"
//               placeholder="Write your remark..."
//               rows={3}
//               value={remark}
//               onChange={(e) => setRemark(e.target.value)}
//               required
//             ></textarea>
//           </div>
//           <div className="form-group">
//             <input
//               type="file"
//               className="form-control-file"
//               onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
//             />
//           </div>
//           <button type="submit" className="btn btn-info">Submit Remark</button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddRemarkForm;
