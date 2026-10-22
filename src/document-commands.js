import {fields} from './model.js';
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const documentActionTypes=['field','outline','design','section','move-section','replace-all','number-sections','add-section','compact'];
export function planDocumentCommand(input,state){
 const q=norm(input.trim()),en=state.lang==='en',reply=(pt,english)=>en?english:pt;
 const result=(action,text)=>({actions:[action],text,suggestions:[],pending:null});
 if(/^(como|qual|quais|how|what|which|por que|why)\b/.test(q))return null;
 const quotes=[...input.matchAll(/["“]([^"”]+)["”]/g)].map(m=>m[1]);
 const all=/\b(tod[oa]s?|all|every)\b/.test(q);
 if(all&&/\b(remov[ae]|remover|apague|exclua|remove|delete|substitua|substituir|troque|replace)\b/.test(q)){
  const replacing=/\b(substitua|substituir|troque|replace)\b/.test(q);
  if(!quotes[0]||(replacing&&quotes.length<2))return {actions:[],suggestions:[],pending:null,text:reply('Informe o texto entre aspas: Remova "texto" de todas as seções; ou Substitua "antigo" por "novo" em todas as seções.','Quote the text: Remove "text" from all sections; or Replace "old" with "new" in all sections.')};
  return result({type:'replace-all',from:quotes[0],to:replacing?quotes[1]:''},reply('Aplicado a todos os campos de conteúdo e seções extras, em PT e EN. Contatos preservados. Você pode desfazer.','Applied to all content fields and custom sections in PT and EN. Contacts preserved. You can undo.'));
 }
 if(/\b(indices|indice|numeracao|numere|numbering|number|indexes|indices)\b/.test(q)&&/\b(adicione|adicione|coloque|inclua|numere|remova|retire|oculte|add|include|number|remove|hide)\b/.test(q)){
  const enabled=!/\b(remova|retire|oculte|remove|hide)\b/.test(q);
  return result({type:'number-sections',enabled},reply(enabled?'Seções numeradas no portfólio, PDF e Word.':'Numeração removida das seções no portfólio, PDF e Word.',enabled?'Sections numbered in the portfolio, PDF and Word.':'Section numbering removed in the portfolio, PDF and Word.'));
 }
 if(/^(adicione|crie|inclua|add|create)\b/.test(q)&&/\b(secao|section)\b/.test(q)&&quotes[0]){
  if(state.customSections.length>=10)return {actions:[],suggestions:[],pending:null,text:reply('O limite é de 10 seções extras. Remova uma antes de adicionar outra.','The limit is 10 custom sections. Remove one before adding another.')};
  return result({type:'add-section',title:quotes[0]},reply('Seção criada. Preencha o conteúdo em Conteúdo; ela aparece na exportação quando tiver texto.','Section created. Fill it under Content; it appears in exports once it contains text.'));
 }
 if(/\b(compacto|compacta|compact|objetivo|objetiva|concise)\b/.test(q)&&/\b(deixe|tornar|torne|organize|make|keep|compacte)\b/.test(q))return result({type:'compact'},reply('Apliquei layout essencial, margens menores e espaçamento compacto nas duas versões. Organizei espaços sem cortar fatos. Para uma leitura rápida, use um perfil de até 3 frases e 2–3 projetos relevantes.','Applied the essential layout, smaller margins and compact spacing in both versions. Cleaned spacing without cutting facts. For quick reading, use a profile of up to 3 sentences and 2–3 relevant projects.'));
 return null;
}
export function applyDocumentCommand(next,action){
 if(action.type==='number-sections'){
  if(typeof action.enabled!=='boolean')throw Error('invalid_section_numbering');next.sectionNumbers=action.enabled;
 }else if(action.type==='add-section'){
  if(typeof action.title!=='string'||!action.title.trim()||action.title.length>150||next.customSections.length>=10)throw Error('invalid_custom_section');
  const id=globalThis.crypto.randomUUID();next.customSections.push({id,pt:{title:'',text:''},en:{title:'',text:''}});next.customSections.at(-1)[next.lang].title=action.title;
 }else if(action.type==='replace-all'){
  if(typeof action.from!=='string'||!action.from||action.from.length>1500||typeof action.to!=='string'||action.to.length>1500)throw Error('invalid_batch_replacement');
  const pattern=new RegExp(action.from.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'giu');
  const replace=text=>text.replace(pattern,()=>action.to).replace(/[ \t]{2,}/g,' ').split('\n').map(x=>x.trim()).join('\n').trim();
  for(const lang of ['pt','en']){for(const field of fields)next[lang][field]=replace(next[lang][field]);for(const section of next.customSections){section[lang].title=replace(section[lang].title);section[lang].text=replace(section[lang].text);}}
 }else if(action.type==='compact'){
  Object.assign(next,{template:'minimal',webLayout:'minimal',fontSize:10.5,lineHeight:1.25,margin:14});
  const clean=text=>text.replace(/\r/g,'').split('\n').map(x=>x.trim().replace(/[ \t]+/g,' ')).join('\n').replace(/\n{3,}/g,'\n\n').trim();
  for(const lang of ['pt','en']){for(const field of fields)next[lang][field]=clean(next[lang][field]);for(const section of next.customSections)section[lang].text=clean(section[lang].text);}
 }else return false;
 return true;
}
