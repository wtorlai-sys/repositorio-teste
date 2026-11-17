// Stills de QC: node scripts/stills.mjs [comp] [frames...|mid]   ("mid" = meio de cada plano)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const [, , compId = 'EcoPreview', ...rest] = process.argv;
const outDir = path.resolve('out/stills');
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const chromiumOptions = {gl: 'swangle'};
const browserExecutable = '/opt/pw-browsers/chromium';
const composition = await selectComposition({serveUrl, id: compId, chromiumOptions, browserExecutable});
let frames = rest.map(Number);
if (rest[0] === 'mid') {
	const starts = JSON.parse(fs.readFileSync('out/starts.json', 'utf8'));
	frames = starts.map((s, i) => Math.round((s + (starts[i + 1] ?? composition.durationInFrames)) / 2));
}
for (const frame of frames) {
	const output = path.join(outDir, `${compId}_${String(frame).padStart(4, '0')}.jpg`);
	const t0 = performance.now();
	await renderStill({composition, serveUrl, frame, output, imageFormat: 'jpeg', jpegQuality: 85, chromiumOptions, browserExecutable, timeoutInMilliseconds: 240000, onBrowserLog: (l) => (process.env.VERBOSE || l.type === 'error') && console.log('[browser]', l.type, l.text.slice(0, 800))});
	console.log(`ok ${output} (${((performance.now() - t0) / 1000).toFixed(1)} s)`);
}
