import {planDocumentCommand,applyDocumentCommand} from './document-commands.js';
import {blank,fields,labels,validate} from './model.js';
import {templates,palettes,templateName,paletteName} from './templates.js';
import {portfolioTypes,applyPortfolioType} from './portfolio-types.js';
import {assistantPlan,assistantReply} from './assistant.js';

const normalize=text=>String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const real=text=>typeof text==='string'&&text.trim()&&!/\[[^\]]+\]/.test(text);
const tidy=text=>String(text).replace(/\r/g,'').split('\n').map(line=>line.trim().replace(/[ \t]+/g,' ')).join('\n').replace(/\n{3,}/g,'\n\n').trim();
const basicFields=['name','email','phone','location','website'];
const fieldAliases={summary:/\b(resumo|perfil|summary|profile|sobre mim|about me)\b/,title:/\b(cargo|objetivo|funcao|role|title|objective)\b/,experience:/\b(experiencia|experiencias|experience|employment)\b/,education:/\b(formacao|educacao|education|degree)\b/,skills:/\b(habilidades|competencias|skills|stack)\b/,certifications:/\b(certificacoes|certificados|certifications|certificates|cursos)\b/,languages:/\b(idiomas|languages)\b/,projects:/\b(projetos|projects)\b/,extra:/\b(informacoes adicionais|additional information|extra)\b/};
const fieldOf=q=>Object.keys(fieldAliases).find(key=>fieldAliases[key].test(q));
const templateAliases={classic:['essencial ats','ats essential','ats','classic','classico'],modern:['studio','moderno','modern'],minimal:['minimalista','minimal'],executive:['executivo','executive'],sidebar:['lateral','sidebar'],horizon:['horizonte','horizon'],technical:['tecnico','technical'],timeline:['trajetoria','timeline'],creative:['atelier','creative','criativo'],academic:['academico','academic'],compact:['compacto','compact'],slate:['ardosia','slate'],folio:['folio'],terminal:['terminal'],brief:['sintese','brief'],atlas:['atlas'],canvas:['tela','canvas'],research:['pesquisa','research'],grid:['grade','grid'],editorial:['editorial']};
const typePatterns={developer:/\b(dev|desenvolv\w*|programa\w*|software|frontend|backend|fullstack|developer|development)\b/,designer:/\b(design|designer|ux|ui)\b/,data:/\b(dados|data|analytics|analise)\b/,writer:/\b(redacao|redator|writer|writing|conteudo|content)\b/,photographer:/\b(fotografia|fotografo|photography|photographer|video|audiovisual)\b/,academic:/\b(academico|pesquisador|academic|researcher|pesquisa|research)\b/,freelancer:/\b(freelancer|freelance|servicos|services)\b/,'first-job':/\b(primeir\w* oportunidade|primeiro emprego|sem experiencia|first job|first opportunity|no experience)\b/,'career-change':/\b(transicao|mudar de carreira|career change)\b/,engineering:/\b(engenharia|engenheiro|engineering|engineer|industria)\b/,business:/\b(negocios|administracao|produto|business|management|product)\b/};
const colorPatterns=[[/\b(azul|blue|oceano|ocean)\b/,2],[/\b(verde|green|floresta|forest)\b/,3],[/\b(roxo|purple|lavanda|lavender)\b/,1],[/\b(grafite|graphite|preto|black)\b/,4],[/\b(terracota|terracotta|laranja|orange)\b/,5],[/\b(borgonha|burgundy|vermelho|red)\b/,6],[/\b(indigo)\b/,7],[/\b(petroleo|teal)\b/,8],[/\b(oliva|olive)\b/,9],[/\b(cobre|copper)\b/,10],[/\b(orquidea|orchid|rosa|pink)\b/,11],[/\b(azul noite|midnight)\b/,12],[/\b(cinza|gray|grey)\b/,0]];
const changeVerb=/\b(troque|troca|trocar|mude|muda|mudar|use|usar|coloque|coloca|colocar|bote|bota|aplique|aplica|aplicar|deixe|deixa|deixar|quero|change|switch|use|apply|set|make|want)\b/;
const question=/\b(como|qual|quais|posso|voce pode|consegue|como voce|how|which|what|can you|could you)\b/;
const writing=/\b(escreva|escreve|escrever|crie|cria|criar|melhore|melhora|melhorar|reescreva|reescreve|reescrever|faca|faz|fazer|organize|organiza|organizar|write|create|improve|rewrite|draft|clean|organize)\b/;
const creation=/\b(crie|cria|criar|monte|monta|montar|faca|faz|fazer|comece|comeca|comecar|create|build|start|make)\b/;
const prompts={name:['Qual é o seu nome?','What is your name?'],title:['Qual cargo ou área você quer apresentar?','What role or field do you want to present?'],skills:['Quais competências você já possui? Separe por vírgulas.','Which skills do you already have? Separate them with commas.'],projects:['Conte um projeto real: nome, o que você fez e resultado.','Describe a real project: name, what you did and the outcome.'],education:['Qual é sua formação? Informe curso, instituição e período que puder confirmar.','What is your education? Include the course, institution and dates you can confirm.'],summary:['Conte sua área, suas competências e seu objetivo profissional.','Tell me your field, skills and professional goal.']};

