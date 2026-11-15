import React, {useMemo} from 'react';
import * as THREE from 'three';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {CameraRig, Shot, T, lerp, rng, shotCam, sr, useCanvasTexture, useTime} from '../lib';
import {Box, SkyDome} from '../components/Props';
import {Person} from '../components/Person';
import {Title} from '../components/Overlays';

const START = T.cena6;
const END = T.end;

const DUDA: [number, number, number] = [3.0, 0, -5.4];
const ENTRY: [number, number, number] = [0.3, 0, -5.0];
const SEAT: [number, number, number] = [1.9, 0, -3.7];

const shots: Shot[] = [
	{at: START, p: [[-11.5, 1.5, 5.2], [-5.5, 1.5, 5.2]], l: [[-13, 1.2, 1], [-7, 1.2, 1]], fov: 40},
	{at: 279.2, p: [[-6.5, 1.3, 4.2], [-6.5, 1.2, 4.2]], l: [[-8, 1.5, 0], [-40, 14, -70]], fov: 46},
	{at: T.campo, p: [[-3.2, 2.3, -0.6], [-1.6, 2.0, -2.2]], l: [[7, 0.8, -8], [7, 0.9, -8]], fov: 44},
	{at: T.jogoPara, p: [[9.5, 1.6, -10.5], [9.0, 1.6, -10.0]], l: [[0.5, 1.3, -5], [0.5, 1.3, -5]], fov: 34},
	{at: T.duda, p: [[0.9, 1.68, -4.6], [1.05, 1.66, -4.75]], l: [[3.0, 1.55, -5.4], [3.0, 1.58, -5.4]], fov: 42},
	{at: T.lugar, p: [[1.45, 1.66, -4.9], [1.6, 1.66, -4.95]], l: [[3.0, 1.62, -5.4], [3.0, 1.62, -5.4]], fov: 44},
	{at: T.chora, p: [[3.5, 1.05, -5.3], [3.25, 0.98, -5.05]], l: [[1.9, 0.6, -3.7], [1.9, 0.55, -3.7]], fov: 42},
	{at: T.ceu, p: [[3.3, 1.2, -5.2], [6.0, 16, -12]], l: [[1.9, 0.5, -3.7], [-25, 30, -70]], fov: 44},
];

const ChainLink: React.FC<{p: [number, number, number]; len: number; ry: number}> = ({p, len, ry}) => {
	const tex = useCanvasTexture(
		64,
		64,
		(ctx, w, h) => {
			ctx.clearRect(0, 0, w, h);
			ctx.strokeStyle = '#8a5a3a';
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(0, h / 2);
			ctx.lineTo(w / 2, 0);
			ctx.lineTo(w, h / 2);
			ctx.lineTo(w / 2, h);
			ctx.closePath();
			ctx.stroke();
		},
		1,
	);
	const t2 = useMemo(() => {
		const c = tex.clone();
		c.wrapS = c.wrapT = THREE.RepeatWrapping;
		c.repeat.set(len * 4, 8);
		c.needsUpdate = true;
		return c;
	}, [tex, len]);
	return (
		<group position={p} rotation={[0, ry, 0]}>
			<mesh position={[0, 1.0, 0]}>
				<planeGeometry args={[len, 2]} />
				<meshStandardMaterial map={t2} transparent alphaTest={0.3} side={2} color="#b0703f" roughness={0.9} />
			</mesh>
			{Array.from({length: Math.floor(len / 2.5) + 1}, (_, i) => (
				<mesh key={i} position={[-len / 2 + i * 2.5, 1.05, 0]}>
					<cylinderGeometry args={[0.035, 0.035, 2.1, 8]} />
					<meshStandardMaterial color="#6e4a33" metalness={0.5} roughness={0.7} />
				</mesh>
			))}
			<mesh position={[0, 2.05, 0]} rotation={[0, 0, Math.PI / 2]}>
				<cylinderGeometry args={[0.025, 0.025, len, 6]} />
				<meshStandardMaterial color="#6e4a33" metalness={0.5} roughness={0.7} />
			</mesh>
		</group>
	);
};

const House: React.FC<{p: [number, number, number]; c: string; w?: number}> = ({p, c, w = 4}) => (
	<group position={p}>
		<Box p={[0, 1.4, 0]} s={[w, 2.8, 4]} c={c} />
		<mesh position={[0, 3.4, 0]} rotation={[0, Math.PI / 4, 0]} scale={[w / 4, 1, 1]}>
			<coneGeometry args={[3.1, 1.3, 4]} />
			<meshStandardMaterial color="#8c3b2a" roughness={0.9} />
		</mesh>
		<Box p={[-w / 4, 1.5, 2.02]} s={[0.9, 0.8, 0.04]} c="#ffe1a8" e="#ffcf7a" ei={0.5} />
		<Box p={[w / 4, 1.0, 2.02]} s={[0.8, 2.0, 0.04]} c="#5a3a26" />
	</group>
);

