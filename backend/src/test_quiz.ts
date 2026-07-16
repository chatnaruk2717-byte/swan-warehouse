import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connString = process.env.DATABASE_URL;
if (!connString) {
  console.error('DATABASE_URL is not defined in .env');
  process.exit(1);
}

async function main() {
  let connection;
  try {
    connection = await mysql.createConnection({
      uri: connString,
      ssl: { rejectUnauthorized: false }
    });
    console.log('Connected to MySQL database!');

    const [courses] = await connection.query('SELECT id, name FROM courses');
    console.log('\n--- Courses ---');
    console.table(courses);

    const [lessons] = await connection.query('SELECT id, chapter_id, title, content_type FROM lessons');
    console.log('\n--- Lessons ---');
    console.table(lessons);

    const [questions] = await connection.query('SELECT id, lesson_id, question_text FROM questions');
    console.log('\n--- Questions ---');
    console.table(questions);
  } catch (err: any) {
    console.error('Error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

main();
