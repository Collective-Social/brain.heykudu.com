import fetch from 'node-fetch';

async function testVercel() {
    console.log("Starting Vercel /api/analyze endpoint test...");
    const url = 'https://brainheykuducom.vercel.app/api/analyze';
    
    // Create a dummy buffer (1KB of zeros)
    const dummyAudioBuffer = new Blob([new Uint8Array(1024)]);

    const formData = new FormData();
    formData.append('audio', dummyAudioBuffer, 'test.webm');

    const startTime = Date.now();
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            // Disable timeout on the node-fetch client so we can test the maximum Vercel limit!
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\nResponse received in ${duration} seconds.`);
        console.log(`Status Payload: ${response.status} ${response.statusText}`);

        if (response.ok) {
            const json = await response.json();
            console.log("Transcription:", json.transcription);
            console.log("\nFeedback:", json.feedback?.substring(0, 500) + "...");
        } else {
            console.log("Error Body:", await response.text());
        }
    } catch (e) {
        console.error("Fetch threw an error:", e);
    }
}

testVercel();