export function documentReview(state){
 const en=state.lang==='en',d=state[state.lang],issues=assistantPlan(state).filter(x=>x.id!=='otherLanguage').slice(0,5);
 const parts=[en?'My review of this document:':'Minha avaliação deste documento:'];
 if(issues.length)parts.push(...issues.map(x=>'• '+x.text));else parts.push(en?'Essential fields are complete. Review accuracy and links before sharing.':'Os campos essenciais estão preenchidos. Confira a precisão dos dados e os links antes de compartilhar.');
 const projects=d.projects.split(/\n\s*\n/).filter(x=>x.trim()).length;
 if(projects>4)parts.push(en?'You have several projects. Prioritize 2–4 relevant case studies and move the rest to a public link.':'Há vários projetos. Priorize 2–4 estudos de caso relevantes e deixe os demais em um link público.');
 if(d.summary.length>650)parts.push(en?'The profile is long. A shorter opening makes the main strengths easier to find.':'O perfil está longo. Uma abertura mais curta facilita encontrar seus pontos principais.');
 if(state.jobText.trim()){
  const words=[...new Set(normalize(state.jobText).match(/[a-z][a-z+#.]{3,}/g)||[])].filter(x=>!['para','with','that','this','your','como','have','will','empresa','voce','trabalho','vaga','from','mais'].includes(x));
  const text=normalize(fields.map(k=>d[k]).join(' ')),missing=words.filter(x=>!text.includes(x)).slice(0,8);
  if(missing.length)parts.push((en?'Job terms not found in your text: ':'Termos da vaga ausentes no seu texto: ')+missing.join(', ')+(en?'. Add them only if they reflect real skills.':'. Inclua somente os que representam competências reais.'));
 }
 parts.push(en?'This is an editorial review, not an ATS score or a hiring prediction.':'Esta é uma avaliação editorial, não uma nota ATS ou previsão de contratação.');
 return parts.join('\n');
}

export function localDraft(state,field){
 const en=state.lang==='en',d=state[state.lang],reason=en?'Prepared locally using your existing text. Review before applying.':'Preparado localmente com base nos seus textos. Revise antes de aplicar.';
 if(field==='summary'){
  if(real(d.summary))return {field,text:tidy(d.summary).replace(/([.!?])(?=[A-Za-zÀ-ÿ])/g,'$1 '),reason:en?'Cleaned spacing and punctuation without adding facts.':'Organizei espaços e pontuação, preservando os fatos.'};
  const role=real(d.title)?tidy(d.title):'',skills=real(d.skills)?tidy(d.skills).split(/[\n,;·|]+/).map(x=>x.trim()).filter(Boolean).slice(0,5).join(', '):'';
  if(!role&&!skills)return null;
  const lines=[];
  if(role)lines.push(en?`My professional goal is to work as ${role}.`:`Meu objetivo profissional é atuar como ${role}.`);
  if(skills)lines.push(en?`My skills include ${skills}.`:`Meus conhecimentos incluem ${skills}.`);
  return {field,text:lines.join(' '),reason};
 }
 if(!fields.includes(field))return null;
 if(real(d[field])){
  let text=tidy(d[field]);
  if(field==='skills')text=[...new Set(text.split(/[\n,;·|]+/).map(x=>x.trim()).filter(Boolean))].join(' · ');
  return {field,text,reason:en?'Organized the supplied text without inventing achievements or qualifications.':'Organizei o texto informado sem inventar conquistas ou qualificações.'};
 }
 if(field==='projects')return {field,text:en?'[Project name]\nProblem: [actual problem]\nMy contribution: [what I did]\nTools: [tools I used]\nOutcome: [verified outcome]\nLink: [public URL]':'[Nome do projeto]\nProblema: [problema real]\nMinha contribuição: [o que fiz]\nFerramentas: [ferramentas utilizadas]\nResultado: [resultado verificável]\nLink: [URL pública]',reason:en?'Case study structure with explicit placeholders; replace them with real facts.':'Estrutura de estudo de caso com campos sinalizados; substitua por fatos reais.'};
 return null;
}

function parseFacts(input){
 const results=[];
 const patterns={name:/(?:meu nome [ée]|me chamo|my name is)\s+([^\n;,.!?]+)/i,title:/(?:meu cargo [ée]|meu objetivo [ée]|quero atuar como|sou (?:um |uma )?|my role is|my goal is|i am (?:an? )?)\s*([^\n;,.!?]+)/i,skills:/(?:minhas (?:habilidades|compet[êe]ncias) s[ãa]o|tenho conhecimentos em|sei(?: usar)?|my skills are|i know)\s+([^\n;.!?]+)/i,education:/(?:minha forma[çc][ãa]o [ée]|my education is)\s+([^\n;!?]+)/i,projects:/(?:meu projeto [ée]|my project is)\s+([^\n;!?]+)/i,location:/(?:moro em|minha cidade [ée]|i live in|my location is)\s+([^\n;.!?]+)/i};
 for(const [field,regex] of Object.entries(patterns)){const match=input.match(regex);if(match)results.push({type:'field',field,value:match[1].trim()});}
 const email=input.match(/(?:meu e-?mail [ée]|my e-?mail is)\s*([\w.+-]+@[\w.-]+\.[a-z]{2,})/i);if(email)results.push({type:'field',field:'email',value:email[1]});
 const assignment=input.match(/^(?:defina|preencha|coloque|atualize|set|fill|update)\s+(.{2,45}?)\s*(?::|=|\bcomo\b|\bto\b)\s*([\s\S]+)$/i);
 if(assignment){const key=fieldOf(normalize(assignment[1]))||(/^(nome|name)$/i.test(assignment[1])?'name':null);if(key)return [{type:'field',field:key,value:assignment[2].trim()}];}
 return results;
}

function designFor(q,state){
 const en=state.lang==='en',count=state[state.lang].projects.split(/\n\s*\n/).filter(x=>x.trim()).length;
 let template='classic',reason=en?'A single column keeps the reading order simple for job applications.':'Uma coluna mantém a ordem de leitura simples para candidaturas.';
 const type=Object.entries(typePatterns).find(([,pattern])=>pattern.test(q))?.[0]||state.portfolioType;
 if(['designer','photographer','writer'].includes(type)){template='folio';reason=en?'The editorial structure gives creative work a clear visual hierarchy.':'A estrutura editorial oferece uma hierarquia visual clara para trabalhos criativos.';}
 if(type==='developer'||type==='engineering'){template='technical';reason=en?'The technical layout clearly separates projects, tools and experience.':'O layout técnico separa com clareza projetos, ferramentas e experiência.';}
 if(type==='academic'){template='research';reason=en?'Research prioritizes education, publications and longer descriptions.':'Pesquisa prioriza formação, publicações e descrições mais extensas.';}
 if(type==='business'){template='executive';reason=en?'The professional header supports a concise business presentation.':'O cabeçalho profissional favorece uma apresentação objetiva de negócios.';}
 const explicit=templates.find(t=>templateAliases[t.id]?.some(alias=>new RegExp(`\\b${alias}\\b`).test(q)));
 if(explicit){template=explicit.id;reason=explicit.description[en?1:0];}
 let palette=palettes[['designer','writer','photographer'].includes(type)?6:type==='academic'?4:type==='engineering'?12:state.sector==='health'?3:0];
 for(const [pattern,index] of colorPatterns)if(pattern.test(q))palette=palettes[index];
 const hex=q.match(/#[0-9a-f]{6}\b/i)?.[0];
 return {template,webLayout:count>2?'cards':['designer','writer'].includes(type)?'editorial':'cards',accent:hex||palette.accent,ink:palette.ink,reason};
}

export function planLocalRequest(input,state,context={}){
 const q=normalize(input),en=state.lang==='en',t=(pt,english)=>en?english:pt;
 const result={text:'',actions:[],suggestions:[],pending:null};
 const is=pattern=>pattern.test(q),notes=[];
 const add=(action,pt,english)=>{result.actions.push(action);notes.push(t(pt,english));};
 const faq=/^(como|qual|quais|how|which|what|por que|why)\b/.test(q.trim());
 if(is(/\b(desfazer|desfaca|undo)\b/)&&context.canUndo===false)return {...result,text:t('Não há edição disponível para desfazer.','There is no edit available to undo.')};
 if(is(/\b(desfazer|desfaca|undo)\b/))return {...result,text:t('Vou desfazer a última edição disponível.','I will undo the last available edit.'),actions:[{type:'history',direction:'undo'}]};
 if(is(/\b(refazer|refaca|redo)\b/)&&context.canRedo===false)return {...result,text:t('Não há edição disponível para refazer.','There is no edit available to redo.')};
 if(is(/\b(refazer|refaca|redo)\b/))return {...result,text:t('Vou refazer a última edição desfeita.','I will redo the last undone edit.'),actions:[{type:'history',direction:'redo'}]};
 const field=fieldOf(q),facts=parseFacts(input);
 if(/^(?:defina|preencha|coloque|atualize|set|fill|update)\s+.{2,45}?\s*(?::|=|\bcomo\b|\bto\b)\s*[\s\S]+$/i.test(input)&&facts.length===1)return {...result,actions:facts,text:t('Vou preencher o campo solicitado com o texto exato informado. Você pode desfazer.','I will fill the requested field with your exact supplied text. You can undo.')};
 const batch=planDocumentCommand(input,state);if(batch)return batch;
 const making=creation.test(q)&&is(/\b(portfolio|curriculo|resume|cv)\b/)&&!field;
 const type=Object.entries(typePatterns).find(([,pattern])=>pattern.test(q))?.[0]||'general';
 if(making&&!faq){
  if(is(/\b(do zero|novo|nova|from scratch|new)\b/))add({type:'new-document'},'Vou criar um documento novo e manter o atual na lista desta sessão.','I will create a new document and keep the current one in this session’s document list.');
  add({type:'outline',id:type},'Vou preparar uma estrutura com campos sinalizados para completar, preservando os textos já preenchidos.','I will prepare an outline with labeled placeholders, preserving existing text.');
  add({type:'mode',value:is(/\b(portfolio)\b/)?'portfolio':'resume'},'Abrirei a prévia do documento.','I will open the document preview.');
 }
 for(const action of facts)add(action,`Vou preencher ${basicFields.includes(action.field)?({name:'nome',email:'e-mail',location:'cidade'})[action.field]||action.field:labels.pt[action.field]} com o que você informou.`,`I will fill ${basicFields.includes(action.field)?action.field:labels.en[action.field]} with your supplied text.`);
 if(!faq&&(changeVerb.test(q)||writing.test(q))&&is(/\b(modelo|template|design|layout|cor|cores|color|colors|paleta|palette|ats)\b/)){
  const design=designFor(q,state),explicitTemplate=is(/\b(modelo|template|design|ats)\b/);
  if(explicitTemplate)add({type:'design',values:{template:design.template}},`Vou usar o modelo ${templateName(templates.find(x=>x.id===design.template),'pt')}.`,`I will use the ${templateName(templates.find(x=>x.id===design.template),'en')} template.`);
  if(is(/\b(cor|cores|color|colors|paleta|palette)\b/))add({type:'design',values:{accent:design.accent,ink:design.ink}},`Vou aplicar o destaque ${design.accent} e texto ${design.ink}.`,`I will apply accent ${design.accent} and text ${design.ink}.`);
  if(is(/\b(layout)\b/)){
   const value=is(/\b(lateral|split|side profile)\b/)?'split':is(/\b(minimal|essencial|essential)\b/)?'minimal':is(/\b(editorial)\b/)?'editorial':'cards';
   add({type:'design',values:{webLayout:value}},`Vou aplicar o layout web ${value}.`,`I will apply the ${value} website layout.`);
  }
 }
 if(!faq&&is(/\b(tema|theme|modo|mode)\b/)&&is(/\b(claro|light|escuro|dark)\b/))add({type:'theme',value:is(/\b(claro|light)\b/)?'light':'dark'},'Vou trocar o tema do editor.','I will change the editor theme.');
 if(!faq&&changeVerb.test(q)&&is(/\b(carta|letter|a4)\b/))add({type:'design',values:{paper:is(/\b(letter|carta)\b/)?'letter':'a4'}},'Vou ajustar o formato do papel.','I will change the paper format.');
 if(!faq&&changeVerb.test(q)&&is(/\b(fonte|font)\b/)){
  const value=is(/\b(mono|courier)\b/)?'courier':is(/\b(serif|times)\b/)?'times':is(/\b(arial|helvetica|sans)\b/)?'helvetica':'auto';
  add({type:'design',values:{font:value}},'Vou ajustar a fonte.','I will change the font.');
 }
 if(!faq&&field&&is(/\b(oculte|ocultar|esconda|esconder|remova|remover|hide|remove)\b/)&&field!=='title')add({type:'section',field,visible:false},'Vou ocultar a seção sem apagar o texto.','I will hide the section without deleting its text.');
 if(!faq&&field&&field!=='title'&&is(/\b(mostre|mostrar|exiba|exibir|show|reveal)\b/))add({type:'section',field,visible:true},'Vou mostrar a seção.','I will show the section.');
 if(!faq&&field&&field!=='title'&&is(/\b(mova|mover|suba|subir|desca|descer|move|raise|lower)\b/))add({type:'move-section',field,direction:is(/\b(desca|descer|baixo|down|lower)\b/)?1:-1},'Vou mover a seção na ordem do documento.','I will move the section in the document order.');
 if(!faq&&is(/\b(importar|importe|import)\b/))add({type:'import'},'Vou abrir a seleção de PDF, DOCX ou TXT. Depois você revisa o texto extraído.','I will open the PDF, DOCX or TXT picker. You can then review the extracted text.');
 if(!faq&&is(/\b(foto|photo|picture)\b/)&&is(/\b(adicione|adicionar|coloque|colocar|troque|trocar|upload|add|change)\b/))add({type:'photo'},'Vou abrir a seleção de foto JPG, PNG ou WebP.','I will open the JPG, PNG or WebP photo picker.');
 const translating=is(/\b(traduza|traduzir|translate|traducao|translation)\b/);
 const language=is(/\b(ingles|english|en)\b/)?'en':is(/\b(portugues|portuguese|pt)\b/)?'pt':null;
 if(!faq&&language&&(translating||changeVerb.test(q)))add({type:'language',value:language,translate:translating},translating?'Vou traduzir campos novos e atualizar traduções automáticas desatualizadas neste dispositivo. O primeiro uso pode baixar um modelo; seu texto não vai para a OpenAI.':'Vou mudar o idioma da interface, mantendo as versões de texto separadas.',translating?'I will translate new fields and update outdated automatic translations on this device. First use may download a model; text is not sent to OpenAI.':'I will change the interface language, keeping text versions separate.');
 if(!faq&&is(/\b(baixe|baixar|exporte|exportar|salve|salvar|download|export|save)\b/)){
  const formats=[];
  if(is(/\b(pdf)\b/))formats.push('pdf');if(is(/\b(docx|word)\b/))formats.push('docx');if(is(/\b(html|site)\b/))formats.push('html');if(is(/\b(json|backup)\b/))formats.push('json');
  for(const format of formats)add({type:'export',format},`Vou preparar o download ${format.toUpperCase()}.`,`I will prepare the ${format.toUpperCase()} download.`);
  if(!formats.length)add({type:'export-menu'},'Vou abrir as opções de download.','I will open the download options.');
 }
 if(!faq&&is(/\b(abra|abrir|open|ir para|go to)\b/)){
  const panel=is(/\b(modelos|templates)\b/)?'templates':is(/\b(conteudo|content)\b/)?'content':is(/\b(estilo|style)\b/)?'style':is(/\b(revisao|review|vaga|job)\b/)?'review':is(/\b(documentos|documents)\b/)?'documents':null;
  if(panel)add({type:'panel',value:panel},'Vou abrir a ferramenta solicitada.','I will open the requested tool.');
 }
 const working=result.actions.some(x=>x.type==='new-document')?{...blank(),lang:state.lang}:structuredClone(state);
 for(const action of facts){if(fields.includes(action.field))working[working.lang][action.field]=action.value;else working[action.field]=action.value;}
 const requestedDraft=field&&writing.test(q)&&!faq?field:facts.length&&context.pending?.draft&&context.pending.documentId===state.id&&context.pending.language===state.lang?context.pending.field:null;
 if(requestedDraft){
  const proposal=localDraft(working,requestedDraft);
  if(proposal){result.suggestions.push(proposal);notes.push(t('Preparei uma sugestão abaixo. Ela só substitui seu texto quando você clicar em Aplicar.','I prepared a suggestion below. It replaces your text only when you click Apply.'));}
  else{result.pending={field:requestedDraft,documentId:state.id,language:state.lang,draft:true};notes.push((prompts[requestedDraft]||prompts.summary)[en?1:0]);}
 }
 if(result.actions.length||result.suggestions.length||result.pending){
  if(making&&!real(working[working.lang].title)&&!result.pending){result.pending={field:'title',language:state.lang,draft:false};notes.push(prompts.title[en?1:0]);}
  result.text=notes.join('\n');return result;
 }
 if(is(/\b(revise|revisar|avalie|avaliar|opiniao|acha do meu|review|evaluate|opinion|feedback)\b/)||is(/\b(adapte|adaptar|tailor)\b/))return {...result,text:documentReview(state),panel:'review'};
 if(is(/\b(quais|liste|listar|todos|todas|list|available|all)\b/)&&is(/\b(modelos|templates|cores|colors|paletas|palettes)\b/)){
  const colors=is(/\b(cores|colors|paletas|palettes)\b/);
  return {...result,panel:colors?'style':'templates',text:(colors?t('Paletas disponíveis: ','Available palettes: '):t('Modelos disponíveis: ','Available templates: '))+(colors?palettes.map(x=>paletteName(x,state.lang)):templates.map(x=>templateName(x,state.lang))).join(', ')+'.'};
 }
 if(is(/\b(modelo|template|cores|cor|color|palette|paleta|design|layout|ats)\b/)){
  const design=designFor(q,state);return {...result,design,panel:'templates',text:t(`Minha sugestão é ${templateName(templates.find(x=>x.id===design.template),'pt')}, com destaque ${design.accent}. ${design.reason} Você pode aplicar o design abaixo ou me pedir uma combinação diferente.`,`My suggestion is ${templateName(templates.find(x=>x.id===design.template),'en')}, with accent ${design.accent}. ${design.reason} Apply the design below or ask for another combination.`)};
 }
 const knowledge=[
  [/\b(importar|import|pdf digitalizado|scanned|ocr)\b/,t('Use Importar para PDF, DOCX ou TXT de até 15 MB. PDFs têm limite de 60 páginas. A extração ocorre no navegador e você revisa antes de aplicar. PDFs digitalizados precisam de OCR externo. Posso abrir a seleção: diga “importe meu currículo”.','Use Import for PDF, DOCX or TXT up to 15 MB. PDFs have a 60-page limit. Text is extracted locally and you review it before applying. Scanned PDFs need external OCR. Say “import my resume” to open the picker.')],
  [/\b(pdf|docx|word|baixar|download|export|backup)\b/,t('Você pode baixar PDF com texto selecionável, Word editável, portfólio HTML ou backup JSON. Diga “baixe em PDF e DOCX” para preparar os dois. O Word pode paginar diferente. O backup permite continuar depois de fechar a sessão.','Download selectable-text PDF, editable Word, standalone HTML or a JSON backup. Say “download PDF and DOCX” to prepare both. Word may paginate differently. A backup lets you continue after closing the session.')],
  [/\b(privacidade|salv|dados|login|conta|sessao|privacy|storage|account|session)\b/,t('Não é necessário login. Documentos ficam na sessão da aba; baixe antes de fechar. Recarregar mantém o rascunho. A restauração de sessão do navegador pode recuperar a aba; Apagar sessão exclui os rascunhos imediatamente. Este assistente local não envia suas mensagens à OpenAI.','No login is needed. Documents stay in this tab session; download before closing. Reloading preserves drafts. Browser session restoration may restore a tab; Clear session erases drafts immediately. This local assistant does not send your messages to OpenAI.')],
  [/\b(ingles|portugues|english|portuguese|traduz|traducao|translate|translation|idioma|language)\b/,t('A interface muda pelo botão PT/EN. O conteúdo tem versões separadas para não misturar idiomas. Diga “traduza para inglês” ou “traduza para português”: uso a tradução do navegador ou o modelo local com download inicial. Revise nomes de cargos e fatos; textos existentes no idioma de destino são preservados.','PT/EN changes the interface. Content has separate versions to avoid mixing languages. Say “translate to English” or “translate to Portuguese”: I use browser translation or a local model with an initial download. Review job titles and facts; existing target-language text is preserved.')],
  [/\b(foto|photo|picture)\b/,t('A foto é opcional. Aceitamos JPG, PNG e WebP de até 8 MB; a imagem é recortada no navegador. Para portfólios pessoais, uma foto nítida pode ajudar na identificação. Para candidaturas, siga as práticas do país e da vaga. Diga “adicione uma foto” para selecionar.','A photo is optional. JPG, PNG and WebP up to 8 MB are cropped locally. A clear photo may help identify a personal portfolio. For applications, follow the country and job conventions. Say “add a photo” to select one.')],
  [/\b(vaga|job|keyword|palavra.chave)\b/,t('Abra Revisão e cole a descrição da vaga. Eu comparo os termos com seus campos e aponto lacunas. A comparação é literal, não uma avaliação automática de contratação. Nunca inclua uma competência que você não possui.','Open Review and paste the job description. I compare its terms with your fields and point out gaps. This is a literal comparison, not an automated hiring assessment. Never add skills you do not have.')],
  [/\b(credito|credit|openai|offline|inteligencia|intelligence|como funciona|how.*work|o que.*faz|what.*do|ajuda|help)\b/,t('Sou o Forma local: interpreto comandos e consulto uma base de orientações do editor, sem créditos ou chamadas à OpenAI. Posso preencher dados que você informar, estruturar portfólios, opinar sobre modelos, cores e conteúdo, organizar seções e preparar downloads. Não sou um modelo generativo geral; não navego na internet nem invento experiências. Exemplos: “crie um portfólio de desenvolvimento”, “use o modelo ATS e cor azul”, “meu cargo é Desenvolvedor; sei JavaScript, HTML e CSS; escreva meu resumo”, “oculte certificações” e “baixe em PDF”.','I am Forma local: I interpret commands and consult an editor knowledge base without credits or OpenAI calls. I can fill supplied facts, structure portfolios, advise on templates, colors and content, organize sections and prepare downloads. I am not a general generative model; I cannot browse or invent experience. Try “create a development portfolio”, “use the ATS template and blue colors”, “my role is Developer; my skills are JavaScript, HTML and CSS; write my summary”, “hide certifications” or “download PDF”.')]
 ];
 for(const [pattern,text] of knowledge)if(pattern.test(q))return {...result,text};
 if(/^(obrigad[oa]|valeu|thanks|thank you)[!.\s]*$/.test(q.trim()))return {...result,pending:context.pending||null,text:t('De nada! Quando quiser, peça outra tarefa do editor.','You are welcome! Ask for another editor task whenever you are ready.')};
 if(context.pending&&/^(sim|nao|ok|nao sei|yes|no|i don.t know)[!.\s]*$/.test(q.trim()))return {...result,pending:context.pending,text:(prompts[context.pending.field]||prompts.summary)[en?1:0]};
 if(context.pending&&context.pending.documentId===state.id&&context.pending.language===state.lang&&!question.test(q)&&input.trim().length<=2000){
  const pending=context.pending,key=pending.field;
  if([...basicFields,...fields].includes(key)){
   const action={type:'field',field:key,value:input.trim()},next=structuredClone(state);
   if(fields.includes(key))next[next.lang][key]=action.value;else next[key]=action.value;
   const suggestion=pending.draft?localDraft(next,key):null;
   return {...result,actions:[action],suggestions:suggestion?[suggestion]:[],text:t('Vou registrar essa informação no campo solicitado. Você pode desfazer.','I will record this information in the requested field. You can undo.')};
  }
 }
 if(field)return {...result,...assistantReply(input,state)};
 if(is(/^(oi|ola|bom dia|boa tarde|boa noite|hello|hi|hey)[!.\s]*$/))return {...result,text:t('Olá! Posso executar tarefas neste editor. Conte o que quer criar ou diga “o que você faz?” para ver exemplos.','Hello! I can perform tasks in this editor. Tell me what you want to create or ask “what can you do?” for examples.')};
 return {...result,text:t('Não consegui identificar uma tarefa suportada nesse pedido. Posso ajudar com o conteúdo do documento e executar ações do editor. Tente “revise meu portfólio”, “troque o modelo para Studio”, “minhas competências são HTML, CSS; escreva meu resumo” ou “baixe em Word”. Para outras perguntas, ainda não tenho conhecimento suficiente.','I could not identify a supported task in that request. I can help with document content and perform editor actions. Try “review my portfolio”, “switch the template to Studio”, “my skills are HTML, CSS; write my summary” or “download Word”. I do not yet have enough knowledge for other questions.')};
}

export function applyLocalDocumentActions(state,actions){
 const next=structuredClone(state);
 if(!Array.isArray(actions)||actions.length>30)throw Error('invalid_local_actions');
 for(const action of actions){
  if(!action||typeof action!=='object')throw Error('invalid_local_action');
  if(applyDocumentCommand(next,action))continue;
  if(action.type==='field'){
   if(![...basicFields,...fields].includes(action.field)||typeof action.value!=='string'||action.value.length>100000)throw Error('invalid_local_field');
   if(fields.includes(action.field))next[next.lang][action.field]=action.value;else next[action.field]=action.value;
  }else if(action.type==='outline'){
   if(!portfolioTypes.some(x=>x.id===action.id))throw Error('invalid_local_outline');
   applyPortfolioType(next,action.id);
  }else if(action.type==='design'){
   const values=action.values;
   if(!values||typeof values!=='object'||Array.isArray(values))throw Error('invalid_local_design');
   for(const [key,value] of Object.entries(values)){
    const allowed=key==='template'?templates.some(t=>t.id===value):key==='webLayout'?['cards','editorial','split','minimal'].includes(value):['accent','ink'].includes(key)?/^#[0-9a-f]{6}$/i.test(value):key==='paper'?['a4','letter'].includes(value):key==='font'?['auto','helvetica','times','courier'].includes(value):false;
    if(!allowed)throw Error('invalid_local_design');next[key]=value;
   }
  }else if(action.type==='section'||action.type==='move-section'){
   if(!fields.includes(action.field)||action.field==='title')throw Error('invalid_local_section');
   if(action.type==='section'){
    if(typeof action.visible!=='boolean')throw Error('invalid_local_section');
    next.hiddenSections=next.hiddenSections.filter(x=>x!==action.field);if(!action.visible)next.hiddenSections.push(action.field);
   }else{
    if(![-1,1].includes(action.direction))throw Error('invalid_local_section');
    const index=next.sectionOrder.indexOf(action.field),target=index+action.direction;
    if(index>=0&&target>=0&&target<next.sectionOrder.length)[next.sectionOrder[index],next.sectionOrder[target]]=[next.sectionOrder[target],next.sectionOrder[index]];
   }
  }else throw Error('unsupported_local_document_action');
 }
 return validate(next);
}
