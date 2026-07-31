import os, fitz
os.chdir(r'D:\Robotics\DIYKit')
pdf = fitz.open(r'web/static/giaotrinh.pdf')
print('pages', pdf.page_count)
for i in range(pdf.page_count):
    page = pdf[i]
    text = page.get_text('text')
    print('PAGE', i+1, 'len', len(text))
    print(text[:1200].replace('\n','\\n'))
    imgs = page.get_images(full=True)
    print('IMAGES', len(imgs))
    for j, info in enumerate(imgs, 1):
        print(' IMAGE', j, 'xref', info[0], 'bbox', info[5])
    print('---')
