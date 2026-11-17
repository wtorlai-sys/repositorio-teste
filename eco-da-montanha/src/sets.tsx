// Cenários (texturas no chão e nas paredes, nunca cor lisa) + luz por clima.
import * as THREE from 'three';
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import {rng, signTex, T} from './tex';

export type Mood = 'day' | 'cloudy' | 'dusk' | 'fire' | 'cold' | 'roomNight' | 'roomDay' | 'cave' | 'void';

const MOODS: Record<Mood, {bg: string; fog: [string, number, number]; hemi: [string, string, number]; sun: [string, number, [number, number, number]]; amb: number}> = {
	day: {bg: '#8fd0f7', fog: ['#cfe8f5', 40, 260], hemi: ['#eaf6ff', '#5c8a3a', 1.1], sun: ['#fff1d6', 2.6, [30, 40, 20]], amb: 0.25},
	cloudy: {bg: '#9aa6ae', fog: ['#a9b2b8', 12, 120], hemi: ['#c9d3da', '#4f5c48', 1.0], sun: ['#dfe6ea', 1.0, [-20, 40, 10]], amb: 0.35},
	dusk: {bg: '#3a3f66', fog: ['#4a4a6a', 20, 160], hemi: ['#7a7fb0', '#2b2a35', 0.7], sun: ['#ff9a5a', 0.8, [-40, 10, 10]], amb: 0.2},
	fire: {bg: '#141a33', fog: ['#1a1d33', 18, 120], hemi: ['#3a4570', '#1a1410', 0.55], sun: ['#7d8cc4', 0.35, [20, 40, -10]], amb: 0.12},
	cold: {bg: '#060a14', fog: ['#0a1020', 10, 90], hemi: ['#2c3f66', '#05070a', 0.45], sun: ['#7fa0d8', 0.45, [-20, 40, 20]], amb: 0.08},
	roomNight: {bg: '#0d1424', fog: ['#0d1424', 30, 80], hemi: ['#4a5a86', '#1c1410', 0.35], sun: ['#7fa0d8', 0.25, [-5, 8, 10]], amb: 0.1},
	roomDay: {bg: '#cfe6f2', fog: ['#cfe6f2', 40, 120], hemi: ['#fff6e8', '#8a6a48', 1.0], sun: ['#fff0d8', 1.3, [5, 8, 8]], amb: 0.3},
	cave: {bg: '#080605', fog: ['#0b0806', 6, 30], hemi: ['#3a2c22', '#050403', 0.3], sun: ['#ffb070', 0.2, [0, 5, 5]], amb: 0.08},
	void: {bg: '#020306', fog: ['#020306', 10, 60], hemi: ['#1a2440', '#000000', 0.25], sun: ['#4060a0', 0.2, [0, 10, 10]], amb: 0.05},
};

export const Env: React.FC<{mood: Mood}> = ({mood}) => {
	const m = MOODS[mood];
	const {scene, gl} = useThree();
	scene.background = new THREE.Color(m.bg);
	scene.fog = new THREE.Fog(m.fog[0], m.fog[1], m.fog[2]);
	gl.toneMapping = THREE.ACESFilmicToneMapping;
	gl.toneMappingExposure = 1.05;
	return (
		<>
			<hemisphereLight args={[m.hemi[0], m.hemi[1], m.hemi[2]]} />
			<ambientLight intensity={m.amb} />
			<directionalLight color={m.sun[0]} intensity={m.sun[1]} position={m.sun[2]} />
		</>
	);
};

const Ground: React.FC<{tex: THREE.Texture; size?: number; y?: number; color?: string}> = ({tex, size = 200, y = 0, color = '#ffffff'}) => (
	<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
		<planeGeometry args={[size, size]} />
		<meshStandardMaterial map={tex} color={color} roughness={0.95} />
	</mesh>
);

const Box: React.FC<{p: [number, number, number]; s: [number, number, number]; map?: THREE.Texture; c?: string; r?: [number, number, number]; e?: string; ei?: number}> = ({p, s, map, c = '#ffffff', r, e, ei}) => (
	<mesh position={p} rotation={r}>
		<boxGeometry args={s} />
		<meshStandardMaterial map={map} color={c} roughness={0.85} emissive={e ?? '#000000'} emissiveIntensity={ei ?? 0} />
	</mesh>
);

