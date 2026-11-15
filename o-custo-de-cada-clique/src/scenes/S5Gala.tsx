import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {CameraRig, Shot, T, lerp, rng, shotCam, sr, useCanvasTexture, useTime} from '../lib';
import {Penthouse, BattleStation} from '../components/Penthouse';
import {CENTER_MON, FACE_A, FACE_B, FACE_LOOK, MaxAtDesk, Monitors} from '../components/Station';
import {Box, Screen} from '../components/Props';
import {Person} from '../components/Person';
import {Caption} from '../components/Overlays';

const START = T.cena5;
const END = T.cena6;
const POSTIT: [number, number, number] = [0.5, 1.07, -1.43];
const TV: [number, number, number] = [-7.92, 1.9, 0.6];

const shots: Shot[] = [
	{at: START, p: [FACE_A, FACE_B], l: [FACE_LOOK, FACE_LOOK], fov: 40},
	{at: T.festa, p: [[5.2, 1.8, 4.8], [2.6, 1.7, 3.6]], l: [[0, 1.3, 0.5], [-1, 1.3, 0.2]], fov: 42},
	{at: 236.6, p: [[-1.0, 1.65, 4.6], [-1.6, 1.62, 4.3]], l: [[-2.6, 1.6, 2.6], [-2.8, 1.6, 2.4]], fov: 38},
	{at: T.documentario, p: [[-6.2, 1.85, 1.4], [-6.5, 1.88, 1.05]], l: [TV, TV], fov: 46},
	{at: T.saldo, p: [[0.4, 1.48, -0.25], [0.25, 1.42, -0.6]], l: [CENTER_MON, CENTER_MON], fov: 42},
	{at: T.postit, p: [[0.78, 1.15, -0.95], [0.68, 1.1, -1.08]], l: [POSTIT, POSTIT], fov: 36},
	{at: 263.0, p: [FACE_B, FACE_A], l: [FACE_LOOK, FACE_LOOK], fov: 38},
	{at: T.desliga - 0.6, p: [[0, 2.8, -3.4], [0, 2.9, -4.1]], l: [[0, 1.35, -0.3], [0, 1.35, -0.3]], fov: 40},
];

/** Convidados contratados: dançam todos no mesmo compasso, com crachás. */
const Guests: React.FC<{t: number; freeze: number}> = ({t, freeze}) => {
	const gs = useMemo(() => {
		const g = rng(91);
		const colors = ['#1a1a1a', '#6b1d2a', '#1d2a6b', '#2b2b2b', '#5a4a1d', '#3d1d5a'];
		return Array.from({length: 22}, (_, i) => {
			let x = -5.0 + g() * 11.5;
			const z = 0.8 + g() * 3.0;
			if (Math.abs(x) < 1.4 && z < 2.2) x += x < 0 ? -1.6 : 1.6;
			return {x, z, ry: g() * Math.PI * 2, c: colors[i % colors.length], dress: g() > 0.5, hair: g() > 0.5 ? '#2a1d14' : '#c9a55a', ph: 0};
		});
	}, []);
	const tt = lerp(t, T.desliga, freeze);
	const beat = Math.sin(tt * 6.6);
	return (
		<group>
			{gs.map((p, i) => (
				<group key={i}>
					<Person
						position={[p.x, Math.abs(beat) * 0.04, p.z]}
						rotationY={p.ry}
						shirt={p.c}
						dress={p.dress}
						hair={p.hair}
						hairLen={p.dress ? 0.6 : 0}
						badge
						smile={1}
						armR={1.4 + beat * 0.1}
						armRSide={-0.2}
						armL={0.2 + beat * 0.25}
						headTilt={beat * 0.05}
					/>
					{/* taça */}
					<mesh position={[p.x + Math.cos(p.ry) * 0.2, 1.45, p.z - Math.sin(p.ry) * 0.2]}>
						<coneGeometry args={[0.04, 0.12, 12, 1, true]} />
						<meshStandardMaterial color="#f5e7a8" transparent opacity={0.8} side={2} />
					</mesh>
				</group>
			))}
		</group>
	);
};

const PostIt: React.FC = () => {
	const tex = useCanvasTexture(
		256,
		256,
		(ctx, w, h) => {
			ctx.fillStyle = '#f6e27a';
			ctx.fillRect(0, 0, w, h);
			ctx.fillStyle = '#e3c95a';
			ctx.fillRect(0, 0, w, 22);
			ctx.fillStyle = '#1b2a6b';
			ctx.font = 'italic 38px "DejaVu Serif", serif';
			ctx.textAlign = 'center';
			ctx.fillText('Parar no', w / 2, 100);
			ctx.fillText('primeiro', w / 2, 150);
			ctx.fillText('bilhão', w / 2, 200);
			ctx.strokeStyle = '#1b2a6b';
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(60, 214);
			ctx.lineTo(196, 210);
			ctx.stroke();
		},
		1,
	);
	return (
		<mesh position={POSTIT} rotation={[0, 0, -0.08]}>
			<planeGeometry args={[0.16, 0.16]} />
			<meshStandardMaterial map={tex} roughness={0.9} emissive="#f6e27a" emissiveIntensity={0.15} />
		</mesh>
	);
};

