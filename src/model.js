export const fields = ['title','summary','experience','education','skills','certifications','languages','projects','extra'];
export const labels = {
 pt: {title:'Cargo / objetivo',summary:'Perfil profissional',experience:'Experiência profissional',education:'Formação',skills:'Competências',certifications:'Certificações',languages:'Idiomas',projects:'Projetos e portfólio',extra:'Informações adicionais'},
 en: {title:'Role / objective',summary:'Professional profile',experience:'Professional experience',education:'Education',skills:'Skills',certifications:'Certifications',languages:'Languages',projects:'Projects and portfolio',extra:'Additional information'}
};
export const sectors = {
 general: ['Todas as áreas','General', 'Evidencie resultados, ferramentas e responsabilidades. Use exemplos verificáveis.', 'Highlight results, tools and responsibilities. Use verifiable examples.'],
 it: ['Tecnologia / TI','Technology / IT','Inclua stack, testes, repositórios e resultados dos projetos. Explique sua contribuição e decisões técnicas.', 'Include your stack, testing, repositories and project results. Explain your contribution and technical decisions.'],
 offshore: ['Offshore / marítimo','Offshore / maritime','Destaque função a bordo, sistemas operados, experiência embarcada e disponibilidade. Informe apenas certificados que possui, com validade e emissor; confira os requisitos da vaga.', 'Highlight onboard roles, operated systems, offshore experience and availability. List only certifications you hold, with expiry and issuer; check the job requirements.'],
 engineering: ['Engenharia / indústria','Engineering / industry','Descreva equipamentos, projetos, manutenção, segurança e resultados mensuráveis. Inclua registro profissional somente se possuir.', 'Describe equipment, projects, maintenance, safety and measurable results. Include professional registration only if held.'],
 business: ['Negócios / administração','Business / management','Apresente processos, orçamento, equipe e indicadores. Mostre melhorias com contexto e números reais.', 'Present processes, budgets, teams and indicators. Show improvements with context and real numbers.'],
 health: ['Saúde','Healthcare','Informe formação, registro quando aplicável, áreas de atuação e capacitações. Preserve informações de pacientes.', 'List education, registration where applicable, specialties and training. Protect patient information.'],
 creative: ['Design / comunicação','Design / communication','Selecione estudos de caso com problema, processo, sua participação e resultado. Inclua links públicos para seu trabalho.', 'Select case studies with the problem, process, your contribution and results. Include public work links.'],
 education: ['Educação / pesquisa','Education / research','Destaque disciplinas, metodologias, pesquisa e publicações. Inclua links e resultados verificáveis.', 'Highlight subjects, methods, research and publications. Include links and verifiable results.'],
 services: ['Comércio / serviços','Sales / services','Mostre atendimento, organização, ferramentas e metas atingidas com dados reais.', 'Show customer service, organization, tools and targets achieved with real data.']
};
export const blank = () => ({version:1,name:'',email:'',phone:'',location:'',website:'',photo:'',showPhoto:false,sector:'general',template:'editorial',lang:'pt',accent:'#153d35',pt:Object.fromEntries(fields.map(k=>[k,''])),en:Object.fromEntries(fields.map(k=>[k,'']))});
export function validate(data) {
 if (!data || data.version!==1 || !data.pt || !data.en) throw Error('Backup inválido / Invalid backup');
 const out=blank();
 for (const k of ['name','email','phone','location','website']) if(typeof data[k]==='string') out[k]=data[k].slice(0,2000);
 for(const lang of ['pt','en']) for(const k of fields) if(typeof data[lang][k]==='string') out[lang][k]=data[lang][k].slice(0,100000);
 if(data.photo && /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(data.photo) && data.photo.length<1000000) out.photo=data.photo;
 out.showPhoto=!!data.showPhoto;
 if(sectors[data.sector]) out.sector=data.sector;
 if(['editorial','classic','modern'].includes(data.template)) out.template=data.template;
 if(data.lang==='en') out.lang='en';
 if(/^#[0-9a-f]{6}$/i.test(data.accent)) out.accent=data.accent;
 return out;
}
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[:\s]+$/,'').trim();
export function parseText(text, lang='pt') {
 const result={name:'',email:'',phone:'',...Object.fromEntries(fields.map(k=>[k,'']))};
 const lines=text.replace(/\r/g,'').split('\n').map(s=>s.trim()).filter(s=>s && !/^\d+\s*\/\s*\d+$/.test(s));
 result.email=text.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0]||'';
 result.phone=text.match(/(?:\+\d{1,3}[ .-]?)?\(?\d{2,3}\)?[ .-]?\d{4,5}[ .-]\d{4}/)?.[0]||'';
 const aliases={summary:['resumo','perfil','perfil profissional','resumo profissional','objetivo','summary','professional profile','profile','objective'],experience:['experiencia','experiencia profissional','experience','professional experience','work experience','employment'],education:['formacao','formacao academica','educacao','education'],skills:['competencias','habilidades','skills','technical skills','tecnologias'],certifications:['certificacoes','cursos','certifications','certificates'],languages:['idiomas','languages'],projects:['projetos','portfolio','projetos e portfolio','projects','projects and portfolio'],extra:['informacoes adicionais','additional information']};
 let section='summary';
 lines.forEach((line,i)=>{const key=Object.keys(aliases).find(k=>aliases[k].includes(normalize(line))); if(key){section=key;return;} if(i===0 && line.length<90 && !line.includes('@')){result.name=line;return;} if(line===result.email||line===result.phone)return;result[section]+=(result[section]?'\n':'')+line;});
 return result;
}
export function suggestions(data) {
 const d=data[data.lang], en=data.lang==='en', tips=[sectors[data.sector][en?3:2]];
 if(Object.values(d).some(v=>/\[[^\]]+\]/.test(v))) tips.push(en?'Replace bracketed placeholders before exporting.':'Substitua os trechos entre colchetes antes de exportar.');
 if(!data.email) tips.push(en?'Add a professional email address.':'Adicione um e-mail profissional.');
 if(!d.summary) tips.push(en?'Write a short profile with your target role, skills and value.':'Escreva um perfil breve com objetivo, competências e contribuição.');
 if(d.summary.length>650) tips.push(en?'Shorten your profile; move details to experience.':'Encurte o perfil; leve detalhes para experiência.');
 if(!d.experience) tips.push(en?'Include experience, volunteering or relevant academic work.':'Inclua experiência, trabalho voluntário ou atividades acadêmicas relevantes.');
 if(d.experience && !/\d/.test(d.experience)) tips.push(en?'Where possible, quantify scope or results using real figures.':'Quando possível, quantifique escopo ou resultados com números reais.');
 if(!d.skills) tips.push(en?'List skills relevant to your target job.':'Liste competências relevantes para a vaga desejada.');
 if(data.showPhoto) tips.push(en?'Check whether a photo is customary for the target country and employer.':'Confira se a foto é adequada ao país e à empresa de destino.');
 if(!d.projects) tips.push(en?'Add a project with context, your contribution and a public link.':'Adicione um projeto com contexto, sua contribuição e link público.');
 return tips;
}
export const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function documentHtml(data, portfolio=false) {
 const d=data[data.lang],e=escapeHtml;
 const contact=[data.location,data.email,data.phone,data.website].filter(Boolean).map(e).join(' · ');
 return `<article class="resume ${data.template} ${portfolio?'portfolio':''}" style="--accent:${data.accent}"><header>${data.showPhoto&&data.photo?`<img class="portrait" src="${data.photo}" alt="">`:''}<div class="eyebrow">${portfolio?(data.lang==='pt'?'PORTFÓLIO PROFISSIONAL':'PROFESSIONAL PORTFOLIO'):''}</div><h1>${e(data.name|| (data.lang==='pt'?'Seu nome':'Your name'))}</h1><div class="role">${e(d.title|| (data.lang==='pt'?'Seu próximo capítulo profissional':'Your next professional chapter'))}</div><div class="contact">${contact}</div></header>${fields.filter(k=>k!=='title' && d[k]).map(k=>`<section><h2>${labels[data.lang][k]}</h2><p>${e(d[k])}</p></section>`).join('')}</article>`;
}
