import fs from 'fs';

async function run() {
  const form = new FormData();
  // using a dummy blob
  const blob = new Blob([new Uint8Array(100)], { type: 'audio/webm' });
  form.append('audio', blob, 'test.webm');

  try {
    const res = await fetch('https://brain.heykudu.com/api/transcribe', {
      method: 'POST',
      body: form
    });
    console.log(res.status, await res.text());
  } catch (e) {
    console.error("Fetch failed", e);
  }
}
run();
