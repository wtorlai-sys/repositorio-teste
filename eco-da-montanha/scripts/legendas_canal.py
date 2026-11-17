"""Legendas no estilo do canal: uma palavra por vez, minúsculas como faladas (nomes próprios mantêm
maiúscula), branco com contorno preto fino, ~70% da altura. Queima sobre out/final_nocaptions.mp4 e
grava out/final.mp4 e out/final_phone.mp4.
uso: python3 scripts/legendas_canal.py [--font "Montserrat ExtraBold"] [--size 96] [--y 1350]"""
import argparse, json, os, re, subprocess

ap = argparse.ArgumentParser()
ap.add_argument("--font", default="Montserrat ExtraBold"); ap.add_argument("--size", type=int, default=96)
ap.add_argument("--y", type=int, default=1350)
o = ap.parse_args()
vdir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
words = json.load(open(os.path.join(vdir, "words.json"), encoding="utf-8"))
LAG = 1.3 / 30


def ts(t):
    cs = int(round(max(t, 0) * 100))
    return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"


def k(w, *names):
    for n in names:
        if n in w: return w[n]


head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Word,{o.font},{o.size},&H00FFFFFF,&H00FFFFFF,&H00000000,&H78000000,-1,0,0,0,100,100,0,0,1,6,2,5,20,20,20,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
lines = []
for i, w in enumerate(words):
    raw = k(w, "word", "w")
    txt = re.sub(r"[^\w'\-]", "", raw).strip("-")
    if not txt: continue
    first_of_sentence = i == 0 or re.search(r"[.!?]$", k(words[i - 1], "word", "w") or "")
    if first_of_sentence and (len(txt) == 1 or txt[1:].islower()) and txt not in ("Teco", "Lia"):
        txt = txt.lower()
    s = 0.0 if i == 0 else k(w, "start", "s") + LAG
    e = (k(words[i + 1], "start", "s") + LAG) if i + 1 < len(words) else k(w, "end", "e") + 0.4
    lines.append(f"Dialogue: 0,{ts(s)},{ts(e)},Word,,0,0,0,,{{\\pos(540,{o.y})}}{txt}")
ass = os.path.join(vdir, "out", "captions_canal.ass")
open(ass, "w", encoding="utf-8").write(head + "\n".join(lines) + "\n")

os.chdir(os.path.join(vdir, "out"))
src = "final_nocaptions.mp4"
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src],
                           capture_output=True, text=True).stdout)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", "ass=captions_canal.ass", "-c:v", "libx264", "-preset",
                "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
                "final.mp4"], check=True)
vbr = max(800, int(25 * 8 * 1024 / dur) - 160)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "final.mp4", "-vf", "scale=720:1280", "-c:v",
                "libx264", "-preset", "slow", "-b:v", f"{vbr}k", "-maxrate", f"{int(vbr * 1.2)}k", "-bufsize",
                f"{vbr * 2}k", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "final_phone.mp4"], check=True)
print("pronto:", os.path.join(vdir, "out", "final.mp4"), f"{len(lines)} palavras")
