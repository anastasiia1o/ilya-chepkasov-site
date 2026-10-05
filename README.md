# Ilya Chepkasov — academic website

Private working version of a six-page RU/EN scientific profile. Static HTML, CSS and JavaScript; no build dependencies, external fonts, trackers, forms or runtime API keys.

## Preview

From this directory: `python -m http.server 8766 --bind 127.0.0.1`

Open http://127.0.0.1:8766/. The loopback address is available only on this computer. `noindex` is included as an indexing precaution; privacy is provided by local preview and the private source repository. GitHub Pages must remain disabled until explicitly authorized.

## Structure

- `index.html`: name, position, four research topics, profile links and portrait
- `research.html`: five interactive research areas, corresponding papers/figures and supporting DOI links
- `publications.html`: search across title/authors/journal/DOI/year, year and type filters, chronological/title/review-first sorting
- `activities.html`: research projects, conferences, reviewing and teaching
- `cv.html`: six short career milestones; no CV PDF is stored or offered for download
- `contact.html`: institutional email and verified profiles

Language switches preserve filters and current page. Preferences persist locally; `?lang=ru` and `?lang=en` override the saved preference. Publication filters are shareable in the URL. Paper titles and journal names retain their original bibliographic language.

The compact layout uses Segoe UI/Arial throughout. Publications form one continuous scrollable list on all screens. Search and filters cover the full catalog; author lists expand on demand. Other pages remain compact. Short factual headings replace slogans and decorative section numbering. Homepage topic links open the corresponding research area. The selected area persists in `?area=` across language changes; tabs support arrow keys, Home and End. Each area shows a verified coauthored paper and its original illustration. The supplied Pt/C illustration appears as a cropped, softly faded CSS background. Other figures appear whole, without recoloring or altered scientific content. “Original” opens a native modal with the full figure; Escape closes it. Source originals and image credits are preserved.

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

`scripts/verify.cjs` uses Playwright. Serve on port 8766 and run with this library available through local installation or `NODE_PATH`. It checks six pages, RU/EN at 1440/780/390/320 px, overflow, loaded images and background asset, local links, publication search/filter/sort combinations, full-list coverage, mobile navigation and DOI uniqueness. It also checks research tabs, keyboard operation, deep links, language-state persistence, original-figure modal bounds/decoding/Escape, and supporting DOI membership in the verified catalog. Pages other than publications fit desktop viewports of 1440×900 and 1366×768. Screenshots/logs stay in ignored `.preview/`.

## Ownership

Source remains private. No public deployment or collaborator invitations are configured. Transfer or access sharing will be done after final approval and recipient details.
