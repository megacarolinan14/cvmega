const fs = require('fs');
const content = fs.readFileSync('.env.local', 'utf8');
const lines = content.split('\n');
const keyLine = lines.find(l => l.startsWith('FIREBASE_PRIVATE_KEY='));
let key = keyLine.replace('FIREBASE_PRIVATE_KEY=', '').trim();
if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1, -1);
key = key.replace(/\\n/g, '\n');

const base64Key = Buffer.from(key).toString('base64');
console.log('BASE64 ENCODED KEY LENGTH:', base64Key.length);

if (!content.includes('FIREBASE_PRIVATE_KEY_BASE64=')) {
  const newContent = content + '\nFIREBASE_PRIVATE_KEY_BASE64="' + base64Key + '"\n';
  fs.writeFileSync('.env.local', newContent);
  console.log('Updated .env.local with Base64 key.');
} else {
  console.log('Base64 key already exists in .env.local');
}
