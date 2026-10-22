import test from 'node:test';
import assert from 'node:assert/strict';
import {createHandler,cleanPayload,providerRequest,parseAnswer,clientFingerprint} from '../supabase/functions/portfolio-assistant/core.js';
import {translateWithAI} from '../src/ai.js';
import {templates} from '../src/templates.js';
import {templateIds} from '../supabase/functions/portfolio-assistant/catalog.js';
const origin='https://brunnojob.github.io';
const env={OPENAI_API_KEY:'test-key',SUPABASE_URL:'https://example.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-service-key'};
const request=(body,options={})=>new Request('https://example.supabase.co/functions/v1/portfolio-assistant',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body),...options});
const payload={language:'en',question:'Help me start',document:{summary:'Actual facts'}};
const output=value=>({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(value)}]}]});
test('Supabase request checks enforce origin, method, payload and secret readiness',async()=>{
 const handler=createHandler({},()=>{throw Error('Must not contact provider');});
 assert.equal((await handler(request(payload,{headers:{origin:'https://evil.example','content-type':'application/json'}}))).status,403);
 assert.equal((await handler(request(payload,{method:'OPTIONS',body:undefined}))).status,204);
 assert.equal((await handler(request(payload,{method:'PUT'}))).status,405);
 assert.equal((await handler(request({...payload,language:'invalid'}))).status,400);
 assert.equal((await handler(request(payload))).status,503);
 const health=await handler(request(null,{method:'GET',body:undefined}));assert.deepEqual(await health.json(),{configured:false});
 const large=await handler(request({...payload,question:'x'.repeat(91000)}));assert.equal(large.status,413);
});
test('durable limiter fails closed and prevents OpenAI calls when exhausted',async()=>{
 for(const [response,status] of [[new Response('false'),429],[new Response('{}',{status:500}),503]]){
  let calls=0;const handler=createHandler(env,async url=>{calls++;assert.match(url,/consume_portfolio_budget$/);return response;});
  assert.equal((await handler(request(payload))).status,status);assert.equal(calls,1);
 }
});
test('provider receives bounded structured non-stored data, never Supabase credentials',async()=>{
 let calls=0;
 const handler=createHandler(env,async(url,options)=>{
  calls++;const body=JSON.parse(options.body);
  if(url.includes('/rpc/')){assert.match(body.client_hash,/^[0-9a-f]{64}$/);return new Response('true');}
  assert.equal(body.store,false);assert.equal(body.text.format.strict,true);assert.ok(!JSON.stringify(body).includes(env.SUPABASE_SERVICE_ROLE_KEY));
  assert.equal(body.input.at(-1).content.includes('Actual facts'),true);
  return Response.json(output({reply:'Build with your real experience',suggestions:[{field:'summary',text:'Actual facts, clearly written',reason:'Clarity'},{field:'photo',text:'unsafe',reason:'invalid'}],design:{template:'technical',webLayout:'cards',accent:'#223344',ink:'#111111',reason:'Readable'}}));
 });
 const response=await handler(request(payload));assert.equal(response.status,200);const answer=await response.json();assert.equal(answer.suggestions.length,1);assert.equal(answer.design.template,'technical');assert.equal(calls,2);
});
test('provider quota and incomplete outputs return recoverable errors',async()=>{
 for(const [provider,code] of [[Response.json({error:{code:'insufficient_quota'}},{status:429}),'quota_exceeded'],[Response.json({status:'incomplete'}),'provider_unavailable']]){
  const handler=createHandler(env,async url=>url.includes('/rpc/')?new Response('true'):provider);
  assert.equal((await (await handler(request(payload))).json()).error,code);
 }
});
test('translation validates completeness, entry ids and supports custom sections',async()=>{
 const entries=[{kind:'field',field:'summary',text:'Experiência real'},{kind:'customTitle',id:'one',text:'Publicações'}];
 const fetcher=async(url,options)=>{const data=cleanPayload(JSON.parse(options.body));assert.equal(data.task,'translate');assert.match(providerRequest(data).instructions,/English/);const answer=parseAnswer(output({translations:[{id:1,text:'Publications'},{id:0,text:'Real experience'}]}),data);return Response.json(answer);};
 const translated=await translateWithAI(entries,'en',fetcher);assert.equal(translated[0].text,'Real experience');assert.equal(translated[1].id,'one');
 await assert.rejects(translateWithAI(entries,'en',async()=>Response.json({translations:[{id:0,text:'only one'}]})),/invalid_response/);
 const data=cleanPayload({task:'translate',language:'pt',entries:[{id:0,text:'Text'}]});
 assert.throws(()=>parseAnswer(output({translations:[{id:7,text:'Wrong'}]}),data),/invalid_response/);
});
test('client hashes rotate daily and depend on the secret, catalog matches the frontend',async()=>{
 const a=await clientFingerprint('192.0.2.1','secret','2026-10-22');
 assert.notEqual(a,await clientFingerprint('192.0.2.1','secret','2026-10-23'));
 assert.notEqual(a,await clientFingerprint('192.0.2.1','other','2026-10-22'));
 assert.deepEqual(templateIds,templates.map(x=>x.id));
});
