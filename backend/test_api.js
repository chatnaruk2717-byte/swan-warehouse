const https = require('https');

const baseUrl = 'swan-warehouse.onrender.com';

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    
    const options = {
      hostname: baseUrl,
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
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (body) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTest() {
  console.log('--- Testing Live API using HTTPS module ---');
  try {
    console.log('Logging in as admin@warehouse.com...');
    const loginRes = await request('POST', '/api/auth/login', {
      loginIdentifier: 'admin@warehouse.com',
      password: 'password123'
    });

    if (loginRes.status !== 200) {
      console.error('Login failed! Status:', loginRes.status, loginRes.data);
      return;
    }

    const { token, user } = loginRes.data;
    console.log('Logged in successfully!');
    console.log('User Role:', user.role);

    console.log('\nFetching /api/employees...');
    const empRes = await request('GET', '/api/employees', null, {
      Authorization: `Bearer ${token}`
    });

    console.log('Response Status:', empRes.status);
    if (empRes.status === 200) {
      console.log('SUCCESS! Number of employees returned:', empRes.data.length);
      console.log('Employees preview:', empRes.data.slice(0, 3).map(e => ({ id: e.id, name: e.name, role: e.role })));
    } else {
      console.log('FAILED! Error data:', empRes.data);
    }

  } catch (err) {
    console.error('Error during test:', err.message);
  }
}

runTest();
