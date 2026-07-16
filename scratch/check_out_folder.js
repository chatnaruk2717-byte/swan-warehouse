const fs = require('fs');
const path = require('path');

const kpisPath = path.join(__dirname, '../frontend/out/kpis.html');
const kpisDir = path.join(__dirname, '../frontend/out/kpis/index.html');

console.log('kpis.html exists:', fs.existsSync(kpisPath));
if (fs.existsSync(kpisPath)) {
  const content = fs.readFileSync(kpisPath, 'utf8');
  console.log('kpis.html Contains "หน่วยนับ" (Unit):', content.includes('หน่วยนับ'));
}

console.log('kpis/index.html exists:', fs.existsSync(kpisDir));
if (fs.existsSync(kpisDir)) {
  const content = fs.readFileSync(kpisDir, 'utf8');
  console.log('kpis/index.html Contains "หน่วยนับ" (Unit):', content.includes('หน่วยนับ'));
}
