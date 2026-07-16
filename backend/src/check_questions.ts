import fs from 'fs';
import mysql from 'mysql2/promise';

async function main() {
  try {
    const logLine = fs.readFileSync('C:\\Users\\chatn\\OneDrive\\Desktop\\Leaning\\scratch\\db_info.txt', 'utf8');
    const match = logLine.match(/mysql:\/\/avnadmin:[^"'\s\)\\]+/);
    if (!match) {
      console.error('Could not find connection string in db_info.txt');
      return;
    }
    const connectionString = match[0].replace(/[`"'\s\)]+$/, '');
    console.log('Connecting to database...');

    const connection = await mysql.createConnection(connectionString);
    console.log('Connected to MySQL!');

    const [questions] = await connection.query('SELECT id, lesson_id, question_text, points FROM questions');
    console.log('\n--- Questions in DB ---');
    console.table(questions);

    const [lessons] = await connection.query('SELECT id, chapter_id, title, content_type FROM lessons');
    console.log('\n--- Lessons in DB ---');
    console.table(lessons);

    await connection.end();
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

main();
