import {Document,Packer,Paragraph,TextRun,HeadingLevel,ImageRun} from 'docx';
import {jsPDF} from 'jspdf';
import {fields,labels,documentHtml} from './model.js';

export function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
const filename=(data,ext)=>`${(data.name||'curriculo').replace(/[^\p{L}\p{N}-]/gu,'-')}-${data.lang}.${ext}`;
export async function makeDocx(data){
 const d=data[data.lang], color=data.accent.slice(1);
 const children=[];
 if(data.showPhoto && data.photo) children.push(new Paragraph({children:[new ImageRun({type:'jpeg',data:Uint8Array.from(atob(data.photo.split(',')[1]),c=>c.charCodeAt(0)),transformation:{width:88,height:88}})]}));
 children.push(new Paragraph({heading:HeadingLevel.TITLE,children:[new TextRun({text:data.name,bold:true,color,size:48})]}),new Paragraph({children:[new TextRun({text:d.title,size:26,color})]}),new Paragraph({text:[data.location,data.email,data.phone,data.website].filter(Boolean).join(' | '),spacing:{after:220}}));
 for(const k of fields.filter(k=>k!=='title'&&d[k])){children.push(new Paragraph({text:labels[data.lang][k],heading:HeadingLevel.HEADING_1,keepNext:true}));for(const line of d[k].split('\n'))children.push(new Paragraph({text:line,spacing:{after:90}}));}
 const doc=new Document({styles:{default:{document:{run:{font:'Calibri',size:22},paragraph:{spacing:{line:280}}}}},sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1000,bottom:1000,left:1100,right:1100}}},children}]});
 return Packer.toBlob(doc);
}
export function makePdf(data){
 const pdf=new jsPDF({unit:'mm',format:'a4'}),d=data[data.lang];let y=22;
 const color=data.accent, width=170;
 const page=()=>{pdf.addPage();y=22;};
 const write=(text,size=10,bold=false)=>{pdf.setFont('helvetica',bold?'bold':'normal');pdf.setFontSize(size);const lines=pdf.splitTextToSize(text||'',width);for(const line of lines){if(y>274)page();pdf.text(line,20,y);y+=size*0.48;}y+=3;};
 pdf.setTextColor(color);
 if(data.showPhoto&&data.photo){pdf.addImage(data.photo,'JPEG',168,18,22,22);}
 pdf.setFont('helvetica','bold');pdf.setFontSize(23);
 const nameLines=pdf.splitTextToSize(data.name||'',data.showPhoto?140:170);for(const l of nameLines){if(y>265)page();pdf.text(l,20,y);y+=11;}
 write(d.title,12);pdf.setTextColor('#444444');write([data.location,data.email,data.phone,data.website].filter(Boolean).join(' | '),9);y+=3;
 for(const k of fields.filter(k=>k!=='title'&&d[k])){if(y>252)page();pdf.setTextColor(color);write(labels[data.lang][k],12,true);pdf.setTextColor('#252525');write(d[k]);}
 const count=pdf.getNumberOfPages();for(let n=1;n<=count;n++){pdf.setPage(n);pdf.setFontSize(8);pdf.setTextColor('#888888');pdf.text(`${n} / ${count}`,190,289,{align:'right'});}
 return pdf;
}
export async function exportDocx(data){download(await makeDocx(data),filename(data,'docx'));}
export function exportPdf(data){makePdf(data).save(filename(data,'pdf'));}
