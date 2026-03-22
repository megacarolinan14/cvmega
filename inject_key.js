const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const keyLine = envContent.split('\n').find(line => line.startsWith('FIREBASE_PRIVATE_KEY='));
  
let keyString = keyLine.replace('FIREBASE_PRIVATE_KEY=', '').trim();
if (keyString.startsWith('"') && keyString.endsWith('"')) {
  keyString = keyString.slice(1, -1);
}
if (keyString.startsWith("'") && keyString.endsWith("'")) {
  keyString = keyString.slice(1, -1);
}

// Convert escaped \n back to physical newlines for safety
keyString = keyString.replace(/\\n/g, '\n');

console.log("Length:", keyString.length);

try {
  console.log("Adding FIREBASE_PRIVATE_KEY to Vercel (production)...");
  execSync('npx vercel env add FIREBASE_PRIVATE_KEY production', { input: keyString, stdio: ['pipe', 'inherit', 'inherit'], shell: true });
} catch (e) {
  console.log("Failed to add to production:", e.message);
}

console.log("Triggering Vercel deployment...");
execSync('npx vercel --prod -y', { stdio: 'inherit', shell: true });
console.log("DONE");
