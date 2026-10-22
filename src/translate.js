import {fields} from './model.js';

const opposite=language=>language==='pt'?'en':'pt';

export function translationEntries(document,source=opposite(document.lang),target=document.lang){
 const entries=[];
 for(const field of fields){
  if(document[source][field].trim()&&!document[target][field].trim())entries.push({kind:'field',field,text:document[source][field]});
 }
 for(const section of document.customSections){
  const from=section[source],to=section[target];
  if(from.title.trim()&&!to.title.trim())entries.push({kind:'customTitle',id:section.id,text:from.title});
  if(from.text.trim()&&!to.text.trim())entries.push({kind:'customText',id:section.id,text:from.text});
 }
 return entries;
}

export function applyTranslations(document,target,translations){
 for(const item of translations){
  if(item.kind==='field'&&!document[target][item.field].trim())document[target][item.field]=item.text;
  if(item.kind==='customTitle'||item.kind==='customText'){
   const section=document.customSections.find(section=>section.id===item.id);
   if(!section)continue;
   const key=item.kind==='customTitle'?'title':'text';
   if(!section[target][key].trim())section[target][key]=item.text;
  }
 }
}

function chunks(text,size=3000){
 const lines=text.split('\n'),result=[];
 for(const line of lines){
  if(!line){result.push('');continue;}
  let rest=line;
  while(rest.length>size){
   let cut=rest.lastIndexOf(' ',size);
   if(cut<size/2)cut=size;
   result.push(rest.slice(0,cut));
   rest=rest.slice(cut).trimStart();
  }
  result.push(rest);
 }
 return result;
}

export async function translateMissing(document,source,target,{Translator=globalThis.Translator,onProgress=()=>{},chunkSize=3000}={}){
 const entries=translationEntries(document,source,target);
 if(!entries.length)return [];
 if(!Translator?.create)throw Error('TRANSLATOR_UNAVAILABLE');
 const translator=await Translator.create({sourceLanguage:source,targetLanguage:target,monitor(monitor){monitor.addEventListener('downloadprogress',event=>onProgress({download:Math.round(event.loaded*100)}));}});
 try{
  const translated=[];
  for(const [index,item] of entries.entries()){
   const pieces=[];
   for(const part of chunks(item.text,chunkSize))pieces.push(part.trim()?await translator.translate(part):'');
   translated.push({...item,text:pieces.join('\n')});
   onProgress({done:index+1,total:entries.length});
  }
  return translated;
 }finally{translator.destroy?.();}
}
