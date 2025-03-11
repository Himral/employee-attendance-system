const { Client } = require('pg');

const client = new Client({
    user: 'your_user',
    host: 'localhost',
    database: 'your_database',
    password: 'your_password',
    port: 5432,
});

async function setupDatabase() {
    try {
        await client.connect();
        console.log("Connected to the database");

        const queries = [
            "DROP TABLE IF EXISTS attendance, salaries, employees, departments;",
            `CREATE TABLE departments (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE
            );`,
            `CREATE TABLE employees (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                role VARCHAR(100) NOT NULL,
                department_id INT REFERENCES departments(id) ON DELETE SET NULL,
                salary_per_day DECIMAL(10,2) NOT NULL,
                extra_expense_per_day DECIMAL(10,2) DEFAULT 0,
                join_date DATE DEFAULT CURRENT_DATE
            );`,
            `CREATE TABLE attendance (
                id SERIAL PRIMARY KEY,
                employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
                date DATE NOT NULL DEFAULT CURRENT_DATE,
                status VARCHAR(10) CHECK (status IN ('Present', 'Absent', 'Late', 'Leave')) NOT NULL
            );`,
            `CREATE TABLE salaries (
                id SERIAL PRIMARY KEY,
                employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
                month_year DATE NOT NULL,
                total_days INT NOT NULL,
                days_present INT NOT NULL,
                total_salary DECIMAL(10,2) NOT NULL,
                extra_expenses DECIMAL(10,2) NOT NULL,
                net_salary DECIMAL(10,2) NOT NULL
            );`,
            `INSERT INTO departments (name) VALUES 
                ('Production'),
                ('Quality Control'),
                ('Logistics'),
                ('Administration');`,
            `INSERT INTO employees (name, role, department_id, salary_per_day, extra_expense_per_day) VALUES 
                ('Amit Sharma', 'Machine Operator', 1, 800, 50),
                ('Ravi Kumar', 'Quality Inspector', 2, 900, 30),
                ('Neha Gupta', 'Supervisor', 3, 1200, 80),
                ('Priya Rathi', 'HR Manager', 4, 1500, 100);`,
            `INSERT INTO attendance (employee_id, date, status) VALUES 
                (1, '2025-03-01', 'Present'),
                (1, '2025-03-02', 'Absent'),
                (2, '2025-03-01', 'Present'),
                (3, '2025-03-01', 'Late'),
                (4, '2025-03-01', 'Leave');`
        ];

        for (const query of queries) {
            await client.query(query);
        }

        console.log("Database setup complete");
    } catch (err) {
        console.error("Error setting up database:", err);
    } finally {
        await client.end();
        console.log("Database connection closed");
    }
}

setupDatabase();