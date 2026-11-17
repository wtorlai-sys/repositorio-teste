// Ficha do Max (frente, lado, costas) renderizada pelo próprio motor do vídeo — para comparar com o conceito.
import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {Blocky, CAST, townie} from './Blocky';
import {Expr} from './tex';

const Cam: React.FC = () => {
	const {camera} = useThree();
	const c = camera as THREE.PerspectiveCamera;
	c.fov = 22;
	c.position.set(0, 0.85, 9.5);
	c.lookAt(0, 0.72, 0);
	c.updateProjectionMatrix();
	return null;
};

export const FichaMax: React.FC<{exprs?: Expr[]}> = () => {
	const {width, height} = useVideoConfig();
	const views: [number, number][] = [[-2.4, 0], [-0.8, Math.PI / 2], [0.8, -Math.PI / 2], [2.4, Math.PI]];
	return (
		<AbsoluteFill style={{background: '#e9e9ea'}}>
			<ThreeCanvas width={width} height={height} shadows gl={{antialias: true}} dpr={1}>
				<Cam />
				<color attach="background" args={['#e9e9ea']} />
				<hemisphereLight args={['#ffffff', '#b0a090', 1.3]} />
				<directionalLight position={[4, 8, 8]} intensity={2.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
				<directionalLight position={[-6, 4, -8]} intensity={1.0} color="#dfe8ff" />
				<mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
					<planeGeometry args={[30, 30]} />
					<meshStandardMaterial color="#e9e9ea" />
				</mesh>
				{views.map(([x, ry], i) => (
					<Blocky key={i} look={CAST.max} pos={[x, 0, 0]} ry={ry} pose="apose" expr="neutral" t={0} shadow={false} />
				))}
			</ThreeCanvas>
		</AbsoluteFill>
	);
};

export const RostosMax: React.FC = () => {
	const {width, height} = useVideoConfig();
	const ex: Expr[] = ['happy', 'sad', 'scared', 'shock', 'smirk', 'determined'];
	return (
		<AbsoluteFill style={{background: '#e9e9ea'}}>
			<ThreeCanvas width={width} height={height} gl={{antialias: true}} dpr={1}>
				<Cam2 />
				<color attach="background" args={['#e9e9ea']} />
				<hemisphereLight args={['#ffffff', '#b0a090', 1.3]} />
				<directionalLight position={[4, 8, 8]} intensity={2.2} />
				{ex.map((e, i) => (
					<Blocky key={i} look={CAST.max} pos={[(i - 2.5) * 1.15, 0, 0]} pose="idle" expr={e} t={0} shadow={false} />
				))}
			</ThreeCanvas>
		</AbsoluteFill>
	);
};

const Cam2: React.FC = () => {
	const {camera} = useThree();
	const c = camera as THREE.PerspectiveCamera;
	c.fov = 18;
	c.position.set(0, 1.25, 10);
	c.lookAt(0, 1.22, 0);
	c.updateProjectionMatrix();
	return null;
};

// Elenco fixo + figurantes (crianças, adultos, idosos) lado a lado — QC de cabelo/roupa por idade.
export const Elenco: React.FC = () => {
	const {width, height} = useVideoConfig();
	const fixed = ['max', 'lia', 'mae', 'pai', 'avo', 'velho'];
	const extras = [0, 1, 2, 3, 6, 13, 4, 5];
	return (
		<AbsoluteFill style={{background: '#e9e9ea'}}>
			<ThreeCanvas width={width} height={height} gl={{antialias: true}} dpr={1}>
				<Cam3 />
				<color attach="background" args={['#e9e9ea']} />
				<hemisphereLight args={['#ffffff', '#b0a090', 1.3]} />
				<directionalLight position={[4, 8, 8]} intensity={2.2} />
				<directionalLight position={[-6, 4, -8]} intensity={0.8} color="#dfe8ff" />
				{fixed.map((k, i) => (
					<Blocky key={k} look={CAST[k]} pos={[(i - 2.5) * 1.05, 0, 0.6]} pose="idle" expr="neutral" t={0} shadow={false} />
				))}
				{extras.map((n, i) => (
					<Blocky key={'x' + n} look={townie(n, i < 4)} pos={[(i - 3.5) * 0.85, 0, -1.6]} pose="idle" expr="happy" t={0} shadow={false} />
				))}
			</ThreeCanvas>
		</AbsoluteFill>
	);
};

const Cam3: React.FC = () => {
	const {camera} = useThree();
	const c = camera as THREE.PerspectiveCamera;
	c.fov = 30;
	c.position.set(0, 2.2, 11);
	c.lookAt(0, 0.9, 0);
	c.updateProjectionMatrix();
	return null;
};
