import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {CameraRig, Shot, T, lerp, shotCam, sr, useTime} from '../lib';
import {Person} from '../components/Person';
import {Box, SkyDome} from '../components/Props';
import {BattleStation, Penthouse} from '../components/Penthouse';
import {Notification} from '../components/Overlays';

const START = T.montagem;
const END = T.cena3;

const Ocean: React.FC<{t: number}> = ({t}) => {
	const geo = useMemo(() => {
		const g = new THREE.PlaneGeometry(80, 60, 120, 90);
		g.rotateX(-Math.PI / 2);
		return g;
	}, []);
	useLayoutEffect(() => {
		const pos = geo.attributes.position as THREE.BufferAttribute;
		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i);
			const z = pos.getZ(i);
			pos.setY(i, Math.sin(z * 0.6 + t * 1.6) * 0.08 + Math.sin(x * 0.35 + z * 0.2 + t * 1.1) * 0.06);
		}
		pos.needsUpdate = true;
		geo.computeVertexNormals();
	}, [t, geo]);
	return (
		<mesh geometry={geo} position={[0, 0, -30]}>
			<meshStandardMaterial color="#1f7fa8" roughness={0.15} metalness={0.3} flatShading />
		</mesh>
	);
};

const shotsA: Shot[] = [
	{at: START, p: [[2.6, 1.0, 3.2], [1.9, 1.1, 2.6]], l: [[0, 1.0, -0.6], [0, 1.1, -0.6]], fov: 40},
	{at: 87.2, p: [[-1.0, 0.9, -4.2], [-0.7, 1.0, -3.6]], l: [[0, 1.4, -0.6], [0, 1.45, -0.6]], fov: 38},
];
const shotsB: Shot[] = [{at: T.amigo, p: [[1.4, 1.4, 1.9], [1.1, 1.3, 1.5]], l: [[0, 1.0, 0], [0, 1.05, 0]], fov: 36}];
const shotsC: Shot[] = [
	{at: T.cobertura, p: [[4.5, 1.6, 2.5], [2.0, 1.6, 0.5]], l: [[0, 1.4, -3.5], [-2, 1.3, -4]], fov: 40},
	{at: 102.4, p: [[-0.7, 1.75, -6.4], [-0.9, 1.7, -6.2]], l: [[-2.05, 1.4, -4.6], [-2.05, 1.4, -4.6]], fov: 36},
];

