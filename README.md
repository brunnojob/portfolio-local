# Forma

A browser-only resume and portfolio builder. Import an existing document or start from scratch. No account, API key, token balance, database or backend.

[Open the app](https://brunnojob.github.io/portfolio-local/)

## Features

- Import PDF, DOCX and TXT with a review step before replacing content.
- Edit profile, experience, education, skills, certifications, languages, projects and additional information.
- Maintain separate Portuguese and English versions.
- Three visual templates, accent colors and optional photo.
- Local suggestions for IT, offshore, engineering, healthcare, business, education, creative work, sales and general careers.
- Download text-based PDF, editable DOCX and a standalone HTML portfolio.
- Autosave in localStorage, JSON backup/restore and local data deletion.
- Responsive layout, labeled controls and keyboard navigation.

## Limits

Import extracts text, not the original document layout. Common section headings are recognized heuristically; review the result. Scanned PDFs require external OCR. Imports are limited to 15 MB and PDFs to 60 pages. Password-protected or malformed files may fail.

Portuguese and English content are edited independently. Changing language translates interface labels and headings, not user-written paragraphs. Suggestions are deterministic rules, not an AI service. No qualifications or experience are invented.

The selected visual template is used in the preview and HTML export. PDF and DOCX use simple text layouts with their own pagination and the chosen accent color. They are not pixel-identical to the preview. PDF uses standard fonts intended for Portuguese and English; other scripts may not render correctly.

Photos are cropped to a square and stored locally as compressed JPEG. Save a backup before clearing browser storage. Private browsing and storage restrictions can prevent persistence. localStorage is scoped to the hosting origin; other software served under the same origin can access it. Do not treat it as encrypted storage.

## Development

Requires Node.js 22 or later.

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
```

The production output is `dist/`. All document libraries and the PDF worker are bundled locally. There are no runtime CDNs, trackers, analytics or remote document-processing endpoints. The browser still contacts the host to load app assets.

## GitHub Pages

Set Settings → Pages → Build and deployment → Source to GitHub Actions. Push to `main`. The included workflow installs locked dependencies, runs tests, builds and deploys `dist/`. Relative asset paths support repository subdirectories.

No user-provided secrets are needed. GitHub Actions uses its own automatic deployment credentials; app visitors need no tokens or login.

## License

MIT. See [LICENSE](LICENSE). Dependencies retain their respective licenses.
