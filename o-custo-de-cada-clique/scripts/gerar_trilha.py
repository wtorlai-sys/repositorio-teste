"""Sintetiza a trilha de efeitos sonoros, ambiente e música do curta.

Lê os marcos de tempo de src/v2/time.ts (objeto T) para manter a sincronia
com as cenas e grava public/trilha.wav (a narração entra separada no Remotion).

Uso: python3 scripts/gerar_trilha.py   (requer numpy e scipy)
"""
import re
import wave
from pathlib import Path

import numpy as np
from scipy import signal

SR = 44100
ROOT = Path(__file__).resolve().parent.parent
rng = np.random.default_rng(7)

# ------------------------------------------------------------------ tempos
src = (ROOT / 'src/v2/time.ts').read_text()
block = src[src.index('export const T = {'):src.index('};', src.index('export const T = {'))]
T = {k: float(v) for k, v in re.findall(r'(\w+):\s*([\d.]+)', block)}
DUR = float(re.search(r'AUDIO_SECONDS = ([\d.]+)', src).group(1)) + 0.5
T['end'] = DUR - 0.5
N = int(DUR * SR)

# camadas (estéreo simples: L/R)
mix = np.zeros((2, N), dtype=np.float64)


def secs(n):
    return int(n * SR)


def t_axis(d):
    return np.arange(int(d * SR)) / SR


def sos(kind, f, order=2):
    return signal.butter(order, f, btype=kind, fs=SR, output='sos')


def filt(x, kind, f, order=2):
    return signal.sosfilt(sos(kind, f, order), x)


def noise(d):
    return rng.standard_normal(int(d * SR))


def env_exp(d, decay):
    t = t_axis(d)
    return np.exp(-t / decay)


def adsr(d, a=0.01, r=0.1):
    n = int(d * SR)
    e = np.ones(n)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e


def reverb(x, size=1.2, wet=0.3):
    ir = noise(size) * env_exp(size, size / 5)
    ir = filt(ir, 'lowpass', 5000)
    ir /= np.abs(ir).sum() ** 0.5 * 8
    y = signal.fftconvolve(x, ir)[: len(x) + int(size * SR)]
    out = np.zeros(len(y))
    out[: len(x)] += x * (1 - wet)
    return out + y * wet


def put(x, at, gain=1.0, pan=0.0):
    """Coloca o som x no tempo `at` (s)."""
    if at < 0:
        x = x[secs(-at):]
        at = 0
    i = secs(at)
    if i >= N:
        return
    x = x[: N - i]
    l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    mix[0, i:i + len(x)] += x * gain * l * 1.41
    mix[1, i:i + len(x)] += x * gain * r * 1.41


def norm(x, peak=1.0):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def fade_bed(x, fi=1.0, fo=1.0):
    n = len(x)
    e = np.ones(n)
    a, b = min(n, secs(fi)), min(n, secs(fo))
    e[:a] = np.linspace(0, 1, a)
    e[n - b:] *= np.linspace(1, 0, b)
    return x * e


# ------------------------------------------------------------------ efeitos
def vibrate(pulses=2, on=0.38, off=0.16):
    out = []
    for _ in range(pulses):
        t = t_axis(on)
        motor = np.sign(np.sin(2 * np.pi * 155 * t)) * 0.4 + np.sin(2 * np.pi * 310 * t) * 0.3
        rattle = filt(noise(on), 'bandpass', [120, 900]) * 0.8
        body = (motor + rattle) * (0.7 + 0.3 * np.sin(2 * np.pi * 28 * t))
        out.append(filt(body, 'lowpass', 1400) * adsr(on, 0.01, 0.04))
        out.append(np.zeros(secs(off)))
    return norm(np.concatenate(out), 0.9)


def chime(freqs, step=0.11, decay=0.35, bright=0.25):
    total = step * len(freqs) + decay * 4
    y = np.zeros(secs(total))
    for i, f in enumerate(freqs):
        t = t_axis(decay * 4)
        tone = np.sin(2 * np.pi * f * t) + bright * np.sin(2 * np.pi * f * 2 * t) + 0.1 * np.sin(2 * np.pi * f * 3.01 * t)
        tone *= np.exp(-t / decay) * adsr(decay * 4, 0.004, 0.05)
        s = secs(i * step)
        y[s:s + len(tone)] += tone
    return norm(reverb(y, 0.8, 0.25), 0.8)