export const Plane: React.FC<{p: [number, number, number]; s: [number, number]; map: THREE.Texture; r?: [number, number, number]; basic?: boolean; c?: string; transparent?: boolean; opacity?: number}> = ({p, s, map, r, basic, c = '#ffffff', transparent, opacity = 1}) => (
	<mesh position={p} rotation={r}>
		<planeGeometry args={s} />
		{basic ? <meshBasicMaterial map={map} color={c} transparent={transparent} opacity={opacity} toneMapped={false} /> : <meshStandardMaterial map={map} color={c} transparent={transparent} opacity={opacity} roughness={0.9} />}
	</mesh>
);

// ---------- Montanha ----------
export const Mountain: React.FC<{p?: [number, number, number]; s?: number; crack?: number}> = ({p = [0, 0, -160], s = 1, crack = 0}) => {
	const geo = useMemo(() => {
		const g = new THREE.ConeGeometry(70, 95, 11, 6, true);
		const pos = g.attributes.position;
		const r = rng(5);
		for (let i = 0; i < pos.count; i++) {
			const y = pos.getY(i);
			if (y > 47) continue;
			const k = 1 + (r() - 0.5) * 0.22;
			pos.setX(i, pos.getX(i) * k);
			pos.setZ(i, pos.getZ(i) * k);
			pos.setY(i, y + (r() - 0.5) * 6);
		}
		g.computeVertexNormals();
		return g.toNonIndexed();
	}, []);
	const snow = useMemo(() => {
		const g = new THREE.ConeGeometry(19, 26, 11, 2);
		return g;
	}, []);
	return (
		<group position={p} scale={s}>
			<mesh geometry={geo} position={[0, 47, 0]}>
				<meshStandardMaterial map={T.rock([6, 4])} color="#9a9488" flatShading roughness={1} side={THREE.DoubleSide} />
			</mesh>
			<mesh geometry={snow} position={[0, 82, 0]}>
				<meshStandardMaterial color="#eef2f5" flatShading roughness={1} />
			</mesh>
			{/* entrada escura da caverna do norte */}
			<mesh position={[-14, 14, 52]} rotation={[0, -0.25, 0]}>
				<circleGeometry args={[6, 7]} />
				<meshBasicMaterial color="#050404" />
			</mesh>
			{crack > 0 && (
				<mesh position={[4, 30, 47]} rotation={[0, 0.1, 0]}>
					<planeGeometry args={[1.6, 40 * crack]} />
					<meshBasicMaterial color="#ffd27a" toneMapped={false} />
				</mesh>
			)}
		</group>
	);
};

// anéis de som saindo de um ponto (eco)
export const EchoRings: React.FC<{p: [number, number, number]; t: number; n?: number; size?: number; broken?: boolean; color?: string; face?: [number, number, number]}> = ({p, t, n = 4, size = 40, broken, color = '#ffffff', face = [0, 0, 0]}) => (
	<group position={p} rotation={face}>
		{Array.from({length: n}).map((_, i) => {
			const ph = (t * 0.7 + i / n) % 1;
			const op = (1 - ph) * (broken ? (i % 2 ? 0.0 : 0.7) : 0.7);
			return (
				<mesh key={i} scale={0.2 + ph * size}>
					<planeGeometry args={[1, 1]} />
					<meshBasicMaterial map={T.ring()} color={color} transparent opacity={op} depthWrite={false} toneMapped={false} />
				</mesh>
			);
		})}
	</group>
);

// ---------- Casas ----------
const House: React.FC<{p: [number, number, number]; ry?: number; w?: number; h?: number; col: string; roof?: string; lit?: string | null; brick?: boolean; door?: string}> = ({p, ry = 0, w = 6, h = 6, col, roof = '#6b2f24', lit = null, brick, door = '#5a3a24'}) => {
	const wall = brick ? T.brick([w / 3, h / 3], col) : T.siding([w / 3, h / 3], col);
	return (
		<group position={p} rotation={[0, ry, 0]}>
			<Box p={[0, h / 2, 0]} s={[w, h, 6]} map={wall} />
			<mesh position={[0, h + 1.4, 0]} rotation={[0, Math.PI / 4, 0]}>
				<coneGeometry args={[w * 0.78, 2.8, 4]} />
				<meshStandardMaterial color={roof} flatShading roughness={0.9} />
			</mesh>
			<Plane p={[-w * 0.25, h * 0.7, 3.01]} s={[1.3, 1.6]} map={T.window(lit)} basic={!!lit} />
			<Plane p={[w * 0.25, h * 0.7, 3.01]} s={[1.3, 1.6]} map={T.window(lit)} basic={!!lit} />
			<Plane p={[w * 0.25, h * 0.25, 3.01]} s={[1.3, 1.6]} map={T.window(lit)} basic={!!lit} />
			<Box p={[-w * 0.25, 1.1, 3.02]} s={[1.2, 2.2, 0.1]} map={T.wood([1, 1], door)} />
			<Box p={[-w * 0.25, 0.1, 3.4]} s={[1.6, 0.2, 0.8]} map={T.rock([1, 1], '#8a8578')} />
		</group>
	);
};

