import React from 'react';

export type Eye = 'open' | 'closed' | 'focus' | 'sad' | 'wide' | 'happy' | 'tired' | 'angry' | 'shock';
export type Mouth = 'none' | 'smile' | 'flat' | 'open' | 'sad' | 'grin' | 'o' | 'yawn';

/** Braço: [ângulo do braço a partir da vertical (graus, + = para frente/para fora), dobra do antebraço]. */
export type Arm = [number, number];

export type CharProps = {
	x: number;
	y: number;
	scale?: number;
	flip?: boolean;
	view?: 'side' | 'front' | 'back';
	pose?: 'stand' | 'sit' | 'ground';
	walk?: number; // fase da caminhada (rad)
	walkAmp?: number; // graus
	armF?: Arm; // lateral: braço da frente | frente/costas: braço direito da tela
	armB?: Arm; // lateral: braço de trás | frente/costas: braço esquerdo da tela
	lean?: number; // graus
	headTilt?: number; // graus
	shirt: string;
	shirtDark?: string;
	pants: string;
	shoe?: string;
	head?: string;
	hood?: boolean;
	hair?: string; // cabelo grisalho / cabelo claro
	longHair?: boolean;
	eye?: Eye;
	blink?: number;
	mouth?: Mouth;
	brows?: boolean; // sobrancelhas sempre visíveis (expressivo)
	shine?: boolean; // brilho na cabeça
	sole?: string; // sola do tênis
	cuff?: string; // barra da calça
	tears?: number; // fase das lágrimas (segundos); undefined = sem lágrimas
	rim?: {c: string; dx: number; dy: number; o?: number};
	headphones?: boolean;
	badge?: boolean;
	dress?: boolean;
	tie?: boolean;
	hold?: 'phone' | 'ball' | 'glass' | 'can' | 'pad';
	phoneGlow?: string;
};

const rad = (d: number) => (d * Math.PI) / 180;
const dir = (a: number, L: number, side = 1): [number, number] => [side * Math.sin(rad(a)) * L, Math.cos(rad(a)) * L];
const add = (p: [number, number], q: [number, number]): [number, number] => [p[0] + q[0], p[1] + q[1]];

type Paint = {rim: boolean; rc: string};
const col = (p: Paint, c: string) => (p.rim ? p.rc : c);

const Limb: React.FC<{pts: [number, number][]; w: number; c: string; p: Paint}> = ({pts, w, c, p}) => (
	<polyline
		points={pts.map((q) => q.join(',')).join(' ')}
		fill="none"
		stroke={col(p, c)}
		strokeWidth={w + (p.rim ? 6 : 0)}
		strokeLinecap="round"
		strokeLinejoin="round"
	/>
);

const HandItem: React.FC<{at: [number, number]; item: CharProps['hold']; p: Paint; glow?: string}> = ({at, item, p, glow}) => {
	if (!item) return null;
	const [x, y] = at;
	if (item === 'phone')
		return (
			<g transform={`translate(${x} ${y - 6}) rotate(-15)`}>
				<rect x={-9} y={-30} width={18} height={34} rx={4} fill={col(p, '#0e1020')} />
				{!p.rim && <rect x={-7} y={-28} width={14} height={28} rx={2} fill={glow ?? '#8fd3ff'} />}
			</g>
		);
	if (item === 'ball')
		return (
			<g>
				<circle cx={x} cy={y - 4} r={24} fill={col(p, '#f4efe6')} />
				{!p.rim && <path d={`M${x - 10} ${y - 18} l10 6 l10 -6 M${x} ${y - 12} v14`} stroke="#2a2a33" strokeWidth={3} fill="none" />}
			</g>
		);
	if (item === 'glass')
		return (
			<g>
				<path d={`M${x - 9} ${y - 34} L${x + 9} ${y - 34} L${x + 2} ${y - 14} L${x - 2} ${y - 14} Z`} fill={col(p, '#f6e3a1')} opacity={0.9} />
				<rect x={x - 1.5} y={y - 14} width={3} height={14} fill={col(p, '#d9d9e3')} />
			</g>
		);
	if (item === 'can') return <rect x={x - 8} y={y - 26} width={16} height={28} rx={3} fill={col(p, '#36d27a')} />;
	if (item === 'pad')
		return (
			<g>
				<rect x={x - 26} y={y - 12} width={52} height={22} rx={10} fill={col(p, '#262a3d')} />
				{!p.rim && <circle cx={x + 12} cy={y - 2} r={3} fill="#ff6b6b" />}
			</g>
		);
	return null;
};

