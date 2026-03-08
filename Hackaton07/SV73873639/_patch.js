const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'app.js');
// Read preserving original line endings
const raw = fs.readFileSync(filePath, 'utf8');
// Detect line ending style
const crlf = raw.includes('\r\n');
const sep = crlf ? '\r\n' : '\n';
const lines = raw.split(sep);

const TMDB_TOKEN = '[REDACTED: Supabase Service Role API Key]';
const NASA_KEY = 'ShtDCgeZ2ZLId2q7N3TwCVhoas4W6bmq3mJMA09g';

let inTmdbTrending = false;
let inTmdbMovie = false;
let inNasa = false;
const result = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.replace(/\r$/, '').trim();

  // Detect which card we're in
  if (line.includes("id: 'tmdb_trending'")) inTmdbTrending = true;
  if (line.includes("id: 'tmdb_movie'")) inTmdbMovie = true;
  if (line.includes("id: 'nasa_mars'")) inNasa = true;

  // Reset card context when we hit the closing brace of a card
  if ((inTmdbTrending || inTmdbMovie || inNasa) && (trimmed === '},' || trimmed === '}')) {
    if (inTmdbTrending) inTmdbTrending = false;
    else if (inTmdbMovie) inTmdbMovie = false;
    else if (inNasa) inNasa = false;
    result.push(line);
    continue;
  }

  // For TMDB cards: skip corsNote line
  if ((inTmdbTrending || inTmdbMovie) && line.includes("corsNote:")) {
    console.log('  Removed corsNote line');
    continue;
  }

  // For TMDB cards: skip token input line
  if ((inTmdbTrending || inTmdbMovie) && line.includes("key: 'token'")) {
    console.log('  Removed token input line');
    continue;
  }

  // For TMDB cards: replace buildHeaders to use hardcoded token
  if ((inTmdbTrending || inTmdbMovie) && line.includes('buildHeaders:') && line.includes('v.token')) {
    const indent = line.match(/^(\s*)/)[1];
    result.push(indent + "buildHeaders: () => ({ Authorization: `Bearer " + TMDB_TOKEN + "`, Accept: 'application/json' })");
    console.log('  Updated buildHeaders (hardcoded token)');
    continue;
  }

  // For NASA: skip key input line
  if (inNasa && line.includes("key: 'key'") && line.includes('nasa_api_key')) {
    console.log('  Removed NASA key input line');
    continue;
  }

  // For NASA: replace buildUrl to use hardcoded key
  if (inNasa && line.includes('buildUrl:') && line.includes('v.key')) {
    const newLine = line.replace(
      /\$\{encodeURIComponent\(v\.key\)\}/,
      NASA_KEY
    );
    console.log('  Updated NASA buildUrl (hardcoded key)');
    result.push(newLine);
    continue;
  }

  result.push(line);
}

// Write back with original line endings
fs.writeFileSync(filePath, result.join(sep), 'utf8');
console.log('\nDone! Verifying...');

const final = fs.readFileSync(filePath, 'utf8');
const ok1 = !final.includes("corsNote: 'Requiere Bearer token");
const ok2 = !final.includes("key: 'token'");
const ok3 = final.includes(TMDB_TOKEN);
const ok4 = final.includes(NASA_KEY);
const ok5 = !final.includes("key: 'key'");
console.log('corsNote removed (cards 13&14):', ok1 ? 'YES' : 'NO - STILL PRESENT');
console.log('token input removed:', ok2 ? 'YES' : 'NO - STILL PRESENT');
console.log('TMDB token hardcoded:', ok3 ? 'YES' : 'NO');
console.log('NASA key hardcoded:', ok4 ? 'YES' : 'NO');
console.log('NASA key input removed:', ok5 ? 'YES' : 'NO - STILL PRESENT');
console.log('\nAll checks passed:', (ok1 && ok2 && ok3 && ok4 && ok5) ? 'YES' : 'NO');
