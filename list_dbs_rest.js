const { google } = require('googleapis');
const fs = require('fs');

async function getAccessToken() {
    const sa = JSON.parse(fs.readFileSync('sa.json', 'utf8'));
    const jwt = new google.auth.JWT(
        sa.client_email,
        null,
        sa.private_key,
        ['https://www.googleapis.com/auth/cloud-platform']
    );
    const result = await jwt.authorize();
    return result.access_token;
}

async function listDatabases() {
    try {
        const token = await getAccessToken();
        const projectId = "cv-mega-5077a";
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases`;
        
        console.log(`Querying REST API for Project: ${projectId}...`);
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        console.log("REST API Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("REST FAILED:", e.message);
    }
}

listDatabases();
