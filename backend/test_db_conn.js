const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Load environment variables
const envPaths = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '../.env')
];
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    require('dotenv').config({ path: p });
    break;
  }
}
require('dotenv').config();

console.log('=== MySQL Connection Diagnostic ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL || '(not set)');
console.log('USE_MOCK_DB:', process.env.USE_MOCK_DB || 'false');
console.log('PORT:', process.env.PORT || '5000');

const connString = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/warehouse_db';
const isSsl = connString.includes('ssl=') || process.env.DB_SSL === 'true';

console.log('Connecting to:', connString.replace(/:[^:@]+@/, ':****@'));

async function check() {
  let connection;
  try {
    const connOptions = { uri: connString };
    if (isSsl) {
      connOptions.ssl = { rejectUnauthorized: false };
    }
    
    connection = await mysql.createConnection(connOptions);
    console.log('\n SUCCESS: Connected to MySQL database!');
    
    const [users] = await connection.query('SELECT id, employee_id, name, role, email FROM users LIMIT 5');
    console.log('\n--- Sample Users in Database ---');
    console.table(users);

    const [courses] = await connection.query('SELECT id, name, category, instructor, duration_minutes FROM courses LIMIT 5');
    console.log('\n--- Sample Courses in Database ---');
    console.table(courses);

    const [skills] = await connection.query('SELECT id, name, category FROM skills LIMIT 5');
    console.log('\n--- Sample Skills in Database ---');
    console.table(skills);

    const [layouts] = await connection.query('SELECT id, zone_name, storage_level, product_type FROM warehouse_layouts LIMIT 5');
    console.log('\n--- Sample Warehouse Layouts ---');
    console.table(layouts);

    console.log('\n Database is fully functional and ready for backend & frontend!');
  } catch (err) {
    console.error('\n❌ DATABASE CONNECTION ERROR:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

check();
