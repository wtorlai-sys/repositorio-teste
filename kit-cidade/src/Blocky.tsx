// Personagem de blocos (estilo avatar), com rosto que muda de expressão e poses animadas por frame.
import * as THREE from 'three';
import React, {useMemo} from 'react';
import {Expr, faceTex, T} from './tex';
import {MaxBody} from './Max';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export type Look = {
	skin: string;
	shirt: () => THREE.Texture;
	shirtCol: string;
	pants: string;
	shoes: string;
	hat?: 'capBack' | 'flatCap' | 'none';
	hatCol?: string;
	hair?: {col: string; style: 'short' | 'pigtails' | 'bun' | 'bald' | 'long' | 'messy' | 'spiky' | 'old' | 'oldBun'};
	beard?: boolean;
	glasses?: boolean;
	hoodie?: boolean;
	iris?: boolean;
	cargo?: boolean;
	custom?: 'max';
	scale: number;
};

export const CAST: Record<string, Look> = {
	// Narrador: MAX (14 anos) — moletom vermelho tricotado, camiseta branca, calça cargo grafite, tênis vermelho/branco, cabelo castanho volumoso.
	max: {skin: '#f1c79c', shirt: () => T.knit('#c8282e', '#b21f25', 1), shirtCol: '#c8282e', pants: '#3a3d42', shoes: '#d8262c', hair: {col: '#3b2414', style: 'messy'}, hoodie: true, iris: true, cargo: true, custom: 'max', scale: 0.92},
	lia: {skin: '#f4cfa8', shirt: () => T.plaid('#e8566b', '#ffd166'), shirtCol: '#e8566b', pants: '#e8566b', shoes: '#ffd166', hair: {col: '#7a4423', style: 'pigtails'}, scale: 0.78},
	velho: {skin: '#d9ab84', shirt: () => T.fabric('#3b3a36'), shirtCol: '#3b3a36', pants: '#2a2925', shoes: '#4a3524', hat: 'flatCap', hatCol: '#5b4a3a', hair: {col: '#e4e1db', style: 'old'}, beard: true, scale: 1.38},
	mae: {skin: '#efc39a', shirt: () => T.knit('#4f7a52', '#5c8a5f', 1), shirtCol: '#4f7a52', pants: '#3b3f4f', shoes: '#5a3b2a', hair: {col: '#6b3b1f', style: 'bun'}, scale: 1.34},
	pai: {skin: '#e3b48a', shirt: () => T.plaid('#2e5a8a', '#1b2f4a'), shirtCol: '#2e5a8a', pants: '#3a3a3a', shoes: '#3a2a1a', hair: {col: '#3a2615', style: 'short'}, scale: 1.42},
	avo: {skin: '#e9be98', shirt: () => T.knit('#c8a878', '#b89464', 1), shirtCol: '#c8a878', pants: '#5a4e40', shoes: '#3a2a1a', hair: {col: '#efece6', style: 'old'}, glasses: true, scale: 1.3},
	// a coisa: silhueta preta de bloco (só aparece em parte)
	sombra: {skin: '#050507', shirt: () => T.fabric('#050507'), shirtCol: '#050507', pants: '#050507', shoes: '#050507', hair: {col: '#050507', style: 'short'}, scale: 1.34},
};

CAST.teco = CAST.max;

// paleta sóbria para figurantes (o vermelho é do Max)
const townCols = ['#4f6d8a', '#8a6f4f', '#5f7f5a', '#7a5c7a', '#b08a3c', '#3f5f6f', '#8a4f45', '#6a7a8a', '#4a6a4f', '#9a7a5a', '#5a5a7a', '#7a6a4a'];
const skins = ['#f1c79c', '#e0ac7e', '#c68a5c', '#8d5a3b', '#f4d5b5', '#a8704a'];
const hairs = ['#2a1a10', '#5a3720', '#c9a25a', '#8a3b1a', '#3a2418'];
export const townie = (i: number, kid = false): Look => {
	const a = townCols[i % townCols.length], b = townCols[(i * 5 + 3) % townCols.length];
	const kind = i % 3;
	return {
		skin: skins[(i * 7) % skins.length],
		shirt: kind === 0 ? () => T.knit(a, b, 2) : kind === 1 ? () => T.plaid(a, b) : () => T.fabric(a),
		shirtCol: a,
		pants: ['#2c3346', '#3a3a3a', '#5a4e40', '#273b5a'][i % 4],
		shoes: '#3a2a1a',
		hair: kid
			? {col: hairs[(i * 3) % 5], style: (['messy', 'long', 'spiky', 'pigtails'] as const)[i % 4]}
			: i % 7 === 6
				? {col: '#e6e2da', style: i % 2 ? 'old' : 'oldBun'} // idosos na multidão
				: {col: hairs[(i * 3) % 5], style: (['short', 'long', 'messy', 'bun'] as const)[i % 4]},
		hat: i % 5 === 2 ? 'flatCap' : 'none',
		hatCol: b,
		scale: kid ? 0.95 + (i % 3) * 0.05 : 1.3 + (i % 4) * 0.04,
	};
};

