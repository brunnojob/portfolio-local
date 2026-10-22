import test from 'node:test';
import assert from 'node:assert/strict';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import {makePdf} from '../src/documents.js';
import {blank} from '../src/model.js';
import {extractPdf} from '../src/import-pdf.js';
test('current PDF.js extracts exported PDF text and cleans up using the loading task',async()=>{
 const s=blank();s.name='Ana Silva';s.pt.title='Técnica em automação';s.pt.experience='Inspeção de 25 instrumentos.';
 const text=await extractPdf(makePdf(s).output('arraybuffer'),pdfjs);
 assert.match(text,/Ana Silva/);assert.match(text,/Técnica em automação/);assert.match(text,/Inspeção de 25 instrumentos/);
});
test('invalid PDF produces its parser error instead of a cleanup method error',async()=>{
 await assert.rejects(extractPdf(new TextEncoder().encode('not a pdf').buffer,pdfjs),err=>/Invalid PDF structure/i.test(err.message));
});
