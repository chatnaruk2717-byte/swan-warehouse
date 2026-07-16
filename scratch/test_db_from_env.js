const fs = require('fs');
const path = require('path');

const paths = [
  path.join(__dirname, '../.env'),
  path.join(__dirname, '../backend/.env'),
  path.join(__dirname, '../frontend/.env')
];

paths.forEach(p => {
  console.log(`Path: ${p}, Exists: ${fs.existsSync(p)}`);
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf8');
    console.log(`Content length: ${content.length}`);
    console.log(content.split('\n').map(l => l.startsWith('DATABASE_URL') ? 'DATABASE_URL=FOUND' : l).join('\n'));
  }
});
