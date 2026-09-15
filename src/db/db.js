// db.js — PostgreSQL connection pool, configured from .env.
// Every query in the app goes through this same pool.
const { Pool, types } = require("pg");
// Keep DATE columns as plain "YYYY-MM-DD" strings instead of
// converting them to JS Date objects, which shifts by timezone
types.setTypeParser(1082, (val) => val);

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

module.exports = pool;
