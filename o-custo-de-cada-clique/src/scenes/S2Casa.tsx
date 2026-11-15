import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {CameraRig, Shot, T, lerp, shotCam, sr, useTime} from '../lib';
import {Person} from '../components/Person';
import {Box} from '../components/Props';

const START = T.casa;
const END = T.montagem;

const shots: Shot[] = [
	{at: START, p: [[3.4, 1.65, 3.2], [2.6, 1.6, 2.7]], l: [[2.2, 1.2, 1.4], [0.7, 1.2, 0.7]], fov: 42, shake: 0.035},
	{at: 66.3, p: [[0.35, 1.45, 0.95], [0.22, 1.32, 0.78]], l: [[0, 0.78, 0.05], [0, 0.78, 0.05]], fov: 34, shake: 0.015},
	{at: T.palida, p: [[0.5, 1.55, 2.0], [0.35, 1.52, 1.65]], l: [[0, 1.45, -0.9], [0, 1.45, -0.9]], fov: 34, shake: 0.025},
	{at: 74.8, p: [[-0.35, 1.6, -1.9], [-0.2, 1.55, -1.6]], l: [[0.6, 1.55, 0.9], [0.6, 1.6, 0.9]], fov: 34, shake: 0.03},
	{at: 79.2, p: [[-2.8, 2.1, 2.8], [-2.2, 1.95, 2.3]], l: [[0.2, 1.0, 0], [0.2, 1.0, 0]], fov: 42, shake: 0.03},
];

export const S2Casa: React.FC = () => {
	const t = useTime(START);
	const cam = shotCam(t, shots, END);

	// Max entra pela porta e vai até a mesa
	const w = sr(t, START, 65.2);
	const mx = lerp(2.7, 0.65, w);
	const mz = lerp(1.6, 0.85, w);
	const walking = t < 65.2;
	const thrown = t > 65.0;
	const cheer = sr(t, 77.4, 78.2);
	const maxArmUp = t > 64.6 && t < 65.4 ? 1.6 : cheer * 2.6;
	const momShock = sr(t, T.palida, T.palida + 0.6);
	const fadeIn = 1 - sr(t, START, START + 0.5);
	const fadeOut = sr(t, END - 0.5, END);

	return (
		<AbsoluteFill style={{background: '#000'}}>
			<ThreeCanvas width={1920} height={1080} gl={{antialias: false, powerPreference: "high-performance"}}>
				<color attach="background" args={['#cfe3f2']} />
				<CameraRig pos={cam.pos} look={cam.look} fov={cam.fov} />
				<ambientLight intensity={0.9} color="#ffe8cc" />
				<hemisphereLight args={['#fff4e0', '#6b5a48', 0.8]} />
				<directionalLight position={[-3, 4, 2]} intensity={2.2} color="#fff0d8" />
				<pointLight position={[0, 2.4, 0]} intensity={3} distance={5} color="#ffd9a0" />

				{/* cozinha modesta */}
				<Box p={[0, -0.01, 0.5]} s={[7, 0.02, 6]} c="#b9a58a" rough={0.9} />
				<Box p={[0, 1.4, -2.0]} s={[7, 2.8, 0.06]} c="#a9c2a4" />
				<Box p={[-3.0, 1.4, 0.5]} s={[0.06, 2.8, 6]} c="#b7cdb2" />
				{/* janela com luz do dia */}
				<Box p={[-1.3, 1.6, -1.96]} s={[1.3, 0.9, 0.02]} c="#ffffff" e="#e8f4ff" ei={1.2} />
				<Box p={[-1.3, 1.6, -1.95]} s={[0.04, 0.9, 0.03]} c="#f2efe8" />
				{/* porta */}
				<Box p={[3.0, 1.0, 1.8]} s={[0.06, 2.0, 0.95]} c="#7a5236" />
				{/* geladeira, balcão, armários */}
				<Box p={[2.2, 0.9, -1.6]} s={[0.75, 1.8, 0.65]} c="#e9e7e1" rough={0.4} />
				<Box p={[0.4, 0.45, -1.65]} s={[2.4, 0.9, 0.6]} c="#8a6a4f" />
				<Box p={[0.4, 0.92, -1.65]} s={[2.45, 0.04, 0.65]} c="#d8d2c4" />
				<Box p={[0.4, 2.1, -1.8]} s={[2.4, 0.7, 0.35]} c="#8a6a4f" />
				{/* relógio de parede */}
				<mesh position={[1.6, 2.2, -1.96]}>
					<cylinderGeometry args={[0.18, 0.18, 0.03, 24]} />
					<meshStandardMaterial color="#f5f1e8" />
				</mesh>
				{/* mesa da cozinha com toalha */}
				<Box p={[0, 0.74, 0]} s={[1.5, 0.05, 0.95]} c="#e7d8c0" />
				<Box p={[0, 0.66, 0]} s={[1.56, 0.14, 1.0]} c="#c94f3d" />
				{[-0.65, 0.65].map((x) => [-0.4, 0.4].map((z) => <Box key={`${x}${z}`} p={[x, 0.36, z]} s={[0.05, 0.72, 0.05]} c="#5a4130" />))}
				{/* fruteira */}
				<mesh position={[-0.4, 0.82, -0.1]}>
					<sphereGeometry args={[0.14, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
					<meshStandardMaterial color="#d9cbb0" side={2} />
				</mesh>
				{/* chaves do carro e contrato de quitação */}
				{thrown && (
					<group position={[0.12, 0.775, 0.12]} rotation={[0, 0.5, 0]}>
						<Box p={[0, 0.01, 0]} s={[0.07, 0.025, 0.12]} c="#111" rough={0.3} />
						<mesh position={[0, 0.01, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
							<torusGeometry args={[0.03, 0.006, 8, 20]} />
							<meshStandardMaterial color="#d8d8d8" metalness={1} roughness={0.2} />
						</mesh>
					</group>
				)}
				{thrown && (
					<group position={[-0.12, 0.772, 0.15]} rotation={[0, -0.25, 0]}>
						<Box p={[0, 0, 0]} s={[0.21, 0.004, 0.3]} c="#fbfaf5" />
						{Array.from({length: 8}, (_, i) => (
							<Box key={i} p={[0, 0.003, -0.11 + i * 0.025]} s={[0.15, 0.002, 0.006]} c="#9a9a9a" />
						))}
						<Box p={[0.05, 0.003, 0.11]} s={[0.07, 0.002, 0.02]} c="#2453a6" />
					</group>
				)}

				{/* pais */}
				<Person
					position={[-0.4, 0, -0.85]}
					pose="stand"
					shirt="#8c4a6b"
					dress
					hair="#5b4a3e"
					hairLen={0.7}
					armR={lerp(0.2, 2.0, momShock)}
					armRSide={lerp(0.08, -0.5, momShock)}
					armL={0.2}
					headTilt={-0.08}
					lean={-momShock * 0.08}
				/>
				<Person
					position={[0.45, 0, -0.9]}
					pose="stand"
					shirt="#4a5a6e"
					pants="#3a3226"
					hair="#8a8580"
					armL={0.1}
					armR={sr(t, 72, 73) * 0.9}
					headTilt={-0.05}
					lean={-sr(t, 65, 66) * 0.06}
				/>
				{/* Max eufórico */}
				<Person
					position={[mx, 0, mz]}
					rotationY={lerp(-1.92, -2.79, sr(t, 64.4, 65.4))}
					pose="stand"
					shirt="#2a2f3a"
					hood
					hair="#20170f"
					walk={walking ? t * 9 : 0}
					walkAmp={walking ? 0.45 : 0}
					armR={maxArmUp}
					armL={cheer * 2.6}
					armLSide={0.08 + cheer * 0.5}
					armRSide={0.08 + cheer * 0.5}
					headTilt={-0.15 - cheer * 0.1 + Math.sin(t * 10) * 0.02}
				/>
			</ThreeCanvas>
			<AbsoluteFill style={{background: 'black', opacity: Math.max(fadeIn, fadeOut)}} />
		</AbsoluteFill>
	);
};
