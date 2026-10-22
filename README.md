# Forma Resume Studio

A free, open source resume and portfolio editor that runs in the browser. No account, subscriptions, API keys, token credits, backend or document uploads to a server.

[Open Forma](https://brunnojob.github.io/portfolio-local/)

## Editor

- Dark workspace with a searchable gallery of 12 templates: Editorial, Essencial ATS, Studio, Executivo, Lateral, Minimal, Horizonte, Técnico, Trajetória, Atelier, Acadêmico and Compacto.
- Single column, sidebar and two column layouts. Templates affect the actual exported documents.
- Twelve color palettes, custom accent and text colors, three font families, font size, line spacing, page margins and A4/Letter formats.
- Live preview rendered from the generated PDF. The PDF download uses the same rendering engine and document settings.
- PDF with selectable text, editable DOCX, standalone HTML portfolio and JSON backup downloads. No watermark or download paywall.
- Separate Portuguese and English content versions and interface labels.
- Profile, work experience, education, skills, certifications, languages, projects and extra information.
- Reorder and hide standard sections. Add up to ten custom sections. Undo and redo editing changes.
- Optional photo, cropped and compressed locally.
- Local field outlines and review suggestions for IT, offshore, engineering, business, healthcare, education, creative work, sales and general careers.
- Optional job-description keyword comparison. This is a literal local text check, not an ATS score or hiring prediction.

## Import

Import PDF, DOCX or TXT, review the extracted text, then open it as a new document or replace the current version. Common section headings and a short professional role line are recognized heuristically; review the fields after import.

The original document layout is not retained. Scanned PDFs need external OCR. Password-protected or malformed documents may not be readable. Imports are limited to 15 MB, PDFs to 60 pages and photos to 8 MB.

PDF and DOCX importers load with the application instead of relying on a delayed importer chunk. Deployment asset failures have a save-and-reload recovery flow. Existing tabs may need one refresh after an update.

## Local persistence

Documents are stored in IndexedDB, with an immediate localStorage recovery copy of the active document. The active draft is also saved when the page is hidden or closed. Normal browser restarts retain stored documents.

The My CVs panel supports multiple documents, duplication and recovery of removed documents. Previous drafts from the first version are migrated without clearing their text.

The storage dialog can request persistent storage from browsers that support it. The browser decides whether to grant that request. Private browsing, browser policies, clearing site data, changing profiles and device changes can remove or separate stored data. Export JSON backups to keep independent copies. Storage is not encrypted and is scoped to the hosting origin; other software on the same origin can access it.

## What stays manual

Portuguese and English text are edited independently. Changing language translates the interface and section labels, not user-written paragraphs. Suggestions use local rules and do not generate credentials or experience.

Word uses the selected typography, color and layout structure, but its pagination depends on the Word processor. The browser preview is exact for the PDF, not for every Word application. PDF fonts support Portuguese and English; unsupported scripts and symbols may require a different export workflow.

The HTML portfolio is a standalone web presentation using the same content, color and template family, with clickable project URLs. It is separate from the PDF document preview.

## Development

Node.js 22 or later.

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
```

Production files are written to `dist/`. Document libraries and the PDF worker are bundled locally. There are no runtime CDNs, trackers, analytics or remote document-processing endpoints. The browser contacts the static host to download the app and its assets.

Tests cover the actual PDF parser, PDF/DOCX content across all templates, multipage column layouts, section ordering and visibility, safe HTML output, local draft migration, storage reopen, document recovery and outdated deployment errors.

## GitHub Pages

In Settings → Pages → Build and deployment, select GitHub Actions. Push to `main`. The workflow installs locked dependencies, runs tests, builds and deploys `dist/` using GitHub's automatic deployment credentials. No visitor credentials or user-provided secrets are needed. Relative asset paths support repository subdirectories.

## License

MIT. Dependencies retain their respective licenses.
