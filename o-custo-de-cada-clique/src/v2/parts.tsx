import React from 'react';
import {AbsoluteFill} from 'remotion';
import {rng} from './time';

export const INK = '#151829';

/** Palco SVG 1920x1080 com câmera (transform) aplicada ao mundo. */
export const Stage: React.FC<{bg: string; cam?: string; children: React.ReactNode; defs?: React.ReactNode}> = ({bg, cam, children, defs}) => (
	<AbsoluteFill style={{background: bg}}>
		<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute'}}>
			<defs>
				<linearGradient id="cone" x1="1" y1="0" x2="0" y2="0">
					<stop offset="0" stopColor="#bfe6ff" stopOpacity={0.55} />
					<stop offset="1" stopColor="#bfe6ff" stopOpacity={0} />
				</linearGradient>
				<linearGradient id="coneL" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor="#bfe6ff" stopOpacity={0.55} />
					<stop offset="1" stopColor="#bfe6ff" stopOpacity={0} />
				</linearGradient>
				<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#e9e4ff" stopOpacity={0.35} />
					<stop offset="1" stopColor="#e9e4ff" stopOpacity={0} />
				</linearGradient>
				<radialGradient id="glow">
					<stop offset="0" stopColor="#ffffff" stopOpacity={0.9} />
					<stop offset="1" stopColor="#ffffff" stopOpacity={0} />
				</radialGradient>
				<radialGradient id="warmGlow">
					<stop offset="0" stopColor="#ffd38a" stopOpacity={0.7} />
					<stop offset="1" stopColor="#ffd38a" stopOpacity={0} />
				</radialGradient>
				{defs}
			</defs>
			<g transform={cam}>{children}</g>
		</svg>
	</AbsoluteFill>
);

/** Cone de luz da tela até o rosto. */
export const Cone: React.FC<{from: [number, number, number, number]; to: [number, number]; spread?: number; o?: number; left?: boolean}> = ({
	from,
	to,
	spread = 60,
	o = 1,
	left,
}) => {
	const [x1, y1, x2, y2] = from;
	return (
		<polygon
			points={`${x1},${y1} ${x2},${y2} ${to[0]},${to[1] + spread} ${to[0]},${to[1] - spread}`}
			fill={`url(#${left ? 'coneL' : 'cone'})`}
			opacity={o}
			style={{mixBlendMode: 'screen'}}
		/>
	);
};

export const Glow: React.FC<{x: number; y: number; r: number; o?: number; warm?: boolean}> = ({x, y, r, o = 1, warm}) => (
	<circle cx={x} cy={y} r={r} fill={`url(#${warm ? 'warmGlow' : 'glow'})`} opacity={o} />
);

/** Silhueta de cidade com janelas acesas. */
export const Skyline: React.FC<{
	x: number;
	y: number;
	w: number;
	h: number;
	seed?: number;
	c: string;
	win: string;
	lit?: number;
	n?: number;
}> = ({x, y, w, h, seed = 1, c, win, lit = 0.35, n = 9}) => {
	const g = rng(seed);
	const bs = Array.from({length: n}, (_, i) => {
		const bw = (w / n) * (0.8 + g() * 0.6);
		const bh = h * (0.35 + g() * 0.65);
		return {x: x + (i * w) / n - bw * 0.1, w: bw, h: bh};
	});
	return (
		<g>
			{bs.map((b, i) => {
				const cols = Math.max(2, Math.floor(b.w / 22));
				const rows = Math.floor(b.h / 30);
				const wins = [];
				for (let r = 0; r < rows; r++)
					for (let k = 0; k < cols; k++)
						if (g() < lit) wins.push(<rect key={`${r}-${k}`} x={b.x + 8 + k * 22} y={y - b.h + 14 + r * 30} width={9} height={13} fill={win} />);
				return (
					<g key={i}>
						<rect x={b.x} y={y - b.h} width={b.w} height={b.h} fill={c} />
						{wins}
					</g>
				);
			})}
		</g>
	);
};

export const Plant: React.FC<{x: number; y: number; s?: number; pot?: string}> = ({x, y, s = 1, pot = '#c97b4a'}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		{[-40, -15, 10, 35].map((a, i) => (
			<path key={i} d="M0 0 q-10 -40 0 -70 q10 30 0 70" fill={i % 2 ? '#4f8a6b' : '#3d7158'} transform={`rotate(${a})`} />
		))}
		<path d="M-20 0 L20 0 L15 34 L-15 34 Z" fill={pot} />
	</g>
);

