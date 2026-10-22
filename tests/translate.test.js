import test from 'node:test';
import assert from 'node:assert/strict';
import {blank,parseText,validate} from '../src/model.js';
import {translationEntries,translateMissing,applyTranslations} from '../src/translate.js';
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
