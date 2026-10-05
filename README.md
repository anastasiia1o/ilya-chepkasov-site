# Ilya Chepkasov — academic website

Private working version of a six-page RU/EN scientific profile. Static HTML, CSS and JavaScript; no build dependencies, external fonts, trackers, forms or runtime API keys.

## Preview

From this directory: `python -m http.server 8766 --bind 127.0.0.1`

Open http://127.0.0.1:8766/ for local preview. The loopback address is available only on this computer.

Public access is disabled at the user's request on 2026-10-05. GitHub Pages is disabled, the source repository is private, and the former public URL returns HTTP 404. Keep Pages disabled until a new explicit request to publish. `noindex,nofollow` is restored as an indexing precaution; it is not an access restriction. Regenerate pages, verify changes and push `codex/initial-site` to save private source updates. No separate deployment copy is required.

## Structure

- `index.html`: name, full institutional affiliation, degree, four research topics, profile links, portrait and eight dated news/media digests
- `research.html`: five large interactive research panels, brief descriptions, corresponding papers/figures and supporting DOI links; the battery panel shows a horizontal detail of the graphene/MoS2 atomic model from Chepkasov's 2022 study (reproduced in his 2025 review), with the full original accessible on click
- `publications.html`: search across title/authors/journal/DOI/year, year and type filters, chronological/title/review-first sorting
- `activities.html`: research projects, conferences, reviewing and teaching
- `cv.html`: six short career milestones; no CV PDF is stored or offered for download
- `contact.html`: institutional email and verified profiles

Language switches preserve filters and current page. Preferences persist locally; `?lang=ru` and `?lang=en` override the saved preference. Publication filters are shareable in the URL. Paper titles and journal names retain their original bibliographic language.

The compact layout uses Segoe UI/Arial throughout, with an cool graphite, light gray and desaturated steel blue palette. Research topic panels use bold labels. The homepage starts directly with the name and portrait, without the former discipline eyebrow. Publications form one continuous scrollable list on all screens. Search and filters cover the full catalog; author lists expand on demand. Other pages remain compact. Homepage news is a manually maintained horizontal list: three digests on desktop, two on tablets and one on phones, with buttons, keyboard and native touch scrolling. The eight source-checked items include Skoltech coverage and a Kommersant feature; summaries and controls switch RU/EN. Short factual headings replace slogans and decorative section numbering. Homepage topic links open the corresponding research area. The selected area persists in `?area=` across language changes; tabs support arrow keys, Home and End. Five large topic panels switch between a concise bilingual description and the corresponding original illustration. The nanocatalysis description covers bimetallic/core–shell nanoparticles and adsorption/catalytic properties. It does not restore the removed Pt/C heading or journal label. All figure images open in the original-figure modal, which closes with Escape. Display width is limited to 640 CSS pixels for the supplied 1280×489 illustration. Other directions retain small journal/DOI links. Navigation, body text, controls and metadata use slightly larger type throughout the site. Source originals and image credits are preserved.

## Editing

- Bilingual text and page structure: `scripts/build_site.py`; run `python scripts/build_site.py` after changes.
- Visual styling: `assets/css/styles.css`.
- Behavior: `assets/js/main.js`.
- Publications: `assets/data/publications.json` and its browser-compatible mirror `assets/js/publications-data.js`.
- Portrait and supplied figure: originals are preserved at the project root, website copies under `assets/images/`.

## Publication data

64 records on 2026-10-05: 63 DOI-bearing publisher records and one CV-only item. Three reviews are explicitly identified from publisher/laboratory sources. Proceedings are separately labeled.

Google Scholar profile: https://scholar.google.com/citations?user=uld736gAAAAJ

The profile is linked directly. There is **no automatic Google Scholar synchronization**. During preparation Scholar returned HTTP 429. The catalog is based on the supplied CV and Crossref publisher metadata, not an export of the entire Scholar profile; no Scholar citation counts are claimed.

To refresh Crossref metadata: `python scripts/import_publications.py`. Review the diff before accepting changes. The importer matches author surname and known given-name/initial variants, excludes preprints and peer-review artifacts, deduplicates by the Crossref DOI feed, preserves CV-only entries and uses the print year when available. Do not add reviews by title heuristics; verify the article type with the publisher. Update the checked date in `scripts/build_site.py` after review and rebuild.

## Verification

`scripts/verify.cjs` uses Playwright. Serve on port 8766 and run with this library available through local installation or `NODE_PATH`. It checks six pages, RU/EN at 1440/780/390/320 px, overflow, loaded images and background asset, dated news/media digests and scrolling controls, local links, publication search/filter/sort combinations, full-list coverage, mobile navigation and DOI uniqueness. It also checks research tabs, keyboard operation, deep links, language-state persistence, original-figure modal bounds/decoding/Escape, and supporting DOI membership in the verified catalog. Pages other than publications fit desktop viewports of 1440×900 and 1366×768. Screenshots/logs stay in ignored `.preview/`.

## Ownership

The source repository is private and GitHub Pages is disabled. Collaborator access and ownership transfer remain unconfigured; they can be handled after recipient details are supplied. Local `.preview/` files, inspection PDFs and verification screenshots are excluded from Git. Decorative link arrows are removed throughout the site. On phones, the name and portrait share the top row, while position, topic links and primary actions occupy full-width rows.
