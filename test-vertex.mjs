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

async function test(model, formatName, fileObject) {
    console.log(`Testing ${model} with ${formatName}...`);
    try {
        const response = await genAI.models.generateContent({
            model: model,
            contents: [
                { role: 'user', parts: [ fileObject, { text: "What is this file?" } ] }
            ],
        });
        console.log(`SUCCESS [${model} + ${formatName}]:`, response.text ? response.text.substring(0, 30) : "empty");
    } catch(e) {
        console.error(`FAILED [${model} + ${formatName}]:`, e.message);
    }
}

async function run() {
    const uri = "gs://brain-heykudu-assets/guideline.pdf";
    const formats = {
        "fileData": { fileData: { fileUri: uri, mimeType: "application/pdf" } },
        "file_data": { file_data: { file_uri: uri, mimeType: "application/pdf" } }
    };
    
    for (const model of ["gemini-2.5-pro", "gemini-1.5-pro"]) {
        for (const [formatName, fileObject] of Object.entries(formats)) {
            await test(model, formatName, fileObject);
        }
    }
}

run();
