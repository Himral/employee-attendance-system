import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function AddNewEmployee() {
  const [employees, setEmployees] = useState([{ name: "", role: "", salary: "" }]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleAddRow = () => {
    setEmployees([...employees, { name: "", role: "", salary: "" }]);
  };

  const handleDeleteRow = (index) => {
    const updatedEmployees = employees.filter((_, i) => i !== index);
    setEmployees(updatedEmployees);
  };

  const handleInputChange = (index, field, value) => {
    const updatedEmployees = [...employees];
    updatedEmployees[index][field] = value;
    setEmployees(updatedEmployees);
  };

  const handleAddEmployees = async () => {
    const response = await fetch("http://localhost:5001/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(employees),
    });
    if (response.ok) {
      setMessage("Employees successfully added!");
      setTimeout(() => setMessage(""), 3000);
      setOpen(false);
      setEmployees([{ name: "", role: "", salary: "" }]);
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-pink-200 hover:bg-sky-300">Add New Employees</Button>
        </DialogTrigger>
        <DialogContent className="bg-white shadow-lg border border-gray-300 p-4">
          <DialogHeader>
            <DialogTitle>Add New Employees</DialogTitle>
          </DialogHeader>
          {message && <p className="text-green-500 text-center">{message}</p>}
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Name</th>
                <th className="border border-gray-300 p-2">Role</th>
                <th className="border border-gray-300 p-2">Salary</th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">
                    <input
                      type="text"
                      value={employee.name}
                      onChange={(e) => handleInputChange(index, "name", e.target.value)}
                      className="w-full border border-gray-300 p-1"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <input
                      type="text"
                      value={employee.role}
                      onChange={(e) => handleInputChange(index, "role", e.target.value)}
                      className="w-full border border-gray-300 p-1"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <input
                      type="number"
                      value={employee.salary}
                      onChange={(e) => handleInputChange(index, "salary", e.target.value)}
                      className="w-full border border-gray-300 p-1"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <Button onClick={() => handleDeleteRow(index)} className="bg-red-200 hover:bg-red-300">Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-4 mt-4">
            <Button onClick={handleAddRow} className="bg-green-200 hover:bg-green-300">+ Add Row</Button>
            <Button onClick={handleAddEmployees} className="bg-blue-200 hover:bg-blue-300">Submit</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewEmployee;