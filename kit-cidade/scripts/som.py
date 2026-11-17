"""Trilha + efeitos sintetizados (numpy/scipy, determinístico) e mixagem com a narração.
Gera public/mix.wav (voz + trilha com ducking + SFX), normalizado para ~-14 LUFS.
Tempos vêm de words.json (índice de palavra), então mudanças de corte não exigem mexer aqui.
uso: python3 scripts/som.py"""
import json, os, subprocess
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100
W = json.load(open(os.path.join(ROOT, 'words.json'), encoding='utf-8'))
wt = lambda i: W[i]['s']
DUR = W[-1]['e'] + 0.6
N = int(DUR * SR)
rng = np.random.default_rng(7)


def t_(d):
    return np.arange(int(d * SR)) / SR


def env(n, a=0.01, r=0.2):
    e = np.ones(n)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e


def lp(x, f, order=4):
    return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x)


def hp(x, f, order=4):
    return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi):
    return sosfilt(butter(4, [lo, hi], 'band', fs=SR, output='sos'), x)


def reverb(x, secs=2.5, mix=0.35):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n))
    ir = lp(ir, 6000)
    wet = fftconvolve(x, ir)[: len(x)]
    wet /= np.max(np.abs(wet)) + 1e-9
    return x * (1 - mix) + wet * mix * np.max(np.abs(x))


def add(buf, x, at, g=1.0):
    i = int(at * SR)
    if i >= len(buf):
        return
    x = x[: len(buf) - i]
    buf[i:i + len(x)] += x * g


hz = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------------- MÚSICA ----------------
music = np.zeros(N)


def pad(chord, d, bright=1.0):
    t = t_(d)
    y = np.zeros_like(t)
    for m in chord:
        for det in (-0.07, 0.0, 0.06):
            f = hz(m) * 2 ** (det / 12)
            y += np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t) * bright
    y *= env(len(t), 1.2, 1.4)
    return lp(y / (len(chord) * 3), 1800 * bright)


def piano(m, d=2.2, vel=1.0):
    t = t_(d)
    f = hz(m)
    y = sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t * (2.2 + k)) / k for k in (1, 2, 3, 4))
    y *= np.minimum(1, t / 0.004)
    return y * vel


def drone(m, d, gain=1.0):
    t = t_(d)
    y = np.sin(2 * np.pi * hz(m) * t) + 0.5 * np.sin(2 * np.pi * hz(m) * 1.003 * t)
    y += 0.3 * lp(rng.standard_normal(len(t)), 300)
    return y * env(len(t), 2, 2) * gain


# progressão: Dm - Bb - F - A (mistério calmo), 4 s por acorde
prog_dark = [[50, 53, 57], [46, 50, 53], [45, 48, 53], [45, 49, 52]]
prog_warm = [[53, 57, 60], [48, 52, 55], [50, 53, 57], [46, 50, 53]]
mel = [62, 65, 69, 67, 65, 64, 62, 60]


def section(t0, t1, prog, bright=1.0, piano_vel=0.6, every=1.0):
    t = t0
    k = 0
    while t < t1:
        d = min(4.0, t1 - t) + 1.4
        add(music, pad(prog[k % 4], d, bright), t, 0.5)
        for b in range(4):
            tb = t + b * every
            if tb < t1 and (b + k) % 2 == 0:
                add(music, piano(mel[(k * 2 + b) % len(mel)] + (12 if bright > 1 else 0), 2.5, piano_vel), tb, 0.33)
        t += 4.0
        k += 1


section(0.0, 28.0, prog_dark, 1.0, 0.65)
section(28.0, 36.6, prog_dark, 0.7, 0.45)  # noite, bordão (mais suave)
section(36.6, 56.6, prog_dark, 0.6, 0.4)
add(music, drone(38, 20.0, 0.5), 36.6, 0.5)  # nublado: drone grave
section(56.6, 74.5, prog_dark, 0.9, 0.7, 0.5)  # mobilização: piano mais rápido
add(music, drone(45, 18.0, 0.4), 56.6, 0.5)
section(74.5, 79.0, prog_warm, 1.3, 0.8, 0.5)  # festa: maior, quente
section(79.0, 85.2, prog_dark, 0.5, 0.35)
add(music, drone(38, 17.0, 0.8), 85.0, 0.6)  # virada: grave e frio
section(85.2, 100.8, [[50, 53, 56], [49, 53, 56], [50, 53, 57], [49, 52, 56]], 0.45, 0.3)
music = reverb(music, 3.0, 0.4)
fade = np.ones(N)
i1 = int(W[-2]['s'] * SR)
fade[i1:] = np.linspace(1, 0, N - i1) ** 3  # trilha some no "ninguém sabe"
music *= fade

# ---------------- SFX ----------------
# >>> EDITAR POR VÍDEO: as seções de música acima (tempos em segundos) e os cues abaixo (índices de palavra).
# Os cues abaixo são os do vídeo 'eco-da-montanha', mantidos como exemplo.
sfx = np.zeros(N)


def knock():
    t = t_(0.25)
    y = np.sin(2 * np.pi * 140 * t) * np.exp(-t * 35) + 0.5 * bp(rng.standard_normal(len(t)), 400, 2500) * np.exp(-t * 60)
    return reverb(y, 0.6, 0.3)


def whoosh(d=0.6, lo=200, hi=3000):
    n = int(d * SR)
    y = bp(rng.standard_normal(n), lo, hi) * np.sin(np.linspace(0, np.pi, n)) ** 2
    return y


