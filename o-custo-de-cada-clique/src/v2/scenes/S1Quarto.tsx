import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Shot2, T, cam2, sr, useTime, win} from '../time';
import {Char, MAX_LOOK} from '../Char';
import {CityWindow, Cone, Desk, GameScreen, GameOpts, GamerChair, Glow, INK, Monitor, MonitorSide, PhoneBig, Plant, Stage} from '../parts';
import {Title} from '../overlays';

const START = 0;
const END = T.casa;

const RIM = {c: '#a9dcff', dx: 6, dy: -2};

/** Quarto à noite, visto de lado. */
export const RoomNight: React.FC<{t: number; max: Partial<React.ComponentProps<typeof Char>>; phone?: number; clock?: string; mess?: boolean}> = ({
	t,
	max,
	phone = 0,
	clock = '02:00',
	mess = true,
}) => {
	const flick = 0.85 + Math.sin(t * 11) * 0.06 + Math.sin(t * 29) * 0.04;
	return (
		<g>
			<defs>
				<linearGradient id="wallN" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#2a2d5e" />
					<stop offset="1" stopColor="#3a3c78" />
				</linearGradient>
			</defs>
			<rect x={-400} y={0} width={2800} height={1200} fill="url(#wallN)" />
			<rect x={-400} y={180} width={2800} height={60} fill="#1e2048" />
			<rect x={-400} y={872} width={2800} height={300} fill="#23254c" />
			<rect x={-400} y={866} width={2800} height={10} fill="#1a1c3c" />
			{/* janela com cidade e lua */}
			<rect x={505} y={318} width={470} height={315} fill="#4a4a86" />
			<CityWindow x={520} y={332} w={440} h={286} sky={['#2a2a5e', '#5b4b8f']} lit={0.35} seed={7} buildC="#262552" />
			<rect x={736} y={332} width={10} height={286} fill="#4a4a86" />
			<rect x={520} y={470} width={440} height={8} fill="#4a4a86" />
			<rect x={498} y={630} width={484} height={18} fill="#52528f" />
			<polygon points="700,332 770,332 980,872 610,872" fill="url(#beam)" opacity={0.45} />
			{/* cortinas */}
			<rect x={440} y={252} width={600} height={10} rx={5} fill="#1b1c3a" />
			<path d="M450 262 h70 v460 q-35 12 -70 0 z" fill="#4b2f7d" />
			<path d="M960 262 h70 v460 q-35 12 -70 0 z" fill="#4b2f7d" />
			<path d="M470 262 v455 M500 262 v458 M980 262 v455 M1010 262 v458" stroke="#3c2566" strokeWidth={6} />
			{/* quadros */}
			<rect x={120} y={380} width={180} height={240} fill={INK} />
			<rect x={132} y={392} width={156} height={216} fill="#e78a6a" />
			<circle cx={210} cy={500} r={46} fill="#ffcf6b" />
			<rect x={132} y={520} width={156} height={88} fill="#3b2a5c" />
			<rect x={1070} y={380} width={200} height={170} fill={INK} />
			<rect x={1080} y={390} width={180} height={150} fill="#3e5fa6" />
			<path d="M1100 500 q20 -34 50 -36 l40 0 q20 0 44 36 z" fill={INK} />
			<rect x={1080} y={500} width={180} height={40} fill="#e3875e" />
			{/* prateleira, relógio e planta */}
			<rect x={1400} y={540} width={210} height={10} fill="#4a4876" />
			<rect x={1440} y={460} width={120} height={64} rx={6} fill="#0f1120" />
			<text x={1500} y={503} fontFamily="Inter" fontWeight={800} fontSize={30} fill="#d9e8ff" textAnchor="middle">
				{clock}
			</text>
			<rect x={1490} y={524} width={20} height={16} fill="#0f1120" />
			<Plant x={1580} y={506} s={0.6} />
			<rect x={1410} y={500} width={22} height={40} fill="#6a5a8a" />
			{/* porta */}
			<rect x={1690} y={400} width={230} height={472} fill="#2d2f62" />
			<rect x={1710} y={420} width={190} height={452} fill="#26285a" />
			<circle cx={1730} cy={650} r={7} fill="#5a5c96" />
			{/* cama */}
			<rect x={60} y={740} width={360} height={132} rx={10} fill="#3d3a74" />
			<path d="M60 760 q80 -40 180 -10 q100 20 180 -6 v40 h-360 z" fill="#5a4f96" />
			<rect x={40} y={700} width={30} height={172} fill="#2a2850" />
			{/* mesa, PC e bagunça */}
			<Desk x={1150} y={760} w={480} />
			<rect x={1480} y={790} width={90} height={150} rx={6} fill="#151626" />
			<rect x={1490} y={800} width={8} height={130} fill="#7a3cff" opacity={0.6 + 0.3 * flick} />
			{mess && (
				<g>
					<rect x={1210} y={724} width={60} height={36} rx={4} fill="#d4463b" />
					<path d="M1216 724 l6 -26 M1230 724 l2 -30 M1246 724 l-2 -28 M1258 724 l4 -24" stroke="#f2c230" strokeWidth={6} strokeLinecap="round" />
					<rect x={1290} y={730} width={22} height={30} rx={4} fill="#36d27a" />
					<rect x={600} y={850} width={70} height={30} rx={4} fill="#d4463b" transform="rotate(-8 630 860)" />
					<rect x={700} y={858} width={22} height={18} rx={4} fill="#36d27a" transform="rotate(80 711 866)" />
					<path d="M1150 900 q-120 -20 -260 10 q-80 18 -200 0" stroke="#15162a" strokeWidth={6} fill="none" />
				</g>
			)}
			{/* celular na mesa */}
			<g transform={`translate(${1350 + (phone > 0 ? Math.sin(t * 80) * 3 : 0)} 752)`}>
				<rect x={-30} y={-6} width={60} height={10} rx={3} fill="#0d0f1c" />
				{phone > 0 && <Glow x={0} y={-10} r={60} o={0.8} />}
			</g>
			{/* monitor e luz */}
			<MonitorSide x={1480} y={600} h={150} on={flick} />
			<Glow x={1470} y={680} r={260} o={0.35 * flick} />
			<GamerChair x={1000} y={770} />
			<Cone from={[1470, 606, 1470, 744]} to={[1060, 610]} spread={110} o={0.75 * flick} />
			{Array.from({length: 26}, (_, i) => {
				const k = ((t * (0.03 + (i % 5) * 0.01) + i * 0.137) % 1);
				const x = 1460 - k * 380;
				const y = 600 + Math.sin(t * 0.6 + i * 2.1) * (40 + k * 70) + ((i * 37) % 60) - 30;
				return <circle key={i} cx={x} cy={y} r={1.6 + (i % 3) * 0.7} fill="#dff1ff" opacity={0.55 * (1 - Math.abs(k - 0.5) * 1.6)} />;
			})}
			<Char x={1040} y={760} pose="sit" {...MAX_LOOK} armF={[52, 42]} armB={[46, 46]} hold="pad" eye="focus" rim={RIM} {...max} />
			{/* primeiro plano desfocado */}
			<path d="M-80 140 h210 q40 300 -10 600 q-30 160 30 300 h-230 z" fill="#0d0e1e" opacity={0.55} />
			<path d="M-60 140 h170 q40 300 -10 600 q-30 160 30 300 h-190 z" fill="#0d0e1e" opacity={0.85} />
		</g>
	);
};

