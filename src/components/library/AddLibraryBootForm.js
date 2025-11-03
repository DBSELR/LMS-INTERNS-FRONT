// import React, { useState } from "react";

// function AddLibraryBootForm() {
//   const [form, setForm] = useState({
//     title: "",
//     subject: "",
//     purchaseDate: "",
//     author: "",
//     publisher: "",
//     price: "",
//     department: "",
//     type: "",
//     details: ""
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Bootstrap Library Form Submitted:", form);
//     alert("Library entry added successfully!");
//     setForm({
//       title: "", subject: "", purchaseDate: "", author: "",
//       publisher: "", price: "", department: "", type: "", details: ""
//     });
//   };

//   return (
//     <div className="row clearfix">
//       <div className="col-lg-12">
//         <div className="card">
//           <div className="card-header">
//             <h3 className="card-title">Add Book / Asset (Bootstrap Styled)</h3>
//           </div>
//           <div className="card-body">
//             <form onSubmit={handleSubmit} className="row g-3">
//               <div className="col-md-6">
//                 <label className="form-label">Title</label>
//                 <input type="text" name="title" className="form-control" value={form.title} onChange={handleChange} required />
//               </div>
//               <div className="col-md-6">
//                 <label className="form-label">Subject</label>
//                 <input type="text" name="subject" className="form-control" value={form.subject} onChange={handleChange} required />
//               </div>
//               <div className="col-md-6">
//                 <label className="form-label">Purchase Date</label>
//                 <input type="date" name="purchaseDate" className="form-control" value={form.purchaseDate} onChange={handleChange} />
//               </div>
//               <div className="col-md-6">
//                 <label className="form-label">Author</label>
//                 <input type="text" name="author" className="form-control" value={form.author} onChange={handleChange} />
//               </div>
//               <div className="col-md-6">
//                 <label className="form-label">Publisher</label>
//                 <input type="text" name="publisher" className="form-control" value={form.publisher} onChange={handleChange} />
//               </div>
//               <div className="col-md-6">
//                 <label className="form-label">Price</label>
//                 <input type="text" name="price" className="form-control" value={form.price} onChange={handleChange} />
//               </div>
//               <div className="col-md-6">
//                 <label className="form-label">Department</label>
//                 <input type="text" name="department" className="form-control" value={form.department} onChange={handleChange} required />
//               </div>
//               <div className="col-md-6">
//                 <label className="form-label">Asset Type</label>
//                 <select name="type" className="form-control" value={form.type} onChange={handleChange} required>
//                   <option value="">Select</option>
//                   <option value="Hard Copy">Hard Copy</option>
//                   <option value="eBook">eBook</option>
//                   <option value="Audio">Audio</option>
//                 </select>
//               </div>
//               <div className="col-12">
//                 <label className="form-label">Asset Details</label>
//                 <textarea name="details" rows="3" className="form-control" value={form.details} onChange={handleChange}></textarea>
//               </div>
//               <div className="col-12">
//                 <button type="submit" className="btn btn-success">Submit</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AddLibraryBootForm;
