import {fields} from './model.js';
const opposite=language=>language==='pt'?'en':'pt';
const keyOf=item=>item.kind==='field'?`field:${item.field}`:`${item.kind}:${item.id}`;
const hash=text=>{let a=2166136261,b=5381;for(const c of text){a=Math.imul(a^c.charCodeAt(0),16777619);b=Math.imul(b,33)^c.charCodeAt(0);}return `${text.length}:${a>>>0}:${b>>>0}`;};
function value(document,language,item){return item.kind==='field'?document[language]?.[item.field]:document.customSections.find(s=>s.id===item.id)?.[language]?.[item.kind==='customTitle'?'title':'text'];}
function put(document,language,item,text){if(item.kind==='field')document[language][item.field]=text;else{const section=document.customSections.find(s=>s.id===item.id);if(section)section[language][item.kind==='customTitle'?'title':'text']=text;}}
export function translationEntries(document,source=opposite(document.lang),target=document.lang,{overwrite=false}={}){
 const candidates=fields.map(field=>({kind:'field',field}));
 for(const section of document.customSections)candidates.push({kind:'customTitle',id:section.id},{kind:'customText',id:section.id});
 return candidates.flatMap(item=>{
  const text=value(document,source,item)||'',targetText=value(document,target,item)||'',key=keyOf(item),meta=document.translationState?.[`${target}:${key}`],reverse=document.translationState?.[`${source}:${key}`];
  if(!text.trim())return [];
  // Do not translate an unchanged generated version back over its original.
  if(!overwrite&&reverse?.source===target&&reverse.targetHash===hash(text)&&reverse.sourceHash===hash(targetText))return [];
  const stale=meta?.source===source&&meta.targetHash===hash(targetText)&&meta.sourceHash!==hash(text);
  if(!overwrite&&targetText.trim()&&!stale)return [];
  return [{...item,text,source,sourceText:text,targetText}];
 });
}
export function applyTranslations(document,target,translations){
 let applied=0;document.translationState||={};
 for(const item of translations){
  if(typeof item.text!=='string'||!item.text.trim())continue;
  const current=value(document,target,item);if(current===undefined)continue;
  if(item.sourceText!==undefined){if(current!==item.targetText||value(document,item.source,item)!==item.sourceText)continue;}
  else if(current.trim())continue;
  put(document,target,item,item.text);applied++;
  if(item.sourceText!==undefined){const key=keyOf(item);delete document.translationState[`${item.source}:${key}`];document.translationState[`${target}:${key}`]={source:item.source,sourceHash:hash(item.sourceText),targetHash:hash(item.text)};}
 }
 return applied;
}
function chunks(text,size){
 const result=[];let rest=text;
 while(rest.length>size){let cut=rest.lastIndexOf(' ',size);if(cut<size/2)cut=size;result.push(rest.slice(0,cut));rest=rest.slice(cut).trimStart();}result.push(rest);return result;
}
export async function translateMissing(document,source,target,{Translator=globalThis.Translator,onProgress=()=>{},chunkSize=3000,overwrite=false}={}){
 const entries=translationEntries(document,source,target,{overwrite});if(!entries.length)return [];
 if(!Translator?.create)throw Error('TRANSLATOR_UNAVAILABLE');
 const translator=await Translator.create({sourceLanguage:source,targetLanguage:target,monitor(monitor){monitor.addEventListener('downloadprogress',event=>onProgress({download:Math.round(event.loaded*100)}));}});
 try{
  const translated=[];
  for(const [index,item] of entries.entries()){
   // Keep paragraph boundaries. URLs and email addresses are never sent through the translator.
   const lines=[];
   for(const line of item.text.split('\n')){
    const parts=line.split(/(https?:\/\/[^\s]+|[\w.+-]+@[\w.-]+\.[a-z]{2,})/gi),output=[];
    for(const part of parts){
     if(!part.trim()||/^(https?:\/\/|[\w.+-]+@)/i.test(part)){output.push(part);continue;}
     const pieces=[];for(const piece of chunks(part.trim(),chunkSize))pieces.push(await translator.translate(piece));
     output.push((/^\s/.test(part)?' ':'')+pieces.join(' ')+(/\s$/.test(part)?' ':''));
    }
    lines.push(output.join(''));
   }
   translated.push({...item,text:lines.join('\n')});onProgress({done:index+1,total:entries.length});
  }
  return translated;
 }finally{translator.destroy?.();}
}
