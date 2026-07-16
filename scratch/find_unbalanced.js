const fs = require('fs');

const content = fs.readFileSync('frontend/src/app/kpis/page.tsx', 'utf8');
const lines = content.split('\n');

let braces = 0;
let parens = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '{') braces++;
    if (line[j] === '}') braces--;
    if (line[j] === '(') parens++;
    if (line[j] === ')') parens--;
  }
  if (braces < 0) {
    console.log(`Braces negative at line ${i + 1}: ${braces}`);
    console.log(`Line content: ${line}`);
    break;
  }
  if (parens < 0) {
    console.log(`Parens negative at line ${i + 1}: ${parens}`);
    console.log(`Line content: ${line}`);
    break;
  }
}
if (braces === 0 && parens === 0) {
  console.log('No imbalance found scanning entire file!');
} else {
  console.log(`Final scan balance: braces=${braces}, parens=${parens}`);
}
