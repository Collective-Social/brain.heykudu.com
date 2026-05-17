import { GoogleGenAI } from "@google/genai";
import fs from "fs";
const ai = new GoogleGenAI({});
async function main() {
  try {
    console.log("Uploading...");
    const uploadResult = await ai.files.upload({
      file: "Primary-Healthcare-Standard-Treatment-Guidelines-and-Essential-Medicines-List-8th-Edition-2024.pdf",
      mimeType: "application/pdf"
    });
    console.log("UPLOAD_URI=" + uploadResult.uri);
  } catch(e) {
    console.error("Error:", e);
  }
}
main();
