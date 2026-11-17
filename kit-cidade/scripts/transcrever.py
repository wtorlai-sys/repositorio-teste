"""Timestamps por palavra (faster-whisper medium, português) -> words.json e src/words.json.
uso: python3 scripts/transcrever.py   (lê public/narracao.mp3)
Requer: pip install faster-whisper ; host huggingface.co liberado na rede para baixar o modelo."""
import json, os, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
mp3 = os.path.join(ROOT, 'public', 'narracao.mp3')
# decodifica com ffmpeg (o PyAV do faster-whisper pode falhar com mp3)
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp3, '-ar', '16000', '-ac', '1', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
audio = np.frombuffer(raw, dtype=np.float32)
m = WhisperModel('medium', device='cpu', compute_type='int8')
segs, _ = m.transcribe(audio, language='pt', word_timestamps=True, vad_filter=False)
words = [{'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3)} for s in segs for w in s.words]
# erros comuns do Whisper em PT
FIX = {'coxixar': 'cochichar', 'coxixando': 'cochichando', 'coxixo': 'cochicho'}
for x in words:
    for a, b in FIX.items():
        x['w'] = x['w'].replace(a, b)
for p in ('words.json', os.path.join('src', 'words.json')):
    json.dump(words, open(os.path.join(ROOT, p), 'w', encoding='utf-8'), ensure_ascii=False)
print(' '.join(f"{i}:{x['w']}@{x['s']:.2f}" for i, x in enumerate(words)))
print(len(words), 'palavras')
