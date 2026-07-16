const { execSync } = require('child_process');

try {
  const content = execSync('git show e41c8b0:frontend/src/app/kpis/page.tsx', { encoding: 'utf8' });
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('setEditTarget(kpi.target)')) {
      console.log(`Found at line ${i + 1}`);
      for (let j = i - 5; j <= i + 5; j++) {
        console.log(`${j + 1}: ${lines[j]}`);
      }
    }
  }
} catch (e) {
  console.error(e.message);
}