def ding_ok():
    return chime([1318.5, 1975.5], 0.12, 0.3)


def ding_bad():
    return chime([880, 659.3], 0.14, 0.32, 0.4)


def ding_msg():
    return chime([1046.5], 0.1, 0.5, 0.15)


def chip(freqs, step=0.07, wave='square', vol=1.0):
    y = []
    for f in freqs:
        t = t_axis(step)
        ph = 2 * np.pi * f * t
        s = np.sign(np.sin(ph)) * 0.5 if wave == 'square' else np.sin(ph)
        y.append(s * adsr(step, 0.003, step * 0.4))
    y = np.concatenate(y + [np.zeros(secs(0.3))])
    return norm(reverb(filt(y, 'lowpass', 6000), 0.6, 0.2), 0.6 * vol)


def coin():
    return chip([1046.5, 1318.5, 1568, 2093, 2637], 0.07)


def buy_game():
    a = chip([784, 1046.5, 1568], 0.06)
    bell = chime([2093, 2637], 0.05, 0.25)
    out = np.zeros(max(len(a), len(bell) + secs(0.15)))
    out[: len(a)] += a
    out[secs(0.15):secs(0.15) + len(bell)] += bell * 0.7
    return norm(out, 0.8)


def warn_beep():
    return chip([880, 660, 880, 660], 0.16, 'sine')


def alarm(d=5.0):
    t = t_axis(d)
    f = np.where((t * 2.5) % 1 < 0.5, 900, 650)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return norm(filt(np.sign(np.sin(ph)) * 0.3, 'lowpass', 2500) * adsr(d, 0.05, 0.3), 0.5)


def pops(d=5.0, rate=2.5):
    y = np.zeros(secs(d))
    k = 0.2
    while k < d - 0.3:
        p = filt(noise(0.12), 'bandpass', [300, 3000]) * env_exp(0.12, 0.02)
        s = secs(k)
        y[s:s + len(p)] += p
        k += rng.uniform(0.15, 1.0) / rate * 2
    return norm(y, 0.5)


def fail():
    t = t_axis(1.2)
    f = 600 * np.exp(-t * 1.8)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sign(np.sin(ph)) * 0.4 * env_exp(1.2, 0.5)
    return norm(reverb(filt(y, 'lowpass', 3000), 0.8, 0.25), 0.6)


def keys_toss():
    d = 0.9
    y = np.zeros(secs(d))
    # pancada na madeira
    th = filt(noise(0.15), 'lowpass', 400) * env_exp(0.15, 0.03)
    th += np.sin(2 * np.pi * 95 * t_axis(0.15)) * env_exp(0.15, 0.04) * 1.5
    y[: len(th)] += th * 0.8
    # tilintar metálico
    for i in range(9):
        at = 0.005 + i * rng.uniform(0.02, 0.06)
        dd = 0.25
        t = t_axis(dd)
        clink = sum(np.sin(2 * np.pi * f * t) * rng.uniform(0.3, 1) for f in rng.uniform(2800, 7800, 5))
        clink *= np.exp(-t / rng.uniform(0.03, 0.08))
        s = secs(at)
        y[s:s + len(clink)] += clink * (0.5 if i else 0.9) * (1 - i * 0.07)
    return norm(reverb(y, 0.5, 0.15), 0.9)


def paper_slap():
    p = filt(noise(0.2), 'bandpass', [400, 4000]) * env_exp(0.2, 0.035)
    return norm(p, 0.6)


def step_sound(kind='floor'):
    if kind == 'dirt':
        s = filt(noise(0.14), 'bandpass', [180, 2200]) * env_exp(0.14, 0.035)
        s += filt(noise(0.14), 'lowpass', 200) * env_exp(0.14, 0.02)
    else:
        s = filt(noise(0.1), 'lowpass', 350) * env_exp(0.1, 0.02)
        s += filt(noise(0.1), 'bandpass', [1500, 5000]) * env_exp(0.1, 0.008) * 0.3
    return norm(s, 0.5)


