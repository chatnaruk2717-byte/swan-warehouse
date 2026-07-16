const fs = require('fs');

const content = fs.readFileSync('frontend/src/app/kpis/page.tsx', 'utf8');

const stack = [];
for (let i = 0; i < content.length; i++) {
  if (content[i] === '(') {
    stack.push(i);
  } else if (content[i] === ')') {
    if (stack.length > 0) {
      stack.pop();
    } else {
      console.log(`Unmatched close paren ')' at index ${i}`);
    }
  }
}

console.log('Unmatched open parens left in stack:', stack.length);
stack.forEach(idx => {
  const lineNum = content.substring(0, idx).split('\n').length;
  console.log(`Unmatched '(' at line ${lineNum}:`);
  const lines = content.split('\n');
  console.log(`  ${lines[lineNum - 1]}`);
});
