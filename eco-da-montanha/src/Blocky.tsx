// Personagem de blocos (estilo avatar), com rosto que muda de expressão e poses animadas por frame.
import * as THREE from 'three';
import React, {useMemo} from 'react';
import {Expr, faceTex, T} from './tex';
import {MaxBody} from './Max';

export type Look = {
	skin: string;
	shirt: () => THREE.Texture;
	shirtCol: string;
	pants: string;
	shoes: string;
	hat?: 'capBack' | 'flatCap' | 'none';
	hatCol?: string;
	hair?: {col: string; style: 'short' | 'pigtails' | 'bun' | 'bald' | 'long' | 'messy'};
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
	velho: {skin: '#d9ab84', shirt: () => T.fabric('#3b3a36'), shirtCol: '#3b3a36', pants: '#2a2925', shoes: '#4a3524', hat: 'flatCap', hatCol: '#5b4a3a', hair: {col: '#c9c4bc', style: 'short'}, beard: true, scale: 1.38},
	mae: {skin: '#efc39a', shirt: () => T.knit('#4f7a52', '#5c8a5f', 1), shirtCol: '#4f7a52', pants: '#3b3f4f', shoes: '#5a3b2a', hair: {col: '#6b3b1f', style: 'bun'}, scale: 1.34},
	pai: {skin: '#e3b48a', shirt: () => T.plaid('#2e5a8a', '#1b2f4a'), shirtCol: '#2e5a8a', pants: '#3a3a3a', shoes: '#3a2a1a', hair: {col: '#3a2615', style: 'short'}, scale: 1.42},
	avo: {skin: '#e9be98', shirt: () => T.knit('#c8a878', '#b89464', 1), shirtCol: '#c8a878', pants: '#5a4e40', shoes: '#3a2a1a', hair: {col: '#e8e4dc', style: 'bald'}, glasses: true, scale: 1.3},
	// a coisa: silhueta preta de bloco (só aparece em parte)
	sombra: {skin: '#050507', shirt: () => T.fabric('#050507'), shirtCol: '#050507', pants: '#050507', shoes: '#050507', hair: {col: '#050507', style: 'short'}, scale: 1.34},
};

CAST.teco = CAST.max;

const townCols = ['#d9534f', '#f0ad4e', '#5bc0de', '#5cb85c', '#9b59b6', '#34495e', '#e67e22', '#16a085', '#c0392b', '#2980b9', '#8e6e53', '#d35400'];
const skins = ['#f1c79c', '#e0ac7e', '#c68a5c', '#8d5a3b', '#f4d5b5', '#a8704a'];
const hairs = ['#2a1a10', '#5a3720', '#d7b36a', '#8a3b1a', '#1a1a1a', '#9a9a9a'];
export const townie = (i: number, kid = false): Look => {
	const a = townCols[i % townCols.length], b = townCols[(i * 5 + 3) % townCols.length];
	const kind = i % 3;
	return {
		skin: skins[(i * 7) % skins.length],
		shirt: kind === 0 ? () => T.knit(a, b, 2) : kind === 1 ? () => T.plaid(a, b) : () => T.fabric(a),
		shirtCol: a,
		pants: ['#2c3346', '#3a3a3a', '#5a4e40', '#273b5a'][i % 4],
		shoes: '#3a2a1a',
		hair: {col: hairs[(i * 3) % hairs.length], style: i % 4 === 1 ? 'long' : i % 4 === 3 ? 'bun' : 'short'},
		hat: i % 5 === 2 ? 'flatCap' : 'none',
		hatCol: b,
		scale: kid ? 0.95 + (i % 3) * 0.05 : 1.3 + (i % 4) * 0.04,
	};
};

