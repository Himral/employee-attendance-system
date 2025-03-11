const { Pool } = require('pg');

const db = new Pool({
  user: 'postgres',      // Your PostgreSQL username
  host: 'localhost',     // Database host
  database: 'attendance_db', // Your database name
  password: '1234', // Your PostgreSQL password
  port: 5432,            // Default PostgreSQL port
});

module.exports = db;
