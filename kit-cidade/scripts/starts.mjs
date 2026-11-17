// grava out/starts.json com o frame inicial de cada plano (lê shots via regex do índice w)
import fs from 'node:fs';
const words = JSON.parse(fs.readFileSync('src/words.json', 'utf8'));
const src = fs.readFileSync('src/shots.tsx', 'utf8');
const ws = [...src.matchAll(/^\t\{w: (\d+),/gm)].map((m) => +m[1]);
const t = (i) => (i <= 0 ? 0 : words[i].s - 0.06);
const starts = ws.map((i) => Math.round(t(i) * 30));
fs.mkdirSync('out', {recursive: true});
fs.writeFileSync('out/starts.json', JSON.stringify(starts));
console.log(ws.length, 'planos', starts.slice(0, 8));
