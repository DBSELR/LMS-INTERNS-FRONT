// File: src/pages/AdminViewAllMarks.jsx

import React, { useEffect, useState } from "react";
import { Table, Button, Form, InputGroup, Pagination, Row, Col, Card, Container } from "react-bootstrap";
import * as XLSX from "xlsx";
import HeaderTop from "../components/HeaderTop";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

function AdminViewAllMarks() {
  const [marks, setMarks] = useState([]);
  const [filteredMarks, setFilteredMarks] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const marksPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    fetch(`${API_BASE_URL}/Marks/AllWithDetails`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setMarks(data);
        setFilteredMarks(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    let filtered = marks;
    if (selectedSemester) {
      filtered = filtered.filter((m) => m.semester === Number(selectedSemester));
    }
    if (selectedCourse) {
      filtered = filtered.filter((m) => m.course === selectedCourse);
    }
    if (searchTerm) {
      filtered = filtered.filter((m) =>
        m.studentName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredMarks(filtered);
    setCurrentPage(1);
  }, [selectedSemester, selectedCourse, searchTerm, marks]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredMarks);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AllMarks");
    XLSX.writeFile(workbook, "ExaminationMarks.xlsx");
  };

  const handleResetFilters = () => {
    setSelectedSemester("");
    setSelectedCourse("");
    setSearchTerm("");
  };

  const uniqueSemesters = [...new Set(marks.map((m) => m.semester))];
  const uniqueCourses = [...new Set(marks.map((m) => m.course))];

  const indexOfLast = currentPage * marksPerPage;
  const indexOfFirst = indexOfLast - marksPerPage;
  const paginatedMarks = filteredMarks.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMarks.length / marksPerPage);

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Admin" />
      <div className="page">
        <div className="section-body mt-4">
          <Container fluid>
            <Card className="shadow-sm border-0 mb-4">
              <Card.Body className="pb-2">
                <h3 className="text-primary fw-bold">All Student Marks</h3>
                <p className="text-muted mb-0">Filter, search, and export student marks.</p>
              </Card.Body>
            </Card>

            <Card className="shadow-sm border-0 mb-4">
              <Card.Body>
                <Form>
                  <Row className="g-3 align-items-end">
                    <Col md={3}>
                      <Form.Group>
                        {/* <Form.Label className="fw-semibold">Semester</Form.Label> */}
                        <Form.Select
                          className="p-2"
                          value={selectedSemester}
                          onChange={(e) => setSelectedSemester(e.target.value)}
                        >
                          <option value="">All Semesters</option>
                          {uniqueSemesters.map((sem) => (
                            <option key={sem} value={sem}>{sem}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        {/* <Form.Label className="fw-semibold">Course</Form.Label> */}
                        <Form.Select
                          className="p-2"
                          value={selectedCourse}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                          <option value="">All Courses</option>
                          {uniqueCourses.map((course) => (
                            <option key={course} value={course}>{course}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Button className="w-100 mt-2 fw-semibold" variant="outline-dark" onClick={handleResetFilters}>
                         Reset
                      </Button>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">Search</Form.Label>
                        <Form.Control
                          className="rounded"
                          type="text"
                          placeholder="Student name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Button className="w-100 mt-2 fw-semibold" variant="success" onClick={exportToExcel}>
                        📤 Export to Excel
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>

            <Card className="shadow-sm border-0">
              <Card.Body className="p-0">
                <Table responsive bordered hover className="mb-0 table-striped align-middle">
                  <thead className="bg-primary text-white text-center">
                    <tr>
                      <th>Student</th>
                      <th>Email</th>
                      <th>Course</th>
                      <th>Group</th>
                      <th>Semester</th>
                      <th>Paper</th>
                      <th>Type</th>
                      <th>Internal</th>
                      <th>Theory</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMarks.map((m, idx) => (
                      <tr key={idx}>
                        <td>{m.studentName}</td>
                        <td>{m.studentEmail}</td>
                        <td>{m.course}</td>
                        <td>{m.group}</td>
                        <td>{m.semester}</td>
                        <td>{`${m.paperCode} - ${m.paperName}`}</td>
                        <td>{m.paperType}</td>
                        <td className="text-end">{m.internalMarks}</td>
                        <td className="text-end">{m.theoryMarks}</td>
                        <td className="text-end">{m.totalMarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                {[...Array(totalPages)].map((_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </div>
          </Container>
        </div>
         
      </div>
    </div>
  );
}

export default AdminViewAllMarks;
