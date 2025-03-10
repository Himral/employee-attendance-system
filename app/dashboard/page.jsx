"use client"
import React, { useState } from 'react';

function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Initial employee data
  const [employees, setEmployees] = useState([
    { id: 1, name: 'John Doe', role: 'Admin', status: 'Active', attendance: Array(daysInMonth).fill(false) },
    { id: 2, name: 'Jane Smith', role: 'Editor', status: 'Pending', attendance: Array(daysInMonth).fill(false) },
    { id: 3, name: 'Sam Wilson', role: 'Viewer', status: 'Inactive', attendance: Array(daysInMonth).fill(false) },
    { id: 4, name: 'Emma Watson', role: 'Editor', status: 'Active', attendance: Array(daysInMonth).fill(false) },
  ]);

  const toggleAttendance = (empIndex, dayIndex) => {
    setEmployees((prevEmployees) => {
      const updatedEmployees = [...prevEmployees];
      updatedEmployees[empIndex].attendance[dayIndex] = !updatedEmployees[empIndex].attendance[dayIndex];
      return updatedEmployees;
    });
  };

  const changeMonth = (direction) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const changeYear = (direction) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setFullYear(newDate.getFullYear() + direction);
      return newDate;
    });
  };

  return (
    <div className="p-10">
      <h2 className="font-bold text-2xl">Dashboard</h2>
      <h2 className="text-gray-500">This marks the start of our project</h2>

      <div className="flex gap-4 my-4">
        <button onClick={() => changeMonth(-1)} className="px-4 py-2 bg-gray-300 rounded">Prev Month</button>
        <span className="font-semibold text-lg">{currentDate.toLocaleString('default', { month: 'long' })} {year}</span>
        <button onClick={() => changeMonth(1)} className="px-4 py-2 bg-gray-300 rounded">Next Month</button>
        <button onClick={() => changeYear(-1)} className="px-4 py-2 bg-gray-300 rounded">Prev Year</button>
        <button onClick={() => changeYear(1)} className="px-4 py-2 bg-gray-300 rounded">Next Year</button>
      </div>

      <div className="overflow-x-auto my-5">
        <table className="min-w-full bg-white shadow-md rounded-lg border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">ID</th>
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Role</th>
              <th className="py-3 px-6 text-left">Status</th>
              {Array.from({ length: daysInMonth }, (_, i) => (
                <th key={i} className="py-3 px-2 text-center">{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm font-light">
            {employees.map((employee, empIndex) => (
              <tr
                key={employee.id}
                className="border-b border-gray-200 hover:bg-gray-100"
              >
                <td className="py-3 px-6 text-left">{employee.id}</td>
                <td className="py-3 px-6 text-left">{employee.name}</td>
                <td className="py-3 px-6 text-left">{employee.role}</td>
                <td className="py-3 px-6 text-left">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      employee.status === 'Active'
                        ? 'bg-green-200 text-green-800'
                        : employee.status === 'Pending'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {employee.status}
                  </span>
                </td>
                {employee.attendance.map((attended, dayIndex) => (
                  <td key={dayIndex} className="py-3 px-2 text-center">
                    <input
                      type="checkbox"
                      checked={attended}
                      onChange={() => toggleAttendance(empIndex, dayIndex)}
                      className="cursor-pointer"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;