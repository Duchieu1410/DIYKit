"""
Extract package/dist/chunks/ from openblock-gui.tgz → web/static/chunks/
The main bundle loads these lazily (localization steps, code chunks, etc.)
"""
import tarfile, pathlib

tgz = pathlib.Path('openblock-gui.tgz')
out_root = pathlib.Path('static/chunks')
out_root.mkdir(parents=True, exist_ok=True)
prefix = 'package/dist/chunks/'

print(f'Extracting chunks...')
extracted = 0

with tarfile.open(tgz, 'r:gz') as tar:
    for member in tar.getmembers():
        name = member.name
        if not name.startswith(prefix):
            continue
        rel = name[len(prefix):]
        dest = out_root / rel
        if member.isdir():
            dest.mkdir(parents=True, exist_ok=True)
            continue
        dest.parent.mkdir(parents=True, exist_ok=True)
        fobj = tar.extractfile(member)
        if fobj is None:
            continue
        dest.write_bytes(fobj.read())
        extracted += 1
        print(f'  {rel}')

print(f'Done. Extracted {extracted} chunk files.')
