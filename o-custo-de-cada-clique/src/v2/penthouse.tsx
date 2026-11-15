import React from 'react';
import {Char, CharProps} from './Char';
import {Cone, Desk, GameScreen, GameOpts, GamerChair, Glow, INK, Monitor, MonitorSide, Skyline} from './parts';
import {rng} from './time';

type MaxMode = 'chair' | 'window' | 'sofa' | 'none';

const MAXC = {shirt: '#f08a3c', shirtDark: '#c96a26', pants: '#3b4a6b', hood: true};

/** Partículas das estações (neve, pétalas, folhas) do lado de fora. */
export const Particles: React.FC<{t: number; color: string; r: number; on?: number; area?: [number, number, number, number]}> = ({
	t,
	color,
	r,
	on = 1,
	area = [120, 1800, 160, 760],
}) => {
	if (on <= 0) return null;
	const g = rng(9);
	const [x0, x1, y0, y1] = area;
	return (
		<g opacity={on}>
			{Array.from({length: 90}, (_, i) => {
				const x = x0 + g() * (x1 - x0) + Math.sin(t * 1.4 + i) * 14;
				const sp = 40 + g() * 60;
				const y = y0 + ((((g() * (y1 - y0) + t * sp) % (y1 - y0)) + (y1 - y0)) % (y1 - y0));
				return <circle key={i} cx={x} cy={y} r={r * (0.6 + g() * 0.8)} fill={color} />;
			})}
		</g>
	);
};

export type PenthouseProps = {
	t: number;
	sky: [string, string];
	lit?: number;
	monOn?: number;
	game?: GameOpts;
	screen?: React.ReactNode; // conteúdo alternativo da tela central
	max?: MaxMode;
	maxProps?: Partial<CharProps>;
	party?: number; // 0..1 intensidade da festa
	freeze?: number;
	particles?: {color: string; r: number};
	bars?: number;
	sun?: number; // 0..1 sol nascendo
	cans?: number;
	room?: string;
};