const Fence: React.FC<{p: [number, number, number]; len: number; ry?: number}> = ({p, len, ry = 0}) => (
	<group position={p} rotation={[0, ry, 0]}>
		{Array.from({length: Math.floor(len / 0.5)}).map((_, i) => (
			<Box key={i} p={[i * 0.5 - len / 2, 0.45, 0]} s={[0.14, 0.9, 0.06]} c="#f4f1ea" />
		))}
		<Box p={[0, 0.65, -0.05]} s={[len, 0.1, 0.05]} c="#f4f1ea" />
		<Box p={[0, 0.3, -0.05]} s={[len, 0.1, 0.05]} c="#f4f1ea" />
	</group>
);

const Lamp: React.FC<{p: [number, number, number]; on?: boolean}> = ({p, on}) => (
	<group position={p}>
		<mesh position={[0, 1.8, 0]}>
			<cylinderGeometry args={[0.07, 0.1, 3.6, 6]} />
			<meshStandardMaterial color="#222" />
		</mesh>
		<Box p={[0, 3.75, 0]} s={[0.4, 0.5, 0.4]} c={on ? '#ffe2a0' : '#d8d2c0'} e={on ? '#ffcf7a' : undefined} ei={on ? 1.4 : 0} />
		{on && (
			<sprite position={[0, 3.75, 0]} scale={[3, 3, 1]}>
				<spriteMaterial map={T.glow('rgba(255,200,120,0.55)')} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
			</sprite>
		)}
	</group>
);

export const Pine: React.FC<{p: [number, number, number]; s?: number; dark?: boolean}> = ({p, s = 1, dark}) => (
	<group position={p} scale={s}>
		<mesh position={[0, 0.8, 0]}>
			<cylinderGeometry args={[0.2, 0.28, 1.6, 6]} />
			<meshStandardMaterial color="#5a3a22" />
		</mesh>
		{[0, 1, 2].map((i) => (
			<mesh key={i} position={[0, 2 + i * 1.2, 0]}>
				<coneGeometry args={[1.7 - i * 0.45, 2.2, 7]} />
				<meshStandardMaterial color={dark ? '#1f3a2a' : ['#2f6b3a', '#357a40', '#3d8a48'][i]} flatShading />
			</mesh>
		))}
	</group>
);

const Church: React.FC<{p: [number, number, number]}> = ({p}) => (
	<group position={p}>
		<Box p={[0, 4, 0]} s={[8, 8, 12]} map={T.brick([3, 3], '#b8aa92')} />
		<mesh position={[0, 9.5, 0]} rotation={[0, 0, 0]}>
			<cylinderGeometry args={[0.01, 6, 3, 4, 1, false, Math.PI / 4]} />
			<meshStandardMaterial color="#4a3b33" flatShading />
		</mesh>
		<Box p={[0, 9, 6.5]} s={[4, 18, 4]} map={T.brick([2, 6], '#b8aa92')} />
		<Plane p={[0, 15, 8.51]} s={[3, 3]} map={T.clock()} />
		<mesh position={[0, 20, 6.5]}>
			<coneGeometry args={[3, 5, 4]} />
			<meshStandardMaterial color="#3a4a5a" flatShading />
		</mesh>
	</group>
);