export const GamerChair: React.FC<{x: number; y: number; flip?: boolean; c?: string; accent?: string}> = ({
	x,
	y,
	flip,
	c = '#22243a',
	accent = '#c0392b',
}) => (
	<g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
		<rect x={-70} y={-250} width={46} height={250} rx={18} fill={c} />
		<rect x={-62} y={-232} width={12} height={200} rx={6} fill={accent} />
		<rect x={-70} y={-10} width={150} height={26} rx={10} fill={c} />
		<rect x={30} y={-60} width={60} height={12} rx={6} fill={c} />
		<rect x={-4} y={16} width={14} height={80} fill="#15161f" />
		<path d="M-60 104 L76 104" stroke="#15161f" strokeWidth={12} strokeLinecap="round" />
		<circle cx={-58} cy={110} r={8} fill="#15161f" />
		<circle cx={74} cy={110} r={8} fill="#15161f" />
	</g>
);

export const Desk: React.FC<{x: number; y: number; w: number; c?: string; leg?: string}> = ({x, y, w, c = '#5d5878', leg = '#2a2a40'}) => (
	<g>
		<rect x={x} y={y} width={w} height={18} rx={4} fill={c} />
		<rect x={x + 20} y={y + 18} width={14} height={190} fill={leg} />
		<rect x={x + w - 34} y={y + 18} width={14} height={190} fill={leg} />
	</g>
);

/** Monitor visto de lado (fino) com brilho. */
export const MonitorSide: React.FC<{x: number; y: number; h?: number; on?: number}> = ({x, y, h = 150, on = 1}) => (
	<g>
		<rect x={x - 6} y={y} width={16} height={h} rx={4} fill="#22243a" />
		<rect x={x - 12} y={y + 4} width={8} height={h - 8} rx={3} fill="#cfe9ff" opacity={on} />
		<rect x={x + 4} y={y + h * 0.4} width={30} height={10} fill="#22243a" />
		<rect x={x + 26} y={y + h * 0.4} width={10} height={h * 0.6 + 40} fill="#22243a" />
	</g>
);

/** Moldura de monitor (de frente) com conteúdo. Conteúdo desenhado em 1600x900. */
export const Monitor: React.FC<{x: number; y: number; w: number; on?: number; children?: React.ReactNode; stand?: boolean}> = ({
	x,
	y,
	w,
	on = 1,
	children,
	stand = true,
}) => {
	const h = (w * 9) / 16;
	const s = w / 1600;
	return (
		<g>
			{stand && <rect x={x + w / 2 - 12} y={y + h} width={24} height={60} fill="#151626" />}
			{stand && <rect x={x + w / 2 - 60} y={y + h + 56} width={120} height={10} rx={4} fill="#151626" />}
			<rect x={x - 10} y={y - 10} width={w + 20} height={h + 20} rx={8} fill="#151626" />
			<g transform={`translate(${x} ${y}) scale(${s})`}>
				<svg width={1600} height={900} viewBox="0 0 1600 900" overflow="hidden">
					{children}
					<rect width={1600} height={900} fill="#05060c" opacity={1 - on} />
				</svg>
			</g>
		</g>
	);
};

export type GameOpts = {
	t: number;
	money: string;
	banner?: string;
	bannerSub?: string;
	bannerColor?: string;
	mode?: 'city' | 'jacket' | 'car' | 'heist' | 'dead';
	night?: boolean;
};

