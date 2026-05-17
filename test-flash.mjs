import { GoogleGenAI } from '@google/genai';
import { readFileSync, writeFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
env.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2];
    if (val.startsWith('"') || val.startsWith("'")) { val = val.slice(1, -1); }
    process.env[match[1]] = val;
  }
});

const b64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON_B64;
if (b64) {
    writeFileSync('tmp-cred.json', Buffer.from(b64, 'base64').toString('utf8'));
    process.env.GOOGLE_APPLICATION_CREDENTIALS = 'tmp-cred.json';
}

const genAI = new GoogleGenAI({});
const fileUri = "gs://brain-heykudu-assets/guideline.pdf";

async function testModel(modelName) {
    const startTime = Date.now();
    try {
        console.log(`\nTesting ${modelName} on 22MB PDF...`);
        const response = await genAI.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [
              { fileData: { fileUri, mimeType: "application/pdf" } },
              { text: "Provide a two sentence summary." }
            ] }]
        });
        const duration = (Date.now() - startTime) / 1000;
        console.log(`SUCCESS [${duration.toFixed(1)}s]:`, response.text.substring(0, 80));
    } catch(e) {
        console.error(`FAILED:`, e.message);
    }
}

async function run() {
    await testModel("gemini-2.5-flash");
    await testModel("gemini-1.5-flash-002");
}
run();
