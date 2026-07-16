const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const envPath = path.join(__dirname, '../backend/.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}

const connString = process.env.DATABASE_URL;
if (!connString) {
  console.error('DATABASE_URL is not defined in backend/.env');
  process.exit(1);
}

async function main() {
  let connection;
  try {
    connection = await mysql.createConnection({
      uri: connString,
      ssl: { rejectUnauthorized: false }
    });
    console.log('Successfully connected to database!');

    const [users] = await connection.query('SELECT id, employee_id, email, name, role FROM users LIMIT 20');
    console.log('\n--- Users in Database ---');
    console.table(users);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

main();
