const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../frontend/src/app/kpis/page.tsx');
const outPath = path.join(__dirname, '../frontend/out/kpis.html');

console.log('src mtime:', fs.statSync(srcPath).mtime);
console.log('out mtime:', fs.statSync(outPath).mtime);
