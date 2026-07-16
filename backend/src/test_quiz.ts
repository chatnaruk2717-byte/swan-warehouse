import { query } from './config/db';

async function run() {
  try {
    const lessonId = 5; // Safety Quiz
    const questionsResult = await query(
      'SELECT id, correct_answers, points FROM questions WHERE lesson_id = $1',
      [lessonId]
    );
    const questions = questionsResult.rows;

    console.log("--- QUESTIONS FROM DB ---");
    for (const q of questions) {
      console.log(`ID: ${q.id}, Type of correct_answers: ${typeof q.correct_answers}`);
      console.log("correct_answers:", q.correct_answers);
      console.log("Is array:", Array.isArray(q.correct_answers));

      let correct = q.correct_answers;
      if (typeof correct === 'string') {
        try {
          correct = JSON.parse(correct);
          console.log("  Parsed correct_answers:", correct, "Is array:", Array.isArray(correct));
        } catch (e: any) {
          console.error("  Parse error:", e.message);
        }
      }
    }
  } catch (err: any) {
    console.error("Query failed:", err.message);
  }
}

run();
