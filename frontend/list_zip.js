const AdmZip = require('adm-zip');
const path = require('path');

try {
  const zipPath = path.join(__dirname, 'out_updated.zip');
  const zip = new AdmZip(zipPath);
  const zipEntries = zip.getEntries();

  console.log('Total files in ZIP:', zipEntries.length);
  console.log('Sample file paths in ZIP (first 30):');
  zipEntries.slice(0, 30).forEach(entry => {
    console.log('-', entry.entryName);
  });
} catch (e) {
  console.error('Error listing zip:', e.message);
}
