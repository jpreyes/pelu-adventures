"""Genera los iconos de Pelu Adventures (PWA) dibujando a la gatita blanca.
Ejecutar:  python tools/generate_icons.py
Produce:   icons/icon-192.png, icon-512.png, icon-512-maskable.png, apple-touch-icon.png
"""
import os, math
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(__file__), "..", "icons")
os.makedirs(OUT, exist_ok=True)

def lerp(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def draw_icon(size, maskable=False):
    S = size
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # Fondo degradado rosado (vertical). Full-bleed para maskable.
    top, bot = (255, 228, 245), (255, 199, 228)
    for y in range(S):
        d.line([(0, y), (S, y)], fill=lerp(top, bot, y / S))

    # Si no es maskable, esquinas redondeadas con transparencia
    if not maskable:
        r = int(S * 0.22)
        mask = Image.new("L", (S, S), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, S - 1, S - 1], radius=r, fill=255)
        img.putalpha(mask)
        d = ImageDraw.Draw(img)

    cx = S / 2
    # En maskable, el contenido va dentro del area segura (~80%)
    scale = 0.78 if maskable else 0.9
    head_r = S * 0.27 * scale
    head_cy = S * 0.50

    white = (253, 251, 253)
    edge = (231, 223, 233)
    pink = (255, 209, 232)
    dark = (74, 58, 74)

    # Orejas
    er = head_r
    d.polygon([(cx - er * 0.95, head_cy - er * 0.55), (cx - er * 1.15, head_cy - er * 1.55),
               (cx - er * 0.15, head_cy - er * 0.95)], fill=white, outline=edge, width=max(2, S // 160))
    d.polygon([(cx + er * 0.95, head_cy - er * 0.55), (cx + er * 1.15, head_cy - er * 1.55),
               (cx + er * 0.15, head_cy - er * 0.95)], fill=white, outline=edge, width=max(2, S // 160))
    d.polygon([(cx - er * 0.85, head_cy - er * 0.7), (cx - er * 0.95, head_cy - er * 1.25),
               (cx - er * 0.3, head_cy - er * 0.9)], fill=pink)
    d.polygon([(cx + er * 0.85, head_cy - er * 0.7), (cx + er * 0.95, head_cy - er * 1.25),
               (cx + er * 0.3, head_cy - er * 0.9)], fill=pink)

    # Cabeza
    d.ellipse([cx - head_r, head_cy - head_r, cx + head_r, head_cy + head_r],
              fill=white, outline=edge, width=max(2, S // 130))

    # Mejillas
    cr = head_r * 0.22
    for sx in (-1, 1):
        bx = cx + sx * head_r * 0.55
        by = head_cy + head_r * 0.22
        d.ellipse([bx - cr, by - cr * 0.7, bx + cr, by + cr * 0.7], fill=pink)

    # Ojos
    eo = head_r * 0.42
    ey = head_cy - head_r * 0.02
    ew, eh = head_r * 0.16, head_r * 0.26
    for sx in (-1, 1):
        ex = cx + sx * eo
        d.ellipse([ex - ew, ey - eh, ex + ew, ey + eh], fill=dark)
        d.ellipse([ex - ew * 0.2, ey - eh * 0.65, ex + ew * 0.7, ey - eh * 0.05], fill=(255, 255, 255))

    # Nariz
    nw = head_r * 0.16
    ny = head_cy + head_r * 0.22
    d.polygon([(cx - nw, ny), (cx + nw, ny), (cx, ny + nw)], fill=(255, 158, 196))

    # Bigotes
    d.line([(cx - head_r * 0.45, ny), (cx - head_r * 1.05, ny - head_r * 0.06)], fill=edge, width=max(2, S // 150))
    d.line([(cx - head_r * 0.45, ny + head_r * 0.12), (cx - head_r * 1.05, ny + head_r * 0.18)], fill=edge, width=max(2, S // 150))
    d.line([(cx + head_r * 0.45, ny), (cx + head_r * 1.05, ny - head_r * 0.06)], fill=edge, width=max(2, S // 150))
    d.line([(cx + head_r * 0.45, ny + head_r * 0.12), (cx + head_r * 1.05, ny + head_r * 0.18)], fill=edge, width=max(2, S // 150))

    # Lazo rojo (sello de Pelu)
    by = head_cy + head_r * 0.92
    bw = head_r * 0.5
    red, red2 = (235, 64, 80), (255, 120, 135)
    d.polygon([(cx, by), (cx - bw, by - bw * 0.6), (cx - bw, by + bw * 0.6)], fill=red)
    d.polygon([(cx, by), (cx + bw, by - bw * 0.6), (cx + bw, by + bw * 0.6)], fill=red)
    d.ellipse([cx - bw * 0.28, by - bw * 0.28, cx + bw * 0.28, by + bw * 0.28], fill=red2)

    return img

for s in (192, 512):
    draw_icon(s).save(os.path.join(OUT, f"icon-{s}.png"))
draw_icon(512, maskable=True).save(os.path.join(OUT, "icon-512-maskable.png"))
draw_icon(180).save(os.path.join(OUT, "apple-touch-icon.png"))
print("Iconos generados en", os.path.abspath(OUT))
