function decodeMojibake(mojibakeStr) {
  const bytes = [];
  for (let i = 0; i < mojibakeStr.length; i++) {
    const code = mojibakeStr.charCodeAt(i);
    if (code < 256) {
      bytes.push(code);
    } else {
      const buf = Buffer.from(mojibakeStr[i], 'utf8');
      for (const b of buf) {
        bytes.push(b);
      }
    }
  }
  return Buffer.from(bytes).toString('utf8');
}

const mojibake = "à¸à¸²à¸£à¸ˆà¹ˆà¸²à¸¢à¸ªà¸´à¸™à¸„à¹‰à¸²à¸­à¸­à¸à¸•à¸²à¸¡à¸¥à¸³à¸”à¸±à¸š";
console.log('Original:', mojibake);
console.log('Decoded:', decodeMojibake(mojibake));
