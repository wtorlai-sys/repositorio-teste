import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Shot2, T, cam2, lerp, sr, useTime} from '../time';
import {Char} from '../Char';
import {Glow, INK, Plant, Stage} from '../parts';

const START = T.casa;
const END = T.montagem;

const shots: Shot2[] = [
	{at: START, a: {x: 1060, y: 560, s: 1.05}, b: {x: 980, y: 560, s: 1.1}, shake: 6},
	{at: 66.3, a: {x: 910, y: 730, s: 3.3}, b: {x: 910, y: 735, s: 3.6}, shake: 2},
	{at: T.palida, a: {x: 800, y: 560, s: 1.7}, b: {x: 800, y: 560, s: 1.85}, shake: 4},
	{at: 74.8, a: {x: 1240, y: 580, s: 1.9}, b: {x: 1250, y: 585, s: 2.1}, shake: 5},
	{at: 79.2, a: {x: 960, y: 560, s: 1.0}, b: {x: 960, y: 560, s: 1.06}, shake: 6},
];

export const S2Casa: React.FC = () => {
	const t = useTime(START);
	const {transform} = cam2(t, shots, END);

	const w = sr(t, START, 65.0);
	const mx = lerp(2050, 1280, w);
	const walking = w > 0 && w < 1;
	const thrown = t > 65.0;
	const throwArm = t > 64.5 && t < 65.4 ? sr(t, 64.5, 65.0) : 0;
	const cheer = sr(t, 77.4, 78.2);
	const shock = sr(t, T.palida, T.palida + 0.5);
	const fade = Math.max(1 - sr(t, START, START + 0.5), sr(t, END - 0.4, END));

	return (
		<AbsoluteFill>
			<Stage bg="#e9c99a" cam={transform}>
				<defs>
					<linearGradient id="kWall" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#d9b98a" />
						<stop offset="1" stopColor="#ecd2a6" />
					</linearGradient>
				</defs>
				<rect x={-300} y={-200} width={2520} height={1500} fill="url(#kWall)" />
				<rect x={-300} y={200} width={2520} height={40} fill="#c9a676" />
				{/* azulejos */}
				<rect x={-300} y={640} width={2520} height={240} fill="#cfe0d6" />
				{Array.from({length: 40}, (_, i) => (
					<rect key={i} x={-300 + i * 64} y={640} width={4} height={240} fill="#b9cfc3" />
				))}
				<rect x={-300} y={880} width={2520} height={400} fill="#a9774f" />
				<rect x={-300} y={876} width={2520} height={8} fill="#8a5d3b" />
				{/* janela com dia */}
				<rect x={260} y={300} width={360} height={280} fill="#fff4dc" />
				<rect x={274} y={314} width={332} height={252} fill="#9fd4f5" />
				<circle cx={520} cy={380} r={34} fill="#fff6d6" />
				<path d="M274 520 q80 -40 160 -10 q90 30 172 -10 v66 h-332 z" fill="#7fbf8a" />
				<rect x={436} y={314} width={8} height={252} fill="#fff4dc" />
				<polygon points="274,314 606,314 980,880 120,880" fill="#fff6d6" opacity={0.18} />
				{/* armários, geladeira, relógio */}
				<rect x={700} y={250} width={520} height={170} fill="#8a5d3b" />
				{[0, 1, 2, 3].map((i) => (
					<rect key={i} x={712 + i * 128} y={262} width={116} height={146} fill="#9b6c48" />
				))}
				<rect x={1300} y={300} width={200} height={580} rx={18} fill="#f3f1ea" />
				<rect x={1300} y={500} width={200} height={8} fill="#d7d3c8" />
				<rect x={1470} y={360} width={10} height={100} rx={5} fill="#b9b5aa" />
				<circle cx={1640} cy={330} r={44} fill="#fffaf0" stroke="#8a5d3b" strokeWidth={8} />
				<path d="M1640 330 v-26 M1640 330 l18 8" stroke={INK} strokeWidth={5} strokeLinecap="round" />
				<Plant x={160} y={600} s={0.9} />
				{/* porta aberta à direita */}
				<rect x={1760} y={300} width={260} height={580} fill="#fff4dc" />
				<rect x={1780} y={320} width={240} height={560} fill="#bfe6ff" />
				{/* pais atrás da mesa */}
				<Char x={700} y={728} view="front" shirt="#b45c7f" pants="#4a3a5a" dress longHair hair="#6a5040" eye={shock > 0.5 ? 'wide' : 'open'} mouth={shock > 0.5 ? 'open' : 'none'} armF={[lerp(6, 18, shock), lerp(4, -150, shock)]} armB={[6, 4]} rim={{c: '#fff6d6', dx: -5, dy: -4, o: 0.8}} />
				<Char x={920} y={728} view="front" shirt="#5b7a99" pants="#3a3226" hair="#b9b5c4" eye={t > 72 ? 'wide' : 'open'} mouth={t > 73 ? 'smile' : 'none'} armF={[6, 4]} armB={[6 + sr(t, 72, 73) * 30, 4]} rim={{c: '#fff6d6', dx: -5, dy: -4, o: 0.8}} />
				{/* mesa da cozinha */}
				<rect x={520} y={760} width={600} height={22} rx={6} fill="#e4573f" />
				<rect x={530} y={782} width={580} height={30} fill="#c9452f" />
				<rect x={560} y={812} width={16} height={130} fill="#6a4630" />
				<rect x={1064} y={812} width={16} height={130} fill="#6a4630" />
				<path d="M600 760 q30 -40 60 0 z" fill="#e8d7b0" />
				<circle cx={612} cy={744} r={10} fill="#e85d3b" />
				<circle cx={636} cy={742} r={10} fill="#f2c230" />
				{thrown && (
					<g>
						<g transform="translate(860 748) rotate(-8)">
							<rect x={-40} y={-8} width={80} height={12} rx={2} fill="#fbfaf5" />
							<rect x={-30} y={-6} width={50} height={2} fill="#9a9a9a" />
							<rect x={-30} y={-2} width={40} height={2} fill="#9a9a9a" />
						</g>
						<g transform="translate(960 748)">
							<rect x={-12} y={-10} width={24} height={14} rx={4} fill={INK} />
							<circle cx={18} cy={-4} r={8} fill="none" stroke="#c9c9d6" strokeWidth={3} />
						</g>
					</g>
				)}
				{/* Max entra */}
				<Char
					x={mx}
					y={724}
					flip
					shirt="#f08a3c"
					shirtDark="#c96a26"
					pants="#3b4a6b"
					hood
					headphones
					walk={walking ? t * 9 : 0}
					walkAmp={walking ? 26 : 0}
					armF={cheer > 0 ? [lerp(20, 165, cheer), 0] : throwArm > 0 ? [lerp(20, 95, throwArm), 0] : [walking ? Math.sin(t * 9) * 22 : 10, 12]}
					armB={cheer > 0 ? [lerp(10, 160, cheer), 0] : [walking ? -Math.sin(t * 9) * 22 : 6, 12]}
					eye={t > 74.8 ? 'happy' : 'open'}
					mouth="smile"
					headTilt={-6}
					rim={{c: '#fff6d6', dx: 6, dy: -4, o: 0.9}}
				/>
				<Glow x={440} y={440} r={600} o={0.25} warm />
			</Stage>
			<AbsoluteFill style={{background: '#000', opacity: fade}} />
		</AbsoluteFill>
	);
};
