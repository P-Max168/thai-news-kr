"""Procedurally draws an original stylized Asian serpentine dragon -> ../dragon.svg
(gold line-art over dark-crimson body). Run: python3 make_dragon.py"""
import math, pathlib
OUT = pathlib.Path(__file__).resolve().parent.parent / "dragon.svg"
W, H = 760, 600
GOLD, GOLD2, DARK = "#d9ac52", "#f4d58d", "#2a0507"

def catmull(pts, n=40):
    out = []
    P = [pts[0]] + pts + [pts[-1]]
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(n):
            t = k / n; t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2
                                    + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in (0, 1)))
    out.append(pts[-1]); return out

def resample(poly, step):
    out = [poly[0]]; acc = 0.0
    for a, b in zip(poly, poly[1:]):
        seg = math.dist(a, b)
        while acc + seg >= step:
            r = (step - acc) / seg
            a = (a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r)
            out.append(a); seg = math.dist(a, b); acc = 0.0
        acc += seg
    return out

# spine: tail (bottom-right, off canvas) -> head (upper-left, facing left)
SPINE = [(800, 640), (700, 560), (640, 470), (680, 370), (640, 280), (540, 250), (450, 300), (400, 390),
         (310, 420), (230, 370), (215, 285), (255, 215), (300, 175)]
S = resample(catmull(SPINE, 60), 3.0)
N = len(S)
def tang(i):
    a, b = S[max(i - 2, 0)], S[min(i + 2, N - 1)]
    d = math.dist(a, b) or 1; return ((b[0] - a[0]) / d, (b[1] - a[1]) / d)
def norm(i):
    tx, ty = tang(i); return (-ty, tx)          # left of travel direction = back (dorsal) side
def width(t):                                  # half-width profile, t: 0 tail -> 1 neck
    return 3 + 33 * math.sin(min(t, .92) / .92 * math.pi * .62) ** .9 if t < .6 else 36 - 12 * (t - .6) / .4
f = lambda v: f"{v:.1f}"
def pt(p): return f"{f(p[0])},{f(p[1])}"

parts = []
add = parts.append

# ---- auspicious clouds (xiangyun), behind the dragon ----
def cloud(cx, cy, s, op):
    d = (f"M{cx - 60 * s},{cy} c{-10 * s},{-28 * s} {28 * s},{-40 * s} {40 * s},{-18 * s} "
         f"c{6 * s},{-30 * s} {50 * s},{-34 * s} {56 * s},{-4 * s} c{22 * s},{-16 * s} {52 * s},{2 * s} {40 * s},{22 * s} "
         f"M{cx - 20 * s},{cy - 18 * s} c{-14 * s},{-4 * s} {-18 * s},{12 * s} {-6 * s},{14 * s} "
         f"M{cx + 36 * s},{cy - 4 * s} c{-10 * s},{-10 * s} {-24 * s},{2 * s} {-14 * s},{10 * s}")
    add(f'<path d="{d}" fill="none" stroke="{GOLD}" stroke-width="{2.2 * s:.1f}" stroke-linecap="round" opacity="{op}"/>')
cloud(600, 120, 1.25, .55); cloud(150, 520, 1.0, .45); cloud(470, 560, .8, .35); cloud(720, 230, .7, .4)

# ---- body ----
L = [(S[i][0] + norm(i)[0] * width(i / (N - 1)), S[i][1] + norm(i)[1] * width(i / (N - 1))) for i in range(N)]
R = [(S[i][0] - norm(i)[0] * width(i / (N - 1)), S[i][1] - norm(i)[1] * width(i / (N - 1))) for i in range(N)]

# dorsal spikes (drawn first so the body overlaps their bases)
for i in range(10, N - 6, 9):
    t = i / (N - 1); w = width(t); nx, ny = norm(i); tx, ty = tang(i)
    h = 8 + 14 * min(1, w / 30)
    b1 = (S[i][0] + nx * (w - 3) - tx * 9, S[i][1] + ny * (w - 3) - ty * 9)
    b2 = (S[i][0] + nx * (w - 3) + tx * 9, S[i][1] + ny * (w - 3) + ty * 9)
    tip = (S[i][0] + nx * (w + h) - tx * 12, S[i][1] + ny * (w + h) - ty * 12)
    add(f'<path d="M{pt(b1)} Q{pt(((b1[0]+tip[0])/2 + tx*4, (b1[1]+tip[1])/2 + ty*4))} {pt(tip)} L{pt(b2)} Z" '
        f'fill="#a3121d" stroke="{GOLD}" stroke-width="1.3" stroke-linejoin="round"/>')

# legs with three claws (belly side)
def leg(i, flip=1):
    t = i / (N - 1); w = width(t); nx, ny = norm(i); tx, ty = tang(i)
    root = (S[i][0] - nx * w * .6, S[i][1] - ny * w * .6)
    knee = (root[0] - nx * 34 + tx * 22 * flip, root[1] - ny * 34 + ty * 22 * flip)
    foot = (knee[0] - nx * 16 + tx * 26 * flip, knee[1] - ny * 16 + ty * 26 * flip)
    add(f'<path d="M{pt(root)} Q{pt(knee)} {pt(foot)}" fill="none" stroke="{DARK}" stroke-width="15" stroke-linecap="round"/>')
    add(f'<path d="M{pt(root)} Q{pt(knee)} {pt(foot)}" fill="none" stroke="#7d0d16" stroke-width="11" stroke-linecap="round"/>')
    add(f'<path d="M{pt(root)} Q{pt(knee)} {pt(foot)}" fill="none" stroke="{GOLD}" stroke-width="1.2" stroke-dasharray="4 5" opacity=".8"/>')
    for a in (-.7, 0, .7):
        ang = math.atan2(foot[1] - knee[1], foot[0] - knee[0]) + a
        c1 = (foot[0] + math.cos(ang) * 10, foot[1] + math.sin(ang) * 10)
        c2 = (foot[0] + math.cos(ang + .5 * flip) * 17, foot[1] + math.sin(ang + .5 * flip) * 17)
        add(f'<path d="M{pt(foot)} Q{pt(c1)} {pt(c2)}" fill="none" stroke="{GOLD2}" stroke-width="2.6" stroke-linecap="round"/>')
    # elbow flame tuft
    e = knee; add(f'<path d="M{pt(e)} q{f(nx*-4 - tx*16)},{f(ny*-4 - ty*16)} {f(-tx*26)},{f(-ty*26)}" fill="none" stroke="{GOLD}" stroke-width="2" stroke-linecap="round"/>')
leg(int(N * .30), 1); leg(int(N * .56), 1); leg(int(N * .86), -1)

body = "M" + " L".join(pt(p) for p in L) + " L" + " L".join(pt(p) for p in reversed(R)) + " Z"
add(f'<path d="{body}" fill="url(#dg-body)" stroke="{GOLD}" stroke-width="2.2" stroke-linejoin="round"/>')

# belly plates band
BL = [(S[i][0] - norm(i)[0] * width(i / (N - 1)) * .45, S[i][1] - norm(i)[1] * width(i / (N - 1)) * .45) for i in range(N)]
band = "M" + " L".join(pt(p) for p in BL) + " L" + " L".join(pt(p) for p in reversed(R)) + " Z"
add(f'<path d="{band}" fill="url(#dg-belly)" opacity=".9"/>')
for i in range(8, N - 2, 5):
    add(f'<path d="M{pt(BL[i])} L{pt(R[i])}" stroke="{DARK}" stroke-width="1.4" opacity=".6"/>')
add('<path d="M' + " L".join(pt(p) for p in BL) + f'" fill="none" stroke="{GOLD}" stroke-width="1.2" opacity=".8"/>')

# scales: staggered scallops on the dorsal 55% of the body, opening toward the head
row = 0
for i in range(6, N - 4, 4):
    t = i / (N - 1); w = width(t); nx, ny = norm(i); tx, ty = tang(i)
    r = max(2.2, w * .2)
    offs = [k for k in (-.2, .15, .5, .82) if True]
    for k in offs:
        kk = k + (.17 if row % 2 else 0)
        if kk > .9: continue
        c = (S[i][0] + nx * w * kk, S[i][1] + ny * w * kk)
        a = (c[0] + nx * r, c[1] + ny * r); b = (c[0] - nx * r, c[1] - ny * r)
        ctrl = (c[0] - tx * r * 2.1, c[1] - ty * r * 2.1)
        add(f'<path d="M{pt(a)} Q{pt(ctrl)} {pt(b)}" fill="none" stroke="{GOLD}" stroke-width="1.1" opacity=".75"/>')
    row += 1

