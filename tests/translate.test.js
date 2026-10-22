import test from 'node:test';
import assert from 'node:assert/strict';
import {blank,parseText,validate} from '../src/model.js';
import {translationEntries,translateMissing,translateWithFallback,applyTranslations} from '../src/translate.js';
import {modelTranslator} from '../src/model-translator.js';

test('fills only missing language fields and preserves authored text',async()=>{
 const document=blank();
 document.pt.title='Desenvolvedor';
 document.pt.summary='Criei um projeto.\n\nPubliquei os resultados.';
 document.en.title='Software developer';
 document.customSections.push({id:'one',pt:{title:'Publicações',text:'Artigo publicado'},en:{title:'',text:''}});
 const calls=[];
 const Translator={async create(options){
  assert.equal(options.sourceLanguage,'pt');assert.equal(options.targetLanguage,'en');
  return {async translate(text){calls.push(text);return `EN: ${text}`;},destroy(){calls.push('destroy');}};
 }};
 const translated=await translateMissing(document,'pt','en',{Translator});
 assert.equal(translationEntries(document,'pt','en').length,3);
 applyTranslations(document,'en',translated);
 assert.equal(document.en.title,'Software developer');
 assert.equal(document.en.summary,'EN: Criei um projeto.\n\nEN: Publiquei os resultados.');
 assert.equal(document.customSections[0].en.title,'EN: Publicações');
 assert.equal(document.customSections[0].en.text,'EN: Artigo publicado');
 assert.equal(calls.at(-1),'destroy');
});

test('unavailable translation keeps the original document intact',async()=>{
 const document=blank();document.pt.summary='Minha experiência.';
 await assert.rejects(translateMissing(document,'pt','en',{Translator:undefined}),/TRANSLATOR_UNAVAILABLE/);
 assert.equal(document.en.summary,'');
});

test('fallback model selects the correct direction and Portuguese target token',async()=>{
 const loaded=[],inputs=[];
 const load=async()=>({env:{},pipeline:async(type,model,options)=>{
  loaded.push({type,model,dtype:options.dtype});
  return async input=>{inputs.push(input);return [{translation_text:'Tradução pronta'}];};
 }});
 const english=await modelTranslator({load}).create({sourceLanguage:'pt',targetLanguage:'en'});
 await english.translate('Experiência em projetos');
 const portuguese=await modelTranslator({load}).create({sourceLanguage:'en',targetLanguage:'pt'});
 assert.equal(await portuguese.translate('Experience in projects'),'Tradução pronta');
 assert.equal(loaded[0].model,'Xenova/opus-mt-ROMANCE-en');
 assert.equal(loaded[1].model,'Xenova/opus-mt-en-ROMANCE');
 assert.equal(loaded[0].dtype,'q8');
 assert.deepEqual(inputs,['Experiência em projetos','>>pt_BR<< Experience in projects']);
});

test('PDF header does not merge the document label into the name',()=>{
 const parsed=parseText('Victor Renan da Silva Dutra | Currículo profissional | 1\nPerfil profissional\nExperiência em operações.');
 assert.equal(parsed.name,'Victor Renan da Silva Dutra');
 assert.equal(parsed.title,'');
 assert.equal(parsed.summary,'Experiência em operações.');
 const legacy=blank();legacy.name='Victor Renan da Silva Dutra | Currículo profissional | 1';legacy.projectName=legacy.name;
 assert.equal(validate(legacy).name,'Victor Renan da Silva Dutra');
 assert.equal(validate(legacy).projectName,'Victor Renan da Silva Dutra');
});

test('source edits and appended content refresh generated targets, including custom sections',async()=>{
 const document=blank();document.pt.summary='Primeira versão';document.customSections=[{id:'x',pt:{title:'Artigos',text:'Artigo um'},en:{title:'',text:''}}];
 const Translator={async create(){return {async translate(text){return `EN ${text}`;}};}};
 applyTranslations(document,'en',await translateMissing(document,'pt','en',{Translator}));
 assert.equal(translationEntries(document,'en','pt').length,0);
 document.pt.summary+=' com conteúdo novo';document.customSections[0].pt.text+=' e dois';
 const restored=validate(document);assert.equal(translationEntries(restored,'pt','en').length,2);
 applyTranslations(restored,'en',await translateMissing(restored,'pt','en',{Translator}));
 assert.equal(restored.en.summary,'EN Primeira versão com conteúdo novo');assert.equal(restored.customSections[0].en.text,'EN Artigo um e dois');
});
test('manual edits and edits during translation are protected; explicit rebuild remains possible',async()=>{
 const document=blank();document.pt.summary='Perfil';const Translator={async create(){return {async translate(text){return `EN ${text}`;}};}};
 applyTranslations(document,'en',await translateMissing(document,'pt','en',{Translator}));
 document.en.summary='My manual profile';document.pt.summary='Outro perfil';
 assert.equal(translationEntries(document,'pt','en').length,0);
 const translated=await translateMissing(document,'pt','en',{Translator,overwrite:true});
 document.en.summary='Edited while waiting';assert.equal(applyTranslations(document,'en',translated),0);
 const current=await translateMissing(document,'pt','en',{Translator,overwrite:true});assert.equal(applyTranslations(document,'en',current),1);assert.equal(document.en.summary,'EN Outro perfil');
 document.pt.summary='Outra alteração';const pending=await translateMissing(document,'pt','en',{Translator});document.pt.summary+=' recente';assert.equal(applyTranslations(document,'en',pending),0);
});
test('chunking preserves paragraphs and URLs without injecting new paragraph breaks',async()=>{
 const document=blank();document.pt.summary='Uma frase longa com várias palavras para traduzir em partes.\n\nhttps://example.com/meu-projeto contato@example.com';
 const calls=[];const Translator={async create(){return {async translate(text){calls.push(text);return text.toUpperCase();}};}};
 const result=await translateMissing(document,'pt','en',{Translator,chunkSize:22});
 assert.equal(result[0].text.split('\n').length,3);assert.match(result[0].text,/https:\/\/example.com\/meu-projeto contato@example.com$/);assert.ok(calls.every(text=>!text.includes('https://')&&!text.includes('@')));
});

 test('native translator failure automatically uses the local provider without changing the document',async()=>{
  const document=blank();document.pt.summary='Criei ferramentas.';const calls=[];
  const primary={async create(){calls.push('native');const error=Error('Unsupported language');error.code=9;throw error;}};
  const fallback={async create(){calls.push('local');return {async translate(){return 'I built tools.';},destroy(){calls.push('destroy');}};}};
  const translated=await translateWithFallback(document,'pt','en',{primary,fallback,onFallback:()=>calls.push('fallback')});
  assert.deepEqual(calls,['native','fallback','local','destroy']);assert.equal(document.en.summary,'');applyTranslations(document,'en',translated);assert.equal(document.en.summary,'I built tools.');
 });