/** Cobertura vista de trás do Max: janela panorâmica, três monitores, cidade. */
export const PenthouseBack: React.FC<PenthouseProps> = ({
	t,
	sky,
	lit = 0.35,
	monOn = 1,
	game,
	screen,
	max = 'chair',
	maxProps,
	party = 0,
	freeze = 0,
	particles,
	bars = 0,
	sun,
	cans = 0,
	room = '#272a55',
}) => {
	const tt = freeze > 0 ? t - (t % 1000) * 0 : t;
	const beat = Math.sin((freeze > 0.5 ? 0 : tt) * 6.5);
	const g = rng(31);
	const guests = Array.from({length: 14}, (_, i) => ({
		x: [160, 330, 470, 1450, 1600, 1760, 250, 1680, 620, 1320, 90, 1850, 400, 1530][i],
		y: [930, 960, 905, 920, 960, 905, 1010, 1010, 980, 985, 980, 980, 1040, 1045][i],
		c: ['#7a2a3a', '#2a3a7a', '#3a2a5a', '#1d1f2e', '#5a3a2a', '#7a2a3a', '#2a5a4a', '#3a2a5a', '#1d1f2e', '#5a2a5a', '#2a3a7a', '#7a2a3a', '#1d1f2e', '#2a5a4a'][i],
		dress: g() > 0.5,
		hair: g() > 0.7 ? '#b98a4a' : g() > 0.4 ? '#2e2018' : undefined,
	}));
	return (
		<g>
			<defs>
				<linearGradient id="pSky" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={sky[0]} />
					<stop offset="1" stopColor={sky[1]} />
				</linearGradient>
				<linearGradient id="pFloor" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#1f2147" />
					<stop offset="1" stopColor="#14152e" />
				</linearGradient>
			</defs>
			<rect x={-300} y={-200} width={2520} height={1500} fill={room} />
			{/* janela panorâmica */}
			<rect x={60} y={150} width={1800} height={640} fill="url(#pSky)" />
			{sun !== undefined && <circle cx={960} cy={760 - sun * 380} r={70} fill="#ffe3a6" />}
			{sun !== undefined && <Glow x={960} y={760 - sun * 380} r={500} o={sun * 0.6} warm />}
			{sun === undefined && <circle cx={1500} cy={260} r={30} fill="#f3f0ff" opacity={1 - Math.min(1, lit)} />}
			<Skyline x={60} y={790} w={1800} h={420} seed={12} c="#232250" win="#ffcf7a" lit={lit} n={14} />
			<Skyline x={60} y={790} w={1800} h={260} seed={44} c="#1b1a40" win="#ffd99a" lit={lit * 0.8} n={11} />
			{particles && <Particles t={t} color={particles.color} r={particles.r} area={[70, 1850, 150, 790]} />}
			{Array.from({length: 9}, (_, i) => (
				<rect key={i} x={60 + i * 225 - 6} y={150} width={12} height={640} fill="#141530" />
			))}
			<rect x={50} y={140} width={1820} height={16} fill="#141530" />
			<rect x={50} y={784} width={1820} height={16} fill="#141530" />
			{/* chão com reflexo */}
			<rect x={-300} y={800} width={2520} height={500} fill="url(#pFloor)" />
			<rect x={60} y={810} width={1800} height={120} fill="url(#pSky)" opacity={0.12} />
			{/* luminária pendente / lustre */}
			{party > 0 ? (
				<g>
					<path d="M960 0 v120" stroke="#c9a85a" strokeWidth={4} />
					<polygon points="900,120 1020,120 990,190 930,190" fill="#ffe7a8" />
					<Glow x={960} y={170} r={420} o={0.5 * party} warm />
					<Glow x={400 + Math.sin(t) * 200} y={300} r={380} o={0.35 * party} />
					<circle cx={1500 + Math.cos(t * 0.8) * 200} cy={320} r={360} fill="#c45cff" opacity={0.18 * party} />
				</g>
			) : null}
			{/* sofá */}
			<rect x={120} y={820} width={360} height={110} rx={26} fill="#3a2f4e" />
			<rect x={120} y={780} width={360} height={70} rx={26} fill="#47395f" />
			{/* mesa e três monitores */}
			<Desk x={520} y={820} w={880} c="#2c2b4a" leg="#1b1b30" />
			{Array.from({length: Math.min(12, cans)}, (_, i) => (
				<rect key={i} x={560 + (i % 6) * 26} y={792 - Math.floor(i / 6) * 30} width={18} height={28} rx={4} fill="#36d27a" />
			))}
			<Glow x={960} y={620} r={520} o={0.4 * monOn} />
			<Monitor x={560} y={500} w={250} on={monOn}>
				{game && <GameScreen {...game} t={game.t + 30} money="SETOR 7" banner={undefined} />}
			</Monitor>
			<Monitor x={835} y={470} w={250} on={monOn}>
				{screen ?? (game && <GameScreen {...game} />)}
			</Monitor>
			<Monitor x={1110} y={500} w={250} on={monOn}>
				{game && <GameScreen {...game} t={game.t + 70} money="ALVOS 3" banner={undefined} />}
			</Monitor>
			{/* convidados */}
			{party > 0 &&
				guests.map((q, i) => (
					<Char
						key={i}
						x={q.x}
						y={q.y - Math.abs(beat) * 8}
						scale={0.95}
						view="front"
						shirt={q.c}
						pants="#1b1c2a"
						dress={q.dress}
						hair={q.hair}
						longHair={q.dress}
						badge
						tie={!q.dress}
						eye="open"
						mouth="smile"
						armF={[18 + beat * 6, -110]}
						armB={[12 - beat * 6, 0]}
						hold="glass"
						headTilt={beat * 4}
						rim={{c: '#ffd9a8', dx: -4, dy: -3, o: 0.7}}
					/>
				))}
			{/* Max */}
			{max === 'chair' && (
				<g>
					<rect x={872} y={640} width={176} height={320} rx={40} fill="#1d1e33" />
					<rect x={892} y={660} width={22} height={260} rx={10} fill="#c0392b" />
					<Char x={960} y={960} scale={1.5} view="back" pose="sit" {...MAXC} headphones armF={[30, -40]} armB={[30, -40]} rim={{c: '#a9dcff', dx: 0, dy: -6, o: monOn}} {...maxProps} />
				</g>
			)}
			{max === 'window' && <Char x={1000} y={760} scale={0.9} view="back" pose="stand" {...MAXC} armF={[4, 0]} armB={[4, 0]} {...maxProps} />}
			{max === 'sofa' && <Char x={300} y={850} scale={0.85} view="front" pose="sit" {...MAXC} eye="sad" headTilt={8} armF={[6, -30]} armB={[6, -30]} {...maxProps} />}
			{/* grades (prisão) */}
			{bars > 0 && (
				<g opacity={bars}>
					{Array.from({length: 14}, (_, i) => (
						<rect key={i} x={-200 + i * 170} y={-300} width={34} height={1700} fill="#0b0c1a" />
					))}
					<rect x={-300} y={-60} width={2520} height={40} fill="#0b0c1a" />
					<rect x={-300} y={1120} width={2520} height={40} fill="#0b0c1a" />
				</g>
			)}
		</g>
	);
};