export const Bonfire: React.FC<{p: [number, number, number]; t: number; s?: number}> = ({p, t, s = 1}) => (
	<group position={p} scale={s}>
		{[0, 1, 2, 3, 4].map((i) => (
			<mesh key={i} position={[0, 0.25, 0]} rotation={[0, (i / 5) * Math.PI, 1.2]}>
				<cylinderGeometry args={[0.12, 0.15, 2, 6]} />
				<meshStandardMaterial color="#4a2f1a" />
			</mesh>
		))}
		{[0, 1, 2].map((i) => (
			<mesh key={'f' + i} position={[Math.sin(i * 2) * 0.2, 0.9 + i * 0.1, Math.cos(i * 2) * 0.2]} scale={[1, 1 + Math.sin(t * (13 + i * 4)) * 0.2, 1]}>
				<coneGeometry args={[0.6 - i * 0.12, 1.8 - i * 0.2, 7]} />
				<meshBasicMaterial color={['#ff7a1a', '#ffb347', '#fff0a0'][i]} toneMapped={false} />
			</mesh>
		))}
		<sprite position={[0, 1.2, 0]} scale={[7, 7, 1]}>
			<spriteMaterial map={T.glow('rgba(255,150,60,0.65)')} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
		</sprite>
		<pointLight position={[0, 2, 0]} color="#ff9a4a" intensity={60 * (1 + Math.sin(t * 11) * 0.12)} distance={30} decay={1.6} />
	</group>
);

export const Town: React.FC<{mood: Mood; t: number; bonfire?: boolean; banner?: boolean}> = ({mood, t, bonfire, banner}) => {
	const night = mood === 'fire' || mood === 'cold' || mood === 'dusk';
	const lit = night ? '#ffd58a' : null;
	return (
		<group>
			<Ground tex={T.cobble([40, 40])} size={160} />
			<Mountain />
			<House p={[-9, 0, -14]} col="#e7c94a" lit={lit} roof="#4a3b33" door="#3a2a1a" />
			<House p={[-2.5, 0, -15]} col="#c6d6e0" lit={lit} />
			<House p={[4, 0, -15]} col="#b55a3c" brick lit={lit} />
			<House p={[-16, 0, -10]} ry={0.5} col="#e3d7c3" lit={lit} roof="#3a4a5a" />
			<House p={[16, 0, -7]} ry={-0.6} col="#9ab48a" lit={lit} />
			<House p={[-15, 0, 4]} ry={1.57} col="#d8a7a0" lit={lit} />
			<House p={[15, 0, 6]} ry={-1.57} col="#c9b48f" brick lit={lit} />
			<Church p={[12, 0, -26]} />
			<Fence p={[-6, 0, -8]} len={9} />
			<Fence p={[6, 0, -8]} len={9} />
			<Lamp p={[-4, 0, -6]} on={night} />
			<Lamp p={[5, 0, -5]} on={night} />
			<Lamp p={[-8, 0, 4]} on={night} />
			<Pine p={[-22, 0, -18]} s={1.4} />
			<Pine p={[22, 0, -14]} s={1.6} />
			<Pine p={[-24, 0, 2]} s={1.2} />
			{bonfire && <Bonfire p={[0, 0, -1]} t={t} s={1.2} />}
			{banner && (
				<group position={[0, 0, -9]}>
					<Box p={[-4, 2.5, 0]} s={[0.15, 5, 0.15]} c="#5a3a22" />
					<Box p={[4, 2.5, 0]} s={[0.15, 5, 0.15]} c="#5a3a22" />
					<Plane p={[0, 4.2, 0.1]} s={[8, 1.8]} map={signTex(['VALEU, TECO!'], {bg: '#f4ecd6', fg: '#c0392b', border: '#c0392b', w: 1024, h: 256})} />
				</group>
			)}
		</group>
	);
};

// ---------- Pedra do eco (pé da montanha) ----------
export const EchoStone: React.FC<{p?: [number, number, number]; glow?: number}> = ({p = [0, 0, 0], glow = 0}) => {
	const geo = useMemo(() => {
		const g = new THREE.IcosahedronGeometry(1.6, 1);
		const pos = g.attributes.position;
		const r = rng(9);
		const seen = new Map<string, number>();
		for (let i = 0; i < pos.count; i++) {
			const key = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
			let k = seen.get(key);
			if (k === undefined) {
				k = 0.85 + r() * 0.3;
				seen.set(key, k);
			}
			pos.setXYZ(i, pos.getX(i) * k * 1.1, pos.getY(i) * k * 1.25, pos.getZ(i) * k * 0.9);
		}
		g.computeVertexNormals();
		return g;
	}, []);
	return (
		<group position={p}>
			<mesh geometry={geo} position={[0, 1.6, 0]}>
				<meshStandardMaterial map={T.rock([2, 2], '#8b857a')} flatShading roughness={1} emissive="#ffc46a" emissiveIntensity={glow * 0.35} />
			</mesh>
			{/* espiral entalhada (a "orelha" da pedra) */}
			<mesh position={[0, 2.0, 1.42]} rotation={[-0.1, 0, 0]}>
				<torusGeometry args={[0.38, 0.06, 6, 20, Math.PI * 1.6]} />
				<meshStandardMaterial color="#3a352f" emissive="#ffc46a" emissiveIntensity={glow * 1.5} />
			</mesh>
			<mesh position={[0, 2.0, 1.44]}>
				<torusGeometry args={[0.18, 0.05, 6, 16, Math.PI * 1.5]} />
				<meshStandardMaterial color="#3a352f" emissive="#ffc46a" emissiveIntensity={glow * 1.5} />
			</mesh>
			{/* placa */}
			<group position={[1.9, 0, 1.2]} rotation={[0, -0.35, 0]}>
				<Box p={[0, 0.6, 0]} s={[0.12, 1.2, 0.12]} c="#5a3a22" />
				<Plane p={[0, 1.35, 0.07]} s={[1.5, 0.75]} map={signTex(['PEDRA', 'DO ECO'], {bg: '#3b2a1c', fg: '#f4ecd6', w: 512, h: 256})} />
			</group>
			{glow > 0 && (
				<sprite position={[0, 2, 1.6]} scale={[3 + glow * 4, 3 + glow * 4, 1]}>
					<spriteMaterial map={T.glow('rgba(255,200,110,0.5)')} transparent opacity={Math.min(1, glow)} depthWrite={false} blending={THREE.AdditiveBlending} />
				</sprite>
			)}
		</group>
	);
};

