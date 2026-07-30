"""
Extract package/dist/static/ from openblock-gui.tgz → web/static/
This provides all the images, cursors, and media that the OpenBlock
GUI bundle references at /static/ (its webpack publicPath).
"""
import tarfile, pathlib, sys

tgz = pathlib.Path('openblock-gui.tgz')
out_root = pathlib.Path('static')
prefix = 'package/dist/static/'

print(f'Extracting {prefix!r} entries from tarball...')
extracted = 0
skipped = 0

with tarfile.open(tgz, 'r:gz') as tar:
    for member in tar.getmembers():
        name = member.name
        if not name.startswith(prefix):
            continue
        rel = name[len(prefix):]          # e.g. "blocks-media/handclosed.cur"
        dest = out_root / rel
        if member.isdir():
            dest.mkdir(parents=True, exist_ok=True)
            continue
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists():
            skipped += 1
            continue
        fobj = tar.extractfile(member)
        if fobj is None:
            continue
        dest.write_bytes(fobj.read())
        extracted += 1
        if extracted % 200 == 0:
            print(f'  {extracted} extracted...')

print(f'Done. Extracted {extracted} files, skipped {skipped} (already exist).')

# Also check for chunks/ dir
print()
with tarfile.open(tgz, 'r:gz') as tar:
    chunk_entries = [n for n in tar.getnames() if '/dist/chunks/' in n or n.endswith('.chunk.js')]
    print(f'chunk entries in tarball: {len(chunk_entries)}')
    for e in chunk_entries[:10]:
        print(' ', e)
