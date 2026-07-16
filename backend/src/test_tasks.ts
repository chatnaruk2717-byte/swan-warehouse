import { query } from './config/db';

async function run() {
  try {
    const qStr = `
      SELECT t.*, u.name as employee_name, u.employee_id as emp_code
      FROM daily_tasks t 
      JOIN users u ON t.employee_id = u.id 
      ORDER BY t.due_date DESC, t.id DESC
    `;
    const res = await query(qStr, []);
    console.log("--- TASKS QUERY SUCCESS ---");
    console.log("Rows returned:", res.rows.length);
    console.table(res.rows);
  } catch (err: any) {
    console.error("--- TASKS QUERY FAILED ---");
    console.error("Error:", err.message);
  }
}

run();
