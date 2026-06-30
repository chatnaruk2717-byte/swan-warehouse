const bcrypt = require('c:/Users/chatn/OneDrive/Desktop/Leaning/backend/node_modules/bcryptjs');

bcrypt.hash('password123', 10).then(hash => {
  console.log('Correct hash for password123:', hash);
}).catch(err => {
  console.error(err);
});
