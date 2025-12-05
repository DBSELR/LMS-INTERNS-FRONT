import React, { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "../../config";

function SemesterFeeTemplateManager() {
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [groupList, setGroupList] = useState([]);

  // University and College state
  const [universities, setUniversities] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");

  // NEW: Fee Heads
  const [feeHeads, setFeeHeads] = useState([]);
  const [selectedFeeHead, setSelectedFeeHead] = useState("");

  const [installmentFeeData, setInstallmentFeeData] = useState([]);
  const [dueDateSelected, setDueDateSelected] = useState(false);

  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [installmentDueDate, setInstallmentDueDate] = useState(new Date());
  const [feeAmount, setFeeAmount] = useState("");

  // ----------------- initial data: Universities + FeeHeads -----------------
  useEffect(() => {
    fetchUniversities();
    fetchFeeHeads();
  }, []);

  // Fetch FeeHeads
  const fetchFeeHeads = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Fee/FeeHeads`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const txt = await res.text();
        console.error("❌ Failed to fetch fee heads:", res.status, txt);
        toast.error("Failed to load fee heads");
        return;
      }

      const data = await res.json();
      setFeeHeads(data || []);

      // Default to "Tuition Fee" if present, else first
      const tuition = (data || []).find((f) => f.feeHead === "Tuition Fee");
      if (tuition) {
        setSelectedFeeHead(tuition.hid.toString());
      } else if (data && data.length > 0) {
        setSelectedFeeHead(data[0].hid.toString());
      }
    } catch (err) {
      console.error("❌ Error fetching fee heads:", err);
      toast.error("Error loading fee heads");
    }
  };

  // Fetch batches/programmes for a given university
  const fetchInitialData = async (universityName) => {
    setLoadingColleges(true);
    try {
      const token = localStorage.getItem("jwt");
      const url = `${API_BASE_URL}/Fee/GetBatchByuniversity?uname=${encodeURIComponent(
        universityName || ""
      )}`;
      console.log("🔍 Fetching batches/programmes from:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📡 Batches API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Batches data received:", data);
        setCourseList(data || []);
        try {
          const names = Array.isArray(data)
            ? data.map((p) => p.batchName || p.batch || "")
            : [];
          setBatchList([...new Set(names.filter(Boolean))]);
        } catch (e) {
          setBatchList([]);
        }
      } else {
        const errorText = await response.text();
        console.error(
          "❌ Failed to fetch batches/programmes:",
          response.status,
          errorText
        );
        toast.error(`Failed to load batches: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error fetching batches/programmes:", error);
      toast.error("Error loading batches/programmes");
    } finally {
      setLoadingColleges(false);
    }
  };

  // Fetch universities
  const fetchUniversities = async () => {
    setLoadingUniversities(true);
    try {
      const token = localStorage.getItem("jwt");
      const url = `${API_BASE_URL}/User/GetUniversity`;
      console.log("🔍 Fetching universities from:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📡 Universities API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Universities data received:", data);
        setUniversities(data || []);
      } else {
        const errorText = await response.text();
        console.error(
          "❌ Failed to fetch universities:",
          response.status,
          errorText
        );
        toast.error(`Failed to load universities: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error fetching universities:", error);
      toast.error("Error loading universities");
    } finally {
      setLoadingUniversities(false);
    }
  };

  // Fetch colleges
  const fetchColleges = async (universityName) => {
    setLoadingColleges(true);
    try {
      const token = localStorage.getItem("jwt");
      const url = `${API_BASE_URL}/User/GetFeeCollegesbyUniversity?uname=${encodeURIComponent(
        universityName
      )}`;
      console.log("🔍 Fetching colleges from:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📡 Colleges API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Colleges data received:", data);
        setColleges(data || []);
      } else {
        const errorText = await response.text();
        console.error(
          "❌ Failed to fetch colleges:",
          response.status,
          errorText
        );
        toast.error(`Failed to load colleges: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error fetching colleges:", error);
      toast.error("Error loading colleges");
    } finally {
      setLoadingColleges(false);
    }
  };

  // Colleges when university changes
  useEffect(() => {
    if (selectedUniversity && selectedUniversity !== "") {
      fetchColleges(selectedUniversity);
    } else {
      setColleges([]);
      setSelectedCollege("");
    }
  }, [selectedUniversity]);

  // Batches/programmes when university changes
  useEffect(() => {
    if (selectedUniversity && selectedUniversity !== "") {
      fetchInitialData(selectedUniversity);
    } else {
      setCourseList([]);
      setBatchList([]);
      setSelectedBatch("");
      setSelectedCourse("");
      setSelectedGroup("");
    }
  }, [selectedUniversity]);

  // Groups when batch + course selected
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (selectedBatch && selectedCourse) {
      fetch(`${API_BASE_URL}/Group/All`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const filtered = data.filter(
            (g) =>
              g.batchName === selectedBatch &&
              g.programmeId === parseInt(selectedCourse)
          );
          setGroupList(filtered);
        })
        .catch((err) => console.error("Failed to load groups", err));
    }
  }, [selectedBatch, selectedCourse]);

  // Fetch existing fee records when filters change (including FeeHead)
 useEffect(() => {
  if (selectedCollege && selectedBatch && selectedFeeHead) {
    fetchInstallmentWiseFees(selectedBatch, selectedCourse, selectedGroup);
  }
}, [selectedCollege, selectedBatch, selectedCourse, selectedGroup, selectedFeeHead]);


  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    return `${day}-${month}-${year}`;
  };

  // ----------------- Submit: Save Semester Fee Template -----------------

    // ----------------- Submit: Save Semester Fee Template -----------------
  const handleSubmit = async () => {
    if (!selectedUniversity) {
      toast.error("Please select a university");
      return;
    }

    if (!selectedCollege) {
      toast.error("Please select a college");
      return;
    }

    if (!selectedBatch) {
      toast.error("Please select a batch");
      return;
    }

    if (!selectedFeeHead) {
      toast.error("Please select a fee head");
      return;
    }

    // If no course selected => apply to ALL courses in this batch + college
    if (!selectedCourse) {
      const proceedAll = window.confirm(
        "No course selected.\nThis will create/update fee template for ALL COURSES in this batch and college.\n\nDo you want to continue?"
      );
      if (!proceedAll) return;
    }

    // ✅ Allow 0, only block empty / non-numeric / negative
    if (feeAmount === "" || feeAmount === null || isNaN(parseFloat(feeAmount))) {
      toast.error("Please enter fee amount (0 or above)");
      return;
    }

    if (parseFloat(feeAmount) < 0) {
      toast.error("Fee amount cannot be negative");
      return;
    }

    // Resolve college id (as you already do)
    const selectedCollegeObj =
      (colleges || []).find((c) => {
        if (!c) return false;
        if (typeof c === "string") return String(c) === String(selectedCollege);
        const candidates = [
          c.college,
          c.cname,
          c.collegeName,
          c.name,
          c.CollegeName,
          c.colcode,
          c.colId,
          c.id,
          c.collegeId,
        ];
        return candidates.some(
          (v) => v !== undefined && String(v) === String(selectedCollege)
        );
      }) || null;

    const colId =
      (selectedCollegeObj && selectedCollegeObj.id) ??
      (selectedCollegeObj && selectedCollegeObj.colId) ??
      (selectedCollegeObj && selectedCollegeObj.collegeId) ??
      (selectedCollegeObj && selectedCollegeObj.colcode) ??
      (Number.isFinite(Number(selectedCollege))
        ? parseInt(selectedCollege, 10)
        : null);

    if (!colId) {
      console.error("Unable to resolve college id", {
        selectedCollege,
        selectedCollegeObj,
        colleges,
      });
      toast.error("Unable to find college ID. Please re-select the college.");
      return;
    }

    const hid =
      selectedFeeHead && Number.isFinite(Number(selectedFeeHead))
        ? parseInt(selectedFeeHead, 10)
        : null;

    if (!hid) {
      toast.error("Invalid fee head selected");
      return;
    }

    // 🔍 FIGURE OUT IF A RECORD ALREADY EXISTS FOR THIS COMBINATION
    const programmeIdNumber = selectedCourse
      ? (Number.isFinite(Number(selectedCourse))
          ? parseInt(selectedCourse, 10)
          : null)
      : null;

    let existingId = 0;

    if (installmentFeeData && installmentFeeData.length > 0) {
      const match = installmentFeeData.find((row) => {
        const rowProgId =
          row.programmeId !== undefined && row.programmeId !== null
            ? parseInt(row.programmeId, 10)
            : null;

        // same batch
        if (row.batch !== selectedBatch) return false;

        // same programme id (null = "all courses" case; usually you pick a course)
        if (programmeIdNumber === null) {
          return rowProgId === null || rowProgId === 0;
        }

        return rowProgId === programmeIdNumber;
      });

      if (match && match.id) {
        existingId = parseInt(match.id, 10);
      }
    }

    // 🧠 If existingId > 0 => UPDATE, else INSERT
    const requestBody = {
      Id: existingId || 0,  // 👈 IMPORTANT
      Batch: selectedBatch || null,
      ProgrammeId: selectedCourse
        ? Number.isFinite(Number(selectedCourse))
          ? parseInt(selectedCourse, 10)
          : null
        : null,
      DueDate: dueDateSelected
        ? installmentDueDate.toISOString().split("T")[0]
        : null,
      Fee: feeAmount ? parseFloat(feeAmount) : null,
      ColId: Number.isFinite(Number(colId)) ? parseInt(colId, 10) : null,
      Hid: hid,
    };

    try {
      const token = localStorage.getItem("jwt");
      console.log("➡️ Saving semester fee", {
        url: `${API_BASE_URL}/Fee/SaveInstallmentFee`,
        requestBody,
      });
      const response = await fetch(`${API_BASE_URL}/Fee/SaveInstallmentFee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const contentType = response.headers.get("content-type") || "";
      let payload = null;
      try {
        payload = contentType.includes("application/json")
          ? await response.json()
          : await response.text();
      } catch (parseErr) {
        payload = await response.text().catch(() => null);
      }

      if (response.ok) {
        console.log("✅ Save successful", payload);
        // reload data
        fetchInstallmentWiseFees(selectedBatch, selectedCourse, selectedGroup);
        const message =
          (payload && (payload.message || payload.Message)) ||
          "Saved successfully";
        toast.success(message);
        setFeeAmount("");
      } else {
        console.error("❌ Save failed", { status: response.status, payload });
        const serverMsg =
          (payload && (payload.error || payload.message)) ||
          String(payload) ||
          "Failed to save data";
        toast.error(`Save failed: ${serverMsg}`);
        alert("Error: " + serverMsg);
      }
    } catch (err) {
      console.error("❌ Error while saving fee", err, { requestBody });
      toast.error("Error saving data: " + (err.message || String(err)));
      alert("Error: " + (err.message || String(err)));
    }
  };

//   const handleSubmit = async () => {
//     if (!selectedUniversity) {
//       toast.error("Please select a university");
//       return;
//     }

//     if (!selectedCollege) {
//       toast.error("Please select a college");
//       return;
//     }

//     if (!selectedBatch) {
//       toast.error("Please select a batch");
//       return;
//     }

//     if (!selectedFeeHead) {
//       toast.error("Please select a fee head");
//       return;
//     }

//     // If no course selected => apply to ALL courses in this batch + college
//     if (!selectedCourse) {
//       const proceedAll = window.confirm(
//         "No course selected.\nThis will create/update fee template for ALL COURSES in this batch and college.\n\nDo you want to continue?"
//       );
//       if (!proceedAll) return;
//     }

//    // ✅ Allow 0, only block empty / non-numeric / negative
// if (feeAmount === "" || feeAmount === null || isNaN(parseFloat(feeAmount))) {
//   toast.error("Please enter fee amount (0 or above)");
//   return;
// }

// if (parseFloat(feeAmount) < 0) {
//   toast.error("Fee amount cannot be negative");
//   return;
// }


//     // Resolve college id
//     const selectedCollegeObj =
//       (colleges || []).find((c) => {
//         if (!c) return false;
//         if (typeof c === "string") return String(c) === String(selectedCollege);
//         const candidates = [
//           c.college,
//           c.cname,
//           c.collegeName,
//           c.name,
//           c.CollegeName,
//           c.colcode,
//           c.colId,
//           c.id,
//           c.collegeId,
//         ];
//         return candidates.some(
//           (v) => v !== undefined && String(v) === String(selectedCollege)
//         );
//       }) || null;

//     const colId =
//       (selectedCollegeObj && selectedCollegeObj.id) ??
//       (selectedCollegeObj && selectedCollegeObj.colId) ??
//       (selectedCollegeObj && selectedCollegeObj.collegeId) ??
//       (selectedCollegeObj && selectedCollegeObj.colcode) ??
//       (Number.isFinite(Number(selectedCollege))
//         ? parseInt(selectedCollege, 10)
//         : null);

//     if (!colId) {
//       console.error("Unable to resolve college id", {
//         selectedCollege,
//         selectedCollegeObj,
//         colleges,
//       });
//       toast.error("Unable to find college ID. Please re-select the college.");
//       return;
//     }

//     const hid =
//       selectedFeeHead && Number.isFinite(Number(selectedFeeHead))
//         ? parseInt(selectedFeeHead, 10)
//         : null;

//     if (!hid) {
//       toast.error("Invalid fee head selected");
//       return;
//     }

//     // Request body must match SemesterFeeRequest on backend
//     const requestBody = {
//       Batch: selectedBatch || null,
//       ProgrammeId: selectedCourse
//         ? Number.isFinite(Number(selectedCourse))
//           ? parseInt(selectedCourse, 10)
//           : null
//         : null,
//       DueDate: dueDateSelected
//         ? installmentDueDate.toISOString().split("T")[0]
//         : null,
//       Fee: feeAmount ? parseFloat(feeAmount) : null,
//       ColId: Number.isFinite(Number(colId)) ? parseInt(colId, 10) : null,
//       Hid: hid, // NEW: FeeHead Id
//     };

//     try {
//       const token = localStorage.getItem("jwt");
//       console.log("➡️ Saving semester fee", {
//         url: `${API_BASE_URL}/Fee/SaveInstallmentFee`,
//         requestBody,
//       });
//       const response = await fetch(`${API_BASE_URL}/Fee/SaveInstallmentFee`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(requestBody),
//       });

//       const contentType = response.headers.get("content-type") || "";
//       let payload = null;
//       try {
//         payload = contentType.includes("application/json")
//           ? await response.json()
//           : await response.text();
//       } catch (parseErr) {
//         payload = await response.text().catch(() => null);
//       }

//       if (response.ok) {
//         console.log("✅ Save successful", payload);
//         // reload data
//         fetchInstallmentWiseFees(selectedBatch, selectedCourse, selectedGroup);
//         const message =
//           (payload && (payload.message || payload.Message)) ||
//           "Saved successfully";
//         toast.success(message);
//         setFeeAmount("");
//       } else {
//         console.error("❌ Save failed", { status: response.status, payload });
//         const serverMsg =
//           (payload && (payload.error || payload.message)) ||
//           String(payload) ||
//           "Failed to save data";
//        if (
//   typeof serverMsg === "string" &&
//   serverMsg.includes("Certificate fee") &&
//   serverMsg.includes("Tuition Fee")
// ) {
//   toast.error(serverMsg); // already clear enough
// } else {
//   toast.error(`Save failed: ${serverMsg}`);
// }

// alert("Error: " + serverMsg);
//       }
//     } catch (err) {
//       console.error("❌ Error while saving fee", err, { requestBody });
//       toast.error("Error saving data: " + (err.message || String(err)));
//       alert("Error: " + (err.message || String(err)));
//     }
//   };

  // ----------------- Delete Fee Record -----------------
  const handleDelete = async (item, index) => {
    if (!item.id) {
      toast.error("Unable to delete: No ID found for this record");
      return;
    }

    if (window.confirm("Are you sure you want to delete this fee record?")) {
      try {
        const token = localStorage.getItem("jwt");
        const response = await fetch(
          `${API_BASE_URL}/Fee/DeleteFeeById?id=${item.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok || response.status === 204) {
          const updatedData = installmentFeeData.filter((_, i) => i !== index);
          setInstallmentFeeData(updatedData);
          toast.success("Fee record deleted successfully!");
        } else {
          const errorText = await response.text();
          toast.error(`Failed to delete fee record: ${response.status}`);
          console.error("Delete error:", errorText);
        }
      } catch (err) {
        toast.error("Failed to delete fee record");
        console.error("Delete error:", err);
      }
    }
  };

  // ----------------- Get existing fees (for selected FeeHead) -----------------
  // const fetchInstallmentWiseFees = async (batch, programmeId, groupId) => {
  //   try {
  //     const token = localStorage.getItem("jwt");

  //     const hid =
  //       selectedFeeHead && Number.isFinite(Number(selectedFeeHead))
  //         ? parseInt(selectedFeeHead, 10)
  //         : 1; // fallback

  //     const response = await fetch(
  //       `${API_BASE_URL}/Fee/Getinstallmentwisefeemaster`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({
  //           hid: hid, // dynamic FeeHead
  //           batch: batch,
  //           programmeId:
  //             programmeId === "0" || !programmeId
  //               ? null
  //               : parseInt(programmeId),
  //           groupId:
  //             groupId === "0" || !groupId ? null : parseInt(groupId),
  //           installment: 1, // Semester template = Installments 1
  //         }),
  //       }
  //     );

  //     if (response.ok) {
  //       const data = await response.json();
  //       const transformed = data.map((item) => ({
  //         id: item.id,
  //         feeHead: item.feeHead,
  //         batch: item.batch,
  //         programmeId: item.programmeId,
  //         pNAME: item.pname,
  //         groupId: item.groupId,
  //         gname: item.gname,
  //         installment: item.installments,
  //         amountDue: parseFloat(item.amountDue),
  //         totalFee: parseFloat(item.amountDue),
  //         dueDate: item.dueDate ? item.dueDate.split("T")[0] : "",
  //       }));
  //       setInstallmentFeeData(transformed);
  //     } else {
  //       console.error("Failed to load installment fee data.");
  //     }
  //   } catch (err) {
  //     console.error("Error fetching installment fee data:", err);
  //   }
  // };

  const fetchInstallmentWiseFees = async (batch, programmeId, groupId) => {
  try {
    const token = localStorage.getItem("jwt");

    // 👉 Resolve colId same way as in handleSubmit
    const selectedCollegeObj =
      (colleges || []).find((c) => {
        if (!c) return false;
        if (typeof c === "string") return String(c) === String(selectedCollege);
        const candidates = [
          c.college,
          c.cname,
          c.collegeName,
          c.name,
          c.CollegeName,
          c.colcode,
          c.colId,
          c.id,
          c.collegeId,
        ];
        return candidates.some(
          (v) => v !== undefined && String(v) === String(selectedCollege)
        );
      }) || null;

    const colId =
      (selectedCollegeObj && selectedCollegeObj.id) ??
      (selectedCollegeObj && selectedCollegeObj.colId) ??
      (selectedCollegeObj && selectedCollegeObj.collegeId) ??
      (selectedCollegeObj && selectedCollegeObj.colcode) ??
      (Number.isFinite(Number(selectedCollege))
        ? parseInt(selectedCollege, 10)
        : null);

    // Not hard error – if we can’t resolve, send null and let SP handle it
    if (!colId) {
      console.warn("⚠️ fetchInstallmentWiseFees: unable to resolve colId", {
        selectedCollege,
        selectedCollegeObj,
      });
    }

    const hid =
      selectedFeeHead && Number.isFinite(Number(selectedFeeHead))
        ? parseInt(selectedFeeHead, 10)
        : 1; // fallback

    const response = await fetch(
      `${API_BASE_URL}/Fee/Getinstallmentwisefeemaster`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hid: hid, // dynamic FeeHead
          batch: batch,
          programmeId:
            programmeId === "0" || !programmeId
              ? null
              : parseInt(programmeId, 10),
          groupId:
            groupId === "0" || !groupId ? null : parseInt(groupId, 10),
          installment: 1, // Semester template = Installments 1
          colid: colId != null ? parseInt(colId, 10) : null, 
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const transformed = data.map((item) => ({
        id: item.id,
        feeHead: item.feeHead,
        batch: item.batch,
        programmeId: item.programmeId,
        pNAME: item.pname,
        groupId: item.groupId,
        gname: item.gname,
        installment: item.installments,
        amountDue: parseFloat(item.amountDue),
        totalFee: parseFloat(item.amountDue),
        dueDate: item.dueDate ? item.dueDate.split("T")[0] : "",
      }));
      setInstallmentFeeData(transformed);
    } else {
      console.error("Failed to load installment fee data.");
    }
  } catch (err) {
    console.error("Error fetching installment fee data:", err);
  }
};


  // ========================== RENDER ==========================
  return (
    <div className="p-6">
      <div className="row mb-4">
        {/* University */}
        <div className="col-12 col-md-3 mb-2">
          <Form.Label>
            UNIVERSITY <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            as="select"
            name="university"
            value={selectedUniversity}
            onChange={(e) => {
              setSelectedUniversity(e.target.value);
              setSelectedCollege("");
            }}
            disabled={loadingUniversities}
          >
            <option value="">
              {loadingUniversities
                ? "Loading universities..."
                : "Select University"}
            </option>
            {universities.map((university, index) => {
              const value =
                university && university.uname
                  ? university.uname
                  : university && university.universityName
                  ? university.universityName
                  : university && university.name
                  ? university.name
                  : university && university.UniversityName
                  ? university.UniversityName
                  : university;
              const display =
                university && university.uname
                  ? university.uname
                  : university && university.universityName
                  ? university.universityName
                  : university && university.name
                  ? university.name
                  : university && university.UniversityName
                  ? university.UniversityName
                  : university;

              return (
                <option key={index} value={value}>
                  {display}
                </option>
              );
            })}
          </Form.Control>
        </div>

        {/* College */}
        <div className="col-12 col-md-3 mb-2">
          <Form.Label>
            College <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            as="select"
            name="college"
            value={selectedCollege || ""}
            onChange={(e) => setSelectedCollege(e.target.value)}
            disabled={loadingColleges || !selectedUniversity}
          >
            <option value="">
              {!selectedUniversity
                ? "Select University first"
                : loadingColleges
                ? "Loading colleges..."
                : "Select College"}
            </option>
            {colleges.map((college, index) => {
              const value =
                college && college.college
                  ? college.college
                  : college && college.cname
                  ? college.cname
                  : college && college.collegeName
                  ? college.collegeName
                  : college && college.name
                  ? college.name
                  : college && college.CollegeName
                  ? college.CollegeName
                  : college;
              const display =
                college && college.college
                  ? college.college
                  : college && college.cname
                  ? college.cname
                  : college && college.collegeName
                  ? college.collegeName
                  : college && college.name
                  ? college.name
                  : college && college.CollegeName
                  ? college.CollegeName
                  : college;

              return (
                <option key={index} value={value}>
                  {display}
                </option>
              );
            })}
          </Form.Control>
        </div>

        {/* Fee Head */}
        <div className="col-12 col-md-3 mb-2">
          <Form.Label>
            Fee Head <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            as="select"
            value={selectedFeeHead}
            onChange={(e) => setSelectedFeeHead(e.target.value)}
          >
            <option value="">Select Fee Head</option>
            {feeHeads.map((fh) => (
              <option key={fh.hid} value={fh.hid}>
                {fh.feeHead}
              </option>
            ))}
          </Form.Control>
        </div>

        {/* Batch */}
        <div className="col-12 col-md-3 mb-2">
          <Form.Label>Batch</Form.Label>
          <Form.Control
            as="select"
            value={selectedBatch}
            onChange={(e) => {
              const batch = e.target.value;
              setSelectedBatch(batch);
              setSelectedCourse("");
              setSelectedGroup("");
            }}
          >
            <option value="">Select Batch</option>
            {batchList.map((b, i) => (
              <option key={i}>{b}</option>
            ))}
          </Form.Control>
        </div>
         {/* Course */}
        <div className="col-12 col-md-3 mb-2">
          <Form.Label>Course</Form.Label>
          <Form.Control
            as="select"
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setSelectedGroup("");
            }}
          >
            <option value="">Select Course</option>
            {courseList
              .filter((c) => c.batchName === selectedBatch)
              .map((c, idx) => {
                const pid =
                  c.programmeId ??
                  c.ProgrammeId ??
                  c.programmeID ??
                  c.programmeid ??
                  c.programme_id ??
                  c.programme ??
                  null;
                const displayCode =
                  c.programmeCode ?? c.programme_code ?? c.code ?? "";
                const displayName =
                  c.programmeName ?? c.programme_name ?? c.name ?? c.pname ?? "";
                const key = pid != null ? String(pid) : `course-${idx}`;
                return (
                  <option key={key} value={pid || ""}>
                    {displayCode
                      ? `${displayCode}-${displayName}`
                      : displayName}
                  </option>
                );
              })}
          </Form.Control>
        </div>

        {/* Fee Amount */}
        <div className="col-12 col-md-3 mb-2">
          <Form.Label>
            Fee Amount <span className="text-danger">*</span>
          </Form.Label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter Fee Amount"
            value={feeAmount}
            onChange={(e) => setFeeAmount(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>

       

        {/* Due Date */}
        <div className="col-12 col-md-2 mb-2">
          <Form.Label>Due Date</Form.Label>
          <input
            type="date"
            className="form-control"
            value={
              dueDateSelected
                ? installmentDueDate.toISOString().split("T")[0]
                : ""
            }
            onChange={(e) => {
              if (e.target.value === "") {
                setDueDateSelected(false);
              } else {
                setDueDateSelected(true);
                setInstallmentDueDate(new Date(e.target.value));
              }
            }}
          />
        </div>

        {/* Submit */}
        <div className="col-12 col-md-1 d-flex align-items-end mb-2">
          <Button
            style={{ height: "40px" }}
            variant="primary"
            className="w-100"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </div>

      {/* Table */}
      {installmentFeeData.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-hover table-striped table-sm">
            <thead className="dark-header bg-dark text-white text-center">
              <tr style={{ fontSize: "13.5px" }}>
                <th>Fee Head</th>
                <th>Batch</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody className="text-center align-middle">
              {installmentFeeData.map((item, index) => (
                <tr key={index}>
                  <td>{item.feeHead}</td>
                  <td>{item.batch}</td>
                  <td>{item.pNAME}</td>
                  <td>₹{parseFloat(item.totalFee || 0).toFixed(2)}</td>
                  <td>{formatDate(item.dueDate)}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(item, index)}
                      title="Delete"
                    >
                      <i className="fa fa-trash" aria-hidden="true"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SemesterFeeTemplateManager;
