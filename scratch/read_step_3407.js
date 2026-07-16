const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\chatn\\.gemini\\antigravity\\brain\\28bd0357-6b2d-4631-9653-a3834d3db9c0\\.system_generated\\logs\\transcript.jsonl';

if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  for (let i = 3400; i <= 3415; i++) {
    console.log(`Line ${i}: ${lines[i - 1]}`);
  }
} else {
  console.log('Log file not found');
}
