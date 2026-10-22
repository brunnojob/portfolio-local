import test from 'node:test';
import assert from 'node:assert/strict';
import {blank} from '../src/model.js';
import {assistantPlan,assistantReply} from '../src/assistant.js';

test('assistant follows the document and links to editable fields',()=>{
 const document=blank();
 assert.equal(assistantPlan(document)[0].field,'name');
 document.name='Alex';
 document.email='alex@example.com';
 document.pt.title='Desenvolvedor';
 document.pt.summary='Desenvolvedor com projetos de software.';
 assert.equal(assistantPlan(document)[0].field,'projects');
 assert.equal(assistantReply('Como melhorar meus projetos?',document).field,'projects');
 assert.equal(assistantReply('Qual modelo para ATS?',document).panel,'templates');
});

test('bilingual guidance points to on-device translation and review',()=>{
 const document=blank();
 document.pt.summary='Experiência em projetos.';
 assert.ok(assistantPlan(document).some(task=>task.language==='en'&&task.field==='summary'));
 assert.match(assistantReply('Pode traduzir para inglês?',document).text,/navegador traduz os campos novos/i);
 document.lang='en';
 document.en.summary='Experience with projects.';
 assert.equal(assistantReply('How can I improve my summary?',document).field,'summary');
 assert.ok(!assistantPlan(document).some(task=>task.language==='pt'&&task.field==='summary'));
});

 test('a focused portfolio does not require education, phone or employment history',()=>{const d=blank();d.name='Alex';d.email='alex@example.com';Object.assign(d.pt,{title:'Developer',summary:'I build tools.',projects:'Actual project',skills:'JavaScript'});assert.ok(!assistantPlan(d).some(t=>['education','experience','phone'].includes(t.field)));});