export type Pose = 'idle' | 'wave' | 'cup' | 'knock' | 'run' | 'walk' | 'sit' | 'sleep' | 'lean' | 'cheer' | 'point' | 'hug' | 'lifted' | 'arms' | 'hold' | 'cover' | 'reach' | 'five' | 'shrug' | 'torch' | 'apose' | 'sitcover';

type Rot = [number, number, number];
const P = (t: number, pose: Pose) => {
	const s = Math.sin;
	const br = s(t * 2.2) * 0.03;
	const o = {la: [0, 0, 0.08] as Rot, ra: [0, 0, -0.08] as Rot, ll: [0, 0, 0] as Rot, rl: [0, 0, 0] as Rot, head: [0, 0, 0] as Rot, torso: [0, 0, 0] as Rot, y: br * 0.3};
	switch (pose) {
		case 'wave':
			o.ra = [0, 0, 2.6 + s(t * 10) * 0.35];
			break;
		case 'cup':
			o.la = [-1.9, 0, -0.75];
			o.ra = [-1.9, 0, 0.75];
			o.head = [-0.18, 0, 0];
			o.torso = [-0.06 + s(t * 3) * 0.02, 0, 0];
			break;
		case 'knock': {
			const k = Math.max(0, s(t * 9)) * 0.45;
			o.ra = [-1.45 - k, 0, 0.15];
			break;
		}
		case 'run': {
			const c = s(t * 13);
			o.la = [c * 1.1, 0, 0.1];
			o.ra = [-c * 1.1, 0, -0.1];
			o.ll = [-c * 0.9, 0, 0];
			o.rl = [c * 0.9, 0, 0];
			o.torso = [0.18, 0, 0];
			o.y = Math.abs(s(t * 13)) * 0.12;
			break;
		}
		case 'walk': {
			const c = s(t * 7);
			o.la = [c * 0.6, 0, 0.08];
			o.ra = [-c * 0.6, 0, -0.08];
			o.ll = [-c * 0.5, 0, 0];
			o.rl = [c * 0.5, 0, 0];
			o.y = Math.abs(c) * 0.05;
			break;
		}
		case 'sit':
			o.ll = [-1.57, 0, 0];
			o.rl = [-1.57, 0, 0];
			o.la = [-0.6, 0, 0.1];
			o.ra = [-0.6, 0, -0.1];
			o.y = -0.5;
			break;
		case 'sleep':
			o.la = [-0.3, 0, 0.3];
			o.ra = [-0.9, 0, -0.6];
			break;
		case 'lean':
			o.torso = [0.45, 0, 0];
			o.la = [-1.1, 0, -0.2];
			o.ra = [-1.6, 0, 0.6];
			o.head = [0.1, 0.25, 0];
			break;
		case 'cheer':
			o.la = [0, 0, -2.7 - s(t * 8) * 0.25];
			o.ra = [0, 0, 2.7 + s(t * 8) * 0.25];
			o.y = Math.max(0, s(t * 8)) * 0.15;
			break;
		case 'point':
			o.ra = [-1.6, 0, 0];
			break;
		case 'hug':
			o.la = [-1.2, 0, -0.6];
			o.ra = [-1.2, 0, 0.6];
			break;
		case 'lifted':
			o.la = [0, 0, -2.6];
			o.ra = [0, 0, 2.6];
			o.ll = [-0.3, 0, 0.15];
			o.rl = [-0.3, 0, -0.15];
			break;
		case 'arms':
			o.la = [-1.3, 0, -0.9];
			o.ra = [-1.3, 0, 0.9];
			break;
		case 'hold':
			o.ra = [-1.0, 0, 0];
			o.la = [-1.0, 0, 0];
			break;
		case 'cover':
			o.la = [-2.4, 0, -0.5];
			o.ra = [-2.4, 0, 0.5];
			o.head = [0.2, 0, 0];
			break;
		case 'reach':
			o.ra = [-2.0, 0, 0];
			o.la = [-2.0, 0, 0];
			o.torso = [0.15, 0, 0];
			break;
		case 'five':
			o.ra = [-2.2, 0, 0.3];
			break;
		case 'shrug':
			o.la = [-0.4, 0, 0.9];
			o.ra = [-0.4, 0, -0.9];
			o.head = [0, 0, 0.12];
			break;
		case 'sitcover':
			o.ll = [-1.57, 0, 0];
			o.rl = [-1.57, 0, 0];
			o.la = [-2.3, 0, -0.45];
			o.ra = [-2.3, 0, 0.45];
			o.head = [0.15, 0, 0];
			o.y = -0.5 + Math.sin(t * 30) * 0.004;
			break;
		case 'apose':
			o.la = [0, 0, -0.45];
			o.ra = [0, 0, 0.45];
			o.head = [0, 0, 0];
			o.y = 0;
			break;
		case 'torch':
			o.ra = [-1.2, 0, 0.1];
			break;
		default:
			o.head = [0, s(t * 0.9) * 0.06, 0];
	}
	return o;
};