/** Por cima do ombro: nuca do Max e o monitor. */
export const OverShoulder: React.FC<{t: number; game: GameOpts; hairGrey?: boolean; three?: boolean}> = ({t, game, hairGrey, three}) => (
	<g>
		<defs>
			<linearGradient id="wallO" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#2d3066" />
				<stop offset="1" stopColor="#454784" />
			</linearGradient>
		</defs>
		<rect x={-200} y={-200} width={2400} height={1500} fill="url(#wallO)" />
		<Glow x={960} y={560} r={620} o={0.28} />
		<rect x={1640} y={150} width={260} height={380} fill={INK} />
		<rect x={1652} y={162} width={236} height={356} fill="#6b4f8a" />
		<path d="M1652 400 q30 -30 60 0 q30 -30 60 0 q30 -30 60 0 q30 -30 56 0 v118 h-236 z" fill="#2c2350" />
		<circle cx={1840} cy={230} r={40} fill="#f2a76b" />
		<rect x={-200} y={850} width={2400} height={500} fill="#5d5878" />
		<rect x={-200} y={850} width={2400} height={16} fill="#6e6990" />
		{three && <Monitor x={70} y={420} w={500}><GameScreen {...game} t={game.t + 30} money="SETOR 7" banner={undefined} /></Monitor>}
		{three && <Monitor x={1350} y={420} w={500}><GameScreen {...game} t={game.t + 70} money="ALVOS 3" banner={undefined} /></Monitor>}
		<Monitor x={600} y={380} w={720}>
			<GameScreen {...game} />
		</Monitor>
		{/* luminária */}
		<path d="M1500 860 h90 M1545 860 l-30 -190 l-90 -60" stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
		<path d="M1400 590 l60 -40 l20 80 z" fill={INK} />
		<rect x={1350} y={790} width={70} height={70} rx={10} fill={INK} />
		<Char x={250} y={1220} scale={2.5} view="back" pose="stand" {...MAX_LOOK} headphones hair={hairGrey ? '#c9c4d6' : undefined} armF={[25, -20]} armB={[25, -20]} rim={{c: '#a9dcff', dx: 8, dy: 0}} />
		<rect x={380} y={820} width={170} height={64} rx={30} fill="#262a3d" transform={`rotate(-6 465 850) translate(0 ${Math.sin(t * 9) * 2})`} />
	</g>
);