def door():
    latch = filt(noise(0.06), 'highpass', 2000) * env_exp(0.06, 0.01)
    t = t_axis(0.7)
    creak = np.sin(2 * np.pi * (240 + 60 * np.sin(2 * np.pi * 3 * t)) * t) * 0.15 * adsr(0.7, 0.1, 0.3)
    thump = filt(noise(0.3), 'lowpass', 200) * env_exp(0.3, 0.06)
    y = np.zeros(secs(1.2))
    y[: len(latch)] += latch
    y[secs(0.05):secs(0.05) + len(creak)] += filt(creak + filt(noise(0.7), 'bandpass', [200, 900]) * 0.04, 'lowpass', 1500)
    y[secs(0.75):secs(0.75) + len(thump)] += thump * 0.4
    return norm(y, 0.6)


def can_open():
    click = filt(noise(0.03), 'highpass', 3000) * env_exp(0.03, 0.004)
    hiss = filt(noise(0.5), 'highpass', 2500) * env_exp(0.5, 0.12)
    y = np.zeros(secs(0.6))
    y[: len(click)] += click * 1.2
    y[secs(0.02):secs(0.02) + len(hiss)] += hiss * 0.6
    return norm(y, 0.6)


def boom(d=2.5, f0=70):
    t = t_axis(d)
    f = f0 * np.exp(-t * 0.8) + 25
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, d / 4)
    y += filt(noise(d), 'lowpass', 180) * env_exp(d, d / 6) * 0.5
    return norm(reverb(y, 1.5, 0.3), 0.9)


def clang():
    d = 2.5
    t = t_axis(d)
    y = sum(np.sin(2 * np.pi * f * t) * np.exp(-t / dd) for f, dd in [(220, 1.2), (331, 0.9), (587, 0.6), (1123, 0.4), (1789, 0.25)])
    y += filt(noise(d), 'bandpass', [1000, 5000]) * env_exp(d, 0.03)
    return norm(reverb(y, 1.8, 0.4), 0.7)


def whoosh(d=0.8):
    n = noise(d)
    t = t_axis(d)
    e = np.sin(np.pi * t / d) ** 2
    lo = filt(n, 'bandpass', [300, 1500])
    hi = filt(n, 'bandpass', [1500, 6000])
    k = t / d
    return norm((lo * (1 - k) + hi * k) * e, 0.5)


def heartbeat(n=6, bpm=60, slow=0.0):
    y = []
    period = 60 / bpm
    for i in range(n):
        p = period * (1 + slow * i)
        b = np.zeros(secs(p))
        for off, a in [(0, 1.0), (0.22, 0.7)]:
            t = t_axis(0.18)
            h = np.sin(2 * np.pi * 52 * t) * np.exp(-t / 0.05) * a
            s = secs(off)
            b[s:s + len(h)] += h
        y.append(b)
    return norm(filt(np.concatenate(y), 'lowpass', 160), 0.9)


def power(on=True):
    t = t_axis(0.6)
    f = (300 + 1800 * t / 0.6) if on else (2400 * np.exp(-t * 5) + 100)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3 * env_exp(0.6, 0.25)
    click = filt(noise(0.03), 'highpass', 1500) * env_exp(0.03, 0.005)
    y[: len(click)] += click
    return norm(y, 0.6)


def ringtone(d=6.0):
    notes = [659.3, 784, 987.8, 784, 880, 1046.5]
    y = np.zeros(secs(d))
    k = 0.0
    i = 0
    while k < d - 0.3:
        t = t_axis(0.3)
        f = notes[i % len(notes)]
        n = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 4 * t)) * np.exp(-t / 0.12)
        s = secs(k)
        y[s:s + len(n)] += n
        k += 0.16 if (i % 6) != 5 else 0.9
        i += 1
    return norm(filt(y, 'bandpass', [400, 4000]), 0.5)


def kick_ball():
    t = t_axis(0.25)
    y = np.sin(2 * np.pi * 110 * np.exp(-t * 6) * t) * env_exp(0.25, 0.04)
    y += filt(noise(0.25), 'bandpass', [300, 2000]) * env_exp(0.25, 0.015) * 0.5
    return norm(y, 0.6)


