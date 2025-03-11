"use client";
import { useEffect, useState } from "react";
import { HotTable } from "@handsontable/react";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.css";

function ShowEmployees() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5001/employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  const handleDeleteRow = async (id) => {
    try {
      const response = await fetch(`http://localhost:5001/employees/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete employee");
      }

      setEmployees((prevEmployees) =>
        prevEmployees.filter((emp) => emp.id !== id)
      );
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const columns = [
    { data: "id", type: Handsontable.cellTypes.NUMERIC },
    { data: "name", type: Handsontable.cellTypes.TEXT },
    { data: "role", type: Handsontable.cellTypes.TEXT },
    { data: "salary", type: Handsontable.cellTypes.NUMERIC },
  ];

  return (
    <div className="p-10">
      <h2>Employee Attendance</h2>
      <HotTable
        data={employees}
        colHeaders={["ID", "Name", "Role", "Salary"]}
        columns={columns}
        rowHeaders={true}
        width="100%"
        height="auto"
        licenseKey="non-commercial-and-evaluation"
      />
    </div>
  );
}

export default ShowEmployees;
