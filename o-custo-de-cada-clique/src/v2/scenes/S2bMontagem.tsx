import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Shot2, T, cam2, lerp, sr, useTime} from '../time';
import {Char} from '../Char';
import {Glow, INK, Plant, Skyline, Stage} from '../parts';
import {Notification} from '../overlays';

const START = T.montagem;
const END = T.cena3;

const Beach: React.FC<{t: number}> = ({t}) => {
	const open = sr(t, 85, 88);
	return (
		<g>
			<defs>
				<linearGradient id="bSky" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#6d7fd0" />
					<stop offset="0.6" stopColor="#f5a47a" />
					<stop offset="1" stopColor="#ffd59a" />
				</linearGradient>
			</defs>
			<rect x={-300} y={-200} width={2520} height={1500} fill="url(#bSky)" />
			<circle cx={1240} cy={560} r={90} fill="#fff1c4" />
			<Glow x={1240} y={560} r={500} o={0.5} warm />
			{[300, 700, 1500].map((x, i) => (
				<rect key={i} x={x - (t * 10) % 50} y={300 + i * 40} width={220} height={36} rx={18} fill="#ffe4d2" opacity={0.6} />
			))}
			<rect x={-300} y={600} width={2520} height={240} fill="#4a74c9" />
			<rect x={-300} y={600} width={2520} height={14} fill="#f7c59a" opacity={0.7} />
			{Array.from({length: 8}, (_, i) => (
				<path key={i} d={`M${-300 + ((i * 330 + t * 40) % 2600)} ${650 + (i % 3) * 50} q40 -14 80 0`} stroke="#9ec0ff" strokeWidth={6} fill="none" strokeLinecap="round" />
			))}
			<rect x={1180} y={600} width={120} height={240} fill="#ffe4b0" opacity={0.35} />
			<path d={`M-300 ${830 + Math.sin(t * 1.3) * 10} q600 -30 1200 0 q600 30 1320 0 v400 h-2520 z`} fill="#f2f6ff" opacity={0.8} />
			<rect x={-300} y={850} width={2520} height={400} fill="#f1d3a0" />
			<Char x={960} y={760} scale={1.15} view="back" shirt="#e98fb0" pants="#4a3a5a" dress longHair hair="#6a5040" armF={[lerp(8, 70, open), lerp(4, -10, open)]} armB={[lerp(8, 70, open), lerp(4, -10, open)]} rim={{c: '#ffe2b0', dx: 4, dy: -6}} />
			<rect x={860} y={860} width={200} height={40} rx={20} fill="#f2f6ff" opacity={0.6} />
		</g>
	);
};

const Friend: React.FC<{t: number}> = ({t}) => {
	const wipe = sr(t, 95, 95.5) * (1 - sr(t, 97, 97.6));
	return (
		<g>
			<rect x={-300} y={-200} width={2520} height={1500} fill="#7a6a8f" />
			<rect x={-300} y={820} width={2520} height={400} fill="#5a4a6a" />
			<rect x={300} y={260} width={300} height={360} fill="#ffd38a" opacity={0.9} />
			<rect x={318} y={278} width={264} height={324} fill="#f6b46a" />
			<Glow x={450} y={440} r={500} o={0.4} warm />
			<Plant x={1500} y={760} s={1.3} />
			{/* sofá */}
			<rect x={640} y={600} width={640} height={240} rx={40} fill="#3f6b62" />
			<rect x={600} y={720} width={720} height={150} rx={40} fill="#4f8478" />
			<Char x={960} y={760} view="front" pose="sit" shirt="#3b78c4" pants="#2b2b3a" eye={wipe > 0.3 ? 'closed' : 'sad'} mouth="smile" armF={[22, -120]} armB={[lerp(10, 30, wipe), lerp(-20, -160, wipe)]} hold="phone" phoneGlow="#5dff9b" headTilt={6} rim={{c: '#ffd38a', dx: -6, dy: -4}} />
			{/* lágrimas */}
			{[0, 1, 2].map((i) => {
				const k = ((t * 0.9 + i * 0.33) % 1);
				return <ellipse key={i} cx={i % 2 ? 980 : 940} cy={600 + k * 70} rx={4} ry={7} fill="#bfe6ff" opacity={1 - k} />;
			})}
		</g>
	);
};