const mat = (col: string, map?: THREE.Texture) => new THREE.MeshStandardMaterial({color: map ? '#ffffff' : col, map, roughness: 0.75, metalness: 0});

export const Blocky: React.FC<{
	look: Look;
	pos?: [number, number, number];
	ry?: number;
	rx?: number;
	pose?: Pose;
	expr?: Expr;
	t: number; // segundos
	prop?: 'bunny' | 'torch' | 'note' | 'none';
	shadow?: boolean;
	tint?: string;
}> = ({look, pos = [0, 0, 0], ry = 0, rx = 0, pose = 'idle', expr = 'neutral', t, prop = 'none', shadow = true}) => {
	const m = useMemo(() => {
		const shirtMap = look.shirt();
		return {
			skin: mat(look.skin),
			shirt: mat(look.shirtCol, shirtMap),
			pants: mat(look.pants, T.fabric(look.pants)),
			shoes: mat(look.shoes),
			hat: mat(look.hatCol ?? '#ff7a1a'),
			hair: mat(look.hair?.col ?? '#333'),
		};
	}, [look]);
	const face = useMemo(() => faceTex(expr, !!look.beard, !!look.iris), [expr, look.beard, look.iris]);
	const p = P(t, pose);
	if (look.custom === 'max' && (pose === 'sit' || pose === 'sitcover')) p.y = -0.6 + (pose === 'sitcover' ? Math.sin(t * 30) * 0.004 : 0); // perna do Max é mais longa (quadril em 2,4)
	const u = 0.25 * look.scale;
	const lying = pose === 'sleep';
	const handProp = (
		<>
						{prop === 'torch' && (
							<group position={[0, -2.0, 0.5]} rotation={[1.57, 0, 0]}>
								<mesh position={[0, 0.2, 0]}>
									<cylinderGeometry args={[0.12, 0.15, 2.4, 6]} />
									<meshStandardMaterial color="#5a3a1f" />
								</mesh>
								<mesh position={[0, 1.6 + Math.sin(t * 17) * 0.05, 0]} scale={[1, 1.2 + Math.sin(t * 23) * 0.15, 1]}>
									<coneGeometry args={[0.35, 1.0, 6]} />
									<meshBasicMaterial color="#ffb347" />
								</mesh>
								<sprite position={[0, 1.6, 0]} scale={[3.5, 3.5, 1]}>
									<spriteMaterial map={T.glow('rgba(255,170,70,0.6)')} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
								</sprite>
							</group>
						)}
						{prop === 'note' && (
							<mesh position={[0, -2.0, 0.55]} rotation={[0.2, 0, 0]}>
								<boxGeometry args={[1.2, 1.5, 0.05]} />
								<meshStandardMaterial color="#f3ecd8" />
							</mesh>
						)}
		</>
	);
	return (
		<group position={pos} rotation={[rx, ry, 0]}>
			{shadow && !lying && (
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} renderOrder={1}>
					<planeGeometry args={[u * 3.4, u * 2.2]} />
					<meshBasicMaterial map={T.blob()} transparent depthWrite={false} />
				</mesh>
			)}
			<group scale={u} position={[0, p.y * u * 4, 0]} rotation={lying ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}>
				{look.custom === 'max' ? (
					<MaxBody rig={p} expr={expr} propSlot={handProp} bunnySlot={prop === 'bunny' ? <Bunny pos={[0, 1.0, 0.95]} s={0.9} /> : null} />
				) : (
				<>
				{/* pernas */}
				<group position={[-0.5, 2, 0]} rotation={p.ll}>
					<mesh position={[0, -0.85, 0]} material={m.pants}>
						<boxGeometry args={[0.96, 1.7, 0.96]} />
					</mesh>
					{look.cargo && (
						<mesh position={[0, -0.9, 0]} material={m.pants}>
							<boxGeometry args={[1.06, 0.5, 0.7]} />
						</mesh>
					)}
					{look.cargo && (
						<mesh position={[0, -1.75, 0.62]}>
							<boxGeometry args={[0.6, 0.06, 0.02]} />
							<meshStandardMaterial color="#f4f2ee" />
						</mesh>
					)}
					<mesh position={[0, -1.85, 0.06]} material={m.shoes}>
						<boxGeometry args={[0.98, 0.3, 1.1]} />
					</mesh>
					<mesh position={[0, -1.96, 0.07]}>
						<boxGeometry args={[1.0, 0.09, 1.12]} />
						<meshStandardMaterial color="#f4f2ee" />
					</mesh>
				</group>
				<group position={[0.5, 2, 0]} rotation={p.rl}>
					<mesh position={[0, -0.85, 0]} material={m.pants}>
						<boxGeometry args={[0.96, 1.7, 0.96]} />
					</mesh>
					{look.cargo && (
						<mesh position={[0, -0.9, 0]} material={m.pants}>
							<boxGeometry args={[1.06, 0.5, 0.7]} />
						</mesh>
					)}
					{look.cargo && (
						<mesh position={[0, -1.75, 0.62]}>
							<boxGeometry args={[0.6, 0.06, 0.02]} />
							<meshStandardMaterial color="#f4f2ee" />
						</mesh>
					)}
					<mesh position={[0, -1.85, 0.06]} material={m.shoes}>
						<boxGeometry args={[0.98, 0.3, 1.1]} />
					</mesh>
					<mesh position={[0, -1.96, 0.07]}>
						<boxGeometry args={[1.0, 0.09, 1.12]} />
						<meshStandardMaterial color="#f4f2ee" />
					</mesh>
				</group>
				<group position={[0, 2, 0]} rotation={p.torso}>
					{/* tronco */}
					<mesh position={[0, 1, 0]} material={m.shirt}>
						<boxGeometry args={[2, 2, 1]} />
					</mesh>
					{look.hoodie && (
						<>
							<mesh position={[0, 1.95, -0.55]} material={m.shirt}>
								<boxGeometry args={[1.5, 0.5, 0.35]} />
							</mesh>
							<mesh position={[0, 1.82, 0.505]}>
								<boxGeometry args={[0.6, 0.3, 0.02]} />
								<meshStandardMaterial color="#f4f2ee" roughness={0.9} />
							</mesh>
							<mesh position={[0, 0.55, 0.52]}>
								<boxGeometry args={[1.15, 0.6, 0.06]} />
								<meshStandardMaterial color="#a91d23" roughness={0.9} />
							</mesh>
							<mesh position={[-0.2, 1.2, 0.52]}>
								<boxGeometry args={[0.06, 0.55, 0.03]} />
								<meshStandardMaterial color="#a91d23" />
							</mesh>
							<mesh position={[0.2, 1.2, 0.52]}>
								<boxGeometry args={[0.06, 0.55, 0.03]} />
								<meshStandardMaterial color="#a91d23" />
							</mesh>
							<mesh position={[0, 2.02, 0.05]} material={m.shirt}>
								<boxGeometry args={[1.5, 0.14, 1.1]} />
							</mesh>
						</>
					)}
					{/* braços */}
					<group position={[-1.5, 1.8, 0]} rotation={p.la}>
						<mesh position={[0, -0.75, 0]} material={m.shirt}>
							<boxGeometry args={[0.96, 1.2, 0.96]} />
						</mesh>
						<mesh position={[0, -1.6, 0]} material={m.skin}>
							<boxGeometry args={[0.94, 0.6, 0.94]} />
						</mesh>
					</group>
					<group position={[1.5, 1.8, 0]} rotation={p.ra}>
						<mesh position={[0, -0.75, 0]} material={m.shirt}>
							<boxGeometry args={[0.96, 1.2, 0.96]} />
						</mesh>
						<mesh position={[0, -1.6, 0]} material={m.skin}>
							<boxGeometry args={[0.94, 0.6, 0.94]} />
						</mesh>
						{handProp}
					</group>
					{prop === 'bunny' && <Bunny pos={[0, 1.0, 0.95]} s={0.9} />}
					{/* cabeça */}
					<group position={[0, 2.55, 0]} rotation={p.head}>
						<mesh material={m.skin}>
							<boxGeometry args={[1.2, 1.1, 1.1]} />
						</mesh>
						<mesh position={[0, 0, 0.556]}>
							<planeGeometry args={[1.12, 1.06]} />
							<meshStandardMaterial map={face} transparent roughness={0.8} polygonOffset polygonOffsetFactor={-2} />
						</mesh>
						<Hair look={look} hairMat={m.hair} />
						{look.glasses && (
							<group position={[0, 0.08, 0.6]}>
								<mesh position={[-0.26, 0, 0]}>
									<torusGeometry args={[0.17, 0.035, 6, 14]} />
									<meshStandardMaterial color="#222" />
								</mesh>
								<mesh position={[0.26, 0, 0]}>
									<torusGeometry args={[0.17, 0.035, 6, 14]} />
									<meshStandardMaterial color="#222" />
								</mesh>
							</group>
						)}
						{look.hat === 'capBack' && (
							<group position={[0, 0.62, 0]}>
								<mesh material={m.hat}>
									<boxGeometry args={[1.3, 0.3, 1.2]} />
								</mesh>
								<mesh material={m.hat} position={[0, -0.08, -0.85]} rotation={[-0.12, 0, 0]}>
									<boxGeometry args={[1.0, 0.1, 0.7]} />
								</mesh>
								<mesh position={[0, 0.1, 0.61]}>
									<boxGeometry args={[0.38, 0.22, 0.02]} />
									<meshStandardMaterial color="#ffe3c2" />
								</mesh>
							</group>
						)}
						{look.hat === 'flatCap' && (
							<group position={[0, 0.62, 0]}>
								<mesh material={m.hat}>
									<boxGeometry args={[1.3, 0.25, 1.24]} />
								</mesh>
								<mesh material={m.hat} position={[0, -0.06, 0.78]} rotation={[0.2, 0, 0]}>
									<boxGeometry args={[1.2, 0.08, 0.45]} />
								</mesh>
							</group>
						)}
					</group>
				</group>
				</>
				)}
			</group>
		</group>
	);
};

