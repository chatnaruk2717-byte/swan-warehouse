const fs = require('fs');
const path = require('path');
const AdmZip = require(path.join(__dirname, 'frontend/node_modules/adm-zip'));

const zip = new AdmZip();
const rootDir = __dirname;
const outputZip = path.join(rootDir, 'warehouse-system-cloud-handover.zip');

const ignoredDirs = new Set([
  'node_modules',
  '.next',
  'dist',
  '.git',
  'out',
  '.wrangler',
  'scratch',
  '.vscode',
  '.idea'
]);

const ignoredExtensions = new Set(['.zip', '.log']);

function addDirectoryToZip(currentDir, zipPath = '') {
  const items = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(currentDir, item.name);
    const relativeZipPath = zipPath ? `${zipPath}/${item.name}` : item.name;

    if (item.isDirectory()) {
      if (!ignoredDirs.has(item.name)) {
        addDirectoryToZip(fullPath, relativeZipPath);
      }
    } else if (item.isFile()) {
      const ext = path.extname(item.name).toLowerCase();
      if (!ignoredExtensions.has(ext) && item.name !== 'warehouse-system-cloud-handover.zip') {
        const fileContent = fs.readFileSync(fullPath);
        const zipDir = path.dirname(relativeZipPath);
        zip.addFile(relativeZipPath, fileContent);
      }
    }
  }
}

console.log('Packaging warehouse project for IT handover...');
addDirectoryToZip(rootDir);

if (fs.existsSync(outputZip)) {
  fs.unlinkSync(outputZip);
}

zip.writeZip(outputZip);
const stats = fs.statSync(outputZip);
console.log(`[SUCCESS] Created clean archive: warehouse-system-cloud-handover.zip (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
