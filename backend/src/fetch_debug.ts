import https from 'https';

function request(method: string, path: string, body?: any, headers: any = {}) {
  return new Promise<any>((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const options: any = {
      hostname: 'swan-warehouse-api.onrender.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null }); }
        catch (e) { resolve({ status: res.statusCode, data: data }); }
      });
    });
    req.on('error', reject);
    if (body) { req.write(postData); }
    req.end();
  });
}

async function testQuery() {
  try {
    const loginRes = await request('POST', '/api/auth/login', {
      loginIdentifier: '28536',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log("Logged in as Admin. Token retrieved.");

    console.log("Fetching all enrollments directly using debug endpoint or similar...");
    // Let's modify our test script to fetch all enrollments for a user that has been enrolled, or query the db directly.
    // Wait, let's look at /api/performance/employees, does it return completed courses?
    const perfRes = await request('GET', '/api/performance/employees', null, {
      'Authorization': `Bearer ${token}`
    });
    console.log("Employees performance data:", perfRes.data);

    // Let's also retrieve the enrollments list for employee 48
    const enrollmentsEmp = await request('GET', `/api/courses/enrollments/employee/48`, null, {
      'Authorization': `Bearer ${token}`
    });
    console.log("Enrollments for employee 48:", enrollmentsEmp.data);
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

testQuery();




