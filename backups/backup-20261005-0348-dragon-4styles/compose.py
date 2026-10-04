import sys
from PIL import Image, ImageDraw, ImageFont
D, PRE, OUTF = sys.argv[1], sys.argv[2], sys.argv[3]
W = 360
STY=[("A","검정+금색 · 호텔 스파"),("B","짙은 남색+금색"),("C","와인+크림 그라데이션"),("D","흰 카드+강한 빨강+큰 버튼")]
ROWS=[("bar","얇은 띠 bar (맨 위·한국 뉴스 사이·서랍)"),("small","카드 small (기사 사이·내 주변·지역)"),("large","큰 배너 large (메인 중간)")]
fb=ImageFont.truetype("/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",44) if __import__("os").path.exists("/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc") else ImageFont.truetype("/usr/share/fonts/truetype/sand-box/google/Nanum Gothic/NanumGothic-Bold.ttf",44)
fs=ImageFont.truetype(fb.path,28)
imgs={(s,v):Image.open(f"{D}/{PRE}-{s}-{v}-{W}.png").convert("RGB") for s,_ in STY for v,_ in ROWS}
cw=max(i.width for i in imgs.values()); pad=36; head=130; rowlab=56
rh={v:max(imgs[(s,v)].height for s,_ in STY) for v,_ in ROWS}
Wt=pad+len(STY)*(cw+pad); Ht=head+sum(rowlab+rh[v]+pad for v,_ in ROWS)+50
im=Image.new("RGB",(Wt,Ht),"#EEF0F3"); d=ImageDraw.Draw(im)
for i,(s,lab) in enumerate(STY):
    x=pad+i*(cw+pad)
    d.text((x,24),s,font=ImageFont.truetype(fb.path,64),fill="#111")
    d.text((x+70,48),lab,font=fs,fill="#333")
y=head
for v,lab in ROWS:
    d.text((pad,y+8),lab,font=fs,fill="#555"); y+=rowlab
    for i,(s,_) in enumerate(STY):
        im.paste(imgs[(s,v)],(pad+i*(cw+pad),y))
    y+=rh[v]+pad
d.text((pad,Ht-44),"360px 휴대폰 화면(2배 해상도) · 드래곤 스웨디시 배너 4종 비교 · 2026-10-05 · 그림·글은 기존 배너 그대로",font=ImageFont.truetype(fb.path,24),fill="#777")
im.save(OUTF,quality=88); print(im.size, OUTF)