# tail flame fin
ti = 4; nx, ny = norm(ti); tx, ty = tang(ti); c = S[ti]
for k, (ln, sp) in enumerate([(46, 1.0), (36, .45), (30, -.2)]):
    ang = math.atan2(-ty, -tx) + sp
    tip = (c[0] + math.cos(ang) * ln, c[1] + math.sin(ang) * ln)
    add(f'<path d="M{pt(c)} Q{pt((c[0] + math.cos(ang + .5) * ln * .6, c[1] + math.sin(ang + .5) * ln * .6))} {pt(tip)} '
        f'Q{pt((c[0] + math.cos(ang - .2) * ln * .5, c[1] + math.sin(ang - .2) * ln * .5))} {pt(c)}" fill="#a3121d" stroke="{GOLD}" stroke-width="1.3"/>')

# ---- head (local coords: neck at 0,0, facing -x) ----
tx, ty = tang(N - 1); ang = math.degrees(math.atan2(ty, tx)) + 180
hx, hy = S[-1]
head = f'''
<g transform="translate({f(hx)} {f(hy)}) rotate({f(ang)}) scale(1.05)">
  <!-- mane flames -->
  <g fill="#a3121d" stroke="{GOLD}" stroke-width="1.4" stroke-linejoin="round">
    <path d="M8 -26 C 30 -54, 58 -52, 74 -70 C 64 -42, 46 -30, 26 -20 Z"/>
    <path d="M14 -10 C 44 -26, 70 -16, 92 -28 C 78 -6, 52 2, 26 0 Z"/>
    <path d="M12 8 C 40 6, 62 22, 86 18 C 70 36, 44 34, 20 22 Z"/>
    <path d="M2 22 C 24 34, 38 54, 58 60 C 34 66, 16 52, 4 34 Z"/>
  </g>
  <!-- antler horns -->
  <g fill="none" stroke="{GOLD2}" stroke-width="5" stroke-linecap="round">
    <path d="M-22 -30 C -6 -60, 24 -76, 62 -86"/><path d="M14 -64 C 18 -76, 14 -88, 6 -96"/><path d="M36 -77 C 46 -86, 50 -98, 48 -108"/>
  </g>
  <g fill="none" stroke="#b9883a" stroke-width="4" stroke-linecap="round" opacity=".9">
    <path d="M-30 -26 C -24 -50, -4 -66, 22 -78"/><path d="M-6 -56 C -6 -66, -12 -74, -20 -80"/>
  </g>
  <!-- lower jaw (open mouth) -->
  <path d="M8 18 C -20 22, -60 26, -92 40 C -98 42, -98 34, -92 30 C -66 18, -40 8, -18 4 Z" fill="#6e0b13" stroke="{GOLD}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M-30 12 L-34 22 L-40 11 M-56 18 L-60 28 L-66 20 M-80 26 L-84 35 L-88 28" fill="{GOLD2}" stroke="{GOLD2}" stroke-width="1" stroke-linejoin="round"/>
  <!-- tongue -->
  <path d="M-40 14 C -70 20, -100 16, -122 24 C -112 28, -116 34, -126 36" fill="none" stroke="#e0434d" stroke-width="4" stroke-linecap="round"/>
  <!-- skull + snout -->
  <path d="M10 -24 C -6 -40, -36 -44, -56 -36 C -76 -30, -96 -30, -112 -22 C -124 -18, -126 -4, -116 2
           C -100 6, -70 4, -46 2 C -26 2, -6 6, 10 14 Z" fill="url(#dg-head)" stroke="{GOLD}" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M-62 2 L-66 -8 L-72 2 M-86 3 L-90 -7 L-96 3" fill="{GOLD2}" stroke="{GOLD2}" stroke-width="1" stroke-linejoin="round"/>
  <!-- nostril curl + brow -->
  <path d="M-112 -20 c -8 -10, 4 -18, 10 -10" fill="none" stroke="{GOLD2}" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M-30 -36 C -40 -50, -60 -50, -70 -38" fill="none" stroke="{GOLD2}" stroke-width="3" stroke-linecap="round"/>
  <path d="M-24 -32 c 6 -10, 16 -12, 24 -8" fill="none" stroke="{GOLD}" stroke-width="2" stroke-linecap="round"/>
  <!-- eye -->
  <ellipse cx="-46" cy="-24" rx="10" ry="7" fill="{GOLD2}" stroke="{DARK}" stroke-width="1.5"/>
  <ellipse cx="-48" cy="-24" rx="3" ry="6" fill="{DARK}"/>
  <!-- cheek swirls -->
  <path d="M-8 -6 c -12 -6, -22 4, -14 12 c 6 4, 12 -2, 8 -6" fill="none" stroke="{GOLD}" stroke-width="1.8" stroke-linecap="round"/>
  <!-- whiskers -->
  <g fill="none" stroke="{GOLD2}" stroke-width="2.4" stroke-linecap="round">
    <path d="M-110 -16 C -150 -40, -150 -96, -100 -112 C -70 -122, -50 -104, -64 -90"/>
    <path d="M-104 4 C -140 30, -146 84, -104 102 C -74 114, -56 94, -70 82"/>
  </g>
  <!-- beard -->
  <g fill="none" stroke="{GOLD}" stroke-width="1.8" stroke-linecap="round">
    <path d="M-40 26 c -4 14, 2 26, 12 32"/><path d="M-26 22 c 0 14, 8 22, 18 26"/><path d="M-54 32 c -6 12, -4 22, 4 30"/>
  </g>
</g>'''
add(head)

