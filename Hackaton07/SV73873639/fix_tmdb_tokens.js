const fs = require('fs');
const filePath = 'frontend/app.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replace defaultValue for tmdb_api_key (Bearer) token inputs - set to empty string
// This targets the specific pattern used in cards 13 and 14
const original = content;

// Use a targeted replacement: find the token input lines for tmdb entries
// Replace any non-empty defaultValue in the tmdb_api_key (Bearer) key entries
content = content.replace(
  /(\{ key: 'token', label: 'tmdb_api_key \(Bearer\)', defaultValue: ')[^']*(')/g,
  "$1$2"
);

if (content === original) {
  console.log('WARNING: No changes made - pattern not found');
} else {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS: File updated');
}

// Verify
const updated = fs.readFileSync(filePath, 'utf8');
const lines = updated.split('\n');
[235, 248].forEach(i => {
  console.log('Line ' + (i+1) + ':', JSON.stringify(lines[i]));
});