def sparkle():
    return chime([3135.9, 4186, 5274], 0.05, 0.25, 0.05)


def clink_glass():
    d = 1.2
    t = t_axis(d)
    y = sum(np.sin(2 * np.pi * f * t) * np.exp(-t / dd) for f, dd in [(2960, 0.5), (4410, 0.3), (6020, 0.2)])
    return norm(reverb(y, 0.8, 0.2), 0.5)


def tick():
    return norm(filt(noise(0.03), 'bandpass', [2000, 6000]) * env_exp(0.03, 0.004), 0.5)


def clicks_bed(d, rate=7.0, gain=0.4):
    """Cliques de botões / teclado."""
    y = np.zeros(secs(d))
    k = 0.0
    while k < d - 0.05:
        c = filt(noise(0.02), 'bandpass', [1800, 7000]) * env_exp(0.02, 0.003) * rng.uniform(0.4, 1)
        s = secs(k)
        y[s:s + len(c)] += c
        k += rng.exponential(1 / rate)
    return y * gain


# ------------------------------------------------------------------ ambientes
def room_tone(d, hum=True):
    y = filt(noise(d), 'lowpass', 160) * 0.5
    if hum:
        t = t_axis(d)
        y += (np.sin(2 * np.pi * 60 * t) * 0.05 + np.sin(2 * np.pi * 120 * t) * 0.03)
    return y


def fan(d):
    return filt(noise(d), 'bandpass', [250, 1100]) * 0.25


def city_night(d):
    base = filt(noise(d), 'lowpass', 450)
    t = t_axis(d)
    swell = 0.6 + 0.4 * np.sin(2 * np.pi * t / 9.0 + 1) ** 2
    return base * swell


def birds(d, density=0.8):
    y = np.zeros(secs(d))
    k = rng.uniform(0, 1)
    while k < d - 0.5:
        n = rng.integers(2, 5)
        f0 = rng.uniform(2600, 4600)
        for j in range(n):
            dd = rng.uniform(0.05, 0.12)
            t = t_axis(dd)
            f = f0 * (1 + 0.25 * np.sin(np.pi * t / dd)) * rng.uniform(0.9, 1.1)
            c = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / dd)
            s = secs(k + j * dd * 1.3)
            if s + len(c) < len(y):
                y[s:s + len(c)] += c
        k += rng.exponential(1 / density) + 0.4
    return y * 0.25


def waves(d):
    n = noise(d)
    t = t_axis(d)
    e = (0.35 + 0.65 * np.sin(np.pi * t / 6.5) ** 4)
    return (filt(n, 'lowpass', 700) * 0.8 + filt(n, 'highpass', 3000) * 0.15) * e


def wind(d):
    t = t_axis(d)
    return filt(noise(d), 'bandpass', [150, 900]) * (0.5 + 0.5 * np.sin(2 * np.pi * t / 7.3) ** 2)


def crowd(d, voices=14):
    y = np.zeros(secs(d))
    for _ in range(voices):
        n = filt(noise(d), 'bandpass', [rng.uniform(250, 400), rng.uniform(1600, 2600)])
        rate = rng.uniform(3.5, 6.5)
        t = t_axis(d)
        syl = np.clip(np.sin(2 * np.pi * rate * t + rng.uniform(0, 6)) + rng.uniform(-0.3, 0.3), 0, 1)
        phrase = (np.sin(2 * np.pi * t / rng.uniform(2, 5) + rng.uniform(0, 6)) > -0.3).astype(float)
        phrase = filt(phrase, 'lowpass', 8)
        y += n * syl * phrase
    return y / voices


def tinnitus(d):
    t = t_axis(d)
    return np.sin(2 * np.pi * 6200 * t) * 0.02 * adsr(d, 1.5, 1.5)


def crackle(d):
    y = filt(noise(d), 'highpass', 2000) * 0.05
    idx = rng.integers(0, secs(d), int(d * 25))
    y[idx] += rng.uniform(-1, 1, len(idx))
    return y


# ------------------------------------------------------------------ música
def note_hz(n):
    return 440 * 2 ** ((n - 69) / 12)


