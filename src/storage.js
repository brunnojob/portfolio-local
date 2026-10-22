import {createId} from './id.js';
import {blank,validate} from './model.js';
export const sessionKey='forma.session.v2';
let memory=null;
function read(){
 if(memory)return memory;
 try{const value=JSON.parse(sessionStorage.getItem(sessionKey));if(value&&Array.isArray(value.documents)){memory={active:typeof value.active==='string'?value.active:null,documents:value.documents.filter(d=>d&&typeof d==='object').flatMap(d=>{try{return [{...validate(d),deleted:!!d.deleted}];}catch{return [];}})};return memory;}}catch{}
 memory={active:null,documents:[]};return memory;
}
function write(value){
 memory=value;
 try{sessionStorage.setItem(sessionKey,JSON.stringify(value));return true;}catch{return false;}
}
export function writeImmediate(data){
 const value=read(),clean=validate(data);
 value.active=clean.id;
 value.documents=value.documents.filter(d=>d.id!==clean.id);
 value.documents.push(clean);
 return write(value);
}
export async function saveDocument(data){
 const clean=validate(data);if(!clean.id)clean.id=createId();clean.updatedAt=Date.now();
 const local=writeImmediate(clean);
 return {document:clean,local,indexed:false};
}
export async function listDocuments(){return read().documents.filter(d=>!d.deleted).sort((a,b)=>b.updatedAt-a.updatedAt);}
export async function loadDocument(id){const data=read().documents.find(d=>d.id===id&&!d.deleted);return data?validate(data):null;}
export async function removeDocument(id){const value=read();value.documents=value.documents.map(d=>d.id===id?{...d,deleted:true}:d);write(value);}
export async function recoverDocuments(){const value=read();value.documents=value.documents.map(d=>({...d,deleted:false}));write(value);}
export function clearSession(){memory={active:null,documents:[]};try{sessionStorage.removeItem(sessionKey);}catch{}}
export async function restoreSession(){
 try{localStorage.removeItem('forma.portfolio.v1');localStorage.removeItem('forma.active-document');globalThis.indexedDB?.deleteDatabase('forma-studio');}catch{}
 const value=read(),data=value.documents.find(d=>d.id===value.active&&!d.deleted)||value.documents.find(d=>!d.deleted);
 let result;try{result=data?validate(data):blank();}catch{result=blank();}
 if(!result.id)result.id=createId();return result;
}
