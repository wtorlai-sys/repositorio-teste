"""Gera public/frame_0..3.png: faixas de cinema (2.39:1), vinheta e grão de filme.

Uso: python3 scripts/gerar_moldura.py   (requer numpy e pillow)
"""
import numpy as np
from PIL import Image

W, H, BAR = 1920, 1080, 138
y, x = np.mgrid[0:H, 0:W].astype(np.float32)
dx = (x - W / 2) / (W / 2)
dy = (y - H / 2) / (H / 2)
r = np.sqrt(dx * dx * 0.75 + dy * dy * 0.9)
v = np.clip((r - 0.55) / 0.6, 0, 1) ** 1.4 * 0.6
rng = np.random.default_rng(1)
for k in range(4):
    n = rng.integers(0, 256, (H, W)).astype(np.float32)
    g = 0.07
    a = g + v * (1 - g)
    c = (n * g) / np.maximum(a, 1e-6)
    a[:BAR, :] = 1
    a[H - BAR:, :] = 1
    c[:BAR, :] = 0
    c[H - BAR:, :] = 0
    img = np.dstack([c, c, c, a * 255]).clip(0, 255).astype(np.uint8)
    Image.fromarray(img, 'RGBA').save(f'public/frame_{k}.png', optimize=True)
print('ok')
