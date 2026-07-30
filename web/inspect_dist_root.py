import tarfile, pathlib

tgz = pathlib.Path('openblock-gui.tgz')
with tarfile.open(tgz, 'r:gz') as tar:
    # Only show top-level dist/ files (not assets/, blocks-media/, chunks/)
    dist_files = [n for n in tar.getnames()
                  if n.startswith('package/dist/')
                  and n.count('/') == 2  # only direct children of dist/
                  ]
    print('=== Files directly in package/dist/ ===')
    for f in sorted(dist_files):
        print(' ', f)
