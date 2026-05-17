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
    const json = Buffer.from(b64, 'base64').toString('utf8');
    writeFileSync('tmp-cred.json', json);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = 'tmp-cred.json';
}

const genAI = new GoogleGenAI({});

async function run() {
    try {
        const fileUri = "gs://brain-heykudu-assets/guideline.pdf";
        const parts = [
            { fileData: { fileUri, mimeType: "application/pdf" } },
            { text: "Summarize this PDF." }
        ];

        console.log("Making request to gemini-2.5-pro...");
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-pro",
            contents: [{ role: 'user', parts: parts }]
        });
        console.log("Success:", response.text.substring(0, 50));
    } catch(e) {
        console.error("GenAI Error:", e);
    }
}
run();
