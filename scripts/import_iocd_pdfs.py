"""Import the verified IOCD PDF manifest and attach local files to the catalog.

Run: python scripts/import_iocd_pdfs.py [--source-dir PATH]
Without --source-dir, download original bytes from the pinned GitHub revision.
"""
import argparse
import hashlib
import json
from pathlib import Path
from urllib.parse import quote
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-dir', type=Path)
    args = parser.parse_args()
    manifest = json.loads((ROOT / 'assets/data/publication-pdfs.json').read_text(encoding='utf-8'))
    rows_path = ROOT / 'assets/data/publications.json'
    rows = json.loads(rows_path.read_text(encoding='utf-8'))
    by_doi = {r.get('doi', '').lower(): r for r in rows if r.get('doi')}
    imported = []
    for entry in manifest['files']:
        row = by_doi[entry['doi']]
        remote = f"https://raw.githubusercontent.com/{manifest['repository']}/{manifest['revision']}/{quote(entry['source_path'])}"
        if args.source_dir:
            content = (args.source_dir / entry['source_path']).read_bytes()
        else:
            with urlopen(remote, timeout=60) as response:
                content = response.read()
        if not content.startswith(b'%PDF-') or hashlib.sha256(content).hexdigest() != entry['sha256']:
            raise ValueError(f"Invalid or changed source PDF: {entry['source_path']}")
        target = ROOT / entry['local_path']
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)
        imported.append((row, entry))
    # Update the catalog only after every file has passed its checksum check.
    for row, entry in imported:
        row['pdf'] = entry['local_path']
        row['pdfSource'] = 'https://iocd.ru/' + quote(entry['source_path'])
    serialized = json.dumps(rows, ensure_ascii=False, indent=2)
    rows_path.write_text(serialized + '\n', encoding='utf-8')
    (ROOT / 'assets/js/publications-data.js').write_text('window.PUBLICATIONS = ' + serialized + ';\n', encoding='utf-8')
    print(f'Imported {len(imported)} verified PDFs; {len(rows)} catalog entries preserved')


if __name__ == '__main__':
    main()
