from PIL import Image, ImageDraw, ImageFilter
import random
def make(size, maskable=False, out='x.png'):
    S=1024
    im=Image.new('RGB',(S,S),(14,58,40))
    d=ImageDraw.Draw(im)
    # felt texture radial-ish
    for r in range(S,0,-8):
        t=r/S; c=(int(14+20*(1-t)),int(58+40*(1-t)),int(40+22*(1-t)))
        d.ellipse([S/2-r,S*0.42-r,S/2+r,S*0.42+r],fill=c)
    rnd=random.Random(3)
    for _ in range(9000):
        x,y=rnd.randrange(S),rnd.randrange(S); v=rnd.randint(-10,10)
        p=im.getpixel((x,y)); im.putpixel((x,y),tuple(max(0,min(255,a+v)) for a in p))
    d=ImageDraw.Draw(im)
    pad=0.20 if maskable else 0.11
    x0,x1=int(S*pad),int(S*(1-pad)); bh=int((x1-x0)*0.42); y0=int(S*0.5-bh/2); y1=y0+bh
    # board shadow
    sh=Image.new('L',(S,S),0); ImageDraw.Draw(sh).rounded_rectangle([x0+10,y0+26,x1+10,y1+26],radius=60,fill=150)
    sh=sh.filter(ImageFilter.GaussianBlur(24)); im.paste((5,20,12),(0,0),sh)
    d=ImageDraw.Draw(im)
    d.rounded_rectangle([x0,y0,x1,y1],radius=60,fill=(176,118,62))
    # wood grain
    for i in range(40):
        yy=y0+12+i*(bh-24)/40
        col=(150+rnd.randint(-15,15),96+rnd.randint(-10,10),48)
        d.line([(x0+30,yy),(x1-30,yy+rnd.randint(-6,6))],fill=col,width=3)
    d.rounded_rectangle([x0,y0,x1,y1],radius=60,outline=(110,66,30),width=10)
    rows=3; cols=10
    for r in range(rows):
        for c in range(cols):
            cx=x0+(x1-x0)*(c+0.5+0.0)/cols; cy=y0+bh*(r+0.5)/rows
            d.ellipse([cx-13,cy-13,cx+13,cy+13],fill=(52,30,14))
    # pegs
    def peg(cx,cy,col,hi):
        d.ellipse([cx-30,cy-30,cx+30,cy+30],fill=(0,0,0))
        d.ellipse([cx-26,cy-34,cx+26,cy+18],fill=col)
        d.ellipse([cx-12,cy-26,cx+4,cy-12],fill=hi)
    def cxr(c,r): return (x0+(x1-x0)*(c+0.5)/cols, y0+bh*(r+0.5)/rows)
    peg(*cxr(7,0),(222,64,56),(255,170,160))
    peg(*cxr(4,2),(60,132,224),(170,210,255))
    peg(*cxr(9,1),(242,193,78),(255,240,190))
    im=im.resize((size,size),Image.LANCZOS); im.save(out)
make(192,out='icon-192.png'); make(512,out='icon-512.png'); make(512,True,'icon-maskable-512.png'); make(180,out='apple-touch-icon.png')
