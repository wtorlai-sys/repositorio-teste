#!/usr/bin/env bash
# Cria um vídeo novo a partir do kit: scripts/novo_video.sh <slug> <narracao.mp3>
# Copia o motor (personagens, cenários, texturas, legendas, som) para ../<slug>/ e deixa só os planos para escrever.
set -euo pipefail
SLUG="$1"; MP3="$2"
KIT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$(dirname "$KIT")/$SLUG"
[ -e "$DEST" ] && { echo "já existe: $DEST"; exit 1; }
mkdir -p "$DEST"
cp -r "$KIT"/{src,scripts,public,assets,package.json,package-lock.json,tsconfig.json,remotion.config.ts,.gitignore} "$DEST"/
cp "$MP3" "$DEST/public/narracao.mp3"
(cd "$DEST" && npm install --no-audit --no-fund >/dev/null)
echo "pronto: $DEST  — próximo: python3 scripts/transcrever.py, depois escrever src/shots.tsx"
