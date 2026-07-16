const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\chatn\\.gemini\\antigravity\\brain\\28bd0357-6b2d-4631-9653-a3834d3db9c0\\.system_generated\\logs\\transcript.jsonl';

if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('เข้าไม่ได้') || line.includes('กำลังโหลดระบบ')) {
      console.log(`Line ${idx + 1}: ${line.substring(0, 300)}`);
    }
  });
} else {
  console.log('Log file not found at path:', logPath);
}
