const { execSync } = require('child_process');

try {
  const content = execSync('git show e41c8b0:frontend/src/app/kpis/page.tsx', { encoding: 'utf8' });
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Visual') || lines[i].includes('Chart') || lines[i].includes('chart')) {
      console.log(`Line ${i + 1}: ${lines[i]}`);
    }
  }
} catch (e) {
  console.error(e.message);
}
