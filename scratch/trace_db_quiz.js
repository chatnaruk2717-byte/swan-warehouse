const fs = require('fs');
const mysql = require('mysql2/promise');

async function main() {
  try {
    const logLine = fs.readFileSync('C:\\Users\\chatn\\OneDrive\\Desktop\\Leaning\\scratch\\db_info.txt', 'utf8');
    // Extract connection string matches. Typical pattern: mysql://avnadmin:[^"'\s\)]+
    const match = logLine.match(/mysql:\/\/avnadmin:[^"'\s\)\\]+/);
    if (!match) {
      console.error('Could not find connection string in db_info.txt');
      return;
    }
    const connectionString = match[0];
    console.log('Database URL parsed from log history. Connecting...');

    const connection = await mysql.createConnection({
      uri: connectionString,
      ssl: { rejectUnauthorized: false }
    });
    console.log('Connected to Aiven.io MySQL database!');

    const [courses] = await connection.query('SELECT id, name FROM courses');
    console.log('\n--- Courses ---');
    console.table(courses);

    const [chapters] = await connection.query('SELECT id, course_id, title FROM chapters');
    console.log('\n--- Chapters ---');
    console.table(chapters);

    const [lessons] = await connection.query('SELECT id, chapter_id, title, content_type FROM lessons');
    console.log('\n--- Lessons ---');
    console.table(lessons);

    const [questions] = await connection.query('SELECT id, lesson_id, question_text FROM questions');
    console.log('\n--- Questions ---');
    console.table(questions);

    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
