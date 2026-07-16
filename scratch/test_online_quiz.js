async function main() {
  const url = 'https://swan-warehouse-api.onrender.com';
  try {
    const token = 'mock_jwt_token_for_admin';
    console.log('Using mock token:', token);

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
