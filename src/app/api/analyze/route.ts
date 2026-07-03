import { NextResponse } from 'next/server';
import { SpeechClient } from '@google-cloud/speech';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabaseClient';
import { readFileSync } from 'fs';
import { join } from 'path';

const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
let speechClient: SpeechClient;

if (credentialsJson) {
  try {
    const credentials = JSON.parse(credentialsJson);
    speechClient = new SpeechClient({ credentials });
  } catch (e) {
    console.error('Failed to parse Google Cloud credentials');
    speechClient = new SpeechClient();
  }
} else {
  speechClient = new SpeechClient();
}

const genAI = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT || 'heykudu',
  location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as Blob;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    
    const audio = {
      content: audioBuffer.toString('base64'),
    };
    
    const config = {
      encoding: 'WEBM_OPUS' as const,
      sampleRateHertz: 48000,
      languageCode: 'en-US',
    };
    
    const request = {
      audio: audio,
      config: config,
    };

    let transcription = '';
    try {
      const [response] = await speechClient.recognize(request);
      transcription = response.results
        ?.map(result => result.alternatives?.[0].transcript)
        .join('\n') || '';
    } catch (e) {
      console.warn("Speech recognition failed, using mock transcription for development.", e);
      transcription = 'Mock transcription: ...patient reports sudden onset palpitation... ...irregular pulse noted...';
    }

    if (!transcription) {
      transcription = 'Unable to transcribe audio.';
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
      
      const fileUri = process.env.GEMINI_DOCUMENT_URI;
      const parts: any[] = [];
      
      if (fileUri) {
        parts.push({ fileData: { fileUri: fileUri, mimeType: "application/pdf" } });
      }
      parts.push({ text: `${systemPrompt}\n\nTranscription:\n${transcription}` });

      const response = await genAI.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: parts,
      });
      
      feedback = response.text || '';
    } catch (e) {
      console.warn("Gemini generation failed, using mock feedback.", e);
      feedback = 'Mock Feedback: Guideline-directed: For rate control in AFib, Diltiazem 0.25 mg/kg bolus is appropriate. Monitoring vitals every 15 min...';
    }

    try {
       await supabase.from('clinical_evaluations').insert([
         { transcription, feedback }
       ]);
    } catch (e) {
      console.warn("Supabase insertion failed.", e);
    }

    return NextResponse.json({ transcription, feedback });
    
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
