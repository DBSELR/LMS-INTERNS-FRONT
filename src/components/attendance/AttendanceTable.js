import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "../../config";

function AttendanceTable() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    const decoded = jwtDecode(token);
    const studentId = decoded["UserId"] || decoded.userId;

    const today = new Date();
    const days = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    setDaysInMonth(Array.from({ length: days }, (_, i) => i + 1));

    fetch(`${API_BASE_URL}/Attendance/ByStudent/${studentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const grouped = {};

        data.forEach((record) => {
          const courseName = record.course?.name || "General";
          const date = new Date(record.date);
          const day = date.getDate();
          const status = record.status?.[0] || "-"; // e.g., P, A, W

          if (!grouped[courseName]) grouped[courseName] = {};
          grouped[courseName][day] = status;
        });

        const formatted = Object.entries(grouped).map(([name, statusMap]) => {
          const status = daysInMonth.map((d) => statusMap[d] || "-");
          return { name, status };
        });

        setAttendanceData(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load attendance", err);
        setLoading(false);
      });
  }, []);

  const getStatusIcon = (code) => {
    switch (code) {
      case "P": return <i className="icon-user-following text-success"></i>;
      case "A": return <i className="icon-user-unfollow text-danger"></i>;
      case "W": return <i className="icon-user-unfollow text-warning"></i>;
      default: return "-";
    }
  };

  if (loading) return <div>Loading attendance...</div>;
  if (!attendanceData.length) return <div>No attendance records found.</div>;

  return (
    <div className="table-responsive">
      <table className="table table-bordered text-nowrap">
        <thead className="thead-light">
          <tr>
            <th>Course</th>
            {daysInMonth.map((day) => (
              <th key={day} className="text-center">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {attendanceData.map((row, i) => (
            <tr key={i}>
              <td>{row.name}</td>
              {row.status.map((code, d) => (
                <td key={d} className="text-center">{getStatusIcon(code)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceTable;