/** Tela do jogo Metrópole Zero: cidade pastel ilustrada + HUD. */
export const GameScreen: React.FC<GameOpts> = ({t, money, banner, bannerSub, bannerColor = '#ffd34d', mode = 'city', night}) => {
	const scroll = (t * 40) % 400;
	const g = rng(42);
	const builds = Array.from({length: 9}, (_, i) => ({
		x: i * 280 - scroll,
		w: 230 + g() * 40,
		h: 330 + g() * 260,
		c: ['#9fd8c4', '#f7b9a0', '#c9b8f0', '#9cc7f2', '#f6d58e'][i % 5],
	}));
	const sky = night ? ['#1d2350', '#5a3f8a'] : ['#57a6f0', '#bfe3ff'];
	return (
		<g>
			<defs>
				<linearGradient id="gsky" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={sky[0]} />
					<stop offset="1" stopColor={sky[1]} />
				</linearGradient>
			</defs>
			<rect width={1600} height={900} fill="url(#gsky)" />
			<circle cx={1250} cy={150} r={56} fill={night ? '#f4f0ff' : '#fff6d6'} />
			<rect x={260 - (scroll * 0.3) % 600} y={110} width={260} height={40} rx={20} fill="#ffffff" opacity={0.8} />
			{/* mar ao fundo */}
			<rect x={0} y={560} width={1600} height={40} fill={night ? '#2a3a7a' : '#2f8fd0'} />
			{builds.map((b, i) => (
				<g key={i}>
					<rect x={b.x} y={640 - b.h} width={b.w} height={b.h} fill={b.c} stroke={INK} strokeWidth={4} />
					{Array.from({length: Math.floor(b.h / 110)}, (_, r) =>
						[0, 1].map((k) => (
							<rect key={`${r}${k}`} x={b.x + 30 + k * (b.w / 2)} y={640 - b.h + 40 + r * 110} width={b.w / 2 - 60} height={60} fill={night ? '#ffd27a' : '#4f8fd6'} stroke={INK} strokeWidth={3} />
						)),
					)}
					<rect x={b.x} y={600} width={b.w} height={40} fill={INK} opacity={0.25} />
				</g>
			))}
			{/* poste e letreiro */}
			<rect x={1000 - scroll} y={420} width={10} height={220} fill="#3b3f58" />
			<rect x={950 - scroll} y={400} width={110} height={50} rx={8} fill="#ff5fa2" stroke={INK} strokeWidth={4} />
			<text x={1005 - scroll} y={436} fontFamily="Inter" fontWeight={900} fontSize={30} fill="#fff" textAnchor="middle">
				MZ
			</text>
			{/* rua */}
			<rect x={0} y={640} width={1600} height={260} fill="#7a7f99" />
			<rect x={0} y={640} width={1600} height={26} fill="#d9d6e6" />
			{Array.from({length: 9}, (_, i) => (
				<rect key={i} x={i * 200 - (scroll % 200)} y={770} width={110} height={10} fill="#ffd34d" />
			))}
			{/* carro do jogador */}
			<g transform={`translate(${620 + Math.sin(t * 2) * 6} 700)`}>
				<ellipse cx={170} cy={120} rx={250} ry={34} fill="none" stroke="#5ff0ff" strokeWidth={8} opacity={0.6 + Math.sin(t * 5) * 0.3} />
				<path d="M0 90 L20 40 L90 30 L130 -10 L270 -10 L320 34 L360 44 L360 90 Z" fill={mode === 'car' ? '#e8423f' : '#e6b84a'} stroke={INK} strokeWidth={5} />
				<path d="M140 0 L260 0 L300 34 L120 34 Z" fill="#9fd8ff" stroke={INK} strokeWidth={4} />
				<circle cx={80} cy={92} r={30} fill={INK} />
				<circle cx={80} cy={92} r={12} fill="#cfd3e6" />
				<circle cx={290} cy={92} r={30} fill={INK} />
				<circle cx={290} cy={92} r={12} fill="#cfd3e6" />
			</g>
			{mode === 'jacket' && (
				<g transform="translate(180 260)">
					<rect width={360} height={330} rx={20} fill="#ffffff" stroke={INK} strokeWidth={6} />
					<path d="M110 70 L160 50 L200 50 L250 70 L280 200 L240 205 L235 280 L125 280 L120 205 L80 200 Z" fill="#7a4a2a" stroke={INK} strokeWidth={5} />
					<text x={180} y={318} fontFamily="Inter" fontWeight={900} fontSize={30} fill={INK} textAnchor="middle">
						$ 4.500
					</text>
				</g>
			)}
			{mode === 'heist' && (
				<g>
					<rect x={0} y={0} width={1600} height={900} fill="#ff2d55" opacity={0.12 + 0.1 * Math.sin(t * 10)} />
					<circle cx={1300} cy={500} r={60 + Math.sin(t * 6) * 10} fill="none" stroke="#ff2d55" strokeWidth={10} />
				</g>
			)}
			{/* HUD */}
			<g transform="translate(60 640)">
				<circle cx={110} cy={110} r={110} fill="#2c3550" stroke="#e8ecff" strokeWidth={8} />
				<path d="M20 150 L200 60 M70 20 L170 200" stroke="#9aa6c8" strokeWidth={22} />
				<path d="M110 90 l16 34 l-16 -8 l-16 8 z" fill="#ffffff" />
			</g>
			<g transform="translate(1260 40)">
				<rect width={300} height={84} rx={42} fill="#16233a" stroke="#0b0f1c" strokeWidth={4} />
				<text x={150} y={58} fontFamily="Inter" fontWeight={900} fontSize={44} fill="#5dff9b" textAnchor="middle">
					{money}
				</text>
			</g>
			{banner && (
				<g>
					<rect x={0} y={330} width={1600} height={200} fill="#0b0f1c" opacity={0.75} />
					<text x={800} y={430} fontFamily="Inter" fontWeight={900} fontSize={84} fill={bannerColor} textAnchor="middle">
						{banner}
					</text>
					{bannerSub && (
						<text x={800} y={500} fontFamily="Inter" fontWeight={800} fontSize={54} fill="#5dff9b" textAnchor="middle">
							{bannerSub}
						</text>
					)}
				</g>
			)}
			{mode === 'dead' && (
				<g>
					<rect width={1600} height={900} fill="#5a0010" opacity={0.65} />
					<text x={800} y={480} fontFamily="Inter" fontWeight={900} fontSize={130} fill="#ff6b6b" textAnchor="middle">
						MISSÃO FALHOU
					</text>
				</g>
			)}
		</g>
	);
};