const BROW: Record<Eye, [number, number]> = {
	// [altura da ponta de trás, altura da ponta da frente] relativas ao olho (lateral)
	open: [-17, -17],
	focus: [-21, -12],
	angry: [-23, -10],
	sad: [-12, -20],
	wide: [-24, -24],
	shock: [-27, -25],
	happy: [-21, -21],
	tired: [-13, -13],
	closed: [-15, -15],
};

const Face: React.FC<{cx: number; cy: number; side: boolean; eye?: Eye; blink: number; mouth?: Mouth; brows?: boolean; tears?: number}> = ({
	cx,
	cy,
	side,
	eye = 'open',
	blink,
	mouth = 'none',
	brows,
	tears,
}) => {
	const W = '#f4f6ff';
	const eyes = side ? [cx + 22] : [cx - 16, cx + 16];
	const ey = cy - 2;
	const big = eye === 'wide' || eye === 'shock';
	const ry = (big ? 10 : 8) * (1 - blink * 0.92);
	const rx = big ? 6.5 : 5;
	const showBrow = brows || eye === 'focus' || eye === 'sad' || eye === 'angry' || eye === 'shock';
	return (
		<g>
			{eyes.map((ex, i) => {
				const dirx = side ? 1 : i === 0 ? -1 : 1; // lado "de fora" do olho
				const [back, front] = BROW[eye];
				// na vista de frente, "de trás" = lado de fora, "da frente" = lado de dentro
				const x1 = ex - 9 * (side ? 1 : -dirx);
				const x2 = ex + 9 * (side ? 1 : -dirx);
				return (
					<g key={i}>
						{eye === 'happy' ? (
							<path d={`M${ex - 7} ${ey + 3} q7 -10 14 0`} stroke={W} strokeWidth={4.5} fill="none" strokeLinecap="round" />
						) : eye === 'closed' ? (
							<path d={`M${ex - 7} ${ey} q7 6 14 0`} stroke={W} strokeWidth={4} fill="none" strokeLinecap="round" />
						) : eye === 'tired' ? (
							<path d={`M${ex - 5.5} ${ey} h11 a5.5 6 0 0 1 -11 0 z`} fill={W} />
						) : (
							<g>
								<ellipse cx={ex} cy={ey} rx={rx} ry={Math.max(0.8, ry)} fill={W} />
								{big && ry > 3 && <circle cx={ex + (side ? 1.5 : 0)} cy={ey} r={2.4} fill="#0e0f19" />}
							</g>
						)}
						{showBrow && <line x1={x1} y1={ey + back} x2={x2} y2={ey + front} stroke={W} strokeWidth={4.5} strokeLinecap="round" />}
						{tears !== undefined &&
							[0, 1].map((k) => {
								const ph = (tears * 0.7 + k * 0.5) % 1;
								return <ellipse key={k} cx={ex + (side ? -2 : dirx * 2)} cy={ey + 10 + ph * 34} rx={3} ry={5} fill="#a9dcff" opacity={1 - ph} />;
							})}
					</g>
				);
			})}
			{(() => {
				const mx = side ? cx + 25 : cx;
				const my = cy + 21;
				switch (mouth) {
					case 'smile':
						return <path d={side ? `M${mx - 10} ${my - 2} q8 7 16 -1` : `M${mx - 12} ${my - 3} q12 11 24 0`} stroke={W} strokeWidth={4} fill="none" strokeLinecap="round" />;
					case 'grin':
						return <path d={side ? `M${mx - 11} ${my - 4} h18 q-2 12 -12 12 q-6 0 -6 -12 z` : `M${mx - 15} ${my - 5} h30 q-2 16 -15 16 q-13 0 -15 -16 z`} fill={W} />;
					case 'flat':
						return <line x1={side ? mx - 8 : mx - 9} y1={my} x2={side ? mx + 6 : mx + 9} y2={my} stroke={W} strokeWidth={4} strokeLinecap="round" />;
					case 'sad':
						return <path d={side ? `M${mx - 10} ${my + 3} q8 -7 16 0` : `M${mx - 11} ${my + 4} q11 -9 22 0`} stroke={W} strokeWidth={4} fill="none" strokeLinecap="round" />;
					case 'open':
						return <ellipse cx={side ? mx - 1 : mx} cy={my + 1} rx={side ? 5 : 8} ry={6.5} fill={W} />;
					case 'o':
						return <ellipse cx={side ? mx - 2 : mx} cy={my + 1} rx={3.5} ry={4.5} fill={W} />;
					case 'yawn':
						return <ellipse cx={side ? mx - 2 : mx} cy={my + 3} rx={side ? 7 : 10} ry={11} fill={W} />;
					default:
						return null;
				}
			})()}
		</g>
	);
};