# flaming pearl in front of the mouth
mx, my = hx + math.cos(math.radians(ang + 180)) * 0 , hy
px, py = hx - 190, hy + 70
add(f'''<g transform="translate({f(px)} {f(py)})">
  <circle r="36" fill="url(#dg-glow)"/>
  <g fill="none" stroke="{GOLD}" stroke-width="2" stroke-linecap="round">
    <path d="M-16 -14 C -24 -30, -10 -40, -4 -52"/><path d="M4 -16 C 2 -34, 16 -38, 14 -56"/><path d="M16 -8 C 26 -20, 34 -24, 34 -38"/>
  </g>
  <circle r="15" fill="url(#dg-pearl)" stroke="{GOLD2}" stroke-width="1.6"/>
  <path d="M-6 -6 a 8 8 0 0 1 9 -3" fill="none" stroke="#fff6dc" stroke-width="3" stroke-linecap="round"/>
</g>''')

defs = f'''<defs>
  <linearGradient id="dg-body" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#8e1420"/><stop offset=".5" stop-color="#5c0a12"/><stop offset="1" stop-color="#3a0609"/></linearGradient>
  <linearGradient id="dg-head" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#a5182a"/><stop offset="1" stop-color="#5a0a12"/></linearGradient>
  <linearGradient id="dg-belly" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#c8913e"/><stop offset="1" stop-color="#8a5a1e"/></linearGradient>
  <radialGradient id="dg-pearl" cx=".4" cy=".35" r=".7">
    <stop offset="0" stop-color="#fff3c9"/><stop offset=".6" stop-color="#e9c46a"/><stop offset="1" stop-color="#a8761f"/></radialGradient>
  <radialGradient id="dg-glow" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#f6c96a" stop-opacity=".55"/><stop offset="1" stop-color="#f6c96a" stop-opacity="0"/></radialGradient>
</defs>'''
svg = (f'<?xml version="1.0" encoding="UTF-8"?>\n<!-- Original stylized dragon, procedurally drawn (src/make_dragon.py). -->\n'
       f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">\n{defs}\n' + "\n".join(parts) + "\n</svg>\n")
OUT.write_text(svg); print("wrote", OUT, len(svg), "bytes")
