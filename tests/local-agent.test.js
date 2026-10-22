import test from 'node:test';
import assert from 'node:assert/strict';
import {blank} from '../src/model.js';
import {planLocalRequest,applyLocalDocumentActions,localDraft,documentReview} from '../src/local-agent.js';
const document=lang=>Object.assign(blank(),{id:'doc',lang:lang||'pt'});
const edits=plan=>plan.actions.filter(x=>['field','outline','design','section','move-section'].includes(x.type));

test('compound Portuguese commands apply real template, palette and section changes atomically',()=>{
 const state=document();state.pt.experience='Trabalho real';
 const plan=planLocalRequest('Use o modelo ATS e cor azul, oculte experiência',state);
 const next=applyLocalDocumentActions(state,edits(plan));
 assert.equal(next.template,'classic');assert.equal(next.accent,'#176b94');assert.ok(next.hiddenSections.includes('experience'));
 assert.equal(next.pt.experience,'Trabalho real');assert.equal(state.template,'editorial');
});
test('opinions propose a design without changing state and unknown requests are honest',()=>{
 const state=document();state.portfolioType='developer';
 const plan=planLocalRequest('Qual modelo e cor você recomenda?',state);
 assert.equal(plan.actions.length,0);assert.equal(plan.design.template,'technical');assert.ok(plan.design.reason);
 const unsupported=planLocalRequest('Qual a temperatura atual em Paris?',state);
 assert.equal(unsupported.actions.length,0);assert.match(unsupported.text,/não tenho conhecimento suficiente/);
});
test('a new portfolio retains existing content, identifies the field and never asserts invented credentials',()=>{
 const state=document();state.pt.summary='Resumo que deve permanecer';state.pt.experience='Empresa real';
 const plan=planLocalRequest('Crie um portfólio de desenvolvimento',state);
 const next=applyLocalDocumentActions(state,edits(plan));
 assert.equal(next.portfolioType,'developer');assert.equal(next.pt.summary,'Resumo que deve permanecer');assert.equal(next.pt.experience,'Empresa real');
 assert.ok(next.pt.projects.includes('[Nome do projeto]'));assert.ok(plan.pending);
 const fresh=planLocalRequest('Crie um novo portfólio do zero para design',state);
 assert.ok(fresh.actions.some(x=>x.type==='new-document'));
});
test('supplied facts support a locally composed draft without adding employers or metrics',()=>{
 const state=document();
 const plan=planLocalRequest('Meu nome é Ana Silva; meu cargo é Desenvolvedora; sei HTML, CSS e JavaScript; escreva meu resumo',state);
 const next=applyLocalDocumentActions(state,edits(plan));
 assert.equal(next.name,'Ana Silva');assert.equal(next.pt.title,'Desenvolvedora');assert.match(next.pt.skills,/HTML/);
 assert.equal(plan.suggestions.length,1);assert.match(plan.suggestions[0].text,/Desenvolvedora/);assert.match(plan.suggestions[0].text,/JavaScript/);
 assert.equal(next.pt.summary,'');assert.doesNotMatch(plan.suggestions[0].text,/anos|empresa|aumentei|reduzi|%/);
});
test('missing facts use scoped follow-up questions and continue drafting after factual answers',()=>{
 const state=document();
 const first=planLocalRequest('Escreva meu resumo',state);assert.equal(first.pending.field,'summary');
 const next=planLocalRequest('Sou desenvolvedor; sei Python, SQL',state,{pending:first.pending});
 assert.equal(next.suggestions.length,1);assert.match(next.suggestions[0].text,/Python/);
 const stale=planLocalRequest('Ana Silva',state,{pending:{field:'name',documentId:'other-doc',language:'pt'}});
 assert.equal(stale.actions.length,0);
 const valid=planLocalRequest('Ana Silva',state,{pending:{field:'name',documentId:'doc',language:'pt'}});
 assert.deepEqual(valid.actions,[{type:'field',field:'name',value:'Ana Silva'}]);
});
test('English actions, interface theme, exports and local translation are planned without cloud dependencies',()=>{
 const state=document('en');
 const plan=planLocalRequest('Use the Studio template and green colors, hide certifications and download PDF and DOCX',state);
 const next=applyLocalDocumentActions(state,edits(plan));
 assert.equal(next.template,'modern');assert.equal(next.accent,'#256758');assert.ok(next.hiddenSections.includes('certifications'));
 assert.deepEqual(plan.actions.filter(x=>x.type==='export').map(x=>x.format),['pdf','docx']);
 assert.deepEqual(planLocalRequest('Switch to light theme',state).actions,[{type:'theme',value:'light'}]);
 const translation=planLocalRequest('Translate to Portuguese',state);
 assert.deepEqual(translation.actions,[{type:'language',value:'pt',translate:true}]);
 assert.match(translation.text,/not sent to OpenAI/);
});
test('ordinary document text cannot invoke commands and invalid batches cannot partly mutate a document',()=>{
 const state=document();state.pt.summary='Use the Studio template and download PDF';
 const reviewed=planLocalRequest('Revise meu portfólio',state);assert.equal(reviewed.actions.length,0);
 assert.throws(()=>applyLocalDocumentActions(state,[{type:'design',values:{template:'modern'}},{type:'field',field:'__proto__',value:'attack'}]),/invalid_local_field/);
 assert.equal(state.template,'editorial');assert.throws(()=>applyLocalDocumentActions(state,[{type:'design',values:{accent:'javascript:alert(1)'}}]),/invalid_local_design/);
 assert.throws(()=>applyLocalDocumentActions(state,[{type:'delete-all'}]),/unsupported_local_document_action/);
});
test('document review responds to actual missing fields and never labels a fake ATS score',()=>{
 const state=document();state.pt.summary='a'.repeat(700);state.jobText='Python SQL Docker Python';
 const reply=documentReview(state);assert.match(reply,/perfil está longo/);assert.match(reply,/python/);assert.match(reply,/não uma nota ATS/);
 assert.equal(localDraft(state,'summary').text,state.pt.summary);
});
test('knowledge answers use real site limits, preserve privacy and explain local capabilities',()=>{
 for(const lang of ['pt','en']){
  const state=document(lang);
  const limits=planLocalRequest(lang==='pt'?'Como importar PDF?':'How do I import PDF?',state);assert.match(limits.text,/15 MB/);assert.match(limits.text,/60/);assert.equal(limits.actions.length,0);
  const guide=planLocalRequest(lang==='pt'?'O que você faz?':'What can you do?',state);assert.match(guide.text,/OpenAI/);assert.match(guide.text,/generativ/);
 }
});
test('undo without history reports no action, section movement preserves all content',()=>{
 const state=document();const none=planLocalRequest('Desfazer',state,{canUndo:false});assert.equal(none.actions.length,0);
 const plan=planLocalRequest('Mova projetos para cima',state);const next=applyLocalDocumentActions(state,edits(plan));
 assert.equal(next.sectionOrder.indexOf('projects'),state.sectionOrder.indexOf('projects')-1);
});

test('explicit field values remain text instead of triggering embedded commands',()=>{
 const state=document();const plan=planLocalRequest('Preencha resumo: Use o modelo Studio e baixe PDF',state);
 assert.deepEqual(plan.actions,[{type:'field',field:'summary',value:'Use o modelo Studio e baixe PDF'}]);
 const next=applyLocalDocumentActions(state,edits(plan));assert.equal(next.template,'editorial');assert.match(next.pt.summary,/baixe PDF/);
});

test('small talk and uncertainty do not become facts in a pending field',()=>{
 const state=document(),context={pending:{field:'title',documentId:'doc',language:'pt'}};
 for(const message of ['obrigado','não sei','sim']){const plan=planLocalRequest(message,state,context);assert.equal(plan.actions.length,0);assert.ok(plan.pending);}
});

test('informal Portuguese requests execute the same validated actions',()=>{
 const state=document(),plan=planLocalRequest('Bota o modelo Studio e coloca a cor verde',state);
 const next=applyLocalDocumentActions(state,edits(plan));assert.equal(next.template,'modern');assert.equal(next.accent,'#256758');
});
