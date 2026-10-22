import test from 'node:test';
import assert from 'node:assert/strict';
import mammoth from 'mammoth';
import {blank} from '../src/model.js';
import {makeDocx,makePdf} from '../src/documents.js';
import fs from 'node:fs/promises';
const data=blank();data.name='Ana Silva';data.email='ana@example.com';data.pt.title='Técnica em automação offshore';data.pt.summary='Manutenção, instrumentação e segurança.';data.pt.experience='Empresa | 2024–2026\nInspeção de 25 instrumentos.';
test('DOCX can be read back with accented content',async()=>{const blob=await makeDocx(data);const buffer=Buffer.from(await blob.arrayBuffer());const result=await mammoth.extractRawText({buffer});assert.match(result.value,/Técnica em automação/);assert.match(result.value,/Inspeção de 25/);assert.match(result.value,/Experiência profissional/);});
test('PDF supports multipage text and valid page structure',()=>{const long=structuredClone(data);long.pt.experience=Array.from({length:180},(_,i)=>`Atividade ${i}: inspeção e manutenção preventiva.`).join('\n');const pdf=makePdf(long);assert.ok(pdf.getNumberOfPages()>2);const buffer=Buffer.from(pdf.output('arraybuffer'));assert.equal(buffer.subarray(0,5).toString(),'%PDF-');assert.ok(buffer.includes(Buffer.from('Atividade 179')));});
