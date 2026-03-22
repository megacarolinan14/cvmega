const fs = require('fs');
const crypto = require('crypto');

const content = fs.readFileSync('.env.local', 'utf8');
const lines = content.split('\n');
const b64Line = lines.find(l => l.startsWith('FIREBASE_PRIVATE_KEY_BASE64='));
let b64 = b64Line.replace('FIREBASE_PRIVATE_KEY_BASE64=', '').trim();
if (b64.startsWith('"') && b64.endsWith('"')) b64 = b64.slice(1, -1);

console.log("Base64 Length:", b64.length);

try {
    const decoded = Buffer.from(b64, 'base64').toString('utf-8');
    console.log("Decoded Start:", decoded.substring(0, 30));
    console.log("Decoded End:", decoded.substring(decoded.length - 30));
    
    const sign = crypto.createSign('RSA-SHA256');
    sign.update('test');
    sign.sign(decoded);
    console.log("SUCCESS: Local crypto accepted the decoded Base64 key!");
} catch (e) {
    console.log("FAILED to decode or sign:", e.message);
}
