const str = "à¸à¸²à¸£à¸ˆà¹ˆà¸²à¸¢à¸ªà¸´à¸™à¸„à¹‰à¸²à¸­à¸­à¸à¸•à¸²à¸¡à¸¥à¸³à¸”à¸±à¸š";
const buf = Buffer.from(str, 'binary');
const decoded = buf.toString('utf8');
console.log('Decoded:', decoded);