/** Celular sobre a mesa em close. */
export const PhoneDesk: React.FC<React.ComponentProps<typeof PhoneBig> & {night?: boolean}> = ({night = true, ...p}) => (
	<g>
		<rect x={-200} y={-200} width={2400} height={1500} fill={night ? '#3d3a63' : '#8b7a63'} />
		{Array.from({length: 9}, (_, i) => (
			<path key={i} d={`M-200 ${i * 160} q900 40 2400 -20`} stroke={night ? '#47446f' : '#9a8870'} strokeWidth={6} fill="none" />
		))}
		<Glow x={1500} y={300} r={900} o={night ? 0.25 : 0.1} />
		<rect x={1200} y={-100} width={900} height={260} rx={30} fill="#1a1b2c" transform="rotate(-8 1600 30)" />
		<rect x={150} y={760} width={260} height={160} rx={16} fill="#d4463b" transform="rotate(14 280 840)" />
		<rect x={1450} y={700} width={110} height={110} rx={55} fill="#36d27a" />
		<PhoneBig {...p} />
	</g>
);

const shots: Shot2[] = [
	{at: 0, a: {x: 960, y: 560, s: 1}, b: {x: 1000, y: 580, s: 1.12}, ease: 'smooth'},
	{at: 7.2, a: {x: 1120, y: 600, s: 1.45}, b: {x: 1170, y: 610, s: 1.7}},
	{at: T.missao, a: {x: 960, y: 560, s: 1.0}, b: {x: 960, y: 580, s: 1.08}},
	{at: T.vibra, a: {x: 960, y: 540, s: 1.0}, b: {x: 960, y: 540, s: 1.12}},
	{at: T.jaqueta, a: {x: 1100, y: 590, s: 2.0}, b: {x: 1110, y: 590, s: 2.15}},
	{at: 38.3, a: {x: 960, y: 560, s: 1.05}, b: {x: 960, y: 560, s: 1.12}},
	{at: T.compra - 0.3, a: {x: 960, y: 540, s: 1.05}, b: {x: 960, y: 540, s: 1.15}},
	{at: 46.6, a: {x: 1080, y: 590, s: 2.6}, b: {x: 1085, y: 595, s: 3.0}},
	{at: T.carro, a: {x: 960, y: 540, s: 1.0}, b: {x: 960, y: 540, s: 1.06}},
	{at: T.eraReal - 0.4, a: {x: 960, y: 540, s: 1.1}, b: {x: 960, y: 540, s: 1.25}},
];

