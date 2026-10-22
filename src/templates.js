export const templates=[
 {id:'editorial',name:'Editorial',group:'simple',description:['Elegância editorial, respiro e hierarquia.','Editorial elegance, space and hierarchy.'],layout:'single',font:'times',header:'line'},
 {id:'classic',name:'Essencial ATS',group:'simple',description:['Uma coluna, leitura direta e foco no conteúdo.','One column, direct reading and content first.'],layout:'single',font:'helvetica',header:'center'},
 {id:'modern',name:'Studio',group:'creative',description:['Cabeçalho expressivo e detalhes de cor.','Expressive header and color details.'],layout:'single',font:'helvetica',header:'band'},
 {id:'executive',name:'Executivo',group:'executive',description:['Estrutura sóbria para uma trajetória sólida.','A refined structure for an established career.'],layout:'single',font:'helvetica',header:'dark'},
 {id:'sidebar',name:'Lateral',group:'creative',description:['Competências em uma coluna independente.','Skills in a separate supporting column.'],layout:'sidebar',font:'helvetica',header:'side'},
 {id:'minimal',name:'Minimal',group:'simple',description:['Tipografia leve e espaço para o essencial.','Light typography and room for the essentials.'],layout:'single',font:'helvetica',header:'minimal'},
 {id:'horizon',name:'Horizonte',group:'executive',description:['Faixa de abertura e duas colunas equilibradas.','Opening band and two balanced columns.'],layout:'columns',font:'helvetica',header:'band'},
 {id:'technical',name:'Técnico',group:'technical',description:['Organização precisa para TI e engenharia.','Precise organization for IT and engineering.'],layout:'single',font:'courier',header:'technical'},
 {id:'timeline',name:'Trajetória',group:'executive',description:['Seções marcadas para uma leitura sequencial.','Section markers for a sequential reading.'],layout:'single',font:'helvetica',header:'line'},
 {id:'creative',name:'Atelier',group:'creative',description:['Contraste e personalidade sem excessos.','Contrast and personality without excess.'],layout:'sidebar',font:'times',header:'creative'},
 {id:'academic',name:'Acadêmico',group:'simple',description:['Formação, pesquisa e texto bem organizados.','Education, research and well organized text.'],layout:'single',font:'times',header:'center'},
 {id:'compact',name:'Compacto',group:'technical',description:['Duas colunas para aproveitar melhor o espaço.','Two columns to make more of the space.'],layout:'columns',font:'helvetica',header:'compact'},
 {id:'slate',name:'Ardósia',group:'executive',description:['Cabeçalho escuro, barra lateral e seções numeradas.','Dark header, sidebar and numbered sections.'],layout:'sidebar',font:'helvetica',header:'dark',sectionStyle:'numbered'},
 {id:'folio',name:'Fólio',group:'creative',description:['Duas colunas com títulos em blocos editoriais.','Two columns with editorial block headings.'],layout:'columns',font:'times',header:'line',sectionStyle:'block'},
 {id:'terminal',name:'Terminal',group:'technical',description:['Monoespaçado, faixa de abertura e marcadores técnicos.','Monospace, opening band and technical markers.'],layout:'single',font:'courier',header:'dark',sectionStyle:'rule'},
 {id:'brief',name:'Síntese',group:'simple',description:['Uma coluna com títulos numerados e abertura discreta.','One column with numbered headings and a quiet opening.'],layout:'single',font:'helvetica',header:'minimal',sectionStyle:'numbered'},
 {id:'atlas',name:'Atlas',group:'executive',description:['Duas colunas, abertura central e linhas de seção.','Two columns, centered opening and section rules.'],layout:'columns',font:'helvetica',header:'center',sectionStyle:'rule'},
 {id:'canvas',name:'Tela',group:'creative',description:['Serifa, lateral clara e títulos em blocos.','Serif type, light sidebar and block headings.'],layout:'sidebar',font:'times',header:'minimal',sectionStyle:'block'},
 {id:'research',name:'Pesquisa',group:'simple',description:['Serifa acadêmica e divisórias discretas.','Academic serif type and quiet dividers.'],layout:'single',font:'times',header:'technical',sectionStyle:'rule'},
 {id:'grid',name:'Grade',group:'technical',description:['Duas colunas técnicas com seções numeradas.','Two technical columns with numbered sections.'],layout:'columns',font:'courier',header:'band',sectionStyle:'numbered'},
];
export const palettes=[
 {name:'Cinza',accent:'#454545',ink:'#292929',background:'#f0f0f0'},
 {name:'Lavanda',accent:'#6d5bd0',ink:'#252438',background:'#f0edfc'},
 {name:'Oceano',accent:'#176b94',ink:'#243342',background:'#e9f3f8'},
 {name:'Floresta',accent:'#256758',ink:'#203b33',background:'#eaf4ef'},
 {name:'Grafite',accent:'#374151',ink:'#1f2937',background:'#eef0f3'},
 {name:'Terracota',accent:'#a64f38',ink:'#3c2d29',background:'#faf0eb'},
 {name:'Borgonha',accent:'#852b4a',ink:'#3a2430',background:'#f9edf2'},
 {name:'Índigo',accent:'#344ca0',ink:'#232e4d',background:'#edf0fa'},
 {name:'Petróleo',accent:'#11666b',ink:'#203d3e',background:'#e9f5f4'},
 {name:'Oliva',accent:'#667336',ink:'#343d26',background:'#f1f4e8'},
 {name:'Cobre',accent:'#9a6028',ink:'#3c3027',background:'#f8f0e7'},
 {name:'Orquídea',accent:'#8b4d99',ink:'#3e2a44',background:'#f6edf8'},
 {name:'Azul noite',accent:'#203c68',ink:'#202c3d',background:'#ebf0f8'}
];
export const getTemplate=id=>templates.find(t=>t.id===id)||templates[0];
const englishNames={slate:'Slate',folio:'Folio',terminal:'Terminal',brief:'Brief',atlas:'Atlas',canvas:'Canvas',research:'Research',grid:'Grid',classic:'ATS Essential',executive:'Executive',sidebar:'Sidebar',horizon:'Horizon',technical:'Technical',timeline:'Career Timeline',academic:'Academic',compact:'Compact'};
const englishPalettes={Cinza:'Gray',Lavanda:'Lavender',Oceano:'Ocean',Floresta:'Forest',Grafite:'Graphite',Terracota:'Terracotta',Borgonha:'Burgundy',Índigo:'Indigo',Petróleo:'Teal',Oliva:'Olive',Cobre:'Copper',Orquídea:'Orchid','Azul noite':'Midnight Blue'};
export const templateName=(template,lang)=>lang==='en'?englishNames[template.id]||template.name:template.name;
export const paletteName=(palette,lang)=>lang==='en'?englishPalettes[palette.name]||palette.name:palette.name;
export function tint(hex,ratio=.92){const n=hex.replace('#','');return '#'+[0,2,4].map(i=>Math.round(parseInt(n.slice(i,i+2),16)*(1-ratio)+255*ratio).toString(16).padStart(2,'0')).join('');}
