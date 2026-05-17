import { GoogleAuth } from 'google-auth-library';

async function run() {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = 'tmp-cred.json';
    const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const uri = 'https://us-central1-aiplatform.googleapis.com/v1beta1/projects/heykudu/locations/us-central1/publishers/google/models/gemini-2.5-pro:generateContent';

    console.log("Testing file_data / file_uri payload...");
    const payload1 = {
      contents: [
        {
          role: "user",
          parts: [
            {
              file_data: {
                file_uri: "gs://brain-heykudu-assets/guideline.pdf",
                mime_type: "application/pdf"
              }
            },
            {
              text: "Tell me about this document"
            }
          ]
        }
      ]
    };

    let res = await fetch(uri, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload1)
    });
    console.log("file_data response:", res.status, await res.text());
}
run();
