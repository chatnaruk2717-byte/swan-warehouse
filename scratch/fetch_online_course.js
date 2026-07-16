async function main() {
  const url = 'https://swan-warehouse-api.onrender.com';
  try {
    console.log('Logging in...');
    const loginRes = await fetch(`${url}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loginIdentifier: 'kall@gmail.com',
        password: 'password123'
      })
    });
    
    if (!loginRes.ok) {
      throw new Error(`Login failed: ${loginRes.status}`);
    }
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Logged in successfully!');

    console.log('Fetching course 7 details from online API...');
    const res = await fetch(`${url}/api/courses/7`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch course: ${res.status}`);
    }
    const course = await res.json();
    console.log('\n--- Course Details ---');
    console.log(`ID: ${course.id}`);
    console.log(`Name: ${course.name}`);

    console.log('\n--- Chapters and Lessons ---');
    course.chapters.forEach((ch) => {
      console.log(`Chapter: ${ch.title} (ID: ${ch.id})`);
      ch.lessons.forEach((l) => {
        console.log(`  Lesson: ${l.title} (ID: ${l.id}, Type: ${l.content_type})`);
        if (l.questions) {
          console.log(`    Questions count: ${l.questions.length}`);
          l.questions.forEach((q) => {
            console.log(`      Question (ID: ${q.id}): ${q.question_text}`);
            console.log(`        Options: ${JSON.stringify(q.options)}`);
          });
        } else {
          console.log(`    Questions: NONE/UNDEFINED`);
        }
      });
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
