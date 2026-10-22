import {portfolioHtml} from './portfolio.js';
import portfolioStyles from './portfolio.css?inline';
import styles from './resume.css?inline';
import {download} from './documents.js';
export {makePdf,makeDocx,exportPdf,exportDocx,download} from './documents.js';
export function exportHtml(data){download(new Blob([`<!doctype html><html lang="${data.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Portfolio</title><style>${styles}${portfolioStyles}body{margin:0;padding:3vw;background:#e5e5e5}.resume{max-width:900px;margin:auto;box-sizing:border-box}.portfolio section{padding:18px 0}</style></head><body>${portfolioHtml(data)}</body></html>`],{type:'text/html;charset=utf-8'}),`${(data.name||'portfolio').replace(/[^\p{L}\p{N}-]/gu,'-')}-${data.lang}.html`);}
