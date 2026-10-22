import test from 'node:test';
import assert from 'node:assert/strict';
import {blank} from '../src/model.js';
const values=new Map();
globalThis.sessionStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k),clear:()=>values.clear()};
globalThis.localStorage={removeItem(){},getItem(){throw Error('Persistent drafts must not be read');},setItem(){throw Error('Persistent drafts must not be written');}};
test('session survives reload, supports multiple documents, and ends with the tab',async()=>{
 const storage=await import('../src/storage.js');
 const d=blank();d.id='temporary';d.pt.summary='Sessão temporária';d.en.summary='Temporary session';
 await storage.saveDocument(d);
 const reloaded=await import('../src/storage.js?reload');
 assert.equal((await reloaded.restoreSession()).en.summary,'Temporary session');
 await reloaded.saveDocument({...d,id:'copy'});
 assert.equal((await reloaded.listDocuments()).length,2);
 await reloaded.removeDocument('temporary');assert.equal((await reloaded.listDocuments()).length,1);
 await reloaded.recoverDocuments();assert.equal((await reloaded.listDocuments()).length,2);
 sessionStorage.clear();
 const newTab=await import('../src/storage.js?newtab');
 assert.equal((await newTab.restoreSession()).pt.summary,'');
 assert.equal((await newTab.listDocuments()).length,0);
});
test('storage denial keeps current edits in memory without resurrecting stale session data',async()=>{
 const store=await import('../src/storage.js?denied');
 const original=globalThis.sessionStorage;
 const d=blank();d.id='denied';
 await store.saveDocument(d);
 sessionStorage={...original,setItem(){throw Error('QuotaExceededError');}};
 d.pt.summary='Newest text';
 try{const result=await store.saveDocument(d);assert.equal(result.local,false);assert.equal((await store.restoreSession()).pt.summary,'Newest text');store.clearSession();assert.equal((await store.listDocuments()).length,0);}finally{globalThis.sessionStorage=original;}
});
