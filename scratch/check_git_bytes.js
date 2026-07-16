const fs = require('fs');

const logLine = fs.readFileSync('C:\\Users\\chatn\\OneDrive\\Desktop\\Leaning\\scratch\\db_info.txt', 'utf8');
const match = logLine.match(/mysql:\/\/avnadmin:[^"'\s\)\\]+/);
if (match) {
  const url = match[0];
  console.log('URL length:', url.length);
  for (let i = 0; i < url.length; i++) {
    console.log(`char ${i}: '${url[i]}' (${url.charCodeAt(i)})`);
  }
} else {
  console.log('No match found');
}