/** Cobertura de lado: Max na cadeira de frente para o monitor (à direita). */
export const PenthouseSide: React.FC<{
	t: number;
	sky: [string, string];
	lit?: number;
	monOn?: number;
	max?: Partial<CharProps>;
	phone?: number;
	phoneColor?: string;
	sunlight?: number;
	postit?: boolean;
	room?: string;
}> = ({t, sky, lit = 0.35, monOn = 1, max, phone = 0, phoneColor = '#8fd3ff', sunlight = 0, postit, room = '#2a2d5e'}) => {
	const flick = monOn * (0.88 + Math.sin(t * 11) * 0.06);
	return (
		<g>
			<defs>
				<linearGradient id="psSky" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={sky[0]} />
					<stop offset="1" stopColor={sky[1]} />
				</linearGradient>
			</defs>
			<rect x={-300} y={-200} width={2520} height={1500} fill={room} />
			<rect x={-100} y={150} width={1300} height={720} fill="url(#psSky)" />
			<Skyline x={-100} y={870} w={1300} h={520} seed={5} c="#232250" win="#ffcf7a" lit={lit} n={9} />
			{[150, 450, 750, 1050].map((x) => (
				<rect key={x} x={x} y={150} width={14} height={720} fill="#141530" />
			))}
			<rect x={-100} y={140} width={1320} height={16} fill="#141530" />
			{sunlight > 0 && <polygon points="1200,150 1200,870 1700,1100 1700,600" fill="#ffd9a0" opacity={0.25 * sunlight} />}
			<rect x={-300} y={870} width={2520} height={400} fill="#1c1e42" />
			<Desk x={1260} y={770} w={520} c="#2c2b4a" leg="#1b1b30" />
			<rect x={1330} y={738} width={22} height={32} rx={4} fill="#36d27a" />
			<rect x={1360} y={738} width={22} height={32} rx={4} fill="#36d27a" />
			<g transform={`translate(${1460 + (phone > 0 ? Math.sin(t * 80) * 3 : 0)} 764)`}>
				<rect x={-30} y={-6} width={60} height={10} rx={3} fill="#0d0f1c" />
				{phone > 0 && <Glow x={0} y={-10} r={80} o={phone} />}
				{phone > 0 && <circle cx={0} cy={-4} r={6} fill={phoneColor} />}
			</g>
			<MonitorSide x={1650} y={560} h={200} on={flick} />
			{postit && <rect x={1630} y={720} width={30} height={30} fill="#f6e27a" transform="rotate(-6 1645 735)" />}
			<Glow x={1640} y={660} r={320} o={0.4 * flick} />
			<GamerChair x={1110} y={780} />
			<Cone from={[1638, 566, 1638, 754]} to={[1190, 620]} spread={120} o={0.8 * flick} />
			<Char x={1150} y={770} pose="sit" {...MAXC} headphones armF={[52, 42]} armB={[46, 46]} hold="pad" eye="focus" rim={{c: '#a9dcff', dx: 6, dy: -2, o: Math.max(0.15, monOn)}} {...max} />
		</g>
	);
};
