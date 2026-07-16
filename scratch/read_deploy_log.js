const fs = require('fs');
const content = fs.readFileSync('frontend/deploy-main.log', 'utf16le');
console.log(content);
