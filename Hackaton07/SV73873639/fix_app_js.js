const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'app.js');
let content = fs.readFileSync(filePath, 'utf8');

// Hardcoded tokens/keys
const tmdbToken = '[REDACTED: Supabase Service Role API Key]';
const nasaKey = 'ShtDCgeZ2ZLId2q7N3TwCVhoas4W6bmq3mJMA09g';

// --- Card 13: tmdb_trending ---
// Remove corsNote, remove token input, hardcode token in buildHeaders
content = content.replace(
  `    corsNote: 'Requiere Bearer token. Si falla: revisa token o CORS.',\n    inputs: [\n      { key: 'token', label: 'tmdb_api_key (Bearer)', defaultValue: '[REDACTED: JSON Web Token]', placeholder: 'API Read Access Token' },\n      { key: 'window', label: 'tmdb_trending_window', defaultValue: 'day', placeholder: 'day | week' }\n    ],\n    buildUrl: (v) => \`https://api.themoviedb.org/3/trending/movie/\${encodeURIComponent(v.window)}\`,\n    buildHeaders: (v) => ({ Authorization: \`Bearer \${v.token}\`, Accept: 'application/json' })`,
  `    inputs: [\n      { key: 'window', label: 'tmdb_trending_window', defaultValue: 'day', placeholder: 'day | week' }\n    ],\n    buildUrl: (v) => \`https://api.themoviedb.org/3/trending/movie/\${encodeURIComponent(v.window)}\`,\n    buildHeaders: () => ({ Authorization: \`Bearer ${tmdbToken}\`, Accept: 'application/json' })`
);

// --- Card 14: tmdb_movie ---
// Remove corsNote, remove token input, hardcode token in buildHeaders
content = content.replace(
  `    corsNote: 'Requiere Bearer token. Si falla: revisa token o CORS.',\n    inputs: [\n      { key: 'token', label: 'tmdb_api_key (Bearer)', defaultValue: '[REDACTED: JSON Web Token]', placeholder: 'API Read Access Token' },\n      { key: 'id', label: 'tmdb_movie_id', defaultValue: '550', placeholder: 'ej: 550' }\n    ],\n    buildUrl: (v) => \`https://api.themoviedb.org/3/movie/\${encodeURIComponent(v.id)}\`,\n    buildHeaders: (v) => ({ Authorization: \`Bearer \${v.token}\`, Accept: 'application/json' })`,
  `    inputs: [\n      { key: 'id', label: 'tmdb_movie_id', defaultValue: '550', placeholder: 'ej: 550' }\n    ],\n    buildUrl: (v) => \`https://api.themoviedb.org/3/movie/\${encodeURIComponent(v.id)}\`,\n    buildHeaders: () => ({ Authorization: \`Bearer ${tmdbToken}\`, Accept: 'application/json' })`
);

// --- Card 15: nasa_mars ---
// Remove key input, hardcode NASA key in buildUrl
content = content.replace(
  `      { key: 'key', label: 'nasa_api_key', defaultValue: 'DEMO_KEY', placeholder: 'DEMO_KEY o tu key' },\n      { key: 'sol', label: 'nasa_sol', defaultValue: '1000', placeholder: 'ej: 1000' },\n      { key: 'camera', label: 'nasa_camera', defaultValue: 'fhaz', placeholder: 'ej: fhaz' }\n    ],\n    buildUrl: (v) => \`https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=\${encodeURIComponent(v.sol)}&camera=\${encodeURIComponent(v.camera)}&api_key=\${encodeURIComponent(v.key)}\``,
  `      { key: 'sol', label: 'nasa_sol', defaultValue: '1000', placeholder: 'ej: 1000' },\n      { key: 'camera', label: 'nasa_camera', defaultValue: 'fhaz', placeholder: 'ej: fhaz' }\n    ],\n    buildUrl: (v) => \`https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=\${encodeURIComponent(v.sol)}&camera=\${encodeURIComponent(v.camera)}&api_key=${nasaKey}\``
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done! File saved.');

// Verify
const newContent = fs.readFileSync(filePath, 'utf8');
console.log('tmdb_trending corsNote removed:', !newContent.includes("corsNote: 'Requiere Bearer token") ? 'YES (GOOD)' : 'NO (BAD)');
console.log('tmdb token input removed:', !newContent.includes("key: 'token'") ? 'YES (GOOD)' : 'NO (BAD)');
console.log('NASA key hardcoded:', newContent.includes(nasaKey) ? 'YES (GOOD)' : 'NO (BAD)');
console.log('TMDB token hardcoded:', newContent.includes(tmdbToken) ? 'YES (GOOD)' : 'NO (BAD)');