def pad(d, chords, cut=900, detune=0.004, vol=1.0):
    """chords: lista de (inicio_rel, [notas midi])."""
    t_all = np.zeros(secs(d))
    for i, (st, notes) in enumerate(chords):
        en = chords[i + 1][0] if i + 1 < len(chords) else d
        seg = en - st
        if seg <= 0:
            continue
        t = t_axis(seg + 1.5)
        y = np.zeros(len(t))
        for n in notes:
            for dt in (-detune, 0, detune):
                f = note_hz(n) * (1 + dt)
                y += signal.sawtooth(2 * np.pi * f * t + rng.uniform(0, 6)) * 0.3
        y = filt(y, 'lowpass', cut) * adsr(seg + 1.5, 1.2, 1.5)
        s = secs(st)
        e = min(len(t_all), s + len(y))
        t_all[s:e] += y[: e - s]
    return norm(t_all, 1.0) * vol


def plucks(d, seq, bpm=96, vol=1.0, decay=0.5, bright=0.3):
    """seq: lista de notas midi (None = pausa), em colcheias."""
    y = np.zeros(secs(d) + secs(3))
    step = 60 / bpm / 2
    k = 0
    i = 0
    while k < d:
        n = seq[i % len(seq)]
        if n is not None:
            t = t_axis(decay * 4)
            f = note_hz(n)
            tone = (np.sin(2 * np.pi * f * t) + bright * np.sin(2 * np.pi * 2 * f * t) + 0.1 * np.sin(2 * np.pi * 3 * f * t)) * np.exp(-t / decay)
            s = secs(k)
            y[s:s + len(tone)] += tone * adsr(decay * 4, 0.003, 0.05)
        k += step
        i += 1
    return norm(reverb(y[: secs(d)], 1.6, 0.35), 1.0) * vol


