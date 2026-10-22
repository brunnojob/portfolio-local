import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {makePdf} from './documents.js';
pdfjs.GlobalWorkerOptions.workerSrc=workerUrl;
let request=0,currentTask=null;
export function cancelPdfPreview(){request++;const task=currentTask;currentTask=null;if(task)void task.destroy().catch(()=>{});}
export async function renderPdfPreview(data,host,zoom=1){
 const token=++request;
 if(currentTask){try{await currentTask.destroy();}catch{}currentTask=null;}
 const buffer=makePdf(data).output('arraybuffer');
 if(token!==request)return;
 const loadingTask=pdfjs.getDocument({data:new Uint8Array(buffer),isEvalSupported:false});currentTask=loadingTask;
 try{
  const pdf=await loadingTask.promise;
  if(token!==request)return;
  const fragment=document.createDocumentFragment();
  const maxWidth=Math.min(740,Math.max(280,host.clientWidth-54))*zoom;
  for(let n=1;n<=pdf.numPages;n++){
   if(token!==request)return;
   const page=await pdf.getPage(n),base=page.getViewport({scale:1}),viewport=page.getViewport({scale:maxWidth/base.width});
   const sheet=document.createElement('div');sheet.className='pdf-sheet';
   const canvas=document.createElement('canvas'),ratio=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(viewport.width*ratio);canvas.height=Math.round(viewport.height*ratio);canvas.style.width=`${viewport.width}px`;canvas.style.height=`${viewport.height}px`;canvas.setAttribute('aria-label',`${data.lang==='pt'?'Página':'Page'} ${n} / ${pdf.numPages}`);canvas.setAttribute('role','img');
   const label=document.createElement('span');label.className='page-label';label.textContent=`${n} / ${pdf.numPages}`;
   sheet.append(canvas,label);fragment.append(sheet);
   await page.render({canvasContext:canvas.getContext('2d'),viewport,transform:[ratio,0,0,ratio,0,0]}).promise;
  }
  if(token===request){host.replaceChildren(fragment);document.querySelector('#page-count').textContent=`${pdf.numPages} ${data.lang==='pt'?'página(s)':'page(s)'}`;}
 }catch(error){if(token===request&&!/destroyed|cancel/i.test(error.message))throw error;}
 finally{if(currentTask===loadingTask){await loadingTask.destroy();currentTask=null;}}
}
