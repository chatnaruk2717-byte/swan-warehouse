const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\chatn\\.gemini\\antigravity\\brain\\28bd0357-6b2d-4631-9653-a3834d3db9c0\\.system_generated\\logs\\transcript.jsonl';

if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('aiven') || line.includes('mysql://') || line.includes('DATABASE_URL')) {
      if (line.includes('PLANNER_RESPONSE') || line.includes('USER_INPUT')) {
        console.log(`Line ${idx + 1}: ${line.substring(0, 1000)}`);
      }
    }
  });
} else {
  console.log('Log file not found');
}
