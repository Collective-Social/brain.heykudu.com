import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 30;

const credentialsB64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON_B64;
if (credentialsB64 && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    const tmpPath = '/tmp/heykudu-credentials-transcribe.json';
    require('fs').writeFileSync(tmpPath, Buffer.from(credentialsB64, 'base64').toString('utf8'));
    process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpPath;
  } catch (e) {
    console.error("Failed to write temporary credentials for Vertex AI", e);
  }
}

const genAI = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as Blob;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    // Use the exact mimeType provided by the browser (e.g. audio/webm or audio/mp4)
    const mimeType = audioFile.type || 'audio/webm';
    
    const filePart = {
      inlineData: {
        data: audioBuffer.toString('base64'),
        mimeType: mimeType
      }
    };

    let transcription = '';
    try {
      const response = await genAI.models.generateContent({
          model: "gemini-2.5-pro",
          contents: [
              { role: 'user', parts: [filePart, { text: "Listen to this audio and provide an exact, accurate medical transcription. Do not add any extra conversational text." }] }
          ],
      });
      transcription = response.text || '';
    } catch (e: any) {
      console.warn("Gemini transcription failed.", e);
      return NextResponse.json({ error: `GEMINI_ERROR: ${e.message || String(e)}` }, { status: 500 });
    }

    if (!transcription) transcription = 'Unable to transcribe audio.';
    return NextResponse.json({ transcription });
    
  } catch (error: any) {
    console.error("Transcription API Fatal:", error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
