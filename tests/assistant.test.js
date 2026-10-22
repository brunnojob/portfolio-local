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
 assert.equal(assistantPlan(document)[0].field,'experience');
 assert.equal(assistantReply('Como melhorar meus projetos?',document).field,'projects');
 assert.equal(assistantReply('Qual modelo para ATS?',document).panel,'templates');
});

test('bilingual guidance does not claim an automatic translation',()=>{
 const document=blank();
 document.pt.summary='Experiência em projetos.';
 assert.ok(assistantPlan(document).some(task=>task.language==='en'&&task.field==='summary'));
 assert.match(assistantReply('Pode traduzir para inglês?',document).text,/não há tradução automática local/i);
 document.lang='en';
 document.en.summary='Experience with projects.';
 assert.equal(assistantReply('How can I improve my summary?',document).field,'summary');
 assert.ok(!assistantPlan(document).some(task=>task.language==='pt'&&task.field==='summary'));
});