export const RockSite: React.FC<{mood: Mood; glow?: number; crack?: number}> = ({mood, glow = 0, crack = 0}) => (
	<group>
		<Ground tex={T.grass([30, 30])} size={140} />
		<mesh rotation={[-Math.PI / 2, 0, 0.1]} position={[1, 0.02, -10]}>
			<planeGeometry args={[2.4, 40]} />
			<meshStandardMaterial map={T.dirt([1, 12])} roughness={1} />
		</mesh>
		<Mountain p={[0, -6, -90]} s={1.05} crack={crack} />
		<EchoStone glow={glow} />
		<Pine p={[-6, 0, -6]} s={1.3} dark={mood !== 'day'} />
		<Pine p={[6.5, 0, -9]} s={1.6} dark={mood !== 'day'} />
		<Pine p={[-9, 0, -14]} s={1.8} dark={mood !== 'day'} />
		<Pine p={[9, 0, 2]} s={1.2} dark={mood !== 'day'} />
		<Pine p={[-10, 0, 3]} s={1.4} dark={mood !== 'day'} />
		{[[-3, -3], [3.5, -2], [-2, 4], [4.5, 3.5]].map(([x, z], i) => (
			<mesh key={i} position={[x, 0.2, z]} scale={[0.6, 0.4, 0.5]}>
				<dodecahedronGeometry args={[1, 0]} />
				<meshStandardMaterial map={T.rock([1, 1])} flatShading />
			</mesh>
		))}
		<group position={[-2.2, 0, 2.2]} rotation={[0, 0.5, 0]}>
			<Box p={[0, 0.8, 0]} s={[0.12, 1.6, 0.12]} c="#5a3a22" />
			<Plane p={[0, 1.5, 0.07]} s={[1.6, 0.8]} map={signTex(['1 PERGUNTA', '= 1 SEGREDO'], {bg: '#f4ecd6', fg: '#3b2a1c', border: '#3b2a1c', w: 512, h: 256})} />
		</group>
	</group>
);

