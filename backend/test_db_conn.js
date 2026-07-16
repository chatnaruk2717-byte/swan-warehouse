const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Load environment variables if backend/.env exists
const envPath = path.join(__dirname, '../../../../../../../OneDrive/Desktop/Leaning/backend/.env');
// Also try loading from root directory
const rootEnvPath = path.join(__dirname, '../../../../../../../OneDrive/Desktop/Leaning/.env');

if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else if (fs.existsSync(rootEnvPath)) {
  require('dotenv').config({ path: rootEnvPath });
} else {
  require('dotenv').config();
}

console.log('--- Environment Check ---');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'FOUND (Hidden for safety)' : 'NOT FOUND');
console.log('USE_MOCK_DB:', process.env.USE_MOCK_DB);
console.log('PORT:', process.env.PORT);

const connString = process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/warehouse_db';
console.log('Attempting to connect to database using connection string:', connString.split('@')[1] || connString);

async function check() {
  let connection;
  try {
    connection = await mysql.createConnection({
      uri: connString,
      ssl: { rejectUnauthorized: false }
    });

    console.log('CONNECTED successfully to MySQL database!');
    
    const [courses] = await connection.query('SELECT id, name, category, instructor, duration_minutes FROM courses');
    console.log('\n--- Courses in Database ---');
    console.table(courses);

    const [chapters] = await connection.query('SELECT id, course_id, title, sort_order FROM chapters');
    console.log('\n--- Chapters in Database ---');
    console.table(chapters);

    const [lessons] = await connection.query('SELECT id, chapter_id, title, content_type, content_url FROM lessons');
    console.log('\n--- Lessons in Database ---');
    console.table(lessons);

  } catch (err) {
    console.error('DATABASE CONNECTION ERROR:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

check();
