import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Shot2, T, cam2, rng, sr, useTime} from '../time';
import {BalanceScreen, Glow, INK, Monitor, Stage} from '../parts';
import {PenthouseBack, PenthouseSide} from '../penthouse';
import {Char} from '../Char';
import {Caption} from '../overlays';

const START = T.cena5;
const END = T.cena6;
const NIGHT: [string, string] = ['#120f30', '#2e2057'];
const AGED = {hair: '#cfcad8', eye: 'sad' as const, head: '#1b1d30', shirt: '#2b2d44', shirtDark: '#202236', hood: false, headphones: false};

const TV: React.FC<{t: number}> = ({t}) => {
	const g = rng(Math.floor(t * 12));
	return (
		<g>
			<rect x={-300} y={-200} width={2520} height={1500} fill="#2a2246" />
			<Glow x={960} y={540} r={800} o={0.25} />
			<rect x={330} y={170} width={1260} height={720} rx={18} fill="#0d0e18" />
			<g>
				<defs>
					<linearGradient id="tvg" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#8a8a8a" />
						<stop offset="1" stopColor="#3a3a3a" />
					</linearGradient>
				</defs>
				<rect x={350} y={190} width={1220} height={680} fill="url(#tvg)" />
				{/* salão vazio, poltrona gigante, homem velho */}
				<rect x={350} y={640} width={1220} height={230} fill="#4a4a4a" />
				<path d="M820 640 v-260 q140 -70 280 0 v260 z" fill="#1e1e1e" />
				<rect x={790} y={560} width={340} height={90} rx={30} fill="#1e1e1e" />
				<circle cx={960} cy={470} r={44} fill="#2e2e2e" />
				<rect x={918} y={515} width={84} height={110} rx={30} fill="#2e2e2e" />
				<path d="M1300 260 h160 v240 h-160 z" fill="#6a6a6a" />
				<rect x={350} y={780} width={1220} height={90} fill="#000" opacity={0.6} />
				<text x={960} y={838} fontFamily="DejaVu Serif" fontStyle="italic" fontSize={40} fill="#eee" textAnchor="middle">
					“Morreu com tudo. E sozinho.”
				</text>
				{Array.from({length: 30}, (_, i) => (
					<rect key={i} x={350 + g() * 1220} y={190 + g() * 680} width={3} height={3} fill="#fff" opacity={0.4} />
				))}
				<rect x={350 + g() * 1220} y={190} width={2} height={680} fill="#fff" opacity={0.25} />
			</g>
			<Char x={300} y={1130} scale={1.6} view="back" shirt="#7a2a3a" pants="#1b1c2a" badge hold="glass" armF={[20, -60]} rim={{c: '#c9c9d6', dx: 6, dy: -4, o: 0.6}} />
		</g>
	);
};

const PostIt: React.FC = () => (
	<g>
		<rect x={-300} y={-200} width={2520} height={1500} fill="#14152a" />
		<Monitor x={-200} y={-60} w={1500} stand={false}>
			<BalanceScreen t={0} />
		</Monitor>
		<Glow x={600} y={300} r={900} o={0.3} />
		<g transform="translate(1180 560) rotate(-6)">
			<rect x={-190} y={-190} width={380} height={380} fill="#f6e27a" />
			<rect x={-190} y={-190} width={380} height={50} fill="#e3c95a" />
			<text x={0} y={-30} fontFamily="DejaVu Serif" fontStyle="italic" fontSize={58} fill="#1b2a6b" textAnchor="middle">
				Parar no
			</text>
			<text x={0} y={40} fontFamily="DejaVu Serif" fontStyle="italic" fontSize={58} fill="#1b2a6b" textAnchor="middle">
				primeiro
			</text>
			<text x={0} y={110} fontFamily="DejaVu Serif" fontStyle="italic" fontSize={58} fill="#1b2a6b" textAnchor="middle">
				bilhão
			</text>
			<path d="M-110 132 q110 -10 220 0" stroke="#1b2a6b" strokeWidth={5} fill="none" />
		</g>
	</g>
);

const shots: Shot2[] = [
	{at: START, a: {x: 1185, y: 585, s: 2.3}, b: {x: 1190, y: 590, s: 2.5}}, // 0 rosto velho
	{at: T.festa, a: {x: 960, y: 600, s: 1.25}, b: {x: 960, y: 560, s: 1.0}, ease: 'smooth'}, // 1 festa
	{at: 236.6, a: {x: 360, y: 760, s: 1.9}, b: {x: 420, y: 760, s: 2.0}}, // 2 convidados
	{at: T.documentario, a: {x: 960, y: 540, s: 1.0}, b: {x: 960, y: 530, s: 1.08}}, // 3 TV
	{at: T.saldo, a: {x: 960, y: 560, s: 1.0}, b: {x: 960, y: 570, s: 1.08}}, // 4 saldo
	{at: T.postit, a: {x: 900, y: 500, s: 1.0}, b: {x: 1050, y: 540, s: 1.25}, ease: 'smooth'}, // 5 post-it
	{at: 263.0, a: {x: 1190, y: 590, s: 2.5}, b: {x: 1185, y: 585, s: 2.3}}, // 6 rosto
	{at: T.desliga - 0.6, a: {x: 960, y: 580, s: 1.1}, b: {x: 960, y: 560, s: 0.98}, ease: 'smooth'}, // 7 desliga
];

export const S5Gala: React.FC = () => {
	const t = useTime(START);
	const {index, transform} = cam2(t, shots, END);
	const off = sr(t, T.desliga, T.desliga + 0.15);
	const party = 1 - sr(t, T.desliga, T.desliga + 1.6) * 0.8;
	return (
		<AbsoluteFill>
			<Stage bg="#14152a" cam={transform}>
				{(index === 1 || index === 2 || index === 7) && (
					<PenthouseBack
						t={t}
						sky={NIGHT}
						lit={0.5}
						monOn={1 - off}
						party={party}
						freeze={off}
						screen={<BalanceScreen t={t} />}
						maxProps={{...AGED, rim: {c: '#a9dcff', dx: 0, dy: -6, o: 1 - off}}}
					/>
				)}
				{(index === 0 || index === 6) && (
					<PenthouseSide t={t} sky={NIGHT} lit={0.5} room="#2a2246" postit max={{...AGED, eye: index === 6 && t > 263.4 ? 'closed' : 'sad', mouth: index === 6 ? 'sad' : 'none', armF: [52, 42], blink: t % 3.4 < 0.15 ? 1 : 0}} />
				)}
				{index === 3 && <TV t={t} />}
				{index === 4 && (
					<g>
						<rect x={-300} y={-200} width={2520} height={1500} fill="#14152a" />
						<Glow x={960} y={540} r={800} o={0.3} />
						<Monitor x={260} y={150} w={1400} stand={false}>
							<BalanceScreen t={t} />
						</Monitor>
					</g>
				)}
				{index === 5 && <PostIt />}
				{index !== 3 && index !== 4 && index !== 5 && <rect x={-300} y={-200} width={2520} height={1500} fill={INK} opacity={0} />}
			</Stage>
			<Caption t={t} a={START + 0.6} b={T.festa - 0.5} text="15 anos depois" />
			<AbsoluteFill style={{background: '#000', opacity: Math.max(1 - sr(t, START, START + 1), sr(t, END - 1.2, END))}} />
		</AbsoluteFill>
	);
};
