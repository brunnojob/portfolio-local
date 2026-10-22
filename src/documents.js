import {Document,Packer,Paragraph,TextRun,HeadingLevel,ImageRun,Table,TableRow,TableCell,WidthType,BorderStyle,AlignmentType} from 'docx';
import {jsPDF} from 'jspdf';
import {sections} from './model.js';
import {getTemplate,tint} from './templates.js';
export function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
export const filename=(data,ext)=>`${(data.projectName||data.name||'curriculo').replace(/[^\p{L}\p{N}-]/gu,'-')}-${data.lang}.${ext}`;
const sideFields=new Set(['skills','certifications','languages','extra']);
export function makePdf(data){
 const template=getTemplate(data.template),paper=data.paper||'a4';
 const pdf=new jsPDF({unit:'mm',format:paper}),pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight();
 const margin=data.margin||18,accent=data.accent,ink=data.ink||'#273443',font=data.font&&data.font!=='auto'?data.font:template.font;
 const size=data.fontSize||10.5,line=(size/2.83465)*(data.lineHeight||1.45),items=sections(data),photo=data.showPhoto&&data.photo;
 const hasSide=template.layout==='sidebar',hasColumns=template.layout==='columns';
 const firstStart=template.header==='minimal'?49:template.header==='technical'?61:66;
 function initialize(index){
  while(pdf.getNumberOfPages()<index+1)pdf.addPage();pdf.setPage(index+1);
  if(hasSide){pdf.setFillColor(tint(accent,.93));pdf.rect(margin-6,index===0?firstStart-5:22,55,ph-(index===0?firstStart-5:22)-18,'F');}
  if(index>0){pdf.setFont(font,'normal');pdf.setFontSize(8);pdf.setTextColor(accent);pdf.text((data.name||'').slice(0,80),margin,13);pdf.setDrawColor(tint(accent,.75));pdf.setLineWidth(.3);pdf.line(margin,17,pw-margin,17);}
 }
 initialize(0);
 const dark=template.header==='dark',band=template.header==='band'||template.header==='creative',center=template.header==='center';
 if(dark){pdf.setFillColor(accent);pdf.rect(0,0,pw,57,'F');}
 if(band){pdf.setFillColor(tint(accent,.9));pdf.rect(0,0,pw,57,'F');pdf.setFillColor(accent);pdf.rect(0,0,5,57,'F');}
 if(template.id==='modern'){pdf.setFillColor(accent);pdf.rect(0,0,pw,4,'F');}
 if(template.header==='technical'){pdf.setDrawColor(accent);pdf.setLineWidth(.7);pdf.rect(margin-3,12,pw-margin*2+6,43);}
 pdf.setFont(font,template.id==='editorial'||template.id==='minimal'?'normal':'bold');pdf.setFontSize(template.header==='compact'?24:28);pdf.setTextColor(dark?'#ffffff':ink);
 const headerW=pw-margin*2-(photo?30:0),name=data.name||(data.lang==='pt'?'Seu nome':'Your name');
 const nameLines=pdf.splitTextToSize(name,headerW).slice(0,2);let y=24;
 for(const l of nameLines){pdf.text(l,center?pw/2:margin,y,{align:center?'center':'left'});y+=9;}
 pdf.setFont(font,'normal');pdf.setFontSize(11);pdf.setTextColor(dark?'#ffffff':accent);
 const title=pdf.splitTextToSize(data[data.lang].title||(data.lang==='pt'?'Seu cargo ou objetivo profissional':'Your role or professional objective'),headerW).slice(0,2);
 for(const l of title){pdf.text(l,center?pw/2:margin,y,{align:center?'center':'left'});y+=5;}
 pdf.setFontSize(8);pdf.setTextColor(dark?'#ffffff':ink);
 const contact=[data.location,data.email,data.phone,data.website].filter(Boolean).join('  |  ');
 for(const l of pdf.splitTextToSize(contact,headerW).slice(0,3)){pdf.text(l,center?pw/2:margin,y,{align:center?'center':'left'});y+=4;}
 if(photo)pdf.addImage(data.photo,'JPEG',pw-margin-24,16,24,24);
 const start=Math.max(firstStart,y+9);
 if(template.header==='line'||template.header==='center'){pdf.setDrawColor(accent);pdf.setLineWidth(template.header==='center'?.3:.7);pdf.line(margin,start-7,pw-margin,start-7);}
 const bottom=ph-20;
 function flow(content,x,width){pdf.setPage(1);let pageIndex=0,cursor=start;
  const next=()=>{pageIndex++;if(pageIndex>=pdf.getNumberOfPages())initialize(pageIndex);else pdf.setPage(pageIndex+1);cursor=27;};
  for(const section of content){
   if(cursor+16+line*2>bottom)next();
   pdf.setTextColor(accent);pdf.setFont(font,'bold');pdf.setFontSize(size+1);
   const heading=section.title||'';
   if(template.id==='timeline'){pdf.setFillColor(accent);pdf.circle(x-3,cursor-1,1,'F');}
   if(template.id==='modern'||template.id==='technical'){pdf.setFillColor(tint(accent,.91));pdf.rect(x-1,cursor-4,width+2,7,'F');}
   const heads=pdf.splitTextToSize(heading,width);
   for(const h of heads){pdf.text(h,x,cursor);cursor+=line;}
   if(template.id==='classic'||template.id==='academic'||template.id==='executive'){pdf.setDrawColor(tint(accent,.7));pdf.setLineWidth(.2);pdf.line(x,cursor-2,width+x,cursor-2);}
   cursor+=2;pdf.setFont(font,'normal');pdf.setFontSize(size);pdf.setTextColor(ink);
   for(const paragraph of section.text.split('\n')){
    if(!paragraph.trim()){cursor+=line*.65;continue;}
    const lines=pdf.splitTextToSize(paragraph,width);
    for(const text of lines){if(cursor+line>bottom)next();pdf.setFont(font,'normal');pdf.setFontSize(size);pdf.setTextColor(ink);pdf.text(text,x,cursor);cursor+=line;}
   }
   cursor+=line*1.5;
  }
 }
 if(hasSide){flow(items.filter(s=>sideFields.has(s.id)),margin,43);flow(items.filter(s=>!sideFields.has(s.id)),margin+61,pw-margin*2-61);}
 else if(hasColumns){const split=Math.ceil(items.length/2),w=(pw-margin*2-10)/2;flow(items.slice(0,split),margin,w);flow(items.slice(split),margin+w+10,w);}
 else flow(items,margin,pw-margin*2);
 const count=pdf.getNumberOfPages();
 for(let i=1;i<=count;i++){pdf.setPage(i);pdf.setFont('helvetica','normal');pdf.setFontSize(7);pdf.setTextColor('#8c929e');pdf.text(`${i} / ${count}`,pw-margin,ph-10,{align:'right'});}
 return pdf;
}
export async function makeDocx(data){
 const t=getTemplate(data.template),color=data.accent.slice(1),ink=(data.ink||'#273443').slice(1),font={helvetica:'Arial',times:'Times New Roman',courier:'Courier New'}[data.font&&data.font!=='auto'?data.font:t.font],size=Math.round((data.fontSize||10.5)*2);
 const content=sections(data),center=t.header==='center',dark=t.header==='dark';
 const header=[];
 if(data.showPhoto&&data.photo)header.push(new Paragraph({children:[new ImageRun({type:'jpeg',data:Uint8Array.from(atob(data.photo.split(',')[1]),c=>c.charCodeAt(0)),transformation:{width:82,height:82}})],alignment:center?AlignmentType.CENTER:AlignmentType.RIGHT}));
 header.push(new Paragraph({alignment:center?AlignmentType.CENTER:AlignmentType.LEFT,spacing:{after:140},shading:dark?{fill:color}:undefined,children:[new TextRun({text:data.name||'',bold:t.id!=='editorial',color:dark?'FFFFFF':color,size:48})]}),new Paragraph({alignment:center?AlignmentType.CENTER:AlignmentType.LEFT,children:[new TextRun({text:data[data.lang].title,size:26,color})]}),new Paragraph({alignment:center?AlignmentType.CENTER:AlignmentType.LEFT,text:[data.location,data.email,data.phone,data.website].filter(Boolean).join(' | '),spacing:{after:250}}));
 const body=list=>list.flatMap(s=>[new Paragraph({heading:HeadingLevel.HEADING_1,keepNext:true,spacing:{before:220,after:130},border:{bottom:{color,style:BorderStyle.SINGLE,size:3}},children:[new TextRun({text:s.title,bold:true,color,size:size+3})]}),...s.text.split('\n').map(text=>new Paragraph({text,spacing:{after:80}}))]);
 let children;
 if(t.layout==='single')children=[...header,...body(content)];
 else{const left=t.layout==='sidebar'?content.filter(s=>sideFields.has(s.id)):content.slice(0,Math.ceil(content.length/2));const right=t.layout==='sidebar'?content.filter(s=>!sideFields.has(s.id)):content.slice(Math.ceil(content.length/2));const noBorder={style:BorderStyle.NONE,size:0,color:'FFFFFF'};children=[...header,new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:{top:noBorder,bottom:noBorder,left:noBorder,right:noBorder,insideHorizontal:noBorder,insideVertical:noBorder},rows:[new TableRow({children:[new TableCell({width:{size:t.layout==='sidebar'?30:50,type:WidthType.PERCENTAGE},margins:{right:220,left:100},shading:t.layout==='sidebar'?{fill:tint(data.accent,.93).slice(1)}:undefined,children:body(left).length?body(left):[new Paragraph('')]}),new TableCell({width:{size:t.layout==='sidebar'?70:50,type:WidthType.PERCENTAGE},margins:{left:220},children:body(right).length?body(right):[new Paragraph('')]})]})]})];}
 const margin=Math.round((data.margin||18)*56.693),letter=data.paper==='letter';
 const document=new Document({styles:{default:{document:{run:{font,size,color:ink},paragraph:{spacing:{line:Math.round((data.lineHeight||1.45)*240)}}}}},sections:[{properties:{page:{size:{width:letter?12240:11906,height:letter?15840:16838},margin:{top:margin,bottom:margin,left:margin,right:margin}}},children}]});
 return Packer.toBlob(document);
}
export async function exportDocx(data){download(await makeDocx(data),filename(data,'docx'));}
export function exportPdf(data){download(makePdf(data).output('blob'),filename(data,'pdf'));}
