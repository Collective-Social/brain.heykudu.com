import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabaseClient';
import { readFileSync } from 'fs';
import { join } from 'path';

export const maxDuration = 60;

const credentialsB64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON_B64;
if (credentialsB64 && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    const tmpPath = '/tmp/heykudu-credentials.json';
    require('fs').writeFileSync(tmpPath, Buffer.from(credentialsB64, 'base64').toString('utf8'));
    process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpPath;
  } catch (e) {
    console.error("Failed to write temporary credentials for Vertex AI", e);
  }
}

const genAI = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const { transcription } = await req.json();
    
    if (!transcription) {
      return NextResponse.json({ error: 'No transcription provided' }, { status: 400 });
    }

    let skillInstructions = '';
    try {
      const filePath = join(process.cwd(), 'SKILL.md');
      skillInstructions = readFileSync(filePath, 'utf-8');
    } catch (e) {
      skillInstructions = '# Mock Skill\nNo evaluation guidelines located.';
    }

    let feedback = '';
    try {
      const systemPrompt = `You are a clinical mentor.\n\nHere are your strict instructions on how to evaluate the practitioner:\n${skillInstructions}\n\nReview the following transcription and provide clinical feedback based on the Standard Treatment Guidelines PDF. Be concise.`;
      
      const fileUri = process.env.GEMINI_DOCUMENT_URI?.trim();
      const parts: any[] = [];
      
      if (fileUri) {
        parts.push({ fileData: { fileUri: fileUri, mimeType: "application/pdf" } });
      }
      parts.push({ text: `${systemPrompt}\n\nTranscription:\n${transcription}` });

      const response = await genAI.models.generateContent({
          model: "gemini-2.5-pro",
          contents: [{ role: 'user', parts: parts }],
      });
      
      feedback = response.text || '';
    } catch (e: any) {
      console.warn("Gemini generation failed.", e);
      feedback = `GEMINI_ERROR: ${e.message || String(e)}`;
    }

    try {
       await supabase.from('clinical_evaluations').insert([{ transcription, feedback }]);
    } catch (e) {}

    return NextResponse.json({ feedback });
    
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
