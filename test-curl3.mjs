import { GoogleAuth } from 'google-auth-library';

async function run() {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = 'tmp-cred.json';
    const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                fileUri: "gs://brain-heykudu-assets/guideline.pdf",
                mimeType: "application/pdf"
              }
            },
            {
              text: "Tell me about this document"
            }
          ]
        }
      ]
    };

    const res = await fetch('https://us-central1-aiplatform.googleapis.com/v1beta1/projects/heykudu/locations/us-central1/publishers/google/models/gemini-1.5-pro:generateContent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log(res.status, await res.text());
}
run();
