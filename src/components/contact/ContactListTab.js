import React from "react";

function ContactListTab() {
  const contacts = [
    {
      name: "John Smith",
      phone: "+264-625-2583",
      email: "johnsmith@info.com",
      address: "455 S. Airport St. Moncks Corner, SC 29461",
      avatar: "avatar4.jpg",
      star: false,
      favorite: false,
    },
    {
      name: "Merri Diamond",
      phone: "+264-625-2583",
      email: "hermanbeck@info.com",
      address: "455 S. Airport St. Moncks Corner, SC 29461",
      avatar: "avatar2.jpg",
      star: true,
      favorite: false,
    },
    {
      name: "Sara Hopkins",
      phone: "+264-625-3333",
      email: "maryadams@info.com",
      address: "19 Ohio St. Snellville, GA 30039",
      avatar: "avatar3.jpg",
      star: false,
      favorite: true,
    },
    {
      name: "Andrew Patrick",
      phone: "+264-625-2586",
      email: "mikethimas@info.com",
      address: "728 Blackburn St. Andover, MA 01810",
      avatar: "avatar7.jpg",
      star: true,
      favorite: false,
    },
    {
      name: "Claire Peters",
      phone: "+264-625-3333",
      email: "clairepeters@info.com",
      address: "19 Ohio St. Snellville, GA 30039",
      avatar: "avatar5.jpg",
      star: false,
      favorite: false,
    },
  ];

  return (
    <div className="table-responsive">
      <table className="table table-hover table-vcenter text-nowrap table_custom list">
        <tbody>
          {contacts.map((c, index) => (
            <tr key={index}>
              <td className="width35 hidden-xs">
              <a href="#" onClick={(e) => e.preventDefault()} className={`mail-star ${c.favorite ? "love" : c.star ? "active" : ""}`}>
                  <i className={`fa ${c.favorite ? "fa-heart" : "fa-star"}`}></i>
                </a>
              </td>
              <td className="text-center width40">
                <div className="avatar d-block">
                  <img className="avatar" src={`../assets/images/xs/${c.avatar}`} alt="avatar" />
                </div>
              </td>
              <td>
                <div><a href="#" onClick={(e) => e.preventDefault()}>{c.name}</a></div>
                <div className="text-muted">{c.phone}</div>
              </td>
              <td className="hidden-xs">
                <div className="text-muted">{c.email}</div>
              </td>
              <td className="hidden-sm">
                <div className="text-muted">{c.address}</div>
              </td>
              <td className="text-right">
                <a className="btn btn-icon btn-sm" href="#" onClick={(e) => e.preventDefault()} title="Phone"><i className="fa fa-phone"></i></a>
                <a className="btn btn-icon btn-sm" href="#" onClick={(e) => e.preventDefault()} title="Mail"><i className="fa fa-envelope"></i></a>
                <a className="btn btn-icon btn-sm text-danger hidden-xs" href="#" onClick={(e) => e.preventDefault()} title="Delete"><i className="fa fa-trash"></i></a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ContactListTab;