export const S1Quarto: React.FC = () => {
	const t = useTime(START);
	const {index, transform} = cam2(t, shots, END);
	const flick = 0.9 + Math.sin(t * 11) * 0.05;

	let money = '$ 312';
	if (t > T.missao + 0.5) money = '$ 25.312';
	if (t > 41) money = '$ 20.812';
	const blink = (t % 3.7) < 0.12 ? 1 : 0;
	const laugh = t > T.jaqueta && t < T.jaqueta + 3;
	const glance = (t > T.vibra && t < T.jaqueta) || t > 59;

	const layout =
		index === 2 || index === 5 ? 'shoulder' : index === 3 || index === 6 || index === 9 ? 'phone' : index === 8 ? 'game' : 'room';

	const phoneProps =
		index === 3
			? {
					buzz: t < T.vibra + 1.4 || (t > T.pix - 0.3 && t < T.pix + 1) ? t : 0,
					on: t > T.vibra + 0.2 ? 1 : 0.2,
					app: t > T.pix ? 'Banco' : undefined,
					title: t > T.pix ? 'Pix recebido' : undefined,
					body: t > T.pix ? 'R$ 25.000,00 · Metrópole Zero' : undefined,
					big: t > T.pix ? '+ R$ 25.000,00' : undefined,
					bigColor: '#5dff9b',
				}
			: index === 6
				? {buzz: t < T.compra + 1 ? t : 0, on: 1, app: 'Banco', title: 'Compra aprovada', body: 'Metrópole Zero · jaqueta', color: '#e5484d', big: '− R$ 4.500,00', bigColor: '#ff8080'}
				: {buzz: t < T.eraReal + 0.8 ? t : 0, on: 1, app: 'Banco', title: 'Compra aprovada', body: 'Metrópole Zero · carro', color: '#e5484d', big: '− R$ 1.200.000,00', bigColor: '#ff8080'};

	const game: GameOpts =
		index === 2
			? {t, money, banner: t > T.missao + 0.5 ? 'MISSÃO CONCLUÍDA' : undefined, bannerSub: '+ $ 25.000'}
			: index === 5
				? {t, money, mode: 'jacket', banner: t > 40.6 ? 'COMPRADO' : undefined, bannerColor: '#5dff9b'}
				: {t, money: '$ 20.812', mode: 'car', banner: t > 57.4 ? 'CARRO ESPORTIVO · COMPRADO' : 'CONCESSIONÁRIA', bannerSub: t > 57.4 ? '− $ 1.200.000' : '$ 1.200.000', bannerColor: t > 57.4 ? '#5dff9b' : '#ffd34d'};

	return (
		<AbsoluteFill>
			<Stage bg="#1d1f45" cam={transform}>
				{layout === 'room' && (
					<RoomNight
						t={t}
						phone={t > T.vibra - 0.5 && t < T.vibra ? 1 : 0}
						max={{
							blink,
							eye: index === 7 ? (t > T.bug ? 'shock' : 'wide') : laugh ? 'happy' : index === 1 && t > 16 ? 'angry' : 'focus',
							mouth: laugh ? 'grin' : index === 7 ? (t > T.bug && t < 53 ? (Math.sin(t * 16) > 0 ? 'o' : 'flat') : 'flat') : 'flat',
							headTilt: laugh ? Math.sin(t * 20) * 3 : glance ? 12 : 0,
							armF: [52 + Math.sin(t * 13) * 2, 42],
						}}
					/>
				)}
				{layout === 'shoulder' && <OverShoulder t={t} game={game} />}
				{layout === "phone" && <PhoneDesk x={960} y={545} s={0.95} rot={-8} {...phoneProps} />}
				{layout === 'game' && (
					<g>
						<rect x={-100} y={-100} width={2200} height={1300} fill="#0b0d18" />
						<rect x={226} y={128} width={1468} height={826} rx={26} fill="#22243a" />
						<g transform="translate(240 142) scale(0.9)">
							<svg width={1600} height={900} viewBox="0 0 1600 900">
								<GameScreen {...game} />
							</svg>
						</g>
					</g>
				)}
			</Stage>
			<Title t={t} a={T.title} b={7.0} text="O CUSTO DE CADA CLIQUE" sub="UM CURTA-METRAGEM" />
			<AbsoluteFill style={{background: '#000', opacity: Math.max(1 - sr(t, 0.3, 2.2), sr(t, END - 0.5, END)) * (1 - flick * 0)}} />
			<AbsoluteFill style={{background: '#000', opacity: index === 0 ? 0.35 * win(t, T.title, 7.0, 0.8) : 0}} />
		</AbsoluteFill>
	);
};
