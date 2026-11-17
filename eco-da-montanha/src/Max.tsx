// MAX — modelo de blocos com quinas arredondadas, fiel ao conceito gerado no Customuse
// (assets/characters/max/max_conceito_frente.png). Mesmo rig dos outros personagens (unidades de avatar).
import * as THREE from 'three';
import React, {useMemo} from 'react';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {Expr, faceMaxTex, softFabric} from './tex';

type Rot = [number, number, number];
export type Rig = {la: Rot; ra: Rot; ll: Rot; rl: Rot; head: Rot; torso: Rot; y: number};

const geoCache = new Map<string, THREE.BufferGeometry>();
export const rb = (w: number, h: number, d: number, r = Math.min(0.12, Math.min(w, h, d) * 0.22)) => {
	const k = `${w}|${h}|${d}|${r}`;
	let g = geoCache.get(k);
	if (!g) {
		g = new RoundedBoxGeometry(w, h, d, 3, r);
		geoCache.set(k, g);
	}
	return g;
};

const C = {
	red: '#c8302f',
	redDark: '#a92527',
	redLight: '#d63a37',
	skin: '#f2c49c',
	tee: '#f5f3ee',
	pants: '#4a4f57',
	pantsDark: '#3a3e45',
	shoe: '#d6302e',
	sole: '#f3f2ef',
	hair: '#5a3520',
	hair2: '#6e4428',
};

const VNECK = (() => {
	const sh = new THREE.Shape();
	sh.moveTo(-0.42, 2.0);
	sh.lineTo(0.42, 2.0);
	sh.lineTo(0, 1.55);
	sh.closePath();
	return new THREE.ShapeGeometry(sh);
})();

const std = (col: string, map?: THREE.Texture, rough = 0.82) => new THREE.MeshStandardMaterial({color: map ? '#ffffff' : col, map, roughness: rough, metalness: 0});

const M: React.FC<{g: THREE.BufferGeometry; m: THREE.Material; p?: [number, number, number]; r?: Rot}> = ({g, m, p, r}) => <mesh geometry={g} material={m} position={p} rotation={r} />;

// mechas do cabelo: [x, y, z, w, h, d, rx, ry, rz, tom]
const LOCKS: number[][] = [
	// volume do topo
	[0, 0.72, 0.0, 1.25, 0.34, 1.2, 0, 0, 0, 0],
	[-0.38, 0.86, 0.18, 0.55, 0.32, 0.55, 0.3, 0.4, 0.35, 1],
	[0.05, 0.92, 0.22, 0.6, 0.34, 0.55, 0.35, -0.3, -0.1, 0],
	[0.42, 0.84, 0.12, 0.52, 0.3, 0.55, 0.25, -0.5, -0.4, 1],
	[-0.2, 0.9, -0.25, 0.6, 0.32, 0.55, -0.25, 0.2, 0.2, 0],
	[0.3, 0.88, -0.3, 0.55, 0.3, 0.5, -0.3, -0.3, -0.25, 1],
	[0.0, 0.98, -0.02, 0.5, 0.3, 0.5, 0.1, 0.8, 0.15, 1],
	[-0.5, 1.0, -0.05, 0.4, 0.3, 0.4, 0.2, 0.6, 0.7, 0],
	[0.48, 1.02, -0.1, 0.42, 0.3, 0.4, -0.2, -0.6, -0.6, 0],
	[0.18, 1.1, 0.12, 0.38, 0.28, 0.38, 0.5, 0.3, -0.3, 0],
	[-0.15, 1.08, -0.35, 0.4, 0.28, 0.4, -0.5, 0.2, 0.4, 1],
	[-0.7, 0.75, -0.2, 0.3, 0.36, 0.5, 0, 0.3, 0.7, 0],
	[0.7, 0.75, -0.2, 0.3, 0.36, 0.5, 0, -0.3, -0.7, 1],
	// franja caindo sobre a testa
	[-0.36, 0.56, 0.52, 0.5, 0.26, 0.22, 0.55, 0.25, 0.45, 0],
	[0.04, 0.6, 0.55, 0.5, 0.26, 0.22, 0.6, -0.15, -0.3, 1],
	[0.42, 0.55, 0.5, 0.42, 0.24, 0.22, 0.5, -0.3, -0.55, 0],
	// laterais (cobrem as orelhas) e nuca
	[-0.63, 0.25, -0.05, 0.12, 0.62, 1.0, 0, 0, 0.05, 0],
	[0.63, 0.25, -0.05, 0.12, 0.62, 1.0, 0, 0, -0.05, 0],
	[-0.66, 0.5, 0.25, 0.26, 0.3, 0.45, 0.2, 0, 0.5, 1],
	[0.66, 0.5, 0.25, 0.26, 0.3, 0.45, 0.2, 0, -0.5, 1],
	[0, 0.25, -0.58, 1.2, 0.7, 0.12, 0, 0, 0, 0],
	[-0.35, 0.45, -0.68, 0.5, 0.36, 0.22, -0.4, 0.2, 0.4, 1],
	[0.3, 0.5, -0.7, 0.5, 0.34, 0.22, -0.45, -0.2, -0.35, 0],
	[0.0, 0.2, -0.7, 0.5, 0.34, 0.2, -0.2, 0, 0.1, 1],
	[-0.4, -0.05, -0.66, 0.42, 0.3, 0.18, 0.1, 0, -0.3, 0],
	[0.42, -0.08, -0.66, 0.42, 0.3, 0.18, 0.1, 0, 0.35, 1],
	[-0.35, 0.05, -0.64, 0.4, 0.32, 0.16, -0.3, 0, 0.3, 1],
	[0.3, 0.02, -0.64, 0.4, 0.32, 0.16, -0.3, 0, -0.3, 1],
];

