import test from 'node:test';
import assert from 'node:assert/strict';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import mammoth from 'mammoth';
import {makePdf,makeDocx} from '../src/documents.js';
import {templates} from '../src/templates.js';
import {blank,validate,sections} from '../src/model.js';
test('every template exports readable PDF and DOCX with actual content and custom sections',async()=>{
 for(const template of templates){const d=blank();d.template=template.id;d.name='Alex Morgan';d.pt.experience='Projeto de automação industrial';d.pt.skills='Instrumentação e CLP';d.customSections=[{id:'extra-test',pt:{title:'Publicações',text:'Pesquisa aplicada em sistemas'},en:{title:'Publications',text:''}}];
 const task=pdfjs.getDocument({data:new Uint8Array(makePdf(d).output('arraybuffer')),useSystemFonts:true});const pdf=await task.promise;let text='';for(let i=1;i<=pdf.numPages;i++)text+=(await (await pdf.getPage(i)).getTextContent()).items.map(x=>x.str||'').join(' ');await task.destroy();text=text.replace(/\s+/g,' ');assert.match(text,/Projeto de automação industrial/,template.id);assert.match(text,/Instrumentação e CLP/,template.id);assert.match(text,/Pesquisa aplicada em sistemas/,template.id);
 const docx=await makeDocx(d),result=await mammoth.extractRawText({buffer:Buffer.from(await docx.arrayBuffer())});assert.match(result.value,/Projeto de automação industrial/,template.id);assert.match(result.value,/Pesquisa aplicada em sistemas/,template.id);
 }
});
test('section order and visibility affect the actual exports without deleting content',async()=>{
 const d=blank();d.pt.summary='PRIVATE_HIDDEN_PROFILE';d.pt.skills='FIRST_SECTION';d.pt.experience='SECOND_SECTION';d.sectionOrder=['skills','experience','summary','education','certifications','languages','projects','extra'];d.hiddenSections=['summary'];const safe=validate(d);assert.equal(safe.pt.summary,'PRIVATE_HIDDEN_PROFILE');assert.equal(sections(safe)[0].id,'skills');const pdf=makePdf(safe),raw=pdf.output();assert.ok(!raw.includes('PRIVATE_HIDDEN_PROFILE'));assert.ok(raw.indexOf('FIRST_SECTION')<raw.indexOf('SECOND_SECTION'));
});
test('two column layouts keep all content when the first column spans multiple pages',async()=>{
 for(const template of ['sidebar','horizon','compact']){const d=blank();d.template=template;d.name='Multi Page';d.pt.skills=Array.from({length:190},(_,i)=>`Skill ${i}`).join('\n');d.pt.experience='FINAL_MAIN_CONTENT';const p=makePdf(d);assert.ok(p.getNumberOfPages()>1);assert.ok(p.output().includes('Skill 189'));assert.ok(p.output().includes('FINAL_MAIN_CONTENT'));}
});
