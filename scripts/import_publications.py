"""Refresh publisher metadata via Crossref; Google Scholar is linked, not scraped.
Run with Python 3: python scripts/import_publications.py
Existing CV-only entries are preserved. Review types are editorially verified.
"""
import json, re, sys, urllib.request
from pathlib import Path
from html import unescape

ROOT = Path(__file__).resolve().parents[1]
REVIEWS = {'10.1002/smll.202508433', '10.1039/d3nr06194a', '10.1016/j.pmatsci.2026.101713'}
def clean(value):
    return re.sub(r'\s+', ' ', unescape(re.sub(r'<[^>]+>', '', value))).strip()
def identity(author):
    given = re.sub(r'[^a-z]', '', author.get('given', '').lower())
    return author.get('family', '').lower() == 'chepkasov' and given in {'iv','ilyav','ilya','iliav','ilia','ilyav'}
def build(items):
    rows = []
    for item in items:
        if not any(identity(a) for a in item.get('author', [])): continue
        if item.get('type') not in {'journal-article', 'proceedings-article'}: continue
        if '/response' in item['DOI'] or '/review' in item['DOI']: continue
        date = item.get('published-print', item.get('published', {})).get('date-parts', [[0]])[0]
        title = clean(item.get('title', [''])[0])
        if 'technetium hydride' in title.lower(): title = 'Synthesis of technetium hydride TcH1.3 at 27 GPa'
        doi = item['DOI'].lower()
        # Publisher issue is 11(1), January 2021; Crossref only carries online 2020.
        if doi == '10.3390/nano11010008': date = [2021]
        if doi == '10.1021/acsami.3c07242': title = 'Order–Disorder Phase Transition and Ionic Conductivity in a Li2B12H12 Solid Electrolyte'
        if doi == '10.1021/acsanm.2c03540': title = 'Ball-Milled Processed, Selective Fe/h-BN Nanocatalysts for CO2 Hydrogenation'
        journal = clean(item.get('container-title', [''])[0])
        kind = 'review' if doi in REVIEWS else 'conference' if ('conference' in journal.lower() or item['type'] == 'proceedings-article') else 'article'
        rows.append(dict(title=title, year=date[0], journal=journal, doi=doi, type=kind,
            authors=', '.join(clean(a.get('given','')+' '+a.get('family','')) for a in item.get('author', [])),
            volume=item.get('volume',''), pages=item.get('page', item.get('article-number','')),
            source='https://api.crossref.org/works/'+doi))
    return sorted(rows, key=lambda p: (-p['year'], p['title'].lower()))
if __name__ == '__main__':
    if len(sys.argv)>1:
        raw=json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
    else:
        url='https://api.crossref.org/works?query.author=Chepkasov&rows=1000'
        with urllib.request.urlopen(url, timeout=60) as response: raw=json.load(response)
    rows=build(raw['message']['items'])
    out=ROOT/'assets/data/publications.json'
    if out.exists():
        rows += [r for r in json.loads(out.read_text(encoding='utf-8')) if not r.get('doi')]
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(rows, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    (ROOT/'assets/js/publications-data.js').write_text('window.PUBLICATIONS = '+json.dumps(rows, ensure_ascii=False, indent=2)+';\n', encoding='utf-8')
    print(f'{len(rows)} verified author-matched records; {sum(r["type"]=="review" for r in rows)} reviews')
