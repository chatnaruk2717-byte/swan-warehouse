const { execSync } = require('child_process');

try {
  // Read git content of HEAD as a raw buffer (using binary encoding in execSync to get raw output)
  const rawBuffer = execSync('git show HEAD:frontend/src/app/kpis/page.tsx', { encoding: 'buffer' });
  
  // Now, decode each character of this raw buffer.
  // Wait, if git has it as UTF-8, then rawBuffer is a UTF-8 byte stream.
  // If the characters inside are U+00E0 U+00B8 etc., they are encoded in UTF-8.
  // U+00E0 is encoded as 0xC3 0xA0.
  // U+00B8 is encoded as 0xC2 0xB8.
  // So we first convert rawBuffer to a UTF-8 string to get the characters.
  const str = rawBuffer.toString('utf8');
  
  // Now, map the characters back to bytes:
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 256) {
      bytes.push(code);
    } else {
      // If code >= 256, it's either U+FFFD or a character we added.
      // Let's see what code points we have.
      const char = str[i];
      const charBuf = Buffer.from(char, 'utf8');
      for (const b of charBuf) {
        bytes.push(b);
      }
    }
  }
  
  const decoded = Buffer.from(bytes).toString('utf8');
  const lines = decoded.split('\n');
  
  console.log('--- Decoded Lines ---');
  for (let i = 85; i <= 115; i++) {
    if (lines[i - 1]) {
      console.log(`${i}: ${lines[i - 1]}`);
    }
  }
} catch (e) {
  console.error(e.message);
}