// Cabelo em mechas de bloco arredondadas (volume de verdade, nunca uma "tampa" lisa).
// Jovens: volume no topo + franja. Idosos: topo calvo/ralo + tufos brancos nas laterais e na nuca.
type Lock = [number, number, number, number, number, number, number, number, number, number];
const CAP: Lock[] = [
	[0, 0.66, -0.02, 1.28, 0.3, 1.2, 0, 0, 0, 0],
	[-0.63, 0.25, -0.08, 0.12, 0.66, 0.98, 0, 0, 0.04, 0],
	[0.63, 0.25, -0.08, 0.12, 0.66, 0.98, 0, 0, -0.04, 0],
	[0, 0.2, -0.6, 1.24, 0.8, 0.14, 0, 0, 0, 0],
];
const HAIR: Record<string, Lock[]> = {
	messy: [
		...CAP,
		[-0.38, 0.84, 0.16, 0.55, 0.32, 0.55, 0.3, 0.4, 0.35, 1], [0.05, 0.9, 0.2, 0.6, 0.34, 0.55, 0.35, -0.3, -0.1, 0],
		[0.42, 0.82, 0.1, 0.52, 0.3, 0.55, 0.25, -0.5, -0.4, 1], [-0.2, 0.88, -0.25, 0.6, 0.32, 0.55, -0.25, 0.2, 0.2, 0],
		[0.3, 0.86, -0.3, 0.55, 0.3, 0.5, -0.3, -0.3, -0.25, 1], [-0.36, 0.56, 0.52, 0.5, 0.26, 0.22, 0.55, 0.25, 0.45, 0],
		[0.04, 0.6, 0.55, 0.5, 0.26, 0.22, 0.6, -0.15, -0.3, 1], [0.42, 0.55, 0.5, 0.42, 0.24, 0.22, 0.5, -0.3, -0.55, 0],
		[-0.35, 0.4, -0.68, 0.5, 0.36, 0.22, -0.4, 0.2, 0.4, 1], [0.3, 0.45, -0.7, 0.5, 0.34, 0.22, -0.45, -0.2, -0.35, 0],
	],
	spiky: [
		...CAP,
		...[-0.4, -0.13, 0.14, 0.4].flatMap((x, i) => [[x, 0.95, 0.15 - (i % 2) * 0.35, 0.3, 0.45, 0.3, 0.3 - (i % 2) * 0.6, 0, -x * 0.8, i % 2] as Lock]),
		[0, 0.58, 0.55, 1.1, 0.2, 0.2, 0.5, 0, 0, 1],
	],
	short: [
		...CAP,
		[-0.2, 0.8, 0.25, 0.9, 0.24, 0.6, 0.35, 0, 0.2, 1], [0.3, 0.78, -0.2, 0.7, 0.22, 0.7, -0.1, 0, -0.15, 0],
		[0.2, 0.58, 0.55, 0.85, 0.2, 0.18, 0.45, 0, -0.2, 0],
	],
	long: [
		...CAP,
		[-0.3, 0.8, 0.15, 0.6, 0.26, 0.7, 0.3, 0.2, 0.3, 1], [0.3, 0.8, 0.1, 0.6, 0.26, 0.7, 0.3, -0.2, -0.3, 0],
		[0, 0.58, 0.55, 1.2, 0.22, 0.2, 0.45, 0, 0, 1],
		[0, -0.35, -0.62, 1.3, 1.1, 0.18, 0, 0, 0, 0], [-0.68, -0.2, -0.05, 0.16, 1.0, 0.9, 0, 0, 0.05, 1], [0.68, -0.2, -0.05, 0.16, 1.0, 0.9, 0, 0, -0.05, 1],
		[-0.68, -0.75, 0.15, 0.2, 0.4, 0.4, 0.2, 0, 0.1, 0], [0.68, -0.75, 0.15, 0.2, 0.4, 0.4, 0.2, 0, -0.1, 0],
	],
	bun: [
		...CAP,
		[0, 0.62, 0.53, 1.18, 0.2, 0.2, 0.4, 0, 0, 1], [0, 0.88, -0.4, 0.55, 0.45, 0.5, 0.2, 0.3, 0, 0], [0, 1.0, -0.45, 0.35, 0.25, 0.35, 0.2, 0.9, 0, 1],
		[-0.66, -0.05, 0.25, 0.14, 0.45, 0.2, 0.1, 0, 0.1, 1], [0.66, -0.05, 0.25, 0.14, 0.45, 0.2, 0.1, 0, -0.1, 1],
	],
	pigtails: [
		...CAP,
		[0, 0.6, 0.54, 1.2, 0.24, 0.2, 0.45, 0, 0, 1], [-0.25, 0.82, 0.1, 0.6, 0.24, 0.7, 0.2, 0, 0.2, 1], [0.25, 0.82, 0.1, 0.6, 0.24, 0.7, 0.2, 0, -0.2, 0],
		[-0.85, 0.12, -0.1, 0.42, 0.62, 0.42, 0, 0, 0.45, 0], [0.85, 0.12, -0.1, 0.42, 0.62, 0.42, 0, 0, -0.45, 0],
		[-0.98, -0.28, -0.1, 0.3, 0.4, 0.3, 0, 0, 0.2, 1], [0.98, -0.28, -0.1, 0.3, 0.4, 0.3, 0, 0, -0.2, 1],
	],
	// idoso: topo calvo, tufos volumosos nas laterais e coroa na nuca
	old: [
		[-0.66, 0.12, -0.1, 0.18, 0.5, 0.9, 0, 0, 0.06, 0], [0.66, 0.12, -0.1, 0.18, 0.5, 0.9, 0, 0, -0.06, 0],
		[-0.72, 0.32, 0.12, 0.26, 0.3, 0.4, 0.2, 0, 0.5, 1], [0.72, 0.32, 0.12, 0.26, 0.3, 0.4, 0.2, 0, -0.5, 1],
		[-0.7, 0.3, -0.35, 0.26, 0.32, 0.45, -0.2, 0, 0.45, 1], [0.7, 0.3, -0.35, 0.26, 0.32, 0.45, -0.2, 0, -0.45, 1],
		[0, 0.1, -0.62, 1.26, 0.5, 0.16, 0, 0, 0, 0], [-0.35, 0.32, -0.66, 0.5, 0.26, 0.2, -0.3, 0, 0.3, 1], [0.35, 0.32, -0.66, 0.5, 0.26, 0.2, -0.3, 0, -0.3, 1],
		[0, 0.6, 0.1, 0.5, 0.06, 0.4, 0, 0, 0, 1],
	],
	oldBun: [
		...CAP,
		[0, 0.6, 0.53, 1.18, 0.18, 0.2, 0.4, 0, 0, 1], [0, 0.85, -0.45, 0.45, 0.38, 0.42, 0.25, 0.4, 0, 1],
	],
};
HAIR.bald = HAIR.old;

