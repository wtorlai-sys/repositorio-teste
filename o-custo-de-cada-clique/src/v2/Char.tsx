import React from 'react';

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
	eye?: 'open' | 'closed' | 'focus' | 'sad' | 'wide' | 'happy';
	blink?: number;
	mouth?: 'none' | 'smile' | 'flat' | 'open' | 'sad';
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

const Face: React.FC<{cx: number; cy: number; side: boolean; eye: CharProps['eye']; blink: number; mouth: CharProps['mouth']}> = ({
	cx,
	cy,
	side,
	eye = 'open',
	blink,
	mouth = 'none',
}) => {
	const W = '#f4f6ff';
	const eh = eye === 'closed' ? 0.15 : eye === 'wide' ? 1.35 : eye === 'happy' ? 0.35 : 1;
	const h = 8 * eh * (1 - blink * 0.9);
	const eyes = side ? [cx + 22] : [cx - 15, cx + 15];
	const ey = cy + (eye === 'sad' ? 4 : 0);
	return (
		<g>
			{eyes.map((ex, i) => (
				<g key={i}>
					{eye === 'happy' ? (
						<path d={`M${ex - 6} ${ey + 2} q6 -8 12 0`} stroke={W} strokeWidth={4} fill="none" strokeLinecap="round" />
					) : (
						<line x1={ex} y1={ey - h} x2={ex} y2={ey + h} stroke={W} strokeWidth={5} strokeLinecap="round" />
					)}
					{eye === 'focus' && (
						<line x1={ex - 9} y1={ey - 17} x2={ex + 9} y2={ey - 12 + (side ? 0 : i === 0 ? 0 : -2)} stroke={W} strokeWidth={4} strokeLinecap="round" transform={!side && i === 1 ? `rotate(-30 ${ex} ${ey - 15})` : undefined} />
					)}
					{eye === 'sad' && (
						<line x1={ex - 9} y1={ey - 14} x2={ex + 9} y2={ey - 18} stroke={W} strokeWidth={4} strokeLinecap="round" transform={!side && i === 0 ? `rotate(25 ${ex} ${ey - 16})` : undefined} />
					)}
				</g>
			))}
			{mouth === 'smile' && (
				<path d={side ? `M${cx + 14} ${cy + 18} q8 6 16 -2` : `M${cx - 12} ${cy + 18} q12 12 24 0`} stroke={W} strokeWidth={4} fill="none" strokeLinecap="round" />
			)}
			{mouth === 'flat' && <line x1={side ? cx + 18 : cx - 9} y1={cy + 22} x2={side ? cx + 30 : cx + 9} y2={cy + 22} stroke={W} strokeWidth={4} strokeLinecap="round" />}
			{mouth === 'sad' && (
				<path d={side ? `M${cx + 16} ${cy + 24} q7 -6 14 0` : `M${cx - 10} ${cy + 26} q10 -9 20 0`} stroke={W} strokeWidth={4} fill="none" strokeLinecap="round" />
			)}
			{mouth === 'open' && <ellipse cx={side ? cx + 26 : cx} cy={cy + 22} rx={side ? 5 : 8} ry={7} fill={W} />}
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
					<rect key={i} x={f[0] - 10} y={f[1] - 6} width={36} height={14} rx={7} fill={col(p, shoe)} />
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
							<path d="M-12 -118 q20 18 40 0" stroke={col(p, '#8a8fa8')} strokeWidth={6} fill="none" />
							<ellipse cx={-14} cy={-116} rx={10} ry={14} fill={col(p, '#3a3f58')} />
						</g>
					)}
					{/* cabeça */}
					<g transform={`rotate(${tilt} 4 -122)`}>
						<circle cx={hx} cy={hy} r={44} fill={col(p, head)} />
						{c.hair && <path d={`M${hx - 44} ${hy - 2} a44 44 0 0 1 70 -34 q-20 10 -30 6 q-14 22 -40 28 z`} fill={col(p, c.hair)} />}
						{c.longHair && <path d={`M${hx - 40} ${hy - 20} q-16 40 -2 76 l22 -6 q-8 -34 8 -60 z`} fill={col(p, c.hair ?? '#3a2a20')} />}
						{!p.rim && <Face cx={hx} cy={hy} side eye={c.eye} blink={c.blink ?? 0} mouth={c.mouth} />}
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
				return <rect key={i} x={f[0] - 16} y={f[1] - 6} width={32} height={14} rx={7} fill={col(p, shoe)} />;
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
					{front && !p.rim && <Face cx={0} cy={hy} side={false} eye={c.eye} blink={c.blink ?? 0} mouth={c.mouth} />}
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