export type Pose = 'idle' | 'wave' | 'cup' | 'knock' | 'run' | 'walk' | 'sit' | 'sleep' | 'lean' | 'cheer' | 'point' | 'hug' | 'lifted' | 'arms' | 'hold' | 'cover' | 'reach' | 'five' | 'shrug' | 'torch' | 'apose';

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
	if (look.custom === 'max' && pose === 'sit') p.y = -0.6; // perna do Max é mais longa (quadril em 2,4)
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

const Hair: React.FC<{look: Look; hairMat: THREE.Material}> = ({look, hairMat}) => {
	const h = look.hair;
	if (!h || h.style === 'bald') {
		return h ? (
			<>
				<mesh material={hairMat} position={[-0.62, 0.05, -0.1]}>
					<boxGeometry args={[0.08, 0.5, 0.8]} />
				</mesh>
				<mesh material={hairMat} position={[0.62, 0.05, -0.1]}>
					<boxGeometry args={[0.08, 0.5, 0.8]} />
				</mesh>
			</>
		) : null;
	}
	return (
		<>
			{look.hat === 'none' || !look.hat ? (
				<mesh material={hairMat} position={[0, 0.5, -0.05]}>
					<boxGeometry args={[1.26, 0.22, 1.2]} />
				</mesh>
			) : null}
			<mesh material={hairMat} position={[0, 0.1, -0.6]}>
				<boxGeometry args={[1.26, h.style === 'long' ? 1.4 : 0.9, 0.12]} />
			</mesh>
			{(h.style === 'pigtails' || h.style === 'long') && (
				<>
					<mesh material={hairMat} position={[0, 0.42, 0.53]}>
						<boxGeometry args={[1.24, 0.24, 0.08]} />
					</mesh>
				</>
			)}
			{h.style === 'pigtails' && (
				<>
					<mesh material={hairMat} position={[-0.8, 0.15, -0.1]} rotation={[0, 0, 0.4]}>
						<boxGeometry args={[0.4, 0.55, 0.4]} />
					</mesh>
					<mesh material={hairMat} position={[0.8, 0.15, -0.1]} rotation={[0, 0, -0.4]}>
						<boxGeometry args={[0.4, 0.55, 0.4]} />
					</mesh>
					<mesh position={[-0.66, 0.3, -0.1]}>
						<boxGeometry args={[0.15, 0.2, 0.3]} />
						<meshStandardMaterial color="#ffd166" />
					</mesh>
					<mesh position={[0.66, 0.3, -0.1]}>
						<boxGeometry args={[0.15, 0.2, 0.3]} />
						<meshStandardMaterial color="#ffd166" />
					</mesh>
				</>
			)}
			{h.style === 'messy' && (
				<>
					{[[-0.45, 0.66, 0.3, 0.3], [0, 0.72, 0.38, -0.2], [0.42, 0.64, 0.25, 0.25], [-0.25, 0.7, -0.25, 0.1], [0.3, 0.7, -0.3, -0.3], [0, 0.6, 0.56, 0.0]].map(([x, y, z, r], i) => (
						<mesh key={i} material={hairMat} position={[x, y, z]} rotation={[0.3, r, r * 0.6]}>
							<boxGeometry args={[0.55, 0.32, 0.5]} />
						</mesh>
					))}
					<mesh material={hairMat} position={[-0.45, 0.42, 0.56]} rotation={[0, 0, 0.35]}>
						<boxGeometry args={[0.45, 0.2, 0.1]} />
					</mesh>
				</>
			)}
			{h.style === 'bun' && (
				<mesh material={hairMat} position={[0, 0.75, -0.3]}>
					<boxGeometry args={[0.5, 0.4, 0.5]} />
				</mesh>
			)}
			<mesh material={hairMat} position={[-0.62, 0.1, -0.15]}>
				<boxGeometry args={[0.06, 0.7, 0.8]} />
			</mesh>
			<mesh material={hairMat} position={[0.62, 0.1, -0.15]}>
				<boxGeometry args={[0.06, 0.7, 0.8]} />
			</mesh>
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