// ---------- Quartos (parede compartilhada em x=0) ----------
export const Rooms: React.FC<{lamp?: boolean; liaWindowOpen?: boolean; liaInBed?: boolean; day?: boolean; t: number; curtain?: number}> = ({lamp = true, liaWindowOpen, day, t}) => {
	const floor = T.wood([4, 4], '#9a6a40');
	return (
		<group>
			<Ground tex={floor} size={20} />
			{/* parede compartilhada */}
			<Box p={[0, 1.6, 0]} s={[0.2, 3.2, 6]} map={T.wallpaper([2, 1.2], '#c9dbe6', '#7aa0c0')} />
			<Plane p={[0.11, 1.6, 0]} s={[6, 3.2]} r={[0, Math.PI / 2, 0]} map={T.wallpaper([2.5, 1.2], '#f3d6dc', '#e88aa0')} />
			{/* paredes do fundo */}
			<Plane p={[-3, 1.6, -3]} s={[6, 3.2]} map={T.wallpaper([2.5, 1.2], '#c9dbe6', '#7aa0c0')} />
			<Plane p={[3, 1.6, -3]} s={[6, 3.2]} map={T.wallpaper([2.5, 1.2], '#f3d6dc', '#e88aa0')} />
			<Plane p={[-6, 1.6, 0]} s={[6, 3.2]} r={[0, Math.PI / 2, 0]} map={T.wallpaper([2.5, 1.2], '#c9dbe6', '#7aa0c0')} />
			<Plane p={[6, 1.6, 0]} s={[6, 3.2]} r={[0, -Math.PI / 2, 0]} map={T.wallpaper([2.5, 1.2], '#f3d6dc', '#e88aa0')} />
			{/* rodapé */}
			<Box p={[-3, 0.08, -2.97]} s={[6, 0.16, 0.05]} c="#efe8dc" />
			<Box p={[3, 0.08, -2.97]} s={[6, 0.16, 0.05]} c="#efe8dc" />
			{/* janelas */}
			<group position={[-3.2, 1.7, -2.98]}>
				<Plane p={[0, 0, 0]} s={[1.4, 1.6]} map={T.window(day ? '#bfe4ff' : null)} basic />
			</group>
			<group position={[3.2, 1.7, -2.98]}>
				{liaWindowOpen ? (
					<>
						<Plane p={[0, 0, 0]} s={[1.4, 1.6]} map={T.window(null)} basic c="#334" />
						<mesh position={[0.4 + Math.sin(t * 3) * 0.08, 0, 0.12]} rotation={[0, 0.5 + Math.sin(t * 2.3) * 0.2, 0]}>
							<planeGeometry args={[0.6, 1.7]} />
							<meshStandardMaterial map={T.fabric('#f6f2e8')} side={THREE.DoubleSide} transparent opacity={0.85} />
						</mesh>
					</>
				) : (
					<Plane p={[0, 0, 0]} s={[1.4, 1.6]} map={T.window(day ? '#bfe4ff' : null)} basic />
				)}
			</group>
			{/* camas */}
			<group position={[-1.3, 0, -1.6]}>
				<Box p={[0, 0.3, 0]} s={[1.2, 0.6, 2.2]} map={T.wood([1, 1], '#6a4a2a')} />
				<Box p={[0, 0.65, 0.15]} s={[1.1, 0.15, 1.9]} map={T.plaid('#2e5a8a', '#f2e3c2')} />
				<Box p={[0, 0.75, -0.8]} s={[0.8, 0.18, 0.4]} c="#f4f1ea" />
				<Box p={[0, 0.8, -1.1]} s={[1.2, 1.0, 0.1]} map={T.wood([1, 1], '#6a4a2a')} />
			</group>
			<group position={[1.3, 0, -1.6]}>
				<Box p={[0, 0.3, 0]} s={[1.2, 0.6, 2.2]} map={T.wood([1, 1], '#f0e6d8')} />
				<Box p={[0, 0.65, 0.15]} s={[1.1, 0.15, 1.9]} map={T.plaid('#e8566b', '#ffd166')} />
				<Box p={[0, 0.75, -0.8]} s={[0.8, 0.18, 0.4]} c="#f4f1ea" />
				<Box p={[0, 0.8, -1.1]} s={[1.2, 1.0, 0.1]} map={T.wood([1, 1], '#f0e6d8')} />
			</group>
			{/* luminárias */}
			{lamp && (
				<>
					<pointLight position={[-2.6, 2.2, 0.5]} color="#ffc98a" intensity={day ? 0 : 6} distance={9} decay={1.5} />
					<pointLight position={[2.6, 2.2, 0.5]} color="#ffb0a0" intensity={day ? 0 : 4} distance={9} decay={1.5} />
				</>
			)}
			<group position={[-2.6, 0, -2.4]}>
				<Box p={[0, 0.35, 0]} s={[0.6, 0.7, 0.5]} map={T.wood([1, 1], '#6a4a2a')} />
				<Box p={[0, 0.95, 0]} s={[0.3, 0.4, 0.3]} c="#ffe2a0" e="#ffcf7a" ei={lamp && !day ? 1 : 0} />
			</group>
			{/* pôster do quarto do Teco */}
			<Plane p={[-4.8, 2.0, -2.97]} s={[1, 1.3]} map={signTex(['FUTEBOL', 'CLUBE'], {bg: '#1f8a8a', fg: '#ffffff', w: 256, h: 340, size: 50})} />
			<Plane p={[4.6, 2.1, -2.97]} s={[0.9, 0.9]} map={signTex(['LIA'], {bg: '#ffd166', fg: '#e8566b', border: '#e8566b', w: 256, h: 256, size: 110})} />
		</group>
	);
};