const hairGeo = new Map<string, THREE.BufferGeometry>();
const hb = (w: number, h: number, d: number) => {
	const k = `${w}|${h}|${d}`;
	let g = hairGeo.get(k);
	if (!g) {
		g = new RoundedBoxGeometry(w, h, d, 2, Math.min(0.06, Math.min(w, h, d) * 0.3));
		hairGeo.set(k, g);
	}
	return g;
};

const Hair: React.FC<{look: Look; hairMat: THREE.Material}> = ({look, hairMat}) => {
	const h = look.hair;
	const m2 = useMemo(() => {
		const c = new THREE.Color(h?.col ?? '#333');
		const hsl = {h: 0, s: 0, l: 0};
		c.getHSL(hsl);
		c.setHSL(hsl.h, hsl.s, Math.min(0.92, hsl.l * 1.18 + 0.03));
		return new THREE.MeshStandardMaterial({color: c, roughness: 0.75});
	}, [h?.col]);
	if (!h) return null;
	const hat = look.hat && look.hat !== 'none';
	const locks = HAIR[h.style] ?? HAIR.short;
	return (
		<>
			{locks.map(([x, y, z, w, hh, d, rx, ry, rz, tone], i) =>
				hat && y > 0.5 ? null : <mesh key={i} geometry={hb(w, hh, d)} material={tone ? m2 : hairMat} position={[x, y, z]} rotation={[rx, ry, rz]} />,
			)}
		</>
	);
};

