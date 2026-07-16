const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPath = 'C:\\Users\\chatn\\.gemini\\antigravity\\brain\\28bd0357-6b2d-4631-9653-a3834d3db9c0\\.system_generated\\logs\\transcript_full.jsonl';

const rl = readline.createInterface({
  input: fs.createReadStream(logPath),
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  const obj = JSON.parse(line);
  if (obj.step_index === 3432) {
    console.log(JSON.stringify(obj, null, 2));
    rl.close();
  }
});
