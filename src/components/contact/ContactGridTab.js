import React from "react";

function ContactGridTab() {
  const contacts = [
    {
      name: "John Smith",
      phone: "+264-625-2583",
      email: "johnsmith@info.com",
      avatar: "avatar4.jpg",
      role: "UI UX Designer",
    },
    {
      name: "Merri Diamond",
      phone: "+264-625-2583",
      email: "hermanbeck@info.com",
      avatar: "avatar2.jpg",
      role: "React Developer",
    },
    {
      name: "Sara Hopkins",
      phone: "+264-625-3333",
      email: "maryadams@info.com",
      avatar: "avatar3.jpg",
      role: "Product Manager",
    },
    {
      name: "Andrew Patrick",
      phone: "+264-625-2586",
      email: "mikethimas@info.com",
      avatar: "avatar7.jpg",
      role: "DevOps Engineer",
    },
    {
      name: "Claire Peters",
      phone: "+264-625-3333",
      email: "clairepeters@info.com",
      avatar: "avatar5.jpg",
      role: "QA Analyst",
    },
  ];

  return (
    <div className="row clearfix">
      {contacts.map((contact, i) => (
        <div className="col-lg-3 col-md-6 col-sm-12" key={i}>
          <div className="card text-center">
            <div className="card-body">
              <img className="rounded-circle avatar" src={`../assets/images/xs/${contact.avatar}`} alt="avatar" />
              <h6 className="mt-3 mb-0">{contact.name}</h6>
              <span>{contact.role}</span>
              <ul className="mt-3 list-unstyled d-flex justify-content-center">
                <li><a href="#" className="p-3"><i className="fa fa-phone"></i></a></li>
                <li><a href="#" className="p-3"><i className="fa fa-envelope"></i></a></li>
                <li><a href="#" className="p-3 text-danger"><i className="fa fa-trash"></i></a></li>
              </ul>
              <small className="text-muted">{contact.phone}</small>
              <p className="text-muted">{contact.email}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ContactGridTab;
