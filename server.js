require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./utils/db');


const app = express();
app.use(cors());
app.use(express.json());

// Get all employees with attendance
app.get('/employees', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM employees');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add multiple employees
app.post("/employees", async (req, res) => {
  try {
    const employees = req.body; // Expecting an array of employees

    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ error: "Invalid input. Expected an array of employees." });
    }

    // Create query placeholders dynamically
    const values = [];
    const placeholders = employees.map((emp, index) => {
      const baseIndex = index * 3;
      values.push(emp.name, emp.role, emp.salary);
      return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3})`;
    }).join(", ");

    const query = `
      INSERT INTO employees (name, role, salary) 
      VALUES ${placeholders} 
      RETURNING *;
    `;

    const result = await db.query(query, values);
    
    res.status(201).json({ message: "Employees added successfully!", employees: result.rows });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Failed to add employees" });
  }
});

// Update attendance for an employee
app.put('/attendance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date ,status } = req.body;
    const result = await db.query(
      'UPDATE attendance SET status = $2 WHERE date = $1 AND employee_id = $3 RETURNING *',
      [date ,status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//Delete Record from the table
app.delete('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM employees WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({ message: "Employee deleted successfully", employee: result.rows[0] });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Failed to delete employee" });
  }
});

//Get employee attendance for a given month and year
// Get employee attendance for a given month and year
app.get('/attendance/:year/:month', async (req, res) => {
  const { year, month } = req.params;
  try {
    const result = await db.query(
      `SELECT e.id AS employee_id, e.name, a.date, a.status 
       FROM employees e
       JOIN attendance a ON e.id = a.employee_id
       WHERE EXTRACT(YEAR FROM a.date) = $1 AND EXTRACT(MONTH FROM a.date) = $2
       ORDER BY a.date`,
      [year, month]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//Update single date attendance of an employee
// app.put('/attendance/:employeeId/:date/:month/:year', async(req,res) => {
//   try{

//   }
// })
// Update single day attendance
app.put('/attendance/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    let { date, status } = req.body;

    if (!date || !status) {
      return res.status(400).json({ error: "Date and status are required" });
    }

    // Convert incoming date to YYYY-MM-DD
    const formattedDate = new Date(date).toISOString().split("T")[0];

    // Check if the attendance record exists
    const existingRecord = await db.query(
      `SELECT * FROM attendance WHERE employee_id = $1 AND date = $2`,
      [employeeId, formattedDate]
    );

    if (existingRecord.rowCount === 0) {
      // Insert a new record if it does not exist
      await db.query(
        `INSERT INTO attendance (employee_id, date, status) VALUES ($1, $2, 'NotSet')`,
        [employeeId, formattedDate]
      );
    }

    // Update the record with the new status
    const result = await db.query(
      `UPDATE attendance 
       SET status = $3 
       WHERE employee_id = $1 AND date = $2 
       RETURNING id, employee_id, date::TEXT, status`, // Ensures date is returned as a plain string
      [employeeId, formattedDate.split("T")[0], status]
    );

    // Send the response with properly formatted date
    res.status(200).json({
      success: true,
      updatedRecord: {
        ...result.rows[0],
        date: result.rows[0].date, // Ensure YYYY-MM-DD format
      }
    });

  } catch (err) {
    console.error("Error updating attendance:", err);
    res.status(500).json({ error: "Failed to update attendance" });
  }
});



app.listen(5001, () => console.log("Server running on port 5001"));
