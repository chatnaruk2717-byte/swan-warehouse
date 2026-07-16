const fs = require('fs');

const content = fs.readFileSync('frontend/src/app/kpis/page.tsx', 'utf8');
const lines = content.split('\n');

let braces = 0;
let parens = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const prevParens = parens;
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '{') braces++;
    if (line[j] === '}') braces--;
    if (line[j] === '(') parens++;
    if (line[j] === ')') parens--;
  }
  if (i + 1 >= 661 && i + 1 <= 804) {
    console.log(`Line ${i + 1}: parens was ${prevParens} -> now ${parens} | ${line.trim().substring(0, 50)}`);
  }
}
