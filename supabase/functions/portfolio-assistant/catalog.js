export const fields=['title','summary','experience','education','skills','certifications','languages','projects','extra'];
export const templateIds=['editorial','classic','modern','executive','sidebar','minimal','horizon','technical','timeline','creative','academic','compact','slate','folio','terminal','brief','atlas','canvas','research','grid'];
export const layouts=['cards','editorial','split','minimal'];
export function cleanDesign(value){
 if(!value||typeof value!=='object')return null;
 const out={};
 if(templateIds.includes(value.template))out.template=value.template;
 if(layouts.includes(value.webLayout))out.webLayout=value.webLayout;
 for(const key of ['accent','ink'])if(/^#[0-9a-f]{6}$/i.test(value[key]))out[key]=value[key];
 if(typeof value.reason==='string')out.reason=value.reason.slice(0,1500);
 return Object.keys(out).some(k=>k!=='reason')?out:null;
}