// ---------- Sala (avô, retrato, porta, cozinha) ----------
export const Sala: React.FC<{day?: boolean; photoQ?: boolean; t: number; noteX?: number}> = ({day = true, photoQ, noteX}) => (
	<group>
		<Ground tex={T.wood([5, 5], '#8a5a34')} size={24} />
		<Plane p={[0, 1.7, -4]} s={[12, 3.4]} map={T.wallpaper([5, 1.4], '#e9dcb8', '#c27a4a')} />
		<Plane p={[-6, 1.7, 0]} s={[8, 3.4]} r={[0, Math.PI / 2, 0]} map={T.wallpaper([3.5, 1.4], '#e9dcb8', '#c27a4a')} />
		<Plane p={[6, 1.7, 0]} s={[8, 3.4]} r={[0, -Math.PI / 2, 0]} map={T.wallpaper([3.5, 1.4], '#e9dcb8', '#c27a4a')} />
		<Box p={[0, 0.08, -3.97]} s={[12, 0.16, 0.05]} c="#efe8dc" />
		{/* poltrona do avô */}
		<group position={[-2.5, 0, -2.6]}>
			<Box p={[0, 0.4, 0]} s={[1.4, 0.5, 1.2]} map={T.plaid('#8a3b2a', '#5a2a1a')} />
			<Box p={[0, 1.1, -0.5]} s={[1.4, 1.4, 0.3]} map={T.plaid('#8a3b2a', '#5a2a1a')} />
			<Box p={[-0.65, 0.75, 0]} s={[0.2, 0.4, 1.2]} map={T.plaid('#8a3b2a', '#5a2a1a')} />
			<Box p={[0.65, 0.75, 0]} s={[0.2, 0.4, 1.2]} map={T.plaid('#8a3b2a', '#5a2a1a')} />
		</group>
		{/* retrato da avó */}
		<Plane p={[-0.6, 2.1, -3.96]} s={[0.9, 1.12]} map={T.photo(!!photoQ)} />
		{/* quadro de giz com as 42 marcas */}
		<group position={[1.6, 1.9, -3.96]}>
			<Plane p={[0, 0, 0]} s={[1.6, 1.1]} map={signTex(['PERGUNTAS', 'DO VOVÔ: 42'], {bg: '#25352b', fg: '#f4f4ee', border: '#8a5a34', w: 512, h: 352, size: 64})} />
		</group>
		{/* porta da frente */}
		<group position={[4.5, 0, -3.95]}>
			<Box p={[0, 1.15, 0]} s={[1.3, 2.3, 0.1]} map={T.wood([1, 1], '#6a3a1f')} />
			<Box p={[0.45, 1.1, 0.08]} s={[0.1, 0.1, 0.1]} c="#d4b04a" />
			<Box p={[0, 2.36, 0]} s={[1.5, 0.12, 0.14]} c="#efe8dc" />
		</group>
		{noteX !== undefined && (
			<mesh position={[4.5, 0.012, -3.9 + noteX]} rotation={[-Math.PI / 2, 0, 0.2]}>
				<planeGeometry args={[0.32, 0.22]} />
				<meshStandardMaterial color="#f3ecd8" />
			</mesh>
		)}
		{/* cozinha */}
		<group position={[4, 0, 0.5]}>
			<Box p={[1.2, 0.5, 0]} s={[1.2, 1.0, 3]} map={T.wood([1, 2], '#c9b48f')} />
			<Box p={[1.2, 1.03, 0]} s={[1.3, 0.06, 3.1]} c="#e8e4dc" />
		</group>
		<pointLight position={[0, 2.8, -1]} color="#ffd9a8" intensity={day ? 4 : 8} distance={12} decay={1.4} />
	</group>
);