def boom(d=2.5, f=48):
    t = t_(d)
    y = np.sin(2 * np.pi * f * t * (1 - 0.3 * t / d)) * np.exp(-t * 2.2) + 0.4 * lp(rng.standard_normal(len(t)), 150) * np.exp(-t * 3)
    return reverb(y, 2.0, 0.3)


def paper(d=0.7):
    n = int(d * SR)
    y = hp(rng.standard_normal(n), 2500) * (0.4 + 0.6 * np.abs(np.sin(np.linspace(0, 9, n)))) * env(n, 0.05, 0.2)
    return y * 0.5


def wind(d):
    n = int(d * SR)
    base = lp(rng.standard_normal(n), 700)
    mod = 0.6 + 0.4 * np.sin(np.linspace(0, d * 0.9, n)) * np.sin(np.linspace(0, d * 0.37, n))
    return base * mod * env(n, 1.5, 1.5)


def step(soft=False):
    t = t_(0.12)
    y = lp(rng.standard_normal(len(t)), 900 if soft else 1600) * np.exp(-t * 45)
    return y


def crackle(d):
    n = int(d * SR)
    y = lp(rng.standard_normal(n), 400) * 0.25
    for _ in range(int(d * 18)):
        i = rng.integers(0, n - 800)
        y[i:i + 800] += hp(rng.standard_normal(800), 3000) * np.exp(-np.arange(800) / 120) * rng.uniform(0.3, 1)
    return y * env(n, 0.5, 0.8)


def crowd(d, cheer=False):
    n = int(d * SR)
    y = np.zeros(n)
    for k in range(14):
        f0 = rng.uniform(140, 320)
        ph = np.cumsum(f0 * (1 + 0.08 * np.sin(np.linspace(0, d * rng.uniform(3, 7), n)))) / SR
        v = np.sin(2 * np.pi * ph) * (0.5 + 0.5 * np.sin(np.linspace(0, d * rng.uniform(1, 4), n) + k))
        y += bp(v + 0.3 * rng.standard_normal(n), 250, 2500 if cheer else 1200)
    return y / 14 * env(n, 0.3, 0.6)


def chime(f=1320, d=1.6):
    t = t_(d)
    y = sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t * (3 + k)) / k for k in (1, 2.01, 3.03))
    return reverb(y, 1.8, 0.5)


def tick():
    t = t_(0.05)
    return hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 120)


add(sfx, whoosh(0.5, 300, 5000), 0.0, 0.35)                       # crash zoom da abertura
for k in range(3):
    add(sfx, tick(), wt(34) + k * 0.33, 0.25)                      # três segundos
add(sfx, chime(990), wt(37), 0.18)                                 # a montanha responde
for i in (46, 181, 260):
    add(sfx, chime(1480, 1.2), wt(i), 0.12)                        # segredo saindo (brilho)
add(sfx, knock(), wt(87), 0.6)                                     # bordão: toc toc
add(sfx, knock(), wt(88), 0.6)
add(sfx, paper(0.9), wt(116), 0.5)                                 # bilhete por baixo da porta
add(sfx, whoosh(0.4, 200, 3000), wt(139), 0.3)                     # Lia sumiu (crash)
add(sfx, wind(10.0), wt(144), 0.22)                                # janela aberta / neblina
for k in range(9):
    add(sfx, step(), wt(156) + k * 0.19, 0.35)                     # subi correndo
add(sfx, crowd(7.5), wt(169), 0.22)                                # cidade inteira
add(sfx, boom(3.0, 40), wt(198), 0.55)                             # montanha grita
add(sfx, crackle(5.0), wt(214), 0.25)                              # fogueira
for i in (218, 219, 220):
    add(sfx, crowd(0.8, True), wt(i), 0.35)                        # Teco! Teco! Teco!
add(sfx, boom(3.0, 45), wt(246), 0.55)                             # aí eu entendi
add(sfx, wind(6.0), wt(267), 0.15)
add(sfx, knock() * 0.8, wt(272), 0.55)                             # alguém bate duas vezes
add(sfx, knock() * 0.8, wt(273), 0.55)
add(sfx, boom(1.6, 36), wt(285), 0.7)                              # ninguém sabe (impacto final)

# ---------------- MIX ----------------
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(ROOT, 'public', 'narracao.mp3'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
voice = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
v = np.zeros(N)
v[: min(N, len(voice))] = voice[:N]

# ducking: trilha abaixa enquanto há voz
ve = np.abs(v)
win = int(0.08 * SR)
ve = np.convolve(ve, np.ones(win) / win, mode='same')
duck = 1 - 0.45 * np.clip(ve / (np.percentile(ve, 90) + 1e-9), 0, 1)
duck = np.convolve(duck, np.ones(win * 3) / (win * 3), mode='same')

rms = lambda x: np.sqrt(np.mean(x ** 2)) + 1e-12
music *= (rms(v) / rms(music)) * 10 ** (-17 / 20)  # trilha ~17 dB abaixo da voz
sfx *= (rms(v) / (np.max(np.abs(sfx)) + 1e-9)) * 2.2
mix = v + music * duck + sfx
st = np.stack([mix, mix], 1)
tmp = os.path.join(ROOT, 'out', 'mix_raw.wav')
os.makedirs(os.path.dirname(tmp), exist_ok=True)
import wave
with wave.open(tmp, 'wb') as f:
    f.setnchannels(2)
    f.setsampwidth(2)
    f.setframerate(SR)
    f.writeframes((np.clip(st / (np.max(np.abs(st)) * 1.05), -1, 1) * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.0:LRA=11', '-ar', str(SR), os.path.join(ROOT, 'public', 'mix.wav')], check=True)
print('ok public/mix.wav', round(DUR, 2), 's')