export const Bunny: React.FC<{pos: [number, number, number]; s?: number; ry?: number}> = ({pos, s = 1, ry = 0}) => (
	<group position={pos} scale={s} rotation={[0, ry, 0]}>
		<mesh>
			<boxGeometry args={[0.8, 0.9, 0.6]} />
			<meshStandardMaterial color="#f3f0ea" roughness={1} />
		</mesh>
		<mesh position={[0, 0.75, 0]}>
			<boxGeometry args={[0.7, 0.6, 0.6]} />
			<meshStandardMaterial color="#f3f0ea" roughness={1} />
		</mesh>
		<mesh position={[-0.18, 1.3, 0]}>
			<boxGeometry args={[0.16, 0.6, 0.12]} />
			<meshStandardMaterial color="#f3f0ea" />
		</mesh>
		<mesh position={[0.18, 1.3, 0]}>
			<boxGeometry args={[0.16, 0.6, 0.12]} />
			<meshStandardMaterial color="#f3f0ea" />
		</mesh>
		<mesh position={[-0.15, 0.8, 0.31]}>
			<boxGeometry args={[0.08, 0.1, 0.02]} />
			<meshBasicMaterial color="#111" />
		</mesh>
		<mesh position={[0.15, 0.8, 0.31]}>
			<boxGeometry args={[0.08, 0.1, 0.02]} />
			<meshBasicMaterial color="#111" />
		</mesh>
		<mesh position={[0, 0.66, 0.31]}>
			<boxGeometry args={[0.1, 0.07, 0.02]} />
			<meshBasicMaterial color="#e78a9a" />
		</mesh>
	</group>
);