const FRIENDS = [
	{c: '#d63b3b', h: '#1c1612'},
	{c: '#f2c230', h: '#3a2a1a'},
	{c: '#2f7dd6', h: '#121212'},
	{c: '#2fb36b', h: '#6b4a2a'},
];

export const S6Campo: React.FC = () => {
	const t = useTime(START);
	const cam = shotCam(t, shots, END);

	// Max caminhando pela rua até o campo
	const walk1 = sr(t, START, T.campo + 1);
	const walk2 = sr(t, T.campo + 1, 291);
	const walk3 = sr(t, 307.0, 308.6);
	let mx = lerp(-13, -1.0, walk1);
	let mz = 1.0;
	if (t > T.campo + 1) {
		mx = lerp(-1.0, ENTRY[0], walk2);
		mz = lerp(1.0, ENTRY[2], walk2);
	}
	if (t > 307.0) {
		mx = lerp(ENTRY[0], SEAT[0], walk3);
		mz = lerp(ENTRY[2], SEAT[2], walk3);
	}
	const moving = (t < T.campo + 1 && walk1 < 1) || (t > T.campo + 1 && walk2 < 1 && walk2 > 0) || (walk3 > 0 && walk3 < 1);
	const mRot = t < T.campo + 1 ? Math.PI / 2 : t < 307 ? lerp(Math.PI * 0.95, Math.PI / 2, sr(t, 290, 291.5)) : Math.PI * 0.75;
	const sitting = t > 308.4;

	// pelada: amigos correm em volta; a bola passa de pé em pé
	const stop = sr(t, T.jogoPara, T.jogoPara + 1.2);
	const tt = lerp(t, T.jogoPara, stop);
	const players = FRIENDS.map((f, i) => {
		const a = tt * 0.7 + i * (Math.PI / 2);
		return {
			...f,
			x: 7.5 + Math.cos(a) * 3.2,
			z: -8.5 + Math.sin(a * 1.3) * 2.6,
			dir: a,
		};
	});
	const seg = Math.floor(tt / 1.1);
	const fr = (tt / 1.1) % 1;
	const pa = players[seg % 4];
	const pb = players[(seg + 1) % 4];
	const ball: [number, number, number] =
		t < T.duda - 0.8
			? [lerp(pa.x, pb.x, fr), 0.12 + Math.sin(fr * Math.PI) * 0.6 * (1 - stop), lerp(pa.z, pb.z, fr)]
			: [DUDA[0] - 0.05, 1.05, DUDA[2] - 0.3];

	const dudaWalk = sr(t, T.jogoPara + 0.5, T.duda - 0.3);
	const dx = lerp(6.5, DUDA[0], dudaWalk);
	const dz = lerp(-7.5, DUDA[2], dudaWalk);
	const point = sr(t, 302.4, 303.2) * (1 - sr(t, 306.6, 307.4));
	const smile = sr(t, 299, 300.5);
	const faceMax = (x: number, z: number) => Math.atan2(mx - x, mz - z);

	const fadeIn = 1 - sr(t, START, START + 1.4);
	const fadeOut = sr(t, 313.8, T.fim);

	const grass = useMemo(() => {
		const g = rng(5);
		return Array.from({length: 160}, () => [-16 + g() * 34, -16 + g() * 30, 0.3 + g() * 0.5] as const);
	}, []);

	return (
		<AbsoluteFill style={{background: '#000'}}>
			<ThreeCanvas width={1920} height={1080} gl={{antialias: false, powerPreference: "high-performance"}}>
				<CameraRig pos={cam.pos} look={cam.look} fov={cam.fov} />
				<SkyDome top="#5b7fc4" bottom="#ffb35c" />
				<fog attach="fog" args={['#f2b07a', 30, 120]} />
				<mesh position={[-40, 10, -110]}>
					<sphereGeometry args={[8, 24, 24]} />
					<meshBasicMaterial color="#fff0c4" />
				</mesh>
				<ambientLight intensity={0.55} color="#ffd9b0" />
				<hemisphereLight args={['#ffd6a0', '#6b4a2a', 0.7]} />
				<directionalLight position={[-12, 5, -12]} intensity={2.8} color="#ffb870" />
				<directionalLight position={[8, 6, 10]} intensity={0.5} color="#9fb8ff" />

				{/* chão, rua e calçada */}
				<mesh rotation={[-Math.PI / 2, 0, 0]}>
					<planeGeometry args={[200, 200]} />
					<meshStandardMaterial color="#9a8a5a" roughness={1} />
				</mesh>
				<Box p={[-10, 0.01, 1.2]} s={[60, 0.02, 3.4]} c="#4a4846" />
				<Box p={[-10, 0.06, 3.4]} s={[60, 0.12, 1.2]} c="#b9b2a6" />
				{[-24, -18, -12, -6].map((x, i) => (
					<House key={x} p={[x, 0, 7]} c={['#e7c8a0', '#a8c6d6', '#e3a99a', '#c9d6a8'][i]} />
				))}
				{[-26, -20, -14, -8].map((x, i) => (
					<House key={x} p={[x, 0, -4]} c={['#d6c3e3', '#f0dca0', '#a8d6c3', '#e7b8a0'][i]} w={3.6} />
				))}
				{[-22, -12, -2].map((x) => (
					<group key={x} position={[x, 0, 3.9]}>
						<mesh position={[0, 3.5, 0]}>
							<cylinderGeometry args={[0.1, 0.12, 7, 8]} />
							<meshStandardMaterial color="#6b5a48" />
						</mesh>
						<Box p={[0, 6.6, 0]} s={[1.6, 0.08, 0.08]} c="#4a3a2a" />
					</group>
				))}

				{/* campo de terra batida */}
				<Box p={[7, 0.015, -8]} s={[12, 0.03, 10]} c="#b9784a" rough={1} />
				{grass.map(([x, z, s], i) =>
					x > 0.8 && x < 13.2 && z < -2.8 && z > -13.2 ? null : (
						<mesh key={i} position={[x, s * 0.15, z]}>
							<coneGeometry args={[0.15 * s, 0.4 * s, 5]} />
							<meshStandardMaterial color="#c2a65a" />
						</mesh>
					),
				)}
				{/* traves */}
				{[1.6, 12.4].map((x) => (
					<group key={x} position={[x, 0, -8]}>
						<Box p={[0, 1.0, -1.2]} s={[0.08, 2, 0.08]} c="#f2f2f2" />
						<Box p={[0, 1.0, 1.2]} s={[0.08, 2, 0.08]} c="#f2f2f2" />
						<Box p={[0, 2.0, 0]} s={[0.08, 0.08, 2.48]} c="#f2f2f2" />
					</group>
				))}
				{/* alambrado enferrujado com a entrada */}
				<ChainLink p={[7, 0, -13]} len={12} ry={0} />
				<ChainLink p={[13, 0, -8]} len={10} ry={Math.PI / 2} />
				<ChainLink p={[7, 0, -3]} len={12} ry={0} />
				<ChainLink p={[1, 0, -10]} len={6} ry={Math.PI / 2} />
				<ChainLink p={[1, 0, -3.6]} len={1.2} ry={Math.PI / 2} />

				{/* amigos */}
				{players.map((p, i) => (
					<Person
						key={i}
						position={[p.x, 0, p.z]}
						rotationY={stop > 0.5 ? faceMax(p.x, p.z) : p.dir + Math.PI}
						shirt={p.c}
						pants="#2b2b33"
						hair={p.h}
						walk={tt * 11 + i}
						walkAmp={0.6 * (1 - stop)}
						smile={stop * 0.6}
					/>
				))}
				{/* Duda */}
				<Person
					position={[dx, 0, dz]}
					rotationY={t > T.jogoPara ? faceMax(dx, dz) : -2.2}
					shirt="#ffffff"
					pants="#2b2b33"
					hair="#2b1d12"
					walk={dudaWalk > 0 && dudaWalk < 1 ? t * 8 : t < T.jogoPara ? t * 11 : 0}
					walkAmp={dudaWalk > 0 && dudaWalk < 1 ? 0.35 : t < T.jogoPara ? 0.6 : 0}
					armL={t > T.duda - 0.8 ? 0.5 : 0}
					armLSide={t > T.duda - 0.8 ? 0.4 : 0.08}
					armR={point * 0.4}
					armRSide={0.08 + point * 1.3}
					smile={smile}
				/>
				<mesh position={ball}>
					<sphereGeometry args={[0.12, 18, 18]} />
					<meshStandardMaterial color="#f4efe6" roughness={0.6} />
				</mesh>
				{/* Max: roupa simples, cabelo grisalho */}
				<Person
					position={[mx, 0, mz]}
					rotationY={mRot}
					pose={sitting ? 'ground' : 'stand'}
					shirt="#c9c4ba"
					pants="#4a4f5a"
					hair="#9a958f"
					hairLen={0.3}
					skin="#d4b39c"
					walk={moving ? t * 7 : 0}
					walkAmp={moving ? 0.35 : 0}
					headTilt={sitting ? 0.45 + Math.sin(t * 5) * 0.015 : 0.05}
					lean={sitting ? 0.3 : 0}
					armL={sitting ? 0.9 : 0}
					armR={sitting ? 0.9 : 0}
				/>
			</ThreeCanvas>
			<AbsoluteFill style={{background: 'black', opacity: Math.max(fadeIn, fadeOut)}} />
			<Title t={t} a={T.fim} b={END + 2} text="FIM" />
		</AbsoluteFill>
	);
};
