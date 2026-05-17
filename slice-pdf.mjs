import { PDFDocument } from 'pdf-lib';
import { readFileSync, writeFileSync } from 'fs';

async function slicePDF() {
    try {
        console.log("Loading massive 22MB PDF...");
        const originalBytes = readFileSync('./Primary-Healthcare-Standard-Treatment-Guidelines-and-Essential-Medicines-List-8th-Edition-2024.pdf');
        
        const originalPdf = await PDFDocument.load(originalBytes);
        console.log(`Original has ${originalPdf.getPageCount()} pages.`);
        
        const newPdf = await PDFDocument.create();
        
        // Grab the first 30 pages
        const pagesToCopy = Array.from({ length: 30 }, (_, i) => i);
        const copiedPages = await newPdf.copyPages(originalPdf, pagesToCopy);
        
        copiedPages.forEach((page) => newPdf.addPage(page));
        
        const newBytes = await newPdf.save();
        writeFileSync('./guideline-shorter.pdf', newBytes);
        
        console.log(`Successfully extracted first 30 pages -> size is ${(newBytes.byteLength / 1024 / 1024).toFixed(2)} MB`);
    } catch (e) {
        console.error("Failed to slice PDF:", e);
    }
}

slicePDF();