export const MaxBody: React.FC<{rig: Rig; expr: Expr; propSlot?: React.ReactNode; bunnySlot?: React.ReactNode}> = ({rig, expr, propSlot, bunnySlot}) => {
	const m = useMemo(
		() => ({
			red: std(C.red, softFabric(C.red, 3), 0.9),
			redDark: std(C.redDark, softFabric(C.redDark, 4), 0.92),
			redLight: std(C.redLight, softFabric(C.redLight, 6), 0.9),
			skin: std(C.skin, undefined, 0.6),
			tee: std(C.tee, undefined, 0.9),
			pants: std(C.pants, softFabric(C.pants, 5), 0.9),
			pantsDark: std(C.pantsDark, undefined, 0.92),
			shoe: std(C.shoe, undefined, 0.55),
			sole: std(C.sole, undefined, 0.6),
			hair: std(C.hair, undefined, 0.7),
			hair2: std(C.hair2, undefined, 0.7),
		}),
		[],
	);
	const face = faceMaxTex(expr);
	const leg = (side: number, r: Rot) => (
		<group position={[side * 0.5, 2.4, 0]} rotation={r}>
			<M g={rb(0.95, 2.1, 0.95)} m={m.pants} p={[0, -1.05, 0]} />
			{/* bolso cargo na lateral externa da coxa */}
			<M g={rb(0.12, 0.5, 0.5, 0.04)} m={m.pantsDark} p={[side * 0.51, -1.0, 0.02]} />
			<M g={rb(0.14, 0.1, 0.52, 0.03)} m={m.pantsDark} p={[side * 0.52, -0.75, 0.02]} />
			{/* tênis vermelho com solado e listras brancas */}
			<M g={rb(0.98, 0.34, 1.16, 0.1)} m={m.shoe} p={[0, -2.22, 0.08]} />
			<M g={rb(1.02, 0.12, 1.2, 0.05)} m={m.sole} p={[0, -2.37, 0.08]} />
			<M g={rb(0.5, 0.04, 0.03, 0.01)} m={m.sole} p={[0, -2.16, 0.67]} />
			<M g={rb(0.5, 0.04, 0.03, 0.01)} m={m.sole} p={[0, -2.24, 0.67]} />
			<M g={rb(0.4, 0.14, 0.32, 0.05)} m={m.shoe} p={[0, -2.02, 0.42]} r={[0.25, 0, 0]} />
		</group>
	);
	const arm = (side: number, r: Rot, slot?: React.ReactNode) => (
		<group position={[side * 1.5, 1.8, 0]} rotation={r}>
			<M g={rb(0.98, 1.7, 0.98)} m={m.red} p={[0, -0.72, 0]} />
			{/* punho do moletom */}
			<M g={rb(1.0, 0.16, 1.0, 0.06)} m={m.redDark} p={[0, -1.56, 0]} />
			<M g={rb(0.9, 0.5, 0.9)} m={m.skin} p={[0, -1.86, 0]} />
			{slot}
		</group>
	);
	return (
		<>
			{leg(-1, rig.ll)}
			{leg(1, rig.rl)}
			<group position={[0, 2.4, 0]} rotation={rig.torso}>
				{/* tronco do moletom */}
				<M g={rb(2, 2.02, 1.02, 0.14)} m={m.red} p={[0, 1, 0]} />
				{/* barra canelada */}
				<M g={rb(2.02, 0.18, 1.04, 0.06)} m={m.redDark} p={[0, 0.1, 0]} />
				{/* capuz enrolado no pescoço */}
				<M g={rb(1.5, 0.28, 1.1, 0.12)} m={m.red} p={[0, 2.02, 0]} />
				<M g={rb(1.3, 0.55, 0.32, 0.12)} m={m.red} p={[0, 1.78, -0.6]} r={[-0.2, 0, 0]} />
				{/* lapelas do capuz formando o V */}
				<M g={rb(0.62, 0.22, 0.2, 0.08)} m={m.redLight} p={[-0.3, 1.8, 0.5]} r={[0, 0, -0.75]} />
				<M g={rb(0.62, 0.22, 0.2, 0.08)} m={m.redLight} p={[0.3, 1.8, 0.5]} r={[0, 0, 0.75]} />
				{/* gola V da camiseta branca */}
				<mesh position={[0, 0, 0.513]} material={m.tee} geometry={VNECK} />
				{/* cordões */}
				<M g={rb(0.06, 0.62, 0.05, 0.02)} m={m.redDark} p={[-0.2, 1.42, 0.54]} />
				<M g={rb(0.06, 0.62, 0.05, 0.02)} m={m.redDark} p={[0.2, 1.42, 0.54]} />
				<M g={rb(0.09, 0.12, 0.08, 0.03)} m={m.redDark} p={[-0.2, 1.08, 0.55]} />
				<M g={rb(0.09, 0.12, 0.08, 0.03)} m={m.redDark} p={[0.2, 1.08, 0.55]} />
				{/* bolso canguru */}
				<M g={rb(1.2, 0.62, 0.06, 0.04)} m={m.redDark} p={[0, 0.56, 0.52]} />
				<M g={rb(1.1, 0.54, 0.06, 0.04)} m={m.red} p={[0, 0.55, 0.535]} />
				{arm(-1, rig.la)}
				{arm(1, rig.ra, propSlot)}
				{bunnySlot}
				{/* cabeça */}
				<group position={[0, 2.6, 0]} rotation={rig.head}>
					<M g={rb(1.22, 1.14, 1.12, 0.16)} m={m.skin} />
					<mesh position={[0, -0.02, 0.565]}>
						<planeGeometry args={[1.12, 1.06]} />
						<meshStandardMaterial map={face} transparent roughness={0.7} polygonOffset polygonOffsetFactor={-2} />
					</mesh>
					{LOCKS.map(([x, y, z, w, h, d, rx, ry, rz, tone], i) => (
						<M key={i} g={rb(w * 1.1, h * 1.1, d * 1.05, 0.06)} m={tone ? m.hair2 : m.hair} p={[x, y, z]} r={[rx, ry, rz]} />
					))}
				</group>
			</group>
		</>
	);
};
