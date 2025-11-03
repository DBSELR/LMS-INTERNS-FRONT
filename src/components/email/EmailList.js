import React from "react";
import EmailCard from "./EmailCard";

function EmailList() {
  const emails = [
    {
      id: 1,
      from: "John Smith",
      subject: "Meeting Follow-Up",
      message: "Hi there, just wanted to check in about the meeting notes we discussed earlier.",
      avatar: "avatar4.jpg",
      time: "10:10 AM",
      unread: true
    },
    {
      id: 2,
      from: "Emma Watson",
      subject: "Invoice #4576 Attached",
      message: "Please find attached the invoice for this month. Let me know if you have any questions.",
      avatar: "avatar2.jpg",
      time: "Yesterday",
      unread: false
    },
    {
      id: 3,
      from: "Support Team",
      subject: "Your Ticket Has Been Resolved",
      message: "Hello, we’re happy to let you know your issue has been resolved successfully.",
      avatar: "avatar1.jpg",
      time: "2 days ago",
      unread: false
    },
    {
      id: 4,
      from: "Anna Lee",
      subject: "Upcoming Workshop Registration",
      message: "Don’t forget to register for next week’s design workshop. Limited spots available!",
      avatar: "avatar6.jpg",
      time: "3 days ago",
      unread: true
    }
  ];

  return (
    <div className="accordion" id="emailAccordion">
      {emails.map((email) => (
        <EmailCard key={email.id} email={email} />
      ))}
    </div>
  );
}

export default EmailList;
