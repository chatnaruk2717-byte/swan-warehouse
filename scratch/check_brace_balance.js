const fs = require('fs');

const content = fs.readFileSync('frontend/src/app/kpis/page.tsx', 'utf8');

let braces = 0;
let parens = 0;
let brackets = 0;

for (let i = 0; i < content.length; i++) {
  if (content[i] === '{') braces++;
  if (content[i] === '}') braces--;
  if (content[i] === '(') parens++;
  if (content[i] === ')') parens--;
  if (content[i] === '[') brackets++;
  if (content[i] === ']') brackets--;
}

console.log('Braces balance (should be 0):', braces);
console.log('Parens balance (should be 0):', parens);
console.log('Brackets balance (should be 0):', brackets);