/** Tela de saldo (festa de gala). */
export const BalanceScreen: React.FC<{t: number}> = ({t}) => (
	<g>
		<rect width={1600} height={900} fill="#071a12" />
		{Array.from({length: 26}, (_, i) => (
			<rect key={i} x={i * 64} y={0} width={2} height={900} fill="#0f3a26" />
		))}
		<polyline
			points={Array.from({length: 40}, (_, i) => `${i * 42},${760 - i * 14 - Math.sin(i + t) * 20}`).join(' ')}
			fill="none"
			stroke="#3da874"
			strokeWidth={8}
		/>
		<text x={800} y={290} fontFamily="JetBrains Mono" fontWeight={600} fontSize={52} fill="#7CFFB2" textAnchor="middle">
			METRÓPOLE ZERO · SALDO TOTAL
		</text>
		<text x={800} y={470} fontFamily="JetBrains Mono" fontWeight={800} fontSize={112} fill="#7CFFB2" textAnchor="middle">
			US$ 100.000.000.000
		</text>
	</g>
);

/** Celular grande (close), tela com notificação. */
export const PhoneBig: React.FC<{
	x: number;
	y: number;
	s?: number;
	rot?: number;
	on?: number;
	buzz?: number;
	app?: string;
	title?: string;
	body?: string;
	color?: string;
	big?: string;
	bigColor?: string;
	clock?: string;
}> = ({x, y, s = 1, rot = 0, on = 1, buzz = 0, app, title, body, color = '#19c37d', big, bigColor = '#ffffff', clock = '02:00'}) => {
	const j = buzz > 0 ? Math.sin(buzz * 80) * 6 : 0;
	return (
		<g transform={`translate(${x + j} ${y}) rotate(${rot + j * 0.4}) scale(${s})`}>
			<rect x={-150} y={-300} width={300} height={600} rx={44} fill="#0d0f1c" />
			<rect x={-136} y={-286} width={272} height={572} rx={34} fill={on > 0.05 ? '#1c2340' : '#07080f'} />
			{on > 0.05 && (
				<g opacity={on}>
					<text x={0} y={-190} fontFamily="Inter" fontWeight={300} fontSize={72} fill="#e9ecff" textAnchor="middle">
						{clock}
					</text>
					{title && (
						<g transform="translate(-122 -120)">
							<rect width={244} height={120} rx={22} fill="#f2f3f8" />
							<rect x={14} y={16} width={36} height={36} rx={9} fill={color} />
							<text x={60} y={42} fontFamily="Inter" fontWeight={700} fontSize={17} fill="#5b5f73">
								{app?.toUpperCase()}
							</text>
							<text x={16} y={80} fontFamily="Inter" fontWeight={800} fontSize={21} fill="#151829">
								{title}
							</text>
							<text x={16} y={104} fontFamily="Inter" fontWeight={500} fontSize={16} fill="#3b3f52">
								{body}
							</text>
						</g>
					)}
					{big && (
						<text x={0} y={90} fontFamily="Inter" fontWeight={900} fontSize={30} fill={bigColor} textAnchor="middle">
							{big}
						</text>
					)}
				</g>
			)}
		</g>
	);
};

/** Janela com cidade lá fora e lua. */
export const CityWindow: React.FC<{x: number; y: number; w: number; h: number; sky: [string, string]; moon?: boolean; sun?: number; lit?: number; seed?: number; buildC?: string}> = ({
	x,
	y,
	w,
	h,
	sky,
	moon = true,
	sun,
	lit = 0.3,
	seed = 3,
	buildC = '#2b2a55',
}) => {
	const id = `win${seed}`;
	return (
		<g>
			<defs>
				<linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={sky[0]} />
					<stop offset="1" stopColor={sky[1]} />
				</linearGradient>
				<clipPath id={`${id}c`}>
					<rect x={x} y={y} width={w} height={h} />
				</clipPath>
			</defs>
			<g clipPath={`url(#${id}c)`}>
				<rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
				{moon && <circle cx={x + w * 0.42} cy={y + h * 0.22} r={18} fill="#f3f0ff" />}
				{sun !== undefined && <circle cx={x + w * 0.5} cy={y + h * (0.9 - sun * 0.6)} r={40} fill="#ffe2a0" />}
				<Skyline x={x - 20} y={y + h} w={w + 40} h={h * 0.62} seed={seed} c={buildC} win="#ffc977" lit={lit} n={7} />
			</g>
		</g>
	);
};
