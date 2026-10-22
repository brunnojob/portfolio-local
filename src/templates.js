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
 {id:'compact',name:'Compacto',group:'technical',description:['Duas colunas para aproveitar melhor o espaço.','Two columns to make more of the space.'],layout:'columns',font:'helvetica',header:'compact'}
];
export const palettes=[
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
export function tint(hex,ratio=.92){const n=hex.replace('#','');return '#'+[0,2,4].map(i=>Math.round(parseInt(n.slice(i,i+2),16)*(1-ratio)+255*ratio).toString(16).padStart(2,'0')).join('');}
