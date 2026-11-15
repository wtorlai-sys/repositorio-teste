import {useCurrentFrame, useVideoConfig} from 'remotion';

export const FPS = 30;
export const AUDIO_SECONDS = 316.68;

// Marcos de tempo (segundos) medidos no áudio da narração.
export const T = {
	title: 2.6,
	missao: 19.9,
	vibra: 24.7,
	pix: 30.7,
	jaqueta: 34.5,
	compra: 43.3,
	bug: 50.7,
	carro: 53.6,
	eraReal: 60.9,
	casa: 62.1,
	palida: 70.9,
	montagem: 82.5,
	amigo: 92.4,
	cobertura: 98.6,
	cena3: 104.9,
	aluguel: 106.3,
	refem: 118.8,
	dormir: 138.1,
	boceja: 145.3,
	prisao: 150.3,
	cena4: 152.4,
	ano3: 164.5,
	ano9: 176.7,
	silencia: 183.1,
	manha: 187.9,
	morte: 194.0,
	paralisa: 196.0,
	preto: 200.7,
	tentativas: 201.9,
	voltou1: 208.5,
	voltou2: 213.0,
	cena5: 222.0,
	festa: 231.1,
	documentario: 241.6,
	saldo: 251.2,
	postit: 255.1,
	desliga: 266.8,
	silencio: 268.3,
	cena6: 272.0,
	campo: 285.4,
	jogoPara: 295.2,
	duda: 297.0,
	lugar: 306.0,
	chora: 307.4,
	ceu: 310.5,
	fim: 315.6,
	end: AUDIO_SECONDS,
};

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const ramp = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const smooth = (x: number) => x * x * (3 - 2 * x);
export const sr = (t: number, a: number, b: number) => smooth(ramp(t, a, b));
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const lerp3 = (
	a: [number, number, number],
	b: [number, number, number],
	x: number,
): [number, number, number] => [lerp(a[0], b[0], x), lerp(a[1], b[1], x), lerp(a[2], b[2], x)];
/** Janela: sobe em [a,a+f], desce em [b-f,b]. */
export const win = (t: number, a: number, b: number, f = 0.4) =>
	Math.min(sr(t, a, a + f), 1 - sr(t, b - f, b));

export const noise = (t: number, seed = 0) =>
	Math.sin(t * 1.3 + seed) * 0.5 +
	Math.sin(t * 2.7 + seed * 1.7) * 0.3 +
	Math.sin(t * 5.9 + seed * 2.3) * 0.2;

export const rng = (seed: number) => {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

/** Tempo absoluto (segundos) dentro de uma Sequence que começa em `start`. */
export const useTime = (start: number) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return start + frame / fps;
};

export const money = (v: number, prefix = 'US$ ') =>
	prefix + Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mixColor = (a: string, b: string, x: number) => {
	const A = hex(a);
	const B = hex(b);
	const k = clamp(x);
	return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
};

/** Plano de câmera 2D: centro (x,y) e zoom s, interpolados de `a` até `b`. */
export type View = {x: number; y: number; s: number};
export type Shot2 = {at: number; a: View; b?: View; shake?: number; ease?: 'lin' | 'smooth'};

export const cam2 = (t: number, shots: Shot2[], end: number) => {
	let i = 0;
	for (let k = 0; k < shots.length; k++) if (t >= shots[k].at) i = k;
	const sh = shots[i];
	const e = i + 1 < shots.length ? shots[i + 1].at : end;
	const x = clamp((t - sh.at) / Math.max(0.001, e - sh.at));
	const k = sh.ease === 'smooth' ? smooth(x) : x * 0.5 + smooth(x) * 0.5;
	const b = sh.b ?? sh.a;
	let cx = lerp(sh.a.x, b.x, k);
	let cy = lerp(sh.a.y, b.y, k);
	const s = lerp(sh.a.s, b.s, k);
	if (sh.shake) {
		cx += noise(t * 2.3, 1) * sh.shake;
		cy += noise(t * 2.9, 4) * sh.shake;
	}
	return {index: i, transform: `translate(960 540) scale(${s}) translate(${-cx} ${-cy})`};
};
