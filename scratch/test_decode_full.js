const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/app/kpis/page.tsx');
// Read the file as raw binary string (ISO-8859-1)
const binaryContent = fs.readFileSync(filePath, 'binary');

// Convert it back to a UTF-8 string
const buffer = Buffer.from(binaryContent, 'binary');
const utf8Content = buffer.toString('utf8');

// Print some lines containing Thai to see if they are fixed!
const lines = utf8Content.split('\n');
for (let i = 85; i <= 105; i++) {
  if (lines[i - 1]) {
    console.log(`${i}: ${lines[i - 1]}`);
  }
}
