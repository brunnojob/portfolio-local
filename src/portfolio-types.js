import {fields} from './model.js';
export const portfolioTypes=[
 ['general','Profissional','Professional','general','editorial','cards','Problema · contribuição · resultado · link','Problem · contribution · result · link'],
 ['developer','Desenvolvimento','Development','it','terminal','cards','Problema · arquitetura · stack · testes · demonstração · repositório','Problem · architecture · stack · tests · demo · repository'],
 ['designer','Design / UX','Design / UX','creative','folio','editorial','Desafio · pesquisa · decisões · acessibilidade · validação','Challenge · research · decisions · accessibility · validation'],
 ['data','Dados / análise','Data / analytics','it','grid','cards','Pergunta · fonte dos dados · método · limitações · conclusão','Question · data source · method · limitations · conclusion'],
 ['writer','Redação / conteúdo','Writing / content','creative','editorial','editorial','Público · objetivo · amostra · processo editorial · resultado','Audience · objective · sample · editorial process · outcome'],
 ['photographer','Fotografia / audiovisual','Photography / video','creative','canvas','cards','Ensaio · conceito · direção · técnica · link da galeria','Series · concept · direction · technique · gallery link'],
 ['academic','Acadêmico / pesquisa','Academic / research','education','research','minimal','Questão · metodologia · contribuição · publicação · DOI','Question · methodology · contribution · publication · DOI'],
 ['freelancer','Freelancer / serviços','Freelance / services','services','slate','split','Cliente autorizado · escopo · entrega · prazo · depoimento autorizado','Authorized client · scope · deliverable · timeline · approved testimonial'],
 ['first-job','Primeira oportunidade','First opportunity','general','brief','minimal','Projeto pessoal ou acadêmico · o que aprendi · minha contribuição · evidência','Personal or academic project · what I learned · contribution · evidence'],
 ['career-change','Transição de carreira','Career change','general','atlas','split','Competência transferível · aplicação na nova área · projeto de transição','Transferable skill · application to new field · transition project'],
 ['engineering','Engenharia / indústria','Engineering / industry','engineering','technical','cards','Problema técnico · restrições · minha responsabilidade · validação · segurança','Technical problem · constraints · responsibility · validation · safety'],
 ['business','Negócios / produto','Business / product','business','executive','split','Contexto · diagnóstico · decisão · execução · indicador real','Context · diagnosis · decision · execution · actual metric']
].map(([id,pt,en,sector,template,layout,outlinePt,outlineEn])=>({id,pt,en,sector,template,layout,outlinePt,outlineEn}));
export function applyPortfolioType(state,id){
 const type=portfolioTypes.find(x=>x.id===id);if(!type)return 0;
 state.portfolioType=id;state.sector=type.sector;state.template=type.template;state.webLayout=type.layout;
 const en=state.lang==='en',d=state[state.lang];let count=0;
 const values={title:en?'[Your role or specialization]':'[Seu cargo ou especialidade]',summary:en?'I help [audience] solve [problem] through [skills]. My work is demonstrated by [real project].':'Ajudo [público] a resolver [problema] com [competências]. Meu trabalho pode ser visto em [projeto real].',projects:(en?'[Project title]\n':'[Nome do projeto]\n')+(en?type.outlineEn:type.outlinePt).split(' · ').map(x=>x+': ['+(en?'add a real fact':'adicione um fato real')+']').join('\n')+(en?'\nLink: [public URL]':'\nLink: [URL pública]'),skills:en?'[Skills evidenced in your projects]':'[Competências demonstradas nos seus projetos]'};
 for(const [key,value] of Object.entries(values))if(fields.includes(key)&&!d[key].trim()){d[key]=value;count++;}
 const first=['summary','projects','skills'];if(id==='academic')first.unshift('education');
 state.sectionOrder=[...new Set([...first,...state.sectionOrder])];return count;
}
