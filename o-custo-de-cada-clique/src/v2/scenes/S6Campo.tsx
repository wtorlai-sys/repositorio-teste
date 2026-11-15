import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Shot2, T, cam2, lerp, rng, sr, useTime} from '../time';
import {Char} from '../Char';
import {Glow, INK, Stage} from '../parts';
import {Title} from '../overlays';

const START = T.cena6;
const END = T.end;
const GROUND = 820;

const MAXOLD = {shirt: '#d9d3c5', shirtDark: '#bdb6a6', pants: '#3e5f94', cuff: '#5677ad', shoe: '#101119', sole: '#eceef5', hair: '#cfcad8', head: '#141522'};
const RIMW = {c: '#ffd59a', dx: -6, dy: -5};

const House: React.FC<{x: number; w: number; c: string; roof: string}> = ({x, w, c, roof}) => (
	<g>
		<rect x={x} y={GROUND - 260} width={w} height={260} fill={c} />
		<polygon points={`${x - 20},${GROUND - 260} ${x + w / 2},${GROUND - 360} ${x + w + 20},${GROUND - 260}`} fill={roof} />
		<rect x={x + w * 0.15} y={GROUND - 200} width={w * 0.28} height={80} fill="#ffe0a0" />
		<rect x={x + w * 0.58} y={GROUND - 150} width={w * 0.24} height={150} fill="#6a4634" />
	</g>
);

const Fence: React.FC<{x1: number; x2: number; y: number; h: number}> = ({x1, x2, y, h}) => (
	<g>
		<rect x={x1} y={y - h} width={x2 - x1} height={h} fill="url(#chain)" />
		{Array.from({length: Math.floor((x2 - x1) / 220) + 1}, (_, i) => (
			<rect key={i} x={x1 + i * 220 - 6} y={y - h - 10} width={12} height={h + 10} fill="#7a4a2e" />
		))}
		<rect x={x1} y={y - h - 10} width={x2 - x1} height={8} fill="#7a4a2e" />
	</g>
);

const shots: Shot2[] = [
	{at: START, a: {x: -1950, y: 560, s: 1.1}, b: {x: -1150, y: 560, s: 1.1}}, // 0 caminhada
	{at: 279.2, a: {x: -1000, y: 560, s: 1.05}, b: {x: -700, y: -150, s: 0.9}, ease: 'smooth'}, // 1 céu
	{at: T.campo, a: {x: 640, y: 600, s: 0.85}, b: {x: 700, y: 600, s: 0.9}}, // 2 campo
	{at: T.jogoPara, a: {x: 800, y: 640, s: 1.05}, b: {x: 780, y: 640, s: 1.1}}, // 3 jogo para
	{at: T.duda, a: {x: 300, y: 620, s: 1.5}, b: {x: 310, y: 620, s: 1.6}}, // 4 Duda
	{at: T.lugar, a: {x: 390, y: 560, s: 2.3}, b: {x: 395, y: 560, s: 2.45}}, // 5 close
	{at: T.chora, a: {x: 220, y: 700, s: 2.0}, b: {x: 225, y: 700, s: 2.1}}, // 6 senta
	{at: T.ceu, a: {x: 300, y: 650, s: 1.4}, b: {x: 700, y: -900, s: 0.8}, ease: 'smooth'}, // 7 grua
];

