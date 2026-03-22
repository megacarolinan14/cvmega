const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const keyLine = envContent.split('\n').find(line => line.startsWith('FIREBASE_PRIVATE_KEY_BASE64='));
  
let keyString = keyLine.replace('FIREBASE_PRIVATE_KEY_BASE64=', '').trim();
if (keyString.startsWith('"') && keyString.endsWith('"')) {
  keyString = keyString.slice(1, -1);
}
if (keyString.startsWith("'") && keyString.endsWith("'")) {
  keyString = keyString.slice(1, -1);
}

try {
  console.log("Removing old FIREBASE_PRIVATE_KEY_BASE64 from Vercel (if any)...");
  try {
    execSync('npx vercel env rm FIREBASE_PRIVATE_KEY_BASE64 -y', { stdio: 'inherit', shell: true });
  } catch (e) {}

  console.log("Adding new FIREBASE_PRIVATE_KEY_BASE64 to Vercel...");
  // Using stdin to avoid CLI character limits or escaping issues
  execSync('npx vercel env add FIREBASE_PRIVATE_KEY_BASE64 production', { input: keyString, stdio: ['pipe', 'inherit', 'inherit'], shell: true });
} catch (e) {
  console.error("Failed to sync env:", e.message);
}

console.log("Pushing code to GitHub...");
try {
  execSync('git add . && git commit -m "fix: implement bulletproof base64 firebase admin initialization" && git push origin main', { stdio: 'inherit' });
} catch (e) {
  console.log("Git push skipped or failed.");
}

console.log("Triggering final production deployment...");
execSync('npx vercel --prod -y', { stdio: 'inherit' });
console.log("BULLSEYE! Deployment triggered.");