def party_music(d, bpm=124):
    y = np.zeros(secs(d))
    beat = 60 / bpm
    k = 0.0
    i = 0
    bass = [45, 45, 48, 43]
    while k < d - 0.5:
        t = t_axis(0.35)
        kick = np.sin(2 * np.pi * np.cumsum(50 + 90 * np.exp(-t * 25)) / SR) * np.exp(-t / 0.12)
        s = secs(k)
        y[s:s + len(kick)] += kick * 0.9
        if i % 2 == 1:
            hat = filt(noise(0.06), 'highpass', 6000) * env_exp(0.06, 0.015) * 0.3
            y[s:s + len(hat)] += hat
        tb = t_axis(beat)
        f = note_hz(bass[(i // 4) % 4])
        b = signal.sawtooth(2 * np.pi * f * tb) * np.exp(-tb / 0.2) * 0.4
        sb = secs(k + beat / 2)
        if sb + len(b) < len(y):
            y[sb:sb + len(b)] += filt(b, 'lowpass', 300)
        k += beat
        i += 1
    chords = pad(d, [(0, [57, 60, 64, 69])], cut=1800, vol=0.25)
    return y + chords


# ------------------------------------------------------------------ montagem da trilha
def bed(fn, a, b, gain, fi=1.0, fo=1.0, pan=0.0):
    d = b - a
    if d <= 0:
        return
    put(fade_bed(fn(d), fi, fo), a, gain, pan)


def steps(a, b, rate, kind='floor', gain=0.25, pan=0.0):
    k = a
    while k < b:
        put(step_sound(kind), k, gain * rng.uniform(0.8, 1.1), pan)
        k += 1 / rate


A = 1.0  # ganho mestre dos efeitos

# ---------- Cena 1: quarto, madrugada
bed(room_tone, 0, T['casa'], 0.10, 2.5, 0.6)
bed(fan, 0, T['casa'], 0.035, 2.5, 0.6, 0.3)
bed(city_night, 0, T['casa'], 0.05, 3, 0.6, -0.4)
put(fade_bed(clicks_bed(T['vibra'] - 6, 6, 0.5), 0.5, 0.5), 6, 0.10 * A, 0.2)
put(fade_bed(clicks_bed(T['compra'] - T['jaqueta'] - 1, 6, 0.5), 0.5, 0.5), T['jaqueta'] + 0.5, 0.10 * A, 0.2)
put(fade_bed(clicks_bed(6, 7, 0.5), 0.5, 0.5), T['carro'], 0.10 * A, 0.2)
put(pad(T['casa'], [(0, [45, 52, 57, 60]), (20, [41, 48, 53, 57]), (34, [43, 50, 55, 59]), (47, [45, 52, 57, 60])], cut=700, vol=1), 0, 0.05)
put(boom(3), T['title'], 0.22)
put(coin(), T['missao'] + 0.4, 0.22 * A, 0.2)
put(vibrate(2), T['vibra'], 0.35 * A, 0.3)
put(vibrate(2), T['pix'] - 0.6, 0.35 * A, 0.3)
put(ding_ok(), T['pix'], 0.30 * A)
put(buy_game(), 40.6, 0.22 * A, 0.2)
put(vibrate(1), T['compra'] - 0.4, 0.35 * A, 0.3)
put(ding_bad(), T['compra'], 0.28 * A)
put(whoosh(0.6), T['carro'] - 0.3, 0.15)
put(buy_game(), 57.4, 0.25 * A, 0.2)
put(vibrate(2), 58.7, 0.38 * A, 0.3)
put(ding_bad(), T['eraReal'] - 0.4, 0.3 * A)
put(boom(3.5, 55), T['eraReal'] + 0.1, 0.3)

# ---------- Cena 2: casa dos pais (dia)
c2a, c2b = T['casa'], T['montagem']
bed(room_tone, c2a, c2b, 0.06, 0.3, 0.5)
bed(birds, c2a, c2b, 0.25, 0.3, 0.8, -0.5)
put(door(), c2a + 0.05, 0.35, 0.6)
k = c2a + 0.2
while k < 65.0:
    put(step_sound('floor'), k, 0.3, 0.4)
    k += np.pi / 9
put(keys_toss(), 65.0, 0.5 * A, 0.1)
put(paper_slap(), 65.08, 0.35 * A, -0.1)
put(whoosh(0.5), 66.1, 0.12)
put(pad(c2b - c2a + 22.4, [(0, [48, 55, 60, 64]), (4.0, [53, 57, 60, 65]), (8.8, [55, 59, 62, 67]), (15.3, [48, 55, 60, 64, 67]), (20.4, [53, 60, 65, 69]), (26, [55, 62, 67, 71]), (32, [48, 55, 60, 64])], cut=1600, vol=1), c2a, 0.05)
put(plucks(c2b - 74 + 22.4, [72, None, 76, 79, 76, None, 74, 72], bpm=100, vol=1, decay=0.35), 74.0, 0.05)
put(clink_glass(), 77.6, 0.12)

# ---------- Montagem
m0, m1, m2, m3 = T['montagem'], T['amigo'], T['cobertura'], T['cena3']
for at in (m0, m1, m2):
    put(whoosh(0.7), at - 0.35, 0.25)
bed(waves, m0, m1, 0.30, 0.4, 0.4)
bed(birds, m0, m1, 0.12, 0.4, 0.4, 0.5)
bed(room_tone, m1, m2, 0.06, 0.2, 0.2)
put(ding_ok(), m1 + 1.2, 0.25)
bed(wind, m2, m3, 0.10, 0.2, 0.8)
bed(city_night, m2, m3, 0.05, 0.2, 0.8)
steps(m2 + 0.2, 102.2, 2.5, 'floor', 0.2)
put(sparkle(), 102.6, 0.3)
put(sparkle(), 103.9, 0.2)
put(plucks(m3 - m0, [72, 76, 79, 84, 79, 76, 74, 77, 81, 77, 74, 71], bpm=104, vol=1, decay=0.4), m0, 0.045)

# ---------- Cena 3: madrugada na cobertura
c3a, c3b = T['cena3'], T['cena4']
bed(room_tone, c3a, c3b, 0.09, 0.6, 0.5)
bed(fan, c3a, c3b, 0.03, 0.6, 0.5)
bed(city_night, c3a, c3b, 0.06, 0.6, 0.5)
put(fade_bed(clicks_bed(c3b - c3a, 7, 0.5), 0.6, 0.5), c3a, 0.09, 0.1)
put(tick(), c3a + 0.6, 0.3)
put(tick(), c3a + 1.6, 0.25)
put(warn_beep(), T['aluguel'] + 0.1, 0.22)
put(vibrate(1), 114.4, 0.35, 0.3)
put(ding_bad(), 114.9, 0.28)
put(alarm(5.6), 130.4, 0.10, -0.2)
put(pops(5.5), 130.6, 0.14, 0.2)
put(fail(), 136.1, 0.25)
put(can_open(), T['boceja'] + 2.4, 0.35, 0.2)
put(boom(3, 60), T['prisao'] - 0.3, 0.3)
put(clang(), T['prisao'] - 0.2, 0.25)
put(pad(c3b - c3a, [(0, [45, 52, 57, 60]), (12, [44, 51, 56, 59]), (25, [41, 48, 53, 57]), (33, [40, 47, 52, 55]), (45, [38, 45, 50, 53])], cut=650, vol=1), c3a, 0.06)

# ---------- Cena 4: os anos
c4a, c4b = T['cena4'], T['tentativas']
bed(room_tone, c4a, c4b, 0.08, 0.5, 0.2)
bed(city_night, c4a, T['manha'], 0.05, 0.5, 1)
k = c4a + 0.3
while k < T['ano3'] - 0.3:
    put(tick(), k, 0.18)
    k += 0.5
for k in np.arange(c4a + 1.5, T['ano3'], 2.85):
    put(whoosh(1.0), k, 0.15)
put(fade_bed(clicks_bed(T['ano3'] - c4a, 9, 0.5), 0.5, 0.5), c4a, 0.08)
put(ringtone(6.5), T['ano3'] + 0.4, 0.28, 0.3)
put(fade_bed(clicks_bed(6, 6, 0.5), 0.5, 0.5), T['ano3'] + 6.5, 0.08)
put(whoosh(1.0), 175.4, 0.2)
for k in np.arange(T['ano9'] + 0.2, T['silencia'] + 0.5, 1.1):
    put(vibrate(1, 0.5, 0.1), k, 0.4, 0.3)
put(power(False), T['silencia'] + 0.75, 0.2, 0.3)
put(alarm(6.5), 185.0, 0.08)
put(pops(6.5, 3), 185.2, 0.12)
bed(birds, T['manha'], 199.9, 0.18, 1.5, 1)
put(ding_msg(), 191.9, 0.3)
put(boom(4, 45), T['morte'] - 0.1, 0.25)
put(heartbeat(6, 62, 0.1), T['morte'] + 0.4, 0.45)
put(fail(), 197.3, 0.18)
put(pad(T['morte'] - c4a, [(0, [45, 52, 57, 60]), (4, [48, 55, 60, 64]), (8, [43, 50, 55, 59]), (12, [45, 52, 57, 60]), (24, [41, 48, 53, 57]), (35.5, [40, 47, 52, 55])], cut=800, vol=1), c4a, 0.055)
put(pad(T['preto'] - T['morte'], [(0, [33, 40, 45])], cut=300, vol=1), T['morte'], 0.08)

# ---------- Cena 4b: tentativas
c5a, c5b = T['tentativas'], T['cena5']
bed(wind, c5a, T['voltou1'], 0.08, 1.5, 0.3)
for k in (203.9, 205.9, 207.6):
    put(whoosh(1.2), k - 0.6, 0.15)
put(vibrate(1), 205.0, 0.3, 0.3)
put(ding_bad(), 205.3, 0.22)
put(power(True), T['voltou1'] - 0.05, 0.3)
put(fade_bed(clicks_bed(T['voltou2'] - T['voltou1'] - 1.9, 7, 0.5), 0.3, 0.3), T['voltou1'], 0.08)
k = 210.5
while k < T['voltou2'] - 0.2:
    put(tick(), k, 0.2)
    k += 0.33
put(power(True), T['voltou2'] - 0.05, 0.3)
put(fade_bed(clicks_bed(c5b - T['voltou2'], 7, 0.5), 0.3, 1.5), T['voltou2'], 0.08)
put(heartbeat(5, 54), 215.8, 0.3)
put(plucks(c5b - c5a, [69, None, None, 72, None, None, 76, None, 74, None, None, None], bpm=70, vol=1, decay=0.9, bright=0.1), c5a + 0.5, 0.05)
put(pad(c5b - c5a, [(0, [45, 52, 57]), (7, [41, 48, 53]), (13, [43, 50, 55])], cut=500, vol=1), c5a, 0.045)

# ---------- Cena 5: festa de gala
g0, g1 = T['cena5'], T['cena6']
off = T['desliga']
pm = party_music(off - g0)
cr = crowd(off - g0)
# abafado no close, aberto na festa, abafado de novo na TV
seg = [(g0, T['festa'], 500, 0.5), (T['festa'], T['documentario'], 3500, 1.0), (T['documentario'], T['saldo'], 700, 0.55), (T['saldo'], off, 1200, 0.6)]
for a, b, cut, gg in seg:
    i0, i1 = secs(a - g0), secs(b - g0)
    put(fade_bed(filt(pm[i0:i1], 'lowpass', cut), 0.25, 0.25), a, 0.10 * gg)
    put(fade_bed(filt(cr[i0:i1], 'lowpass', cut * 1.4), 0.25, 0.25), a, 0.20 * gg)
put(clink_glass(), T['festa'] + 1.5, 0.15, -0.4)
put(clink_glass(), 237.6, 0.18, 0.3)
put(clink_glass(), 239.2, 0.12, -0.2)
bed(crackle, T['documentario'], T['saldo'], 0.12, 0.2, 0.2)
put(power(False), off, 0.4)
bed(tinnitus, off + 0.2, g1, 1.0, 1.5, 1.0)
bed(room_tone, off, g1, 0.05, 0.1, 1.0)
put(pad(off - g0, [(0, [40, 47, 52, 55]), (9, [41, 48, 53, 57]), (19.6, [38, 45, 50, 53]), (29.2, [40, 47, 52, 55])], cut=500, vol=1), g0, 0.04)

# ---------- Cena 6: campo de terra (fim de tarde)
f0, f1 = T['cena6'], T['end']
bed(wind, f0, f1, 0.07, 2.0, 2.5)
bed(birds, f0, 313.5, 0.22, 2.0, 2.0, 0.3)
k = f0 + 0.2
while k < 291.0:
    put(step_sound('floor' if k < T['campo'] else 'dirt'), k, 0.2, -0.2)
    k += np.pi / 7
put(whoosh(2.0), 279.3, 0.12)
k = T['campo'] + 0.5
while k < T['jogoPara']:
    put(kick_ball(), k, 0.25 * rng.uniform(0.6, 1.0), rng.uniform(-0.6, 0.6))
    k += 1.0
steps(T['campo'], T['jogoPara'], 6, 'dirt', 0.06, 0.4)
steps(T['jogoPara'] + 0.4, T['duda'] - 0.2, 2.6, 'dirt', 0.2, 0.2)
steps(307.0, 308.3, 2.2, 'dirt', 0.22)
put(paper_slap() * 0.6, 308.35, 0.25)
put(pad(f1 - f0, [(0, [41, 48, 53, 57, 60]), (7.4, [43, 50, 55, 59, 62]), (13.4, [45, 52, 57, 60, 64]), (23.2, [41, 48, 53, 57, 60]), (T['lugar'] - f0, [48, 55, 60, 64, 67]), (T['ceu'] - f0, [41, 48, 53, 57, 65]), (T['fim'] - f0 - 0.5, [48, 55, 60, 64, 72])], cut=1400, vol=1), f0, 0.06)
put(plucks(f1 - f0 - 1, [65, None, 69, 72, None, 69, 67, None, 64, 67, None, 72], bpm=72, vol=1, decay=0.8, bright=0.15), f0 + 0.5, 0.05)
put(chime([523.3, 659.3, 784, 1046.5], 0.25, 1.2, 0.1), T['fim'], 0.2)

# ------------------------------------------------------------------ saída
peak = np.max(np.abs(mix))
if peak > 0.98:
    mix *= 0.98 / peak
out = (np.clip(mix, -1, 1) * 32767).astype(np.int16).T.copy()
path = ROOT / 'public/trilha.wav'
with wave.open(str(path), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(out.tobytes())
print(f'ok: {path} ({DUR:.1f}s, pico {peak:.2f})')