const Figure: React.FC<CharProps & {p: Paint}> = (c) => {
	const {p} = c;
	const view = c.view ?? 'side';
	const pose = c.pose ?? 'stand';
	const head = c.head ?? '#151829';
	const shoe = c.shoe ?? '#14151f';
	const shirtDark = c.shirtDark ?? c.shirt;
	const amp = c.walkAmp ?? 0;
	const ph = c.walk ?? 0;
	const armF = c.armF ?? [8, 10];
	const armB = c.armB ?? [-6, 10];
	const lean = c.lean ?? 0;
	const tilt = c.headTilt ?? 0;
	const bob = amp > 0 ? -Math.abs(Math.cos(ph)) * 5 : 0;

	if (view === 'side') {
		// pernas
		const legs: [number, number][][] = [];
		const feet: [number, number][] = [];
		if (pose === 'stand') {
			for (const s of [1, -1]) {
				const a = Math.sin(ph) * amp * s;
				const knee = add([0, 0], dir(a, 78));
				const bend = Math.max(0, -Math.sin(ph) * s) * amp * 0.9;
				const foot = add(knee, dir(a - bend, 78));
				legs.push([[0, 0], knee, foot]);
				feet.push(foot);
			}
		} else if (pose === 'sit') {
			for (const dx of [0, -6]) {
				legs.push([[dx, 0], [dx + 82, 0], [dx + 84, 80]]);
				feet.push([dx + 84, 80]);
			}
		} else {
			for (const dx of [0, -8]) {
				legs.push([[dx, 0], [dx + 62, -48], [dx + 104, 2]]);
				feet.push([dx + 104, 2]);
			}
		}
		const sh: [number, number] = [6, -100];
		const elbowF = add(sh, dir(armF[0], 56));
		const handF = add(elbowF, dir(armF[0] + armF[1], 54));
		const elbowB = add(sh, dir(armB[0], 56));
		const handB = add(elbowB, dir(armB[0] + armB[1], 54));
		const hx = 8;
		const hy = -160;
		return (
			<g transform={`translate(0 ${bob})`}>
				{/* perna de trás + frente */}
				<Limb pts={legs[1]} w={26} c={c.pants} p={p} />
				<Limb pts={legs[0]} w={26} c={c.pants} p={p} />
				{feet.map((f, i) => (
					<g key={i}>
						{c.cuff && !p.rim && <rect x={f[0] - 15} y={f[1] - 20} width={30} height={12} rx={4} fill={c.cuff} />}
						<path d={`M${f[0] - 12} ${f[1] - 10} h20 q18 2 20 14 h-40 z`} fill={col(p, shoe)} />
						{c.sole && !p.rim && <rect x={f[0] - 13} y={f[1] + 3} width={43} height={6} rx={3} fill={c.sole} />}
						{c.sole && !p.rim && <path d={`M${f[0] + 18} ${f[1] - 3} q8 1 10 7 h-10 z`} fill={c.sole} />}
					</g>
				))}
				<g transform={`rotate(${lean})`}>
					{/* braço de trás */}
					<Limb pts={[sh, elbowB, handB]} w={22} c={shirtDark} p={p} />
					<circle cx={handB[0]} cy={handB[1]} r={10} fill={col(p, head)} />
					{c.dress && <path d="M-34 -14 L38 -14 L54 62 L-46 62 Z" fill={col(p, c.shirt)} />}
					{/* tronco */}
					<rect x={-31} y={-120} width={64} height={128} rx={28} fill={col(p, c.shirt)} />
					{c.hood && <ellipse cx={-22} cy={-112} rx={26} ry={19} fill={col(p, shirtDark)} />}
					{c.hood && !p.rim && (
						<g stroke="#f4f0e6" strokeWidth={2.5} strokeLinecap="round" opacity={0.8}>
							<line x1={20} y1={-108} x2={22} y2={-80} />
							<line x1={26} y1={-106} x2={28} y2={-84} />
						</g>
					)}
					{c.badge && !p.rim && <rect x={6} y={-92} width={18} height={24} rx={3} fill="#f6f6f0" />}
					{c.headphones && (
						<g>
							<path d="M-14 -118 q22 20 44 0" stroke={col(p, '#6a6f88')} strokeWidth={7} fill="none" />
							<ellipse cx={-6} cy={-112} rx={17} ry={19} fill={col(p, '#3a3e54')} />
							{!p.rim && <ellipse cx={-6} cy={-112} rx={9} ry={11} fill="#5a5f78" />}
							{!p.rim && <ellipse cx={-6} cy={-112} rx={4} ry={5} fill="#2a2d40" />}
						</g>
					)}
					{/* cabeça */}
					<g transform={`rotate(${tilt} 4 -122)`}>
						<circle cx={hx} cy={hy} r={44} fill={col(p, head)} />
						{c.hair && <path d={`M${hx - 44} ${hy - 2} a44 44 0 0 1 70 -34 q-20 10 -30 6 q-14 22 -40 28 z`} fill={col(p, c.hair)} />}
						{c.longHair && <path d={`M${hx - 40} ${hy - 20} q-16 40 -2 76 l22 -6 q-8 -34 8 -60 z`} fill={col(p, c.hair ?? '#3a2a20')} />}
						{!p.rim && c.shine && <path d={`M${hx - 30} ${hy - 14} a33 33 0 0 1 26 -28`} stroke="#ffffff" strokeOpacity={0.28} strokeWidth={5} fill="none" strokeLinecap="round" />}
						{!p.rim && <Face cx={hx} cy={hy} side eye={c.eye} blink={c.blink ?? 0} mouth={c.mouth} brows={c.brows} tears={c.tears} />}
					</g>
					{/* braço da frente */}
					<Limb pts={[sh, elbowF, handF]} w={22} c={c.shirt} p={p} />
					<circle cx={handF[0]} cy={handF[1]} r={10} fill={col(p, head)} />
					<HandItem at={handF} item={c.hold} p={p} glow={c.phoneGlow} />
				</g>
			</g>
		);
	}

	// ----------------------------------------------------- frente / costas
	const front = view === 'front';
	const legs: [number, number][][] = [];
	if (pose === 'stand') {
		for (const s of [-1, 1]) {
			const lift = amp > 0 ? Math.max(0, Math.sin(ph) * s) * 10 : 0;
			legs.push([
				[s * 20, 0],
				[s * 21, 150 - lift],
			]);
		}
	} else if (pose === 'sit') {
		for (const s of [-1, 1]) legs.push([[s * 22, 0], [s * 26, 22], [s * 26, 96]]);
	} else {
		for (const s of [-1, 1]) legs.push([[s * 22, 0], [s * 44, -42], [s * 34, 6]]);
	}
	const shL: [number, number] = [-44, -102];
	const shR: [number, number] = [44, -102];
	const eR = add(shR, dir(armF[0], 54, 1));
	const hR = add(eR, dir(armF[0] + armF[1], 52, 1));
	const eL = add(shL, dir(armB[0], 54, -1));
	const hL = add(eL, dir(armB[0] + armB[1], 52, -1));
	const hy = -168;
	return (
		<g transform={`translate(0 ${bob})`}>
			{legs.map((L, i) => (
				<Limb key={i} pts={L} w={28} c={c.pants} p={p} />
			))}
			{legs.map((L, i) => {
				const f = L[L.length - 1];
				return (
					<g key={i}>
						{c.cuff && !p.rim && <rect x={f[0] - 16} y={f[1] - 20} width={32} height={12} rx={4} fill={c.cuff} />}
						<rect x={f[0] - 17} y={f[1] - 8} width={34} height={15} rx={7} fill={col(p, shoe)} />
						{c.sole && !p.rim && <rect x={f[0] - 18} y={f[1] + 4} width={36} height={6} rx={3} fill={c.sole} />}
					</g>
				);
			})}
			<g transform={`rotate(${lean})`}>
				{c.dress && <path d="M-46 -20 L46 -20 L66 70 L-66 70 Z" fill={col(p, c.shirt)} />}
				{c.hood && <ellipse cx={0} cy={-118} rx={front ? 44 : 50} ry={front ? 18 : 30} fill={col(p, shirtDark)} />}
				<rect x={-49} y={-124} width={98} height={132} rx={32} fill={col(p, c.shirt)} />
				{c.hood && front && !p.rim && (
					<g stroke="#f4f0e6" strokeWidth={2.5} strokeLinecap="round" opacity={0.8}>
						<line x1={-9} y1={-114} x2={-11} y2={-86} />
						<line x1={9} y1={-114} x2={11} y2={-86} />
					</g>
				)}
				{c.tie && front && !p.rim && <path d="M-6 -118 L6 -118 L4 -70 L0 -62 L-4 -70 Z" fill="#1a1a24" />}
				{c.badge && front && !p.rim && (
					<g>
						<rect x={14} y={-96} width={22} height={28} rx={3} fill="#f6f6f0" />
						<rect x={18} y={-90} width={14} height={4} fill="#c9c9d6" />
					</g>
				)}
				{c.headphones && <path d="M-34 -122 q34 26 68 0" stroke={col(p, '#8a8fa8')} strokeWidth={7} fill="none" />}
				<Limb pts={[shL, eL, hL]} w={24} c={c.shirt} p={p} />
				<Limb pts={[shR, eR, hR]} w={24} c={c.shirt} p={p} />
				<circle cx={hL[0]} cy={hL[1]} r={11} fill={col(p, head)} />
				<circle cx={hR[0]} cy={hR[1]} r={11} fill={col(p, head)} />
				<g transform={`rotate(${tilt} 0 -126)`}>
					{c.longHair && <path d={`M-46 ${hy - 6} q-6 60 6 84 l80 0 q12 -24 6 -84 z`} fill={col(p, c.hair ?? '#3a2a20')} />}
					<circle cx={0} cy={hy} r={45} fill={col(p, head)} />
					{c.hair && !c.longHair && <path d={`M-44 ${hy - 8} a45 45 0 0 1 88 0 q-20 -16 -44 -12 q-24 -4 -44 12 z`} fill={col(p, c.hair)} />}
					{c.hair && c.longHair && <path d={`M-45 ${hy} a45 45 0 0 1 90 0 q-30 -22 -45 -16 q-15 -6 -45 16 z`} fill={col(p, c.hair)} />}
					{!p.rim && c.shine && <path d={`M-32 ${hy - 12} a34 34 0 0 1 24 -30`} stroke="#ffffff" strokeOpacity={0.28} strokeWidth={5} fill="none" strokeLinecap="round" />}
					{front && !p.rim && <Face cx={0} cy={hy} side={false} eye={c.eye} blink={c.blink ?? 0} mouth={c.mouth} brows={c.brows} tears={c.tears} />}
				</g>
				<HandItem at={hR} item={c.hold} p={p} glow={c.phoneGlow} />
			</g>
		</g>
	);
};

/** Personagem vetorial com cabeça em silhueta e luz de recorte (rim light). */
export const Char: React.FC<CharProps> = (c) => {
	const s = c.scale ?? 1;
	return (
		<g transform={`translate(${c.x} ${c.y}) scale(${c.flip ? -s : s} ${s})`}>
			{c.rim && (
				<g transform={`translate(${(c.flip ? -1 : 1) * c.rim.dx} ${c.rim.dy})`} opacity={c.rim.o ?? 1}>
					<Figure {...c} p={{rim: true, rc: c.rim.c}} />
				</g>
			)}
			<Figure {...c} p={{rim: false, rc: ''}} />
		</g>
	);
};

/** Visual do Max: moletom preto com capuz, fone no pescoço, jeans e tênis de cano alto. */
export const MAX_LOOK = {
	shirt: '#1f2030',
	shirtDark: '#15161f',
	pants: '#3e5f94',
	cuff: '#5677ad',
	shoe: '#101119',
	sole: '#eceef5',
	head: '#0d0e17',
	hood: true,
	headphones: true,
	shine: true,
	brows: true,
} as const;