export const S6Campo: React.FC = () => {
	const t = useTime(START);
	const {transform} = cam2(t, shots, END);

	// Max
	const w1 = sr(t, START, T.campo);
	const w2 = sr(t, T.campo, 291);
	let mx = lerp(-2150, -500, w1);
	if (t > T.campo) mx = lerp(-500, 60, w2);
	const walking = (w1 > 0 && w1 < 1) || (t > T.campo && w2 < 1);
	const toSeat = sr(t, 307.0, 308.4);
	if (t > 307) mx = lerp(60, 170, toSeat);
	const sitting = t > 308.3;

	// pelada
	const stop = sr(t, T.jogoPara, T.jogoPara + 1);
	const tt = lerp(t, T.jogoPara, stop);
	const players = [
		{c: '#d63b3b', base: 700, ph: 0},
		{c: '#f2c230', base: 1050, ph: 1.6},
		{c: '#2f7dd6', base: 1350, ph: 3.1},
		{c: '#2fb36b', base: 1600, ph: 4.4},
	].map((p) => {
		const x = p.base + Math.sin(tt * 0.9 + p.ph) * 180;
		const v = Math.cos(tt * 0.9 + p.ph);
		return {...p, x, faceLeft: stop > 0.5 ? true : v < 0};
	});
	const seg = Math.floor(tt / 1.0);
	const fr = (tt / 1.0) % 1;
	const pa = players[seg % 4];
	const pb = players[(seg + 1) % 4];

	// Duda
	const dw = sr(t, T.jogoPara + 0.4, T.duda - 0.2);
	const dx = lerp(900, 420, dw);
	const point = sr(t, 302.4, 303.0) * (1 - sr(t, 306.8, 307.4));
	const holding = t > T.duda - 0.8;
	const ballX = holding ? dx - 52 : lerp(pa.x, pb.x, fr);
	const ballY = holding ? GROUND - 130 : GROUND + 80 - Math.sin(fr * Math.PI) * 120 * (1 - stop);

	const g = rng(4);
	const tufts = Array.from({length: 40}, () => [-2600 + g() * 4600, GROUND + 10 + g() * 260]);

	return (
		<AbsoluteFill>
			<Stage
				bg="#f2a46e"
				cam={transform}
				defs={
					<>
						<linearGradient id="sky6" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#3b3f8f" />
							<stop offset="0.55" stopColor="#c86a8a" />
							<stop offset="0.85" stopColor="#f59a6a" />
							<stop offset="1" stopColor="#ffd08a" />
						</linearGradient>
						<pattern id="chain" width="26" height="26" patternUnits="userSpaceOnUse">
							<path d="M0 13 L13 0 L26 13 L13 26 Z" fill="none" stroke="#9a5e3a" strokeWidth={2.5} />
						</pattern>
					</>
				}
			>
				<rect x={-3200} y={-2400} width={6400} height={3300} fill="url(#sky6)" />
				<circle cx={1500} cy={640} r={95} fill="#fff0c4" />
				<Glow x={1500} y={640} r={700} o={0.55} warm />
				<Glow x={-900} y={600} r={900} o={0.35} warm />
				{[[-1600, -300], [-400, -600], [600, -200], [1300, -900], [-2200, -900]].map(([x, y], i) => (
					<rect key={i} x={x + t * 6} y={y} width={360} height={60} rx={30} fill="#ffc6c0" opacity={0.55} />
				))}
				{/* morros ao fundo */}
				<path d="M-3200 760 q600 -160 1200 -40 q600 -140 1300 -20 q700 -150 1500 -10 q700 -120 2400 10 V900 H-3200 Z" fill="#a85a78" opacity={0.7} />
				{/* rua com casas */}
				{[
					[-2700, 320, '#e9b69a', '#8c3b2a'],
					[-2300, 280, '#a8c6d6', '#5a3a6a'],
					[-1950, 340, '#f0d59a', '#8c3b2a'],
					[-1540, 300, '#c9d6a8', '#5a3a6a'],
					[-1150, 320, '#e3a9ba', '#8c3b2a'],
					[-760, 280, '#b8c0e8', '#5a3a6a'],
				].map(([x, w, c, r], i) => (
					<House key={i} x={x as number} w={w as number} c={c as string} roof={r as string} />
				))}
				{[-2500, -1700, -900, -150].map((x) => (
					<g key={x}>
						<rect x={x} y={GROUND - 520} width={14} height={520} fill="#5a3a3a" />
						<rect x={x - 60} y={GROUND - 500} width={134} height={10} fill="#5a3a3a" />
					</g>
				))}
				<path d="M-2500 300 q400 60 800 0 q400 60 800 0 q375 60 750 0" stroke="#3a2a3a" strokeWidth={3} fill="none" />
				{/* campo: alambrado do fundo e traves */}
				<Fence x1={100} x2={1880} y={GROUND} h={260} />
				<rect x={-3200} y={GROUND} width={6400} height={600} fill="#b98a5a" />
				<rect x={100} y={GROUND} width={1780} height={600} fill="#c97d4f" />
				<rect x={-3200} y={GROUND} width={3300} height={30} fill="#8f8a86" />
				{tufts.map(([x, y], i) =>
					x > 100 && x < 1880 ? null : <path key={i} d={`M${x} ${y} l6 -22 l6 22 l6 -16 l4 16 z`} fill="#d9b46a" />,
				)}
				{[300, 1700].map((x) => (
					<g key={x}>
						<rect x={x - 90} y={GROUND - 170} width={12} height={250} fill="#f4f4f4" />
						<rect x={x + 90} y={GROUND - 170} width={12} height={250} fill="#f4f4f4" />
						<rect x={x - 90} y={GROUND - 176} width={192} height={12} fill="#f4f4f4" />
					</g>
				))}
				{/* amigos */}
				{players.map((p, i) => (
					<Char
						key={i}
						x={p.x}
						y={GROUND + 80 - 157}
						scale={0.95}
						flip={p.faceLeft}
						shirt={p.c}
						pants="#2b2b3a"
						walk={tt * 11 + i}
						walkAmp={26 * (1 - stop)}
						armF={[Math.sin(tt * 11 + i) * 30 * (1 - stop), 30]}
						armB={[-Math.sin(tt * 11 + i) * 30 * (1 - stop), 30]}
						eye={stop > 0.5 ? 'open' : 'focus'}
						mouth={stop > 0.5 ? 'smile' : 'none'}
						rim={RIMW}
					/>
				))}
				{/* Duda */}
				<Char
					x={dx}
					y={GROUND + 60 - 157}
					flip
					shirt="#f4f4f4"
					pants="#2b2b3a"
					hair="#2b1d12"
					walk={dw > 0 && dw < 1 ? t * 8 : t < T.jogoPara ? t * 11 : 0}
					walkAmp={(dw > 0 && dw < 1) || t < T.jogoPara ? 24 : 0}
					armF={holding ? [40, 70] : [10, 20]}
					armB={[lerp(6, 95, point), 0]}
					eye={t > 299 ? 'happy' : 'open'}
					mouth={t > 299 ? 'smile' : 'none'}
					rim={RIMW}
				/>
				<g>
					<circle cx={ballX} cy={ballY} r={24} fill="#f4efe6" stroke={INK} strokeWidth={3} />
					<path d={`M${ballX - 10} ${ballY - 12} l10 6 l10 -6 M${ballX} ${ballY - 6} v14`} stroke={INK} strokeWidth={3} fill="none" />
				</g>
				{/* Max */}
				<Char
					x={mx}
					y={sitting ? GROUND + 40 - 2 : GROUND + 40 - 157}
					pose={sitting ? 'ground' : 'stand'}
					{...MAXOLD}
					walk={walking ? t * 7 : 0}
					walkAmp={walking ? 22 : 0}
					armF={sitting ? [70, 60] : [walking ? Math.sin(t * 7) * 18 : 6, 10]}
					armB={sitting ? [60, 70] : [walking ? -Math.sin(t * 7) * 18 : 4, 10]}
					eye={sitting ? 'closed' : t > T.lugar ? 'sad' : t > T.jogoPara ? 'wide' : 'tired'}
					mouth={sitting ? (t > T.ceu ? 'smile' : 'sad') : t > T.lugar ? 'sad' : t > T.jogoPara ? 'o' : 'flat'}
					tears={t > T.lugar + 0.6 ? t : undefined}
					brows
					shine
					headTilt={sitting ? 18 : 4}
					rim={RIMW}
				/>
				{sitting &&
					[0, 1].map((i) => {
						const k = (t * 0.8 + i * 0.5) % 1;
						return <ellipse key={i} cx={mx + 40} cy={GROUND - 120 + k * 60} rx={4} ry={7} fill="#bfe6ff" opacity={1 - k} />;
					})}
			</Stage>
			<AbsoluteFill style={{background: '#000', opacity: Math.max(1 - sr(t, START, START + 1.4), sr(t, 313.8, T.fim))}} />
			<Title t={t} a={T.fim} b={END + 2} text="FIM" />
		</AbsoluteFill>
	);
};
