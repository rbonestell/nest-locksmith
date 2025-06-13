const fs = require('fs');
if (!fs.existsSync('node_modules')) {
  console.error('Dependencies not installed. Run "npm install".');
  process.exit(1);
}