const drawBalance = (t: number) => (ctx: CanvasRenderingContext2D, w: number, h: number) => {
	ctx.fillStyle = '#04110b';
	ctx.fillRect(0, 0, w, h);
	ctx.strokeStyle = '#0f3a26';
	for (let x = 0; x < w; x += 32) {
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, h);
		ctx.stroke();
	}
	ctx.textAlign = 'center';
	ctx.fillStyle = '#7CFFB2';
	ctx.font = `600 ${Math.round(h * 0.06)}px "JetBrains Mono", monospace`;
	ctx.fillText('METRÓPOLE ZERO · SALDO TOTAL', w / 2, h * 0.3);
	ctx.font = `800 ${Math.round(h * 0.12)}px "JetBrains Mono", monospace`;
	ctx.shadowColor = '#7CFFB2';
	ctx.shadowBlur = 20;
	ctx.fillText('US$ 100.000.000.000', w / 2, h * 0.55);
	ctx.shadowBlur = 0;
	ctx.font = `500 ${Math.round(h * 0.05)}px "JetBrains Mono", monospace`;
	ctx.fillStyle = '#3da874';
	ctx.fillText(`sessão ativa: 15 anos · ${Math.floor(t * 7) % 60} min`, w / 2, h * 0.75);
};

const drawDoc = (t: number) => (ctx: CanvasRenderingContext2D, w: number, h: number) => {
	const g = ctx.createLinearGradient(0, 0, 0, h);
	g.addColorStop(0, '#5a5a5a');
	g.addColorStop(1, '#1e1e1e');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, w, h);
	// silhueta de um velho numa poltrona gigante, num salão vazio
	ctx.fillStyle = '#0c0c0c';
	ctx.fillRect(w * 0.38, h * 0.3, w * 0.24, h * 0.55);
	ctx.beginPath();
	ctx.arc(w * 0.5, h * 0.45, h * 0.07, 0, Math.PI * 2);
	ctx.fillStyle = '#2a2a2a';
	ctx.fill();
	ctx.fillStyle = '#2a2a2a';
	ctx.fillRect(w * 0.45, h * 0.52, w * 0.1, h * 0.25);
	ctx.fillStyle = '#000000aa';
	ctx.fillRect(0, h * 0.82, w, h * 0.18);
	ctx.fillStyle = '#eeeeee';
	ctx.textAlign = 'center';
	ctx.font = `italic ${Math.round(h * 0.06)}px "DejaVu Serif", serif`;
	ctx.fillText('“Morreu com tudo. E sozinho.”', w / 2, h * 0.92);
	// película antiga
	const r = rng(Math.floor(t * 12));
	ctx.fillStyle = '#ffffff22';
	for (let i = 0; i < 40; i++) ctx.fillRect(r() * w, r() * h, 2, 2);
	ctx.fillRect(r() * w, 0, 1, h);
};

export const S5Gala: React.FC = () => {
	const t = useTime(START);
	const cam = shotCam(t, shots, END);
	const off = sr(t, T.desliga, T.desliga + 0.15);
	const partyLights = 1 - sr(t, T.desliga, T.desliga + 1.5) * 0.8;

	return (
		<AbsoluteFill style={{background: '#000'}}>
			<ThreeCanvas width={1920} height={1080} gl={{antialias: false, powerPreference: "high-performance"}}>
				<CameraRig pos={cam.pos} look={cam.look} fov={cam.fov} />
				<Penthouse skyTop="#02040c" skyBottom="#1d1430" cityLit={1} ambient={0.25 * partyLights + 0.05} ambientColor="#b08ad0">
					<pointLight position={[0, 2.4, -2.6]} intensity={4} distance={6} color="#6a7cb8" />
					{/* luzes da festa */}
					<pointLight position={[Math.sin(t) * 4, 3.4, 2.5]} intensity={8 * partyLights} distance={9} color="#c45cff" />
					<pointLight position={[Math.cos(t * 0.8) * 4, 3.4, 3.5]} intensity={8 * partyLights} distance={9} color="#ffb04a" />
					<pointLight position={[0, 3.6, 4.5]} intensity={5 * partyLights} distance={8} color="#ffffff" />
					{/* lustre */}
					<mesh position={[0, 3.6, 3]}>
						<octahedronGeometry args={[0.45, 1]} />
						<meshStandardMaterial color="#fff6dc" emissive="#ffe7a8" emissiveIntensity={1.2 * partyLights} metalness={0.8} roughness={0.1} />
					</mesh>
					<Guests t={t} freeze={sr(t, T.desliga, T.desliga + 0.4)} />
					<BattleStation />
					<Monitors t={t} on={1 - off} k={Math.floor(t * 8)} draw={drawBalance(t)} />
					<PostIt />
					{/* TV com documentário */}
					<Screen p={TV} r={[0, Math.PI / 2, 0]} w={2.2} h={1.24} draw={drawDoc(t)} k={Math.floor(t * 12)} on={0.9 * partyLights + 0.1} />
					<Box p={[-7.7, 0.4, 0.6]} s={[0.5, 0.8, 2.4]} c="#151515" />
					<MaxAtDesk
						t={t}
						typing={1 - sr(t, T.desliga - 0.8, T.desliga) * 0.8}
						hair="#9a958f"
						hairLen={0.3}
						skin="#cfae98"
						shirt="#1d1e22"
						hood={false}
						lean={0.28}
						headTilt={0.04}
						glow={off > 0.5 ? '#000000' : '#2fbf7d'}
					/>
				</Penthouse>
			</ThreeCanvas>
			<Caption t={t} a={START + 0.6} b={T.festa - 0.5} text="15 anos depois" />
			<AbsoluteFill style={{background: 'black', opacity: Math.max(1 - sr(t, START, START + 1), sr(t, END - 1.2, END))}} />
		</AbsoluteFill>
	);
};
