import { query } from './config/db';

async function run() {
  try {
    const res = await query('SELECT id, employee_id, name, role, department, position FROM users', []);
    console.log("--- ALL USERS IN DB ---");
    console.log("Rows returned:", res.rows.length);
    console.table(res.rows);
  } catch (err: any) {
    console.error("Query failed:", err.message);
  }
}

run();
