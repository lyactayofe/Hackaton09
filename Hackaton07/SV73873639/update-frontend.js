const fs = require('fs');

// Copy the new files over the old ones
fs.copyFileSync('frontend/index.html', 'frontend/index.html');
console.log('index.html updated');

fs.copyFileSync('frontend/app.js', 'frontend/app.js');
console.log('app.js updated');

// Clean up the .new files
fs.unlinkSync('frontend/index.html');
fs.unlinkSync('frontend/app.js');
console.log('Cleaned up .new files');
