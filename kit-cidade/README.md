# kit-cidade — motor dos Shorts "Nesta cidade…" (Remotion + three.js, sem Blender)

Base reutilizável para os vídeos do canal. **Não edite um vídeo pronto para fazer outro: crie a partir daqui.**

```bash
scripts/novo_video.sh <slug> <narracao.mp3>   # cria ../<slug>/ com o motor
cd ../<slug>
python3 scripts/transcrever.py                 # words.json (índice:palavra@segundo)
# escrever src/shots.tsx (1 plano por linha, começa numa palavra)
node scripts/starts.mjs && node scripts/stills.mjs EcoPreview mid   # contact sheet (540x960)
python3 scripts/som.py                         # editar seções de música e cues de SFX antes
npx remotion render Eco out/final_nocaptions.mp4   # ~1 s/frame em 4 CPUs (~50 min p/ 1:40)
python3 scripts/legendas_canal.py              # out/final.mp4 + out/final_phone.mp4
```

QC visual sem custo: `node scripts/stills.mjs FichaMax 0`, `RostosMax 0`, `Elenco 0`.

| Arquivo | O que tem |
| --- | --- |
| `src/Max.tsx` | o Max (narrador) fiel ao conceito do Customuse |
| `src/Blocky.tsx` | rig de bloco, poses, elenco fixo (`CAST`), figurantes (`townie`), cabelo por idade |
| `src/tex.ts` | texturas procedurais: assoalho, lambri+papel de parede, calçamento, tijolo, grama, rostos, placas em PT |
| `src/sets.tsx` | cenários: cidade, pedra/montanha, quartos, sala, trilha, caverna, "dentro" + climas de luz |
| `src/shots.tsx` | lista de planos (o exemplo é o vídeo eco-da-montanha) |
| `scripts/som.py` | trilha + SFX sintetizados, ducking, -14 LUFS |
| `assets/characters/max/` | conceito, multiview e manifest do Max |
