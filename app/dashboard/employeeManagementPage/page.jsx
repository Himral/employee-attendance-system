//"use client";
// import { useState, useEffect, useMemo } from "react";
// import { HotTable } from "@handsontable/react";
// import Handsontable from "handsontable";
// import "handsontable/dist/handsontable.full.min.css";
// import { Button } from '@/components/ui/button';
// import { fetchEmployees, updateAttendance } from '@/utils/api';

// // Register the checkbox cell type
// Handsontable.cellTypes.registerCellType('checkbox', {
//   editor: Handsontable.editors.CheckboxEditor,
//   renderer: Handsontable.renderers.CheckboxRenderer,
// });

// export default function EmployeeManagementPage() {
//   const [employees, setEmployees] = useState([]);
//   const [month, setMonth] = useState(new Date().getMonth() + 1);
//   const [year, setYear] = useState(new Date().getFullYear());
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const daysInMonth = new Date(year, month, 0).getDate();

//   useEffect(() => {
//     setLoading(true);
//     fetchEmployees(month, year)
//       .then(setEmployees)
//       .catch(err => {
//         console.error("Error fetching employees:", err);
//         setError(err.message);
//       })
//       .finally(() => setLoading(false));
//   }, [month, year]);

//   const handleCheckboxChange = async (row, col, checked) => {
//     const employee = employees[row];
//     const date = new Date(year, month, col - 3).toISOString().split('T')[0];
//     console.log('Date is : ' + date)
//     await updateAttendance(employee.id, date, checked ? 'present' : 'absent');
//     setEmployees(prev => {
//       const updated = [...prev];
//       updated[row].attendance[col] = checked;
//       updated[row].present = updated[row].attendance.filter(Boolean).length;
//       updated[row].percentage = ((updated[row].present / daysInMonth) * 100).toFixed(0) + '%';
//       return updated;
//     });
//   };

//   const data = useMemo(() => {
//     return employees.map(emp => [
//       emp.id,
//       emp.name,
//       emp.supervisor,
//       ...emp.attendance,
//       emp.present,
//       daysInMonth,
//       emp.percentage
//     ]);
//   }, [employees, daysInMonth]);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div className="p-4">
//       <div className="flex gap-4 mb-4 items-center">
//         <div className="flex gap-2">
//           <Button variant="outline" onClick={() => setMonth(m => m > 1 ? m - 1 : 12)}>
//             ← Month
//           </Button>
//           <Button variant="outline" onClick={() => setYear(y => y - 1)}>
//             ← Year
//           </Button>
//         </div>
        
//         <div className="flex items-center gap-2">
//           <span className="font-medium">{new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}</span>
//         </div>

//         <div className="flex gap-2">
//           <Button variant="outline" onClick={() => setMonth(m => m < 12 ? m + 1 : 1)}>
//             Month →
//           </Button>
//           <Button variant="outline" onClick={() => setYear(y => y + 1)}>
//             Year →
//           </Button>
//         </div>
//       </div>

//       <HotTable
//         data={data}
//         colHeaders={[
//           'Emp ID',
//           'Name',
//           'Supervisor',
//           ...Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
//           'Present',
//           'Total',
//           '%'
//         ]}
//         rowHeaders={true}
//         licenseKey="non-commercial-and-evaluation"
//         height="600"
//         contextMenu={true}
//         afterChange={(changes) => {
//           changes?.forEach(([row, col, _, newValue]) => {
//             if (col >= 3 && col < daysInMonth + 3) {
//               handleCheckboxChange(row, col - 3, newValue);
//             }
//           });
//         }}
//         cells={(row, col) => {
//           if (col >= 3 && col < daysInMonth + 3) {
//             return { type: 'checkbox', className: 'htCenter' };
//           }
//           return {};
//         }}
//       />
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect, useRef } from "react";
import Handsontable from "handsontable";
import "handsontable/styles/handsontable.css";
import "handsontable/styles/ht-theme-main.css";

const AttendanceTable = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1); // JavaScript months are 0-based
  const [daysInMonth, setDaysInMonth] = useState(new Date(year, month, 0).getDate());
  const tableRef = useRef(null);
  const hotInstance = useRef(null);

  useEffect(() => {
    setDaysInMonth(new Date(year, month, 0).getDate());
  }, [year, month]);

  useEffect(() => {
    if (!tableRef.current) return;

    const colHeaders = ["EmployeeId", "Name", ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

    const columns = [
      { type: "numeric", readOnly: true }, // Employee ID (can't be edited)
      { readOnly: true }, // Employee Name (can't be edited)
      ...Array.from({ length: daysInMonth }, () => ({
        type: "dropdown",
        source: ["Present", "Absent", "Late", "Leave", "NotSet"],
      })),
    ];

    const data = [
      [1, "Ravo", ...Array(daysInMonth).fill("NotSet")],
      [2, "Shyam", ...Array(daysInMonth).fill("NotSet")],
      [3, "Chrysler", ...Array(daysInMonth).fill("NotSet")],
      [4, "Volvo", ...Array(daysInMonth).fill("NotSet")],
    ];

    if (hotInstance.current) {
      hotInstance.current.destroy();
    }

    hotInstance.current = new Handsontable(tableRef.current, {
      data,
      colHeaders,
      columns,
      autoWrapRow: true,
      autoWrapCol: true,
      licenseKey: "non-commercial-and-evaluation",
      afterChange: (changes, source) => {
        if (source === "edit" && changes) {
          changes.forEach(([row, col, oldValue, newValue]) => {
            if (col >= 2 && newValue !== oldValue) {
              updateAttendance(row, col, newValue);
            }
          });
        }
      },
    });
  }, [daysInMonth]);

  const updateAttendance = async (row, col, status) => {
    if (!hotInstance.current) return;

    const hot = hotInstance.current;
    const employeeId = hot.getDataAtCell(row, 0);
    const date = `${year}-${month.toString().padStart(2, "0")}-${(col - 1).toString().padStart(2, "0")}`; // Format YYYY-MM-DD

    try {
      const response = await fetch(`http://localhost:5001/attendance/${employeeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date, status }),
      });

      const result = await response.json();
      if (result.success) {
        console.log(`✅ Attendance updated: Employee ${employeeId}, Date: ${date}, Status: ${status}`);
      } else {
        console.error(`❌ Failed to update attendance for Employee ${employeeId}`);
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  return (
    <div>
      {/* Year Selection */}
      <select value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))}>
        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      {/* Month Selection */}
      <select value={month} onChange={(e) => setMonth(parseInt(e.target.value, 10))}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <option key={m} value={m}>
            {new Date(2024, m - 1, 1).toLocaleString("default", { month: "long" })}
          </option>
        ))}
      </select>

      {/* Handsontable Container */}
      <div ref={tableRef} id="example1" />
    </div>
  );
};

export default AttendanceTable;
