export const AI_ENDPOINT='https://portfolio-maker-assistant.vercel.app/api/assistant';
const fields=['title','summary','experience','education','skills','certifications','languages','projects','extra'];
export function aiPayload(state,question,history=[]){
 // Deliberately omit identity, contact, photo, custom sections and inactive language.
 const redact=text=>String(text).replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi,'[email]').replace(/(?:\+?\d[\d ()-]{7,}\d)/g,'[phone]');
 return {language:state.lang,type:state.portfolioType||'general',question:redact(question),document:Object.fromEntries(fields.map(key=>[key,redact(state[state.lang][key]).slice(0,6000)])),job:redact(state.jobText||'').slice(0,6000),history:history.slice(-4).map(x=>({role:x.role,content:redact(x.text).slice(0,1500)}))};
}
export async function askAI(payload,fetcher=fetch){
 const response=await fetcher(AI_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(55000)});
 const data=await response.json().catch(()=>({}));if(!response.ok){const error=new Error(data.error||'provider_unavailable');error.code=data.error;throw error;}
 if(typeof data.reply!=='string'||!Array.isArray(data.suggestions))throw Error('invalid_response');
 return {reply:data.reply,suggestions:data.suggestions.filter(x=>fields.includes(x.field)&&typeof x.text==='string'&&typeof x.reason==='string').slice(0,3)};
}
export function aiError(code,lang){const errors={quota_exceeded:['O serviço de IA está sem créditos. A edição e as orientações locais continuam disponíveis.','The AI service has no credits. Editing and local guidance remain available.'],rate_limited:['Limite de 5 consultas por hora atingido. Tente mais tarde.','The limit of 5 requests per hour was reached. Try later.'],provider_auth:['A chave do serviço precisa ser atualizada pelo responsável.','The service key needs to be updated by the owner.'],not_configured:['A IA ainda não foi configurada pelo responsável.','AI has not been configured by the owner.']};return (errors[code]||['Não foi possível consultar a IA agora. Tente novamente; seu documento está salvo.','AI is unavailable right now. Try again; your document is saved.'])[lang==='en'?1:0];}
