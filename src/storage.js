import {createId} from './id.js';
import {blank,validate} from './model.js';
export const legacyKey='forma.portfolio.v1';
const activeKey='forma.active-document';
let dbPromise;
export function database(){
 if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{
  const request=indexedDB.open('forma-studio',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('documents',{keyPath:'id'});
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
  request.onblocked=()=>reject(Error('Feche outras abas do Forma e tente novamente.'));
 });
 return dbPromise;
}
async function operation(mode,execute){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('documents',mode),request=execute(tx.objectStore('documents'));tx.oncomplete=()=>resolve(request.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Saving interrupted'));});}
export async function listDocuments(){return (await operation('readonly',s=>s.getAll())).filter(x=>!x.deleted).sort((a,b)=>b.updatedAt-a.updatedAt);}
export function writeImmediate(data){const snapshot=JSON.stringify(data);localStorage.setItem(legacyKey,snapshot);localStorage.setItem(activeKey,data.id);}
export async function saveDocument(data){const clean=validate(data);if(!clean.id)clean.id=createId();clean.updatedAt=Date.now();let local=false;try{writeImmediate(clean);local=true;}catch{}let indexed=false;try{await operation('readwrite',s=>s.put(clean));indexed=true;}catch{}if(!local&&!indexed)throw Error('O navegador não permitiu salvar. Baixe um backup.');return {document:clean,local,indexed};}
export async function loadDocument(id){const data=await operation('readonly',s=>s.get(id));if(!data||data.deleted)return null;return validate(data);}
export async function removeDocument(id){const d=await loadDocument(id);if(d)await operation('readwrite',s=>s.put({...d,deleted:true}));}
export async function recoverDocuments(){const all=await operation('readonly',s=>s.getAll());for(const d of all.filter(x=>x.deleted))await operation('readwrite',s=>s.put({...d,deleted:false}));}
export async function restoreSession(){let local=null,active=null;try{active=localStorage.getItem(activeKey);const text=localStorage.getItem(legacyKey);if(text)local=validate(JSON.parse(text));}catch{}let documents=[];try{documents=await listDocuments();}catch{}const stored=documents.find(d=>d.id===active)||documents[0];let result=local&&(!stored||local.updatedAt>=stored.updatedAt)?local:stored?validate(stored):blank();if(!result.id)result.id=createId();return result;}
export async function persistStorage(){return navigator.storage?.persist?await navigator.storage.persist():false;}
