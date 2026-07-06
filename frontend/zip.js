const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const outDir = path.join(__dirname, 'out');
const zipFile = path.join(__dirname, 'out_updated.zip');

if (!fs.existsSync(outDir)) {
  console.error('Error: "out" directory does not exist! Please run npm run build first.');
  process.exit(1);
}

// Remove old zip file if exists
if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile);
}

console.log('Zipping contents of "out" folder into "out_updated.zip"...');
try {
  const zip = new AdmZip();
  // addLocalFolder adds the contents of the directory directly to the root of the zip
  zip.addLocalFolder(outDir);
  zip.writeZip(zipFile);
  console.log('ZIP file created successfully!');
  console.log('File path:', zipFile);
  console.log('File size:', fs.statSync(zipFile).size, 'bytes');
} catch (err) {
  console.error('Error creating ZIP file:', err.message);
  process.exit(1);
}
