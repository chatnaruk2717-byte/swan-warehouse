const { execSync } = require('child_process');

try {
  const content = execSync('git show e41c8b0:frontend/src/app/kpis/page.tsx', { encoding: 'utf8' });
  const lines = content.split('\n');
  
  // Search for the end of getKpiGradeAndScore
  for (let i = 230; i <= 260; i++) {
    console.log(`${i}: ${lines[i - 1]}`);
  }
} catch (e) {
  console.error(e.message);
}
