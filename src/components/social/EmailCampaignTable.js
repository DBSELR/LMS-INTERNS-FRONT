import React from "react";

function EmailCampaignTable() {
  const campaigns = [
    {
      name: "Holiday Promo",
      sent: "12,345",
      opened: "8,876",
      clicked: "2,304",
      bounced: "232",
      unsubscribed: "45",
      progress: 72,
    },
    {
      name: "Newsletter June",
      sent: "9,243",
      opened: "6,753",
      clicked: "1,203",
      bounced: "112",
      unsubscribed: "32",
      progress: 65,
    },
    {
      name: "Product Launch",
      sent: "15,876",
      opened: "11,453",
      clicked: "4,543",
      bounced: "315",
      unsubscribed: "68",
      progress: 80,
    },
    {
      name: "Event Invite",
      sent: "5,786",
      opened: "3,913",
      clicked: "987",
      bounced: "89",
      unsubscribed: "15",
      progress: 58,
    }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Email Campaign Performance</h3>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover table-vcenter text-nowrap mb-0">
            <thead>
              <tr>
                <th>Campaign</th>
                <th className="text-center">Sent</th>
                <th className="text-center">Opened</th>
                <th className="text-center">Clicked</th>
                <th className="text-center">Bounced</th>
                <th className="text-center">Unsubscribed</th>
                <th className="text-center">Progress</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, i) => (
                <tr key={i}>
                  <td>{c.name}</td>
                  <td className="text-center">{c.sent}</td>
                  <td className="text-center">{c.opened}</td>
                  <td className="text-center">{c.clicked}</td>
                  <td className="text-center">{c.bounced}</td>
                  <td className="text-center">{c.unsubscribed}</td>
                  <td className="text-center">
                    <div className="progress progress-xs">
                      <div
                        className="progress-bar bg-primary"
                        role="progressbar"
                        style={{ width: `${c.progress}%` }}
                        aria-valuenow={c.progress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <small>{c.progress}%</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EmailCampaignTable;
