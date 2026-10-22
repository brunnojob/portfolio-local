import test from 'node:test';
import assert from 'node:assert/strict';
import {blank,validate,sections} from '../src/model.js';
import {planLocalRequest,applyLocalDocumentActions} from '../src/local-agent.js';
import {portfolioHtml} from '../src/portfolio.js';
import {makePdf,makeDocx} from '../src/documents.js';
const execute=(state,command)=>applyLocalDocumentActions(state,planLocalRequest(command,state).actions);
test('literal batch removal reaches both languages and custom sections without altering contacts',()=>{
 const state=blank();state.email='teste@example.com';state.pt.summary='Sou teste e desenvolvo.';state.en.projects='TESTE project';state.customSections=[{id:'one',pt:{title:'teste',text:'um teste'},en:{title:'TESTE',text:'TESTE'}}];
 const next=execute(state,'Remova "teste" de todas as seções');
 assert.equal(next.pt.summary,'Sou e desenvolvo.');assert.equal(next.en.projects,'project');assert.equal(next.customSections[0].en.text,'');assert.equal(next.email,state.email);assert.equal(state.pt.summary,'Sou teste e desenvolvo.');
 const replaced=execute(next,'Replace "desenvolvo." with "$& React" in all sections');assert.equal(replaced.pt.summary,'Sou e $& React');
});
test('batch instructions require quoted text and treat metacharacters literally',()=>{
 const state=blank();state.pt.skills='C++ · React';assert.equal(execute(state,'Remova "C++" de todos os campos').pt.skills,'· React');
 assert.equal(planLocalRequest('Remova algo de todas as seções',state).actions.length,0);
 assert.equal(planLocalRequest('Como remover "React" de todas as seções?',state).actions.length,0);
 assert.throws(()=>applyLocalDocumentActions(state,[{type:'replace-all',from:'',to:''}]),/invalid_batch/);
});
test('heading numbering is consistent in HTML PDF and Word, can be removed and survives backup',async()=>{
 let state=blank();state.pt.summary='Perfil';state.pt.projects='Projeto real\nResultado';
 state=execute(state,'Adicione índices');assert.equal(validate(state).sectionNumbers,true);assert.equal(sections(state)[0].title,'01  Perfil profissional');
 assert.match(portfolioHtml(state),/01  Perfil profissional/);
 const text=makePdf(state).output();assert.match(text,/01  Perfil profissional/);assert.ok((await makeDocx(state)).size>0);
 state=execute(state,'Remova os índices');assert.equal(sections(state)[0].title,'Perfil profissional');assert.doesNotMatch(portfolioHtml(state),/01  Perfil profissional/);
});
test('compact command preserves facts in both languages while applying a denser layout',()=>{
 const state=blank();state.pt.projects='Projeto A\n\n\n Resultado: 42 usuários';state.en.summary='Built tools for 42 users.';
 const next=execute(state,'Deixe meu portfólio compacto e objetivo');assert.equal(next.template,'minimal');assert.equal(next.webLayout,'minimal');assert.equal(next.lineHeight,1.25);assert.match(next.pt.projects,/42 usuários/);assert.equal(next.en.summary,state.en.summary);
});
test('custom section creation and contextual palette commands execute locally',()=>{
 const state=blank();const next=execute(state,'Adicione uma seção "Publicações"');assert.equal(next.customSections[0].pt.title,'Publicações');assert.equal(next.customSections[0].en.title,'');
 assert.notEqual(execute(state,'Melhore a paleta para engenharia').accent,execute(state,'Melhore a paleta para design').accent);
 assert.equal(planLocalRequest('Qual paleta você recomenda para engenharia?',state).actions.length,0);
});
