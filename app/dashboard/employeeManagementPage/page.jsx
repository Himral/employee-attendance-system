"use client";
import { useState, useEffect, useMemo } from "react";
import { HotTable } from "@handsontable/react";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.min.css";
import { Button } from '@/components/ui/button';
import { fetchEmployees, updateAttendance } from '@/utils/api';

// Register the checkbox cell type
Handsontable.cellTypes.registerCellType('checkbox', {
  editor: Handsontable.editors.CheckboxEditor,
  renderer: Handsontable.renderers.CheckboxRenderer,
});

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const daysInMonth = new Date(year, month, 0).getDate();

  useEffect(() => {
    setLoading(true);
    fetchEmployees(month, year)
      .then(setEmployees)
      .catch(err => {
        console.error("Error fetching employees:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [month, year]);

  const handleCheckboxChange = async (row, col, checked) => {
    const employee = employees[row];
    const date = new Date(year, month - 1, col + 1).toISOString().split('T')[0];
    await updateAttendance(employee.id, date, checked ? 'present' : 'absent');
    setEmployees(prev => {
      const updated = [...prev];
      updated[row].attendance[col] = checked;
      updated[row].present = updated[row].attendance.filter(Boolean).length;
      updated[row].percentage = ((updated[row].present / daysInMonth) * 100).toFixed(0) + '%';
      return updated;
    });
  };

  const data = useMemo(() => {
    return employees.map(emp => [
      emp.id,
      emp.name,
      emp.supervisor,
      ...emp.attendance,
      emp.present,
      daysInMonth,
      emp.percentage
    ]);
  }, [employees, daysInMonth]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4 items-center">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMonth(m => m > 1 ? m - 1 : 12)}>
            ← Month
          </Button>
          <Button variant="outline" onClick={() => setYear(y => y - 1)}>
            ← Year
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-medium">{new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}</span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMonth(m => m < 12 ? m + 1 : 1)}>
            Month →
          </Button>
          <Button variant="outline" onClick={() => setYear(y => y + 1)}>
            Year →
          </Button>
        </div>
      </div>

      <HotTable
        data={data}
        colHeaders={[
          'Emp ID',
          'Name',
          'Supervisor',
          ...Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
          'Present',
          'Total',
          '%'
        ]}
        rowHeaders={true}
        licenseKey="non-commercial-and-evaluation"
        height="600"
        contextMenu={true}
        afterChange={(changes) => {
          changes?.forEach(([row, col, _, newValue]) => {
            if (col >= 3 && col < daysInMonth + 3) {
              handleCheckboxChange(row, col - 3, newValue);
            }
          });
        }}
        cells={(row, col) => {
          if (col >= 3 && col < daysInMonth + 3) {
            return { type: 'checkbox', className: 'htCenter' };
          }
          return {};
        }}
      />
    </div>
  );
}