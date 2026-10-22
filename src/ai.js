import {cleanDesign} from '../supabase/functions/portfolio-assistant/catalog.js';
export const AI_ENDPOINT='https://cdkbobyevlwxofvcoxcc.supabase.co/functions/v1/portfolio-assistant';
const fields=['title','summary','experience','education','skills','certifications','languages','projects','extra'];
export function aiPayload(state,question,history=[]){
 // Deliberately omit identity, contact, photo, custom sections and inactive language.
 const redact=text=>String(text).replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi,'[email]').replace(/(?:\+?\d[\d ()-]{7,}\d)/g,'[phone]');
 return {design:{template:state.template,webLayout:state.webLayout,accent:state.accent,ink:state.ink},language:state.lang,type:state.portfolioType||'general',question:redact(question),document:Object.fromEntries(fields.map(key=>[key,redact(state[state.lang][key]).slice(0,6000)])),job:redact(state.jobText||'').slice(0,6000),history:history.slice(-4).map(x=>({role:x.role,content:redact(x.text).slice(0,1500)}))};
}
export async function askAI(payload,fetcher=fetch){
 const response=await fetcher(AI_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(55000)});
 const data=await response.json().catch(()=>({}));if(!response.ok){const error=new Error(data.error||'provider_unavailable');error.code=data.error;throw error;}
 if(typeof data.reply!=='string'||!Array.isArray(data.suggestions))throw Error('invalid_response');
 return {reply:data.reply,suggestions:data.suggestions.filter(x=>x&&fields.includes(x.field)&&typeof x.text==='string'&&typeof x.reason==='string').slice(0,9),design:cleanDesign(data.design)};
}
export function aiError(code,lang){const errors={quota_exceeded:['O serviço de IA está sem créditos. A edição e as orientações locais continuam disponíveis.','The AI service has no credits. Editing and local guidance remain available.'],rate_limited:['Limite temporário de uso atingido. Tente mais tarde.','The temporary usage limit was reached. Try again later.'],provider_auth:['A chave do serviço precisa ser atualizada pelo responsável.','The service key needs to be updated by the owner.'],limiter_unavailable:['O serviço está temporariamente indisponível. Tente novamente em alguns minutos.','The service is temporarily unavailable. Try again in a few minutes.'],not_configured:['A IA ainda não foi configurada pelo responsável.','AI has not been configured by the owner.']};return (errors[code]||['Não foi possível consultar a IA agora. Tente novamente; seu documento está salvo.','AI is unavailable right now. Try again; your document is saved.'])[lang==='en'?1:0];}

export async function translateWithAI(entries,language,fetcher=fetch){
 if(entries.some(x=>x.text.length>6000))throw Error('translation_too_large');
 const payload={task:'translate',language,entries:entries.map((x,id)=>({id,text:x.text}))};
 const response=await fetcher(AI_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(60000)});
 const result=await response.json().catch(()=>({}));
 if(!response.ok){const error=new Error(result.error||'provider_unavailable');error.code=result.error;throw error;}
 if(!Array.isArray(result.translations)||result.translations.length!==entries.length)throw Error('invalid_response');
 return entries.map((entry,id)=>{
  const matches=result.translations.filter(x=>x.id===id);
  if(matches.length!==1||typeof matches[0].text!=='string'||!matches[0].text.trim())throw Error('invalid_response');
  return {...entry,text:matches[0].text};
 });
}