// ---------- Trilha ----------
export const Trail: React.FC<{mood: Mood; steps?: number}> = ({mood, steps = 14}) => (
	<group>
		<Ground tex={T.grass([30, 30])} size={140} color={mood === 'day' ? '#ffffff' : '#a8b0a0'} />
		<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -15]}>
			<planeGeometry args={[2.2, 50]} />
			<meshStandardMaterial map={T.dirt([1, 14])} roughness={1} />
		</mesh>
		{Array.from({length: steps}).map((_, i) => (
			<mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[(i % 2 ? 0.18 : -0.18) + Math.sin(i * 0.7) * 0.15, 0.03, 4 - i * 0.55]}>
				<planeGeometry args={[0.12, 0.24]} />
				<meshBasicMaterial map={T.footprint()} transparent depthWrite={false} />
			</mesh>
		))}
		<Mountain p={[0, -10, -100]} s={1.1} />
		{[[-4, -4], [4, -7], [-5, -14], [5, -18], [-4, -24], [4.5, -28], [-6, 2], [6, 1]].map(([x, z], i) => (
			<Pine key={i} p={[x, 0, z]} s={1.2 + (i % 3) * 0.3} dark={mood !== 'day'} />
		))}
		<group position={[1.8, 0, -2]} rotation={[0, -0.4, 0]}>
			<Box p={[0, 0.8, 0]} s={[0.12, 1.6, 0.12]} c="#5a3a22" />
			<Plane p={[0, 1.45, 0.07]} s={[1.5, 0.6]} map={signTex(['TRILHA ↑'], {bg: '#3b2a1c', fg: '#f4ecd6', w: 512, h: 205})} />
		</group>
	</group>
);

// ---------- Caverna do norte ----------
export const Cave: React.FC<{t: number}> = ({t}) => (
	<group>
		<mesh>
			<icosahedronGeometry args={[9, 2]} />
			<meshStandardMaterial map={T.rock([4, 4], '#6a5e52')} side={THREE.BackSide} flatShading roughness={1} />
		</mesh>
		<Ground tex={T.dirt([6, 6])} size={20} y={0} />
		{[[-2, -1], [2.5, -2], [1.5, 2], [-3, 2.5]].map(([x, z], i) => (
			<mesh key={i} position={[x, 0.3, z]} scale={[0.6, 0.5, 0.5]}>
				<dodecahedronGeometry args={[1, 0]} />
				<meshStandardMaterial map={T.rock([1, 1], '#5a5048')} flatShading />
			</mesh>
		))}
		<pointLight position={[1.5, 1.6, 1.5]} color="#ffa860" intensity={10 * (1 + Math.sin(t * 13) * 0.1)} distance={12} decay={1.5} />
		<Plane p={[-1.8, 1.4, -2.6]} s={[1.6, 0.8]} r={[0, 0.5, 0]} map={signTex(['CAVERNA', 'DO NORTE'], {bg: '#3b2a1c', fg: '#f4ecd6', w: 512, h: 256})} />
	</group>
);

// ---------- Dentro da montanha: os pedacinhos ----------
export const Pieces: React.FC<{t: number; form: number; n?: number; handOnly?: boolean}> = ({t, form, n = 220}) => {
	const pts = useMemo(() => {
		const r = rng(77);
		const out: {a: THREE.Vector3; b: THREE.Vector3; s: number}[] = [];
		for (let i = 0; i < n; i++) {
			const a = new THREE.Vector3((r() - 0.5) * 30, r() * 18, -r() * 20);
			// forma alvo: silhueta de bloco gigante (só tronco, braço e cabeça), recortada pela câmera
			const part = r();
			let b: THREE.Vector3;
			if (part < 0.45) b = new THREE.Vector3((r() - 0.5) * 6, 6 + r() * 6, -8 + (r() - 0.5) * 2.5);
			else if (part < 0.7) b = new THREE.Vector3((r() - 0.5) * 3.2, 12.6 + r() * 3, -8 + (r() - 0.5) * 2.5);
			else b = new THREE.Vector3(3.5 + r() * 1.8, 2 + r() * 8.5, -8 + (r() - 0.5) * 2);
			out.push({a, b, s: 0.15 + r() * 0.25});
		}
		return out;
	}, [n]);
	return (
		<group>
			{pts.map((p, i) => {
				const k = Math.min(1, Math.max(0, form * 1.2 - (i / n) * 0.2));
				const x = p.a.x + (p.b.x - p.a.x) * k + Math.sin(t * 1.3 + i) * 0.15 * (1 - k * 0.7);
				const y = p.a.y + (p.b.y - p.a.y) * k + Math.cos(t * 1.1 + i * 0.7) * 0.15;
				const z = p.a.z + (p.b.z - p.a.z) * k;
				return (
					<sprite key={i} position={[x, y, z]} scale={[p.s * 3, p.s * 3, 1]}>
						<spriteMaterial map={T.glow(i % 7 === 0 ? 'rgba(160,210,255,0.9)' : 'rgba(255,205,120,0.9)')} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
					</sprite>
				);
			})}
		</group>
	);
};
