const API_BASE_URL = 'http://localhost:5001';

export async function fetchEmployees(month, year) {
  const res = await fetch(`${API_BASE_URL}/attendance/${year}/${month}`);
  if (!res.ok) throw new Error("Failed to fetch employees");
  const attendanceData = await res.json();
  console.log("Fetched Attendance Data:", attendanceData);

  const daysInMonth = new Date(year, month, 0).getDate();
  const employeesMap = new Map();

  attendanceData.forEach(({ employee_id, name, date, status }) => {
    if (!employeesMap.has(employee_id)) {
      employeesMap.set(employee_id, {
        id: employee_id,
        name,
        attendance: Array(daysInMonth).fill(false),
        supervisor: "N/A", // Adjust based on your data
      });
    }
    const day = new Date(date).getDate() - 1;
    employeesMap.get(employee_id).attendance[day] = status === 'present';
  });

  const employees = Array.from(employeesMap.values()).map(emp => ({
    ...emp,
    present: emp.attendance.filter(Boolean).length,
    totalDays: daysInMonth,
    percentage: ((emp.present / daysInMonth) * 100).toFixed(0) + '%',
  }));

  console.log("Processed Employees Data:", employees);
  return employees;
}

export async function updateAttendance(employeeId, date, status) {
  await fetch(`/attendance/${employeeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, status }),
  });
}