const fs = require('fs');
const content = fs.readFileSync('frontend/src/app/kpis/page.tsx', 'utf8');
const lines = content.split('\n');
for (let i = 1; i <= 40; i++) {
  console.log(`${i}: ${lines[i - 1]}`);
}
