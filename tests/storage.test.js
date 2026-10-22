import test from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import {blank} from '../src/model.js';
import {saveDocument,restoreSession,listDocuments,loadDocument,removeDocument,recoverDocuments,database,legacyKey} from '../src/storage.js';
const values=new Map();
globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k),clear:()=>values.clear()};
test('documents survive a closed database connection and a fresh app module',async()=>{
 const d=blank();d.id='persistence-test';d.name='Ana Silva';d.pt.summary='Rascunho durável';d.template='sidebar';d.accent='#176b94';
 await saveDocument(d);const db=await database();db.close();
 const reopened=await import('../src/storage.js?reopened');
 const restored=await reopened.restoreSession();assert.equal(restored.name,'Ana Silva');assert.equal(restored.pt.summary,'Rascunho durável');assert.equal(restored.template,'sidebar');
 localStorage.clear();const fromDb=await reopened.restoreSession();assert.equal(fromDb.name,'Ana Silva');assert.equal(fromDb.accent,'#176b94');
 const copy={...fromDb,id:'copy-test',projectName:'Segunda vaga'};await reopened.saveDocument(copy);
 assert.equal((await reopened.listDocuments()).length,2);assert.equal((await reopened.loadDocument('persistence-test')).pt.summary,'Rascunho durável');
 await reopened.removeDocument('persistence-test');assert.equal((await reopened.listDocuments()).length,1);await reopened.recoverDocuments();assert.equal((await reopened.listDocuments()).length,2);
});
test('legacy local draft content is migrated without losing bilingual text',async()=>{
 const d=blank();d.pt.summary='Perfil antigo';d.en.summary='Previous profile';d.updatedAt=Date.now()+10000;localStorage.setItem(legacyKey,JSON.stringify(d));
 const isolated=await import('../src/storage.js?legacy');const restored=await isolated.restoreSession();assert.equal(restored.pt.summary,'Perfil antigo');assert.equal(restored.en.summary,'Previous profile');assert.ok(restored.id);
});