const Sunset: React.FC<{t: number; closeWatch: boolean}> = ({t, closeWatch}) => {
	const w = sr(t, T.cobertura, 102.2);
	if (closeWatch) {
		const glint = Math.max(0, Math.sin((t - 102.4) * 4));
		return (
			<g>
				<rect x={-300} y={-200} width={2520} height={1500} fill="#3a2a55" />
				<Skyline x={-200} y={1100} w={2400} h={700} seed={8} c="#2a1f4a" win="#ffcf7a" lit={0.3} n={10} />
				<Glow x={1300} y={300} r={900} o={0.5} warm />
				{/* braço com relógio de ouro */}
				<path d="M-100 820 L900 560" stroke="#f2efe8" strokeWidth={170} strokeLinecap="round" />
				<circle cx={1010} cy={530} r={80} fill={INK} />
				<rect x={760} y={560} width={120} height={180} rx={30} fill="#e8b84a" transform="rotate(-15 820 650)" />
				<circle cx={820} cy={580} r={74} fill="#f6cf5a" stroke="#b8862a" strokeWidth={10} />
				<circle cx={820} cy={580} r={52} fill="#fff8e0" />
				<path d="M820 580 v-34 M820 580 l24 12" stroke={INK} strokeWidth={6} strokeLinecap="round" />
				<g transform={`translate(860 520) scale(${0.4 + glint})`} opacity={glint}>
					<path d="M0 -40 L8 -8 L40 0 L8 8 L0 40 L-8 8 L-40 0 L-8 -8 Z" fill="#ffffff" />
				</g>
			</g>
		);
	}
	return (
		<g>
			<defs>
				<linearGradient id="sSky" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#3b3a8a" />
					<stop offset="0.7" stopColor="#ff8a5c" />
					<stop offset="1" stopColor="#ffc07a" />
				</linearGradient>
			</defs>
			<rect x={-300} y={-200} width={2520} height={1500} fill="#2b2650" />
			<rect x={40} y={160} width={1840} height={640} fill="url(#sSky)" />
			<circle cx={1300} cy={700} r={90} fill="#ffe1a6" />
			<Skyline x={40} y={800} w={1840} h={420} seed={3} c="#3a2a5a" win="#ffcf7a" lit={0.25} n={13} />
			{Array.from({length: 9}, (_, i) => (
				<rect key={i} x={40 + i * 230 - 6} y={160} width={12} height={640} fill="#1b1838" />
			))}
			<rect x={-300} y={800} width={2520} height={400} fill="#211d40" />
			<rect x={40} y={810} width={1840} height={90} fill="url(#sSky)" opacity={0.15} />
			<Char x={lerp(1650, 700, w)} y={650} flip shirt="#f2efe8" pants="#2a2a3a" walk={w < 1 ? t * 8 : 0} walkAmp={w < 1 ? 24 : 0} armF={[w < 1 ? Math.sin(t * 8) * 18 : 30, w < 1 ? 10 : 60]} armB={[w < 1 ? -Math.sin(t * 8) * 18 : 0, 10]} eye="happy" mouth="smile" rim={{c: '#ffc07a', dx: -6, dy: -4}} />
		</g>
	);
};

const shots: Shot2[] = [
	{at: START, a: {x: 960, y: 560, s: 1.0}, b: {x: 960, y: 600, s: 1.15}},
	{at: 87.4, a: {x: 960, y: 640, s: 1.6}, b: {x: 960, y: 620, s: 1.45}},
	{at: T.amigo, a: {x: 960, y: 560, s: 1.25}, b: {x: 960, y: 560, s: 1.45}},
	{at: T.cobertura, a: {x: 960, y: 560, s: 1.0}, b: {x: 900, y: 560, s: 1.08}},
	{at: 102.4, a: {x: 900, y: 600, s: 1.0}, b: {x: 880, y: 590, s: 1.1}},
];

export const S2bMontagem: React.FC = () => {
	const t = useTime(START);
	const {index, transform} = cam2(t, shots, END);
	const pulse = (c: number) => Math.max(0, 1 - Math.abs(t - c) / 0.3);
	const flash = Math.max(pulse(START), pulse(T.amigo), pulse(T.cobertura));
	return (
		<AbsoluteFill>
			<Stage bg="#000" cam={transform}>
				{index <= 1 && <Beach t={t} />}
				{index === 2 && <Friend t={t} />}
				{index >= 3 && <Sunset t={t} closeWatch={index === 4} />}
			</Stage>
			<Notification t={t} a={T.amigo + 1.2} b={T.cobertura - 0.3} app="Banco" title="Dívida estudantil quitada" body="Saldo devedor: R$ 0,00" color="#19c37d" />
			<AbsoluteFill style={{background: '#fff', opacity: flash * 0.85}} />
			<AbsoluteFill style={{background: '#000', opacity: sr(t, END - 0.5, END)}} />
		</AbsoluteFill>
	);
};
