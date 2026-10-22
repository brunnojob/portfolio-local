import {documentHtml} from './model.js';
import styles from './resume.css?inline';
import {download} from './documents.js';
export {makePdf,makeDocx,exportPdf,exportDocx,download} from './documents.js';
export function exportHtml(data){download(new Blob([`<!doctype html><html lang="${data.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Portfolio</title><style>${styles}body{margin:0;padding:3vw;background:#e9ede9}.resume{max-width:900px;margin:auto;box-sizing:border-box}.portfolio section{padding:18px 0}</style></head><body>${documentHtml(data,true)}</body></html>`],{type:'text/html;charset=utf-8'}),`${(data.name||'portfolio').replace(/[^\p{L}\p{N}-]/gu,'-')}-${data.lang}.html`);}
