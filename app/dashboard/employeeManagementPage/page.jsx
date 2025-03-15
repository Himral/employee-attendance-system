"use client";

import React, { useState, useEffect, useRef } from "react";
import Handsontable from "handsontable";
import "handsontable/styles/handsontable.css";
import "handsontable/styles/ht-theme-main.css";
import { updateAttendance } from '@/utils/api';

const AttendanceTable = () => {
  const [employees, setEmployees] = useState([]);
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

    fetch("http://localhost:5001/employees")
      .then((res) => res.json())
      .then((data) => {
        const updatedEmployees = data.map(emp => ({
          ...emp,
          attendance: Array(daysInMonth).fill("NotSet"),
        }));
        setEmployees(updatedEmployees);
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, [daysInMonth]);

  useEffect(() => {
    if (!tableRef.current || employees.length === 0) return;

    const colHeaders = ["EmployeeId", "Name", ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

    const columns = [
      { type: "numeric", readOnly: true }, // Employee ID (can't be edited)
      { readOnly: true }, // Employee Name (can't be edited)
      ...Array.from({ length: daysInMonth }, () => ({
        type: "dropdown",
        source: ["Present", "Absent", "Late", "Leave", "NotSet"],
      })),
    ];

    const data = employees.map(emp => [
      emp.id,
      emp.name,
      ...emp.attendance,
    ]);

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
  }, [employees, daysInMonth]);

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
            {new Date(year, m - 1, 1).toLocaleString("default", { month: "long" })}
          </option>
        ))}
      </select>

      {/* Handsontable Container */}
      <div ref={tableRef} id="example1" />
    </div>
  );
};

export default AttendanceTable;
