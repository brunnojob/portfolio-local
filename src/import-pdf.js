export async function extractPdf(buffer,pdfjs){
 const loadingTask=pdfjs.getDocument({data:new Uint8Array(buffer),isEvalSupported:false});
 try{
  const pdf=await loadingTask.promise;
  if(pdf.numPages>60)throw Error('Limite de 60 páginas / 60 page limit');
  const pages=[];
  for(let i=1;i<=pdf.numPages;i++){
   const page=await pdf.getPage(i),content=await page.getTextContent();
   let lastY=null,text='';
   for(const item of content.items){
    if(!('str' in item))continue;
    const y=item.transform[5];
    if(lastY!==null&&Math.abs(y-lastY)>3)text+='\n';
    text+=item.str+(item.hasEOL?'\n':' ');
    lastY=y;
   }
   pages.push(text);
  }
  return pages.join('\n\n');
 }finally{await loadingTask.destroy();}
}