export const S2bMontagem: React.FC = () => {
	const t = useTime(START);
	const part = t < T.amigo ? 'A' : t < T.cobertura ? 'B' : 'C';
	const cam = shotCam(t, part === 'A' ? shotsA : part === 'B' ? shotsB : shotsC, part === 'A' ? T.amigo : part === 'B' ? T.cobertura : END);

	// fades curtos entre os sub-planos (ritmo de videoclipe)
	const pulse = (c: number) => Math.max(0, 1 - Math.abs(t - c) / 0.3);
	const flash = Math.max(pulse(START), pulse(T.amigo), pulse(T.cobertura));
	const fadeOut = sr(t, END - 0.5, END);

	const walkW = sr(t, T.cobertura, 102.6);

	return (
		<AbsoluteFill style={{background: '#000'}}>
			<ThreeCanvas width={1920} height={1080} gl={{antialias: false, powerPreference: "high-performance"}}>
				<CameraRig pos={cam.pos} look={cam.look} fov={cam.fov} />
				{part === 'A' && (
					<group>
						<SkyDome top="#4f9ee8" bottom="#ffe2b8" />
						<ambientLight intensity={0.8} color="#fff3e0" />
						<hemisphereLight args={['#bfe3ff', '#d9c29a', 0.8]} />
						<directionalLight position={[-5, 6, -8]} intensity={2.4} color="#fff1d6" />
						<mesh position={[-25, 9, -110]}>
							<sphereGeometry args={[7, 24, 24]} />
							<meshBasicMaterial color="#fff6dc" />
						</mesh>
						<Ocean t={t} />
						{/* areia */}
						<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 6]}>
							<planeGeometry args={[80, 14]} />
							<meshStandardMaterial color="#e7d3a8" roughness={1} />
						</mesh>
						{/* espuma */}
						<Box p={[0, 0.04, -0.95 + Math.sin(t * 1.2) * 0.2]} s={[80, 0.02, 0.35]} c="#ffffff" e="#ffffff" ei={0.3} />
						<Person
							position={[0, -0.05, -0.6]}
							rotationY={Math.PI}
							shirt="#e8a0b4"
							dress
							hair="#5b4a3e"
							hairLen={0.7}
							armL={0.3}
							armR={0.3}
							armLSide={0.2 + sr(t, 85, 88) * 1.0}
							armRSide={0.2 + sr(t, 85, 88) * 1.0}
							headTilt={-0.2}
						/>
					</group>
				)}
				{part === 'B' && (
					<group>
						<color attach="background" args={['#2a2420']} />
						<ambientLight intensity={0.6} color="#ffd9b0" />
						<pointLight position={[1, 2.2, 1]} intensity={5} distance={6} color="#ffcf99" />
						<Box p={[0, -0.01, 0]} s={[6, 0.02, 6]} c="#5a4636" />
						<Box p={[0, 1.4, -1.2]} s={[6, 2.8, 0.05]} c="#6e5b4b" />
						<Box p={[-1.5, 1.7, -1.16]} s={[0.8, 1.0, 0.02]} c="#3b7ab8" e="#9fd0ff" ei={0.5} />
						{/* sofá */}
						<Box p={[0, 0.25, -0.3]} s={[1.8, 0.5, 0.8]} c="#4b6b5a" />
						<Box p={[0, 0.7, -0.65]} s={[1.8, 0.6, 0.15]} c="#4b6b5a" />
						<Person
							position={[0, 0, -0.35]}
							pose="sit"
							shirt="#d97a2b"
							hair="#2b1d12"
							armR={1.7 + Math.sin(t * 3) * 0.04}
							armRSide={-0.35}
							armL={2.2 * sr(t, 95, 95.6) * (1 - sr(t, 97.2, 97.8))}
							armLSide={0.35}
							headTilt={0.35 + Math.sin(t * 6) * 0.03}
						/>
						<group position={[0.12, 1.05, 0.12]} rotation={[-0.9, 0, 0]}>
							<Box p={[0, 0, 0]} s={[0.08, 0.16, 0.01]} c="#111" />
							<Box p={[0, 0, 0.006]} s={[0.07, 0.14, 0.002]} c="#9fffc9" e="#9fffc9" ei={1} />
						</group>
					</group>
				)}
				{part === 'C' && (
					<Penthouse skyTop="#2d3e78" skyBottom="#ff9a5c" cityLit={0.7} ambient={0.5} ambientColor="#ffd2b0" sun={1.4} sunColor="#ffb070">
						<BattleStation />
						<Person
							position={[lerp(3.5, -2.3, walkW), 0, lerp(-3.2, -4.3, walkW)]}
							rotationY={-Math.PI / 2 - 0.2 + sr(t, 102.2, 103) * -1.2}
							shirt="#f2f0ea"
							pants="#1b1c22"
							hair="#20170f"
							walk={t < 102.6 ? t * 8 : 0}
							walkAmp={t < 102.6 ? 0.35 : 0}
							armL={t > 102.6 ? 1.4 * sr(t, 102.6, 103.2) : 0}
							armLSide={t > 102.6 ? -0.2 : 0.08}
							headTilt={t > 102.6 ? 0.35 : 0}
							watch
						/>
						<pointLight position={[-1.8, 1.6, -5.2]} intensity={t > 102.6 ? 1.5 + Math.sin(t * 7) * 0.6 : 0} distance={1.4} color="#ffd36b" />
					</Penthouse>
				)}
			</ThreeCanvas>
			<Notification
				t={t}
				a={T.amigo + 1.2}
				b={T.cobertura - 0.3}
				app="Banco"
				title="Dívida estudantil quitada"
				body="Saldo devedor: R$ 0,00"
				color="#19c37d"
			/>
			<AbsoluteFill style={{background: 'white', opacity: Math.min(1, flash) * 0.85}} />
			<AbsoluteFill style={{background: 'black', opacity: fadeOut}} />
		</AbsoluteFill>
	);
};
