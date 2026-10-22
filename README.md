# Forma — Portfolio Maker

[Open the editor](https://brunnojob.github.io/portfolio-maker/) · [Abrir o editor](https://brunnojob.github.io/portfolio-maker/)

Free, open-source resume and portfolio editor in Portuguese and English. No account, watermark or download paywall. Neutral gray interface. Documents stay in the browser unless you explicitly request AI assistance.

## What you can do

- Import PDF, DOCX or TXT, review the extracted text and continue editing. Scanned PDFs require external OCR. Limits: 15 MB / 60 PDF pages.
- Start from scratch with 12 portfolio outlines: development, UX/design, data, writing, photography/video, research, freelance services, first opportunity, career transition, engineering, business, and general professional work.
- Choose among 20 resume templates, 13 palettes, A4/Letter, fonts, spacing, optional photo and custom sections. Every template exports real selectable-text PDF and editable DOCX.
- Export a standalone responsive portfolio website in four layouts: cards, editorial, side profile or essential. Project entries separated by a blank line become separate cards. Photography uses gallery links rather than uploading an image collection.
- Keep separate PT/EN versions; optional local translation downloads its model only when requested. Browser translation availability varies.
- Autosave, multiple documents, duplication, backups, recovery, undo/redo and section visibility/order.

## AI assistant

Choose **Assistente → Usar inteligência artificial**, consent to the text transfer, then ask for a review, clearer writing, project case studies, career advice, or adaptation to a job pasted in Review. The assistant sees active text fields, the question, up to four previous messages and the job description. It helps with imported and newly created portfolios.

Responses include advice and up to three proposed field replacements. Review the proposed text and apply each change explicitly. Undo restores the previous content. Suggestions are tied to the document and language used for the request; changing a field meanwhile asks before replacement. Unknown facts should remain questions or bracketed placeholders, never fabricated credentials or achievements. AI can make mistakes: verify every suggestion.

Local guidance remains available without OpenAI. It is labeled separately and never presented as an AI response.

### Privacy and costs

Contact fields, name, photo, custom sections and the inactive language are omitted automatically. Emails and phone-like numbers in text are redacted on the client, but this is not complete anonymization: review names and other personal information inside free text before sending. Browser content goes to the API hosted on Vercel, then OpenAI. The backend does not log portfolio text or questions; it logs only provider error status/code/type. Requests use `store: false`; provider retention policies still apply. Chat is kept in memory, not autosaved.

Visitors do not need a key or payment. **OpenAI usage is billed to the project owner**, and hosting has plan quotas. This does not promise unlimited free AI. The backend has bounded input/output, a 45-second provider timeout and a best-effort 5-request/hour/IP limit held in each function instance. It resets with instances and is not a distributed spending ceiling. CORS is an origin restriction for browsers, not authentication. For a large public launch, configure provider project limits and a shared rate limiter or challenge before increasing traffic.

## Run and verify

```sh
npm ci
npm test
npm run dev
npm run build
```

Node 22+. Tests cover all templates in PDF/DOCX, import, backup recovery, translation, portfolio outlines, HTML escaping, AI payload minimization, response validation and backend request restrictions.

## Deploy

`.github/workflows/pages.yml` tests/builds and publishes `dist` to GitHub Pages on main. No API secret is included in Pages or the Vite bundle.

Pages cannot run a server. `backend/` is a separate Vercel Node function, deployed at `https://portfolio-maker-assistant.vercel.app/api/assistant`. Deploy that directory when changing backend code. Its project settings are at [Vercel](https://vercel.com/brunnojobs-projects/portfolio-maker-assistant/settings/environment-variables).

Server variables (see `backend/.env.example`):

- `OPENAI_API_KEY`: sensitive production secret. Rotate any key shared in a chat or source file. Never use a `VITE_` variable for a secret.
- `OPENAI_MODEL`: defaults to `gpt-5-mini`; choose a Responses API model supporting Structured Outputs and the configured reasoning effort.
- `ALLOWED_ORIGINS`: comma-separated exact origins; defaults to `https://brunnojob.github.io`. No wildcard CORS.

The browser endpoint is public configuration in `src/ai.js`. Change it if hosting your own backend. Provider quota, authentication or availability errors are shown without losing the document. AI requires an active funded OpenAI project; code deployment alone cannot supply credits.

MIT license.
