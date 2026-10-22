# Forma — Portfolio Maker

[Open editor / Abrir editor](https://brunnojob.github.io/portfolio-maker/)

Free portfolio and resume studio in Brazilian Portuguese and English. GitHub Pages serves the frontend; Supabase Edge Functions runs the OpenAI assistant, and Postgres enforces shared usage limits. No account, watermark or download paywall.

## Create and export

- Import PDF, DOCX or TXT locally; review the extracted text before applying it. Limit: 15 MB / 60 PDF pages. Scanned PDFs need external OCR.
- Start from scratch with 12 professional outlines, including development, design, data, creative work, research, engineering, business and first opportunities.
- Choose 20 document templates, 13 color palettes, dark/light editor theme, fonts, margins, A4/Letter, photo and custom sections.
- Export selectable-text PDF, editable Word DOCX, a standalone portfolio website in four layouts, or a complete JSON backup.
- Keep separate Portuguese and English versions. Changing language translates every UI label immediately. Missing content can be translated by the browser, the optional local model, or OpenAI after consent. Existing authored translations are preserved.
- Manage multiple documents, undo/redo, section order and visibility during the current tab session.

## Temporary session

Documents use `sessionStorage`, not permanent local storage or a cloud document database. Reloading the same tab keeps drafts; closing it normally ends that session. Browser session restoration can restore sessionStorage, so **Clear session** explicitly erases it. Download before closing. If sessionStorage is unavailable or full, edits remain in memory and the save indicator explains that reloading will lose them.

The new version removes this application's older persistent drafts from localStorage and IndexedDB. Export anything needed from the older version before upgrading. Other applications' data is untouched.

## Forma local — default assistant, no credits

The default assistant runs entirely in the browser. It combines a bilingual editor knowledge base with a deterministic task planner and validated editor actions. It does not call OpenAI, need an API key or download a chat model. It is not a general generative language model and cannot answer arbitrary world-knowledge questions. Unsupported questions are identified honestly.

It can:

- Create a new portfolio/resume or fill an existing outline for one of the 12 professional types. New documents preserve the previous document in the current session.
- Fill explicitly supplied name, role, skills, education, projects, location and email; ask a focused follow-up when facts are missing.
- Draft a short profile from the supplied role and skills, organize existing text, deduplicate skill lists and propose a project case study. Text proposals require Apply; it never invents employers, qualifications or metrics.
- Give contextual editorial feedback and recommend real templates, palettes and layouts with reasons.
- Apply templates, colors, paper format, fonts, editor theme, section visibility/order, navigation and language changes. Reversible document edits are grouped in undo history.
- Open file/photo selection, prepare PDF/DOCX/HTML/JSON downloads and start local translation. Import contents and editor fields are treated as data, not task instructions.

Examples in Portuguese:

```text
Crie um portfólio de desenvolvimento
Crie um novo currículo do zero para primeira oportunidade
Meu nome é Ana Silva; meu cargo é Desenvolvedora; sei HTML, CSS e JavaScript; escreva meu resumo
Use o modelo ATS e cor azul
Oculte certificações e mova projetos para cima
Revise meu portfólio
Traduza para inglês
Baixe em PDF e DOCX
Desfazer
```

English examples: “Create a development portfolio”, “Use the Studio template and green colors”, “My role is Developer; my skills are HTML, CSS; write my summary”, “Hide certifications”, “Download PDF and DOCX”.

Local commands work without paid services after the app has loaded. Browser/local translation is separate: it may need an initial language-model download and can fail if the browser or network does not support it. The app is not advertised as an installed offline PWA.

## Optional OpenAI assistant

OpenAI is opt-in and requires owner-funded API credits. On provider errors the chat switches back to Forma local and handles the same request using supported local capabilities. It never labels a local response as an OpenAI answer.

Enable AI and consent to the text transfer in Assistant. Ask for a complete outline, improvements to an import, writing help, job adaptation, template/color recommendations, translation, or guidance using the editor. The assistant can answer general questions within its capabilities; it cannot guarantee correctness or perform external actions.

Responses contain advice, up to nine proposed replacement fields and optional template, palette and website-layout changes. Review and apply proposals explicitly; undo restores prior edits. Stale proposals ask before overwriting newer text or design. Missing facts remain questions or placeholders rather than fabricated qualifications.

Name, contact fields, photos, custom sections and the inactive language are omitted from advice requests. Emails and phone-like strings in free text are redacted as a best effort. AI translation explicitly sends the missing fields, including custom sections, for translation; review personal information before consenting. Local import, editing and export do not send document files to the backend.

The backend sends bounded text to the OpenAI Responses API with Structured Outputs and `store: false`. It does not save documents or chat in Postgres or log request content. Provider/platform retention policies still apply. The database stores only expiring counters with daily rotating HMAC client identifiers, never raw IP addresses or document text. Infrastructure providers may keep their own operational logs.

Visitors do not need an API key. OpenAI usage is paid by the project owner; GitHub Pro/Developer benefits do not themselves fund OpenAI API requests. The optional OpenAI service’s shared limiter allows 10 requests per client/hour and at most 300 requests across the project per UTC day. Failed provider requests consume a slot too. CORS is not authentication; limits bound request count, not dollar spending. Configure OpenAI project budgets and monitor actual usage.

## Run and verify

Node 22 or later:

```sh
npm ci --ignore-scripts
npm test
npm run dev
npm run build
```

The browser translator uses the web WASM runtime; native ONNX install scripts are unnecessary. Tests cover PDF/DOCX content and all templates, import parsing, bilingual editing, temporary sessions, privacy, translation completeness, design validation, provider errors and limiter failure handling.

## GitHub Pages

`.github/workflows/pages.yml` runs tests and the production build, then deploys `dist` on each push to `main`. In repository Settings → Pages, select **GitHub Actions** as the source if it is not already selected. Relative asset URLs support the `/portfolio-maker/` project path.

No OpenAI key or Supabase service-role key belongs in the repository, frontend variables or Pages bundle. The public function URL is configured in `src/ai.js`.

## Supabase backend

Project reference: `cdkbobyevlwxofvcoxcc`.

1. Run `supabase/schema.sql` in the project's SQL Editor for a new installation. It creates a private rate-limit table with RLS and a service-role-only RPC. No document table or visitor login is needed. The SQL is repeatable.
2. In [Edge Function secrets](https://supabase.com/dashboard/project/cdkbobyevlwxofvcoxcc/functions/secrets), add **OPENAI_API_KEY**. Optionally add `OPENAI_MODEL` (default `gpt-5-mini`) and `ALLOWED_ORIGINS` (default `https://brunnojob.github.io`). Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the function automatically. Never publish their values.
3. Deploy `supabase/functions/portfolio-assistant/index.ts` with its `core.js` and `catalog.js` dependencies. `supabase/config.toml` deliberately disables JWT verification for this public, login-free endpoint. Input validation and the server-only database limiter remain mandatory.
4. Verify the deployed endpoint:

```sh
curl -H 'Origin: https://brunnojob.github.io' \
  https://cdkbobyevlwxofvcoxcc.supabase.co/functions/v1/portfolio-assistant
```

Expected: `{"configured":true}` after setting the secret. No secret values are returned. OPTIONS supports browser preflight; unapproved origins are rejected. Database failures fail closed before contacting OpenAI.

A missing key is shown as setup pending, not a successful AI response. End-to-end OpenAI testing requires the owner's funded key. Forma local, document creation, templates, import and downloads work without it.

## Português

Editor gratuito, sem cadastro. Importe ou crie do zero, personalize modelos e cores e baixe PDF, DOCX ou HTML. Os rascunhos ficam somente na sessão da aba; baixe antes de fechar. A interface muda integralmente entre português e inglês. A tradução de conteúdo usa IA autorizada ou tradução local, preservando o original.

O assistente padrão é o Forma local, que executa tarefas sem créditos. A integração opcional com OpenAI continua disponível na Supabase. Para ativar as respostas da OpenAI, cadastre `OPENAI_API_KEY` somente nos segredos da Edge Function pelo link acima. O consumo da API é cobrado do proprietário. Nenhuma chave deve ser enviada ao frontend ou adicionada ao GitHub.

MIT license.
