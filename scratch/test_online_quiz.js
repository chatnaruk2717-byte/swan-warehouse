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

    console.log('Submitting quiz for lesson 21...');
    const submitRes = await fetch(`${url}/api/courses/lesson/21/quiz-submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        answers: { 20: [1], 21: [2], 22: [2], 23: [1], 24: [1], 25: [1], 26: [1], 27: [0], 28: [1], 29: [1] },
        questionIds: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29]
      })
    });
    
    const status = submitRes.status;
    const resText = await submitRes.text();
    console.log('API Response Status:', status);
    console.log('API Response Body:', resText);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
