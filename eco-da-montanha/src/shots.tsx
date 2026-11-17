// Lista de planos: cada plano começa numa palavra (índice em words.json).
import React from 'react';
import * as THREE from 'three';
import {Blocky, Bunny, CAST, Look, Pose, townie} from './Blocky';
import {Expr, signTex, T} from './tex';
import {Bonfire, Cave, EchoRings, EchoStone, Mood, Mountain, Pieces, Plane, RockSite, Rooms, Sala, Town, Trail} from './sets';
import words from './words.json';

export type V3 = [number, number, number];
export type Cam = {p: V3; p2?: V3; t: V3; t2?: V3; fov?: number; fov2?: number; ease?: 'io' | 'out' | 'lin'; crash?: boolean; shake?: number; roll?: number};
export type Actor = {who: string | Look; p: V3; p2?: V3; ry?: number; rx?: number; pose?: Pose; expr?: Expr; at?: [number, Expr | null, Pose | null][]; prop?: 'bunny' | 'torch' | 'note'};
type Ctx = {t: number; k: number; dur: number; wt: (i: number) => number};
export type Shot = {w: number; mood: Mood; set: (c: Ctx) => React.ReactNode; cam: Cam; actors?: Actor[]; extra?: (c: Ctx) => React.ReactNode};

const W = words as {w: string; s: number; e: number}[];
export const wordTime = (i: number) => (i <= 0 ? 0 : W[i].s - 0.06);

const crowd = (n: number, cx: number, cz: number, rad: number, pose: Pose, seed = 0, torch = false, face?: V3, rows = 1): Actor[] =>
	Array.from({length: n}).map((_, i) => {
		const a = ((i + 0.5) / n) * Math.PI * 1.1 - Math.PI * 0.55 + Math.sin(i * 7.3 + seed) * 0.08;
		const ring = rows > 1 ? (i % rows) * 1.2 : 0;
		const x = cx + Math.sin(a) * (rad + ring), z = cz + Math.cos(a) * (rad + ring);
		const ry = face ? Math.atan2(face[0] - x, face[2] - z) : a + Math.PI;
		return {who: townie(i + seed, i % 3 === 0), p: [x, 0, z], ry, pose: i % 4 === 1 && pose === 'cheer' ? 'wave' : pose, expr: pose === 'cheer' ? (i % 2 ? 'happy' : 'grin') : 'neutral', prop: torch && i % 2 === 0 ? 'torch' : undefined};
	});

// linhas de gente subindo a trilha (plongée)
const line = (n: number, x0: number, z0: number, dz: number, seed: number, torch: boolean): Actor[] =>
	Array.from({length: n}).map((_, i) => ({who: townie(i + seed, i % 4 === 0), p: [x0 + Math.sin(i * 1.7) * 0.6 + (i % 2 ? 0.5 : -0.5), 0, z0 - i * dz], ry: Math.PI, pose: 'walk', prop: torch && i % 2 === 0 ? 'torch' : undefined}));

// segredo (luz) saindo da cabeça para a pedra
const Secret: React.FC<{from: V3; to: V3; k: number; col?: string}> = ({from, to, k, col = 'rgba(255,215,130,0.95)'}) => {
	const e = Math.min(1, Math.max(0, k));
	const x = from[0] + (to[0] - from[0]) * e, y = from[1] + (to[1] - from[1]) * e + Math.sin(e * Math.PI) * 0.35, z = from[2] + (to[2] - from[2]) * e;
	return (
		<sprite position={[x, y, z]} scale={[0.5, 0.5, 1]}>
			<spriteMaterial map={T.glow(col)} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={e < 0.95 ? 1 : (1 - e) * 20} />
		</sprite>
	);
};

const Insert: React.FC<{tex: THREE.Texture; bg: THREE.Texture; w?: number; h?: number; tilt?: number; y?: number}> = ({tex, bg, w = 1.6, h = 0.8, tilt = 0, y = 1}) => (
	<group>
		<Plane p={[0, y, -0.4]} s={[8, 8]} map={bg} />
		<Plane p={[0, y, -0.38]} s={[w, h]} map={tex} r={[0, 0, tilt]} />
	</group>
);

const Counter: React.FC<{n: string}> = ({n}) => (
	<group position={[0, 0, 0]}>
		<Plane p={[0, 1, -0.4]} s={[10, 10]} map={T.wood([3, 3], '#4a2f1a')} />
		<Plane p={[0, 1.2, -0.38]} s={[0.76, 0.38]} basic map={signTex(['SEGREDOS', 'NA PEDRA'], {bg: '#f4ecd6', fg: '#3b2a1c', border: 'none', w: 768, h: 384, size: 130})} />
		<Plane p={[0, 0.8, -0.38]} s={[0.76, 0.38]} basic map={signTex([n], {bg: '#1b1b1b', fg: '#ffd166', border: '#ffd166', w: 768, h: 384, size: 220})} />
	</group>
);

const stoneHead: V3 = [0, 2.0, 1.45];
const NOTE = () => signTex(['O eco não esquece.', 'Ele guarda.'], {paper: true, font: 'Caveat', fg: '#1f2a5a', w: 1024, h: 700, size: 150, tilt: 0.03});

export const SHOTS: Shot[] = [
	// 1 — regra no primeiro segundo
	{w: 0, mood: 'day', set: (c) => <Town mood="day" t={c.t} />, cam: {p: [0, 22, 30], p2: [0, 12, 16], t: [0, 20, -120], fov: 50, crash: true}, actors: crowd(6, 0, -2, 4, 'walk', 3)},
	{w: 2, mood: 'day', set: (c) => <Town mood="day" t={c.t} />, cam: {p: [1.0, 1.25, -0.4], p2: [0.8, 1.2, 0.1], t: [0, 1.2, 2], fov: 45}, actors: [{who: 'teco', p: [0, 0, 2], ry: Math.PI - 0.3, pose: 'cup', expr: 'shout'}]},
	{w: 7, mood: 'day', set: (c) => <Town mood="day" t={c.t} />, cam: {p: [2.3, 0.85, 4.4], p2: [2.2, 0.8, 3.9], t: [1.2, 10, -150], fov: 55}, actors: [{who: 'teco', p: [1.6, 0, 1.8], ry: Math.PI, pose: 'cup', expr: 'shout'}]},
	{w: 10, mood: 'day', set: (c) => <Town mood="day" t={c.t} />, cam: {p: [0, 9, 6], p2: [0, 10, 2], t: [0, 32, -150], fov: 40}, extra: (c) => <EchoRings p={[0, 35, -100]} t={c.t} size={60} />},
	{w: 12, mood: 'day', set: (c) => <Town mood="day" t={c.t} />, cam: {p: [-1.4, 1.2, 4.2], p2: [-1.1, 1.15, 3.5], t: [0, 1.15, 2], fov: 45}, actors: [{who: 'teco', p: [0, 0, 2], ry: 0.25, pose: 'idle', expr: 'smirk'}], extra: (c) => <EchoRings p={[0, 1.15, 1.6]} t={c.t * 1.5} size={2.5} n={3} />},
	// preço
	{w: 14, mood: 'day', set: (c) => <Town mood="day" t={c.t} />, cam: {p: [0, 1.2, 4], p2: [0, 1.17, 3.1], t: [0, 1.14, 2], fov: 40}, actors: [{who: 'teco', p: [0, 0, 2], ry: 0, pose: 'idle', expr: 'determined'}]},
	{w: 18, mood: 'day', set: (c) => <Town mood="day" t={c.t} />, cam: {p: [0.8, 1.3, 3.5], p2: [0.5, 1.4, 2.9], t: [0, 1.3, 2], fov: 40}, actors: [{who: 'teco', p: [0, 0, 2], ry: 0.2, pose: 'idle', expr: 'whisper'}], extra: (c) => <Secret from={[0, 1.2, 2.3]} to={[0.1, 1.9, 2.5]} k={c.k * 0.8} />},
	// como funciona — na pedra
	{w: 21, mood: 'day', set: () => <RockSite mood="day" />, cam: {p: [3.6, 1.6, 0.9], p2: [3.3, 1.55, 1.3], t: [0.9, 1.5, 3.4], fov: 50}, actors: [{who: townie(3), p: [0.9, 0, 3.4], ry: Math.PI + 0.15, pose: 'cup', expr: 'shout'}]},
	{w: 26, mood: 'day', set: () => <RockSite mood="day" />, cam: {p: [2.5, 1.8, 1.4], p2: [2.3, 1.75, 1.6], t: [0.2, 1.4, 2.0], fov: 50}, actors: [{who: townie(3), p: [0.15, 0, 2.35], ry: Math.PI + 0.2, pose: 'lean', expr: 'whisper'}]},
	{w: 30, mood: 'day', set: () => <RockSite mood="day" />, cam: {p: [3.0, 1.35, 3.6], p2: [2.8, 1.35, 3.2], t: [1.9, 1.3, 1.2], fov: 45}},
	{w: 34, mood: 'day', set: () => <Town mood="day" t={0} />, cam: {p: [12, 14, -8], p2: [12, 14.6, -10], t: [12, 15, -17.5], fov: 30}},
	{w: 37, mood: 'day', set: () => <RockSite mood="day" />, cam: {p: [-1.5, 1.2, 7], p2: [-1.2, 1.3, 6], t: [0, 5, -60], fov: 55}, actors: [{who: townie(3), p: [0.9, 0, 3.4], ry: Math.PI + 0.15, pose: 'idle', expr: 'neutral'}], extra: (c) => <EchoRings p={[0, 16, -12]} t={c.t} size={40} face={[0, 0, 0]} />},
	{w: 40, mood: 'day', set: () => <RockSite mood="day" />, cam: {p: [0.2, 1.65, 5.6], p2: [0.3, 1.6, 4.9], t: [0.9, 1.5, 3.4], fov: 40}, actors: [{who: townie(3), p: [0.9, 0, 3.4], ry: 0.1, pose: 'idle', expr: 'happy'}], extra: (c) => <EchoRings p={[0.9, 1.6, 3.6]} t={c.t * 1.5} size={2} n={3} />},
	// o segredo some
	{w: 44, mood: 'day', set: () => <RockSite mood="day" />, cam: {p: [0.5, 1.6, 5.0], p2: [0.7, 1.55, 4.5], t: [0.9, 1.55, 3.4], fov: 38}, actors: [{who: townie(3), p: [0.9, 0, 3.4], ry: 0.1, pose: 'shrug', expr: 'blank'}], extra: (c) => <Secret from={[0.9, 1.6, 3.4]} to={stoneHead} k={c.k * 1.1} />},
	{w: 50, mood: 'day', set: () => <RockSite mood="day" glow={0.5} />, cam: {p: [0.4, 2.0, 4.2], p2: [0.2, 2.0, 3.2], t: [0, 2.0, 1.4], fov: 40}, extra: (c) => <Secret from={[0.6, 2.2, 3.4]} to={stoneHead} k={0.4 + c.k} />},
	// avô
	{w: 53, mood: 'roomDay', set: (c) => <Sala t={c.t} />, cam: {p: [-1.2, 1.4, 0.6], p2: [-1.6, 1.35, -0.2], t: [-2.5, 1.2, -2.5], fov: 45}, actors: [{who: 'avo', p: [-2.5, 0.62, -2.4], pose: 'sit', expr: 'neutral'}]},
	{w: 56, mood: 'roomDay', set: (c) => <Sala t={c.t} />, cam: {p: [1.6, 1.9, -0.9], p2: [1.6, 1.9, -1.1], t: [1.6, 1.9, -4], fov: 52}},
	{w: 58, mood: 'roomDay', set: (c) => <Sala t={c.t} />, cam: {p: [-2.2, 1.6, -0.6], p2: [-2.35, 1.55, -1.0], t: [-2.5, 1.5, -2.4], fov: 40}, actors: [{who: 'avo', p: [-2.5, 0.62, -2.4], pose: 'sit', expr: 'blank'}]},
	{w: 63, mood: 'roomDay', set: (c) => <Sala t={c.t} photoQ />, cam: {p: [-0.6, 2.1, -2.6], p2: [-0.6, 2.1, -3.1], t: [-0.6, 2.1, -4], fov: 40}},
	// Teco e Lia
	{w: 68, mood: 'day', set: (c) => <Town mood="day" t={c.t} />, cam: {p: [0, 1.0, 5.5], p2: [0, 1.1, 4.0], t: [0, 1.0, 2], fov: 42}, actors: [{who: 'teco', p: [0, 0, 2], pose: 'wave', expr: 'happy'}]},
	{w: 72, mood: 'day', set: (c) => <Town mood="day" t={c.t} />, cam: {p: [1.3, 0.9, 4.6], p2: [1.4, 0.85, 3.8], t: [1.1, 0.8, 2.2], fov: 42}, actors: [{who: 'teco', p: [0, 0, 2], ry: 0.4, pose: 'point', expr: 'happy'}, {who: 'lia', p: [1.2, 0, 2.3], ry: -0.2, pose: 'hug', prop: 'bunny', expr: 'happy'}]},
	{w: 80, mood: 'day', set: (c) => <Town mood="day" t={c.t} />, cam: {p: [1.2, 0.95, 3.6], p2: [1.2, 0.92, 3.2], t: [1.2, 0.85, 2.3], fov: 40}, actors: [{who: 'lia', p: [1.2, 0, 2.3], ry: 0, pose: 'five', prop: 'bunny', expr: 'grin'}]},
	// bordão (filmado igual nas duas vezes: ângulo A = parede de lado, ângulo B = close sussurrando)
	{w: 83, mood: 'roomNight', set: (c) => <Rooms t={c.t} />, cam: {p: [-3.5, 2.4, 3.5], p2: [-2.5, 2.0, 2.8], t: [0, 1.2, -0.5], fov: 50}, actors: [{who: 'teco', p: [-0.65, 0, 0.4], ry: Math.PI / 2, pose: 'idle', expr: 'neutral'}, {who: 'lia', p: [1.3, 0.82, -1.5], pose: 'sleep', expr: 'happy'}]},
	{w: 86, mood: 'roomNight', set: (c) => <Rooms t={c.t} />, cam: {p: [-0.6, 1.15, 2.6], p2: [-0.55, 1.15, 2.2], t: [-0.35, 1.05, 0.4], fov: 45}, actors: [{who: 'teco', p: [-0.65, 0, 0.4], ry: Math.PI / 2, pose: 'knock', expr: 'smirk'}], extra: (c) => <EchoRings p={[-0.12, 1.3, 0.4]} t={c.t * 1.4} size={1.2} n={2} face={[0, -Math.PI / 2, 0]} />},
	{w: 92, mood: 'roomNight', set: (c) => <Rooms t={c.t} />, cam: {p: [2.4, 1.6, 1.6], p2: [2.2, 1.5, 1.0], t: [1.3, 0.9, -1.6], fov: 42}, actors: [{who: 'lia', p: [1.3, 0.82, -1.5], pose: 'sleep', expr: 'happy'}]},
	{w: 96, mood: 'roomNight', set: (c) => <Rooms t={c.t} />, cam: {p: [-0.2, 0.9, 1.15], p2: [-0.2, 0.9, 1.0], t: [-0.75, 0.95, 0.4], fov: 40}, actors: [{who: 'teco', p: [-0.95, 0, 0.4], ry: Math.PI / 2, pose: 'lean', expr: 'whisper'}]},
	{w: 98, mood: 'roomNight', set: (c) => <Rooms t={c.t} />, cam: {p: [0, 7, 2.5], p2: [0, 6.2, 2.0], t: [0, 0, -0.5], fov: 50, roll: 0}, actors: [{who: 'teco', p: [-0.65, 0, 0.4], ry: Math.PI / 2, pose: 'lean', expr: 'happy'}, {who: 'lia', p: [0.7, 0, 0.3], ry: -Math.PI / 2, pose: 'hug', prop: 'bunny', expr: 'happy'}]},
	{w: 102, mood: 'dusk', set: (c) => <Town mood="dusk" t={c.t} />, cam: {p: [1.3, 0.6, 3.8], p2: [1.1, 0.7, 3.2], t: [0, 6, -150], fov: 55}, actors: [{who: 'teco', p: [0, 0, 2], ry: Math.PI + 0.3, pose: 'idle', expr: 'determined'}]},
	// o velho e o bilhete
	{w: 108, mood: 'cloudy', set: (c) => <Town mood="cloudy" t={c.t} />, cam: {p: [-6, 1.6, 2], p2: [-7, 1.8, -1], t: [-9, 3, -14], fov: 45}},
	{w: 113, mood: 'cloudy', set: (c) => <Town mood="cloudy" t={c.t} />, cam: {p: [-10.2, 1.9, -7.0], p2: [-10.3, 1.9, -7.6], t: [-10.5, 1.85, -10.6], fov: 40}, actors: [{who: 'velho', p: [-10.5, 0, -10.6], pose: 'idle', expr: 'angry'}]},
	{w: 116, mood: 'cloudy', set: (c) => <Sala t={c.t} day noteX={0.1 + c.k * 0.5} />, cam: {p: [4.4, 0.35, -2.4], p2: [4.5, 0.3, -2.8], t: [4.5, 0.05, -3.8], fov: 45}},
	{w: 123, mood: 'cloudy', set: () => <Insert tex={NOTE()} bg={T.wood([2, 2], '#8a5a34')} w={0.95} h={0.65} tilt={0.05} />, cam: {p: [0, 1, 1.95], p2: [0, 1, 1.75], t: [0, 1, -0.4], fov: 45}},
	{w: 129, mood: 'roomDay', set: (c) => <Sala t={c.t} />, cam: {p: [2.8, 1.5, 2.5], p2: [2.7, 1.5, 2.0], t: [3.5, 1.4, 0], fov: 42}, actors: [{who: 'mae', p: [3.6, 0, 0.0], ry: -0.4, pose: 'shrug', expr: 'smirk'}, {who: 'pai', p: [2.6, 0, -0.3], ry: 0.3, pose: 'idle', expr: 'happy'}]},
	{w: 137, mood: 'cloudy', set: (c) => <Town mood="cloudy" t={c.t} />, cam: {p: [-9.4, 1.9, -7.4], p2: [-9.7, 1.9, -8.0], t: [-10.5, 1.85, -10.6], fov: 40}, actors: [{who: 'velho', p: [-10.5, 0, -10.6], ry: 0.3, pose: 'idle', expr: 'sad'}]},
	// a Lia sumiu
	{w: 139, mood: 'cloudy', set: (c) => <Rooms t={c.t} day liaWindowOpen />, cam: {p: [1.3, 1.6, 2.6], p2: [1.3, 1.3, 0.6], t: [1.3, 0.6, -1.6], fov: 50, crash: true}},
	{w: 144, mood: 'cloudy', set: (c) => <Rooms t={c.t} day liaWindowOpen />, cam: {p: [2.4, 1.6, -0.4], p2: [2.7, 1.65, -1.2], t: [3.2, 1.7, -3], fov: 45}},
	{w: 147, mood: 'cloudy', set: () => <Trail mood="cloudy" />, cam: {p: [0.3, 2.2, 5.5], p2: [0.2, 1.8, 3.5], t: [0, 0, 0.5], fov: 50}},
	{w: 150, mood: 'cloudy', set: () => <Trail mood="cloudy" />, cam: {p: [0, 0.7, 5], p2: [0, 1.0, 1], t: [0, 8, -60], fov: 45}},
	{w: 156, mood: 'cloudy', set: () => <Trail mood="cloudy" />, cam: {p: [1.3, 1.3, -2.4], p2: [1.3, 1.3, -11.4], t: [0, 1.0, -5], t2: [0, 1.0, -14], fov: 50, ease: 'lin'}, actors: [{who: 'teco', p: [0, 0, -5], p2: [0, 0, -14], ry: Math.PI + 0.4, pose: 'run', expr: 'scared'}]},
	{w: 160, mood: 'cloudy', set: () => <RockSite mood="cloudy" />, cam: {p: [1.0, 1.25, 0.9], p2: [0.8, 1.2, 1.2], t: [0, 1.2, 2.6], fov: 45, crash: true}, actors: [{who: 'teco', p: [0, 0, 2.6], ry: Math.PI - 0.5, pose: 'cup', expr: 'shout'}]},
	{w: 164, mood: 'cloudy', set: () => <RockSite mood="cloudy" />, cam: {p: [4.5, 1.0, 5], p2: [4.2, 1.1, 3.8], t: [0, 40, -90], fov: 45}, extra: (c) => <EchoRings p={[0, 16, -12]} t={c.t} size={50} broken />},
	// mobilização (noite com tochas)
	{w: 169, mood: 'fire', set: (c) => <Town mood="fire" t={c.t} />, cam: {p: [0, 1.4, 5.5], p2: [0, 1.6, 3.5], t: [0, 1.3, -1], fov: 50}, actors: [{who: 'teco', p: [0, 0, 1.5], pose: 'arms', expr: 'determined', prop: 'torch'}, ...crowd(9, 0, 1.5, 3.2, 'idle', 10, true, [0, 0, 1.5])]},
	{w: 175, mood: 'fire', set: () => <Counter n="100" />, cam: {p: [0, 1, 1.5], p2: [0, 1, 1.35], t: [0, 1, -0.4], fov: 45}},
	{w: 177, mood: 'fire', set: () => <RockSite mood="fire" glow={0.3} />, cam: {p: [0, 14, 10], p2: [0, 15, 9], t: [0, 0, -2], fov: 50}, actors: [...line(16, 0.5, 6, 1.2, 20, true)]},
	{w: 178, mood: 'fire', set: () => <Counter n="1.200" />, cam: {p: [0, 1, 1.6], p2: [0, 1, 1.35], t: [0, 1, -0.4], fov: 45, shake: 0.5}},
	{w: 179, mood: 'fire', set: () => <RockSite mood="fire" glow={0.5} />, cam: {p: [3.2, 2.2, 7], p2: [2.6, 2.0, 5.8], t: [0, 1.6, 1], fov: 45}, actors: [{who: townie(5), p: [0.1, 0, 2.35], ry: Math.PI + 0.1, pose: 'lean'}, ...line(9, 0.4, 3.6, 0.95, 30, true)], extra: (c) => <Secret from={[0.1, 1.6, 2.2]} to={stoneHead} k={(c.t * 1.2) % 1} />},
	{w: 184, mood: 'fire', set: () => <RockSite mood="fire" glow={0.6} />, cam: {p: [0.9, 2.0, 4.6], p2: [0.6, 2.0, 4.0], t: [0, 1.9, 1.4], fov: 42}, extra: (c) => <>{[0, 1, 2, 3].map((i) => <Secret key={i} from={[1.5 - i, 1.5, 3.5]} to={stoneHead} k={((c.t + i * 0.3) * 1.1) % 1} />)}</>},
	{w: 186, mood: 'fire', set: () => <RockSite mood="fire" glow={1.2} crack={0.6} />, cam: {p: [4.5, 0.6, 5], p2: [4.2, 0.7, 3.8], t: [0, 30, -90], fov: 48}},
	{w: 194, mood: 'fire', set: () => <RockSite mood="fire" glow={0.8} />, cam: {p: [0, 1.18, 3.6], p2: [0, 1.17, 3.3], t: [0, 1.14, 2.4], fov: 38, crash: true}, actors: [{who: 'teco', p: [0, 0, 2.6], pose: 'idle', expr: 'shock', prop: 'torch'}]},
	{w: 196, mood: 'fire', set: () => <RockSite mood="fire" glow={1.2} />, cam: {p: [0.9, 0.85, 1.4], p2: [0.85, 0.85, 1.5], t: [0.1, 0.95, 2.0], fov: 40}, actors: [{who: 'teco', p: [0.0, 0, 2.3], ry: Math.PI - 0.45, pose: 'lean', expr: 'whisper'}], extra: (c) => <Secret from={[0, 1.2, 2.0]} to={stoneHead} k={c.k} col="rgba(150,210,255,0.95)" />},
	{w: 198, mood: 'fire', set: () => <RockSite mood="fire" glow={1.5} crack={1} />, cam: {p: [4.5, 0.4, 4.5], p2: [4.3, 0.4, 3.6], t: [0, 32, -90], fov: 52, shake: 1}, extra: (c) => <EchoRings p={[0, 16, -12]} t={c.t * 1.5} size={70} n={5} color="#ffe0a0" />},
	{w: 201, mood: 'cave', set: (c) => <Cave t={c.t} />, cam: {p: [0.6, 1.4, 2.2], p2: [-0.4, 1.4, 0.4], t: [-1.8, 1.4, -2.6], fov: 45, crash: true}},
	// caverna
	{w: 205, mood: 'cave', set: (c) => <Cave t={c.t} />, cam: {p: [2.5, 1.6, 4.5], p2: [1.8, 1.2, 3.2], t: [0, 0.3, 0], fov: 48}, actors: [{who: 'lia', p: [0, 0.12, 0.9], pose: 'sleep', expr: 'sleep', prop: 'bunny'}, {who: 'teco', p: [1.6, 0, 1.8], ry: -2.4, pose: 'torch', expr: 'shock', prop: 'torch'}]},
	{w: 210, mood: 'cave', set: (c) => <Cave t={c.t} />, cam: {p: [0.5, 1.1, 0.1], p2: [0.4, 0.95, 0.05], t: [0, 0.2, 0.05], fov: 40}, actors: [{who: 'lia', p: [0, 0.12, 0.9], pose: 'sleep', expr: 'sleep', prop: 'bunny'}]},
	// festa
	{w: 214, mood: 'fire', set: (c) => <Town mood="fire" t={c.t} bonfire banner />, cam: {p: [0, 14, 12], p2: [0, 11, 9], t: [0, 0, -2], fov: 50}, actors: [...crowd(16, 0, -1, 4.5, 'cheer', 40, false, [0, 0, -1], 2)]},
	{w: 218, mood: 'fire', set: (c) => <Town mood="fire" t={c.t} bonfire />, cam: {p: [0, 1.0, 6], p2: [0, 1.2, 5.2], t: [0, 2.0, 2], fov: 50}, actors: [{who: 'teco', p: [0, 1.25, 2.5], pose: 'cheer', expr: 'grin'}, ...crowd(7, 0, 2.5, 1.2, 'reach', 50, false, [0, 0, 2.5])]},
	{w: 219, mood: 'fire', set: (c) => <Town mood="fire" t={c.t} bonfire banner />, cam: {p: [0, 3.0, 5.5], p2: [0, 3.4, 3.8], t: [0, 4.0, -9], fov: 50}, actors: crowd(6, 0, -6, 2.5, 'cheer', 60, true, [0, 0, -9])},
	{w: 220, mood: 'fire', set: (c) => <Town mood="fire" t={c.t} bonfire />, cam: {p: [0.6, 1.25, 4.0], p2: [0.5, 1.25, 3.5], t: [0, 1.15, 2.2], fov: 40}, actors: [{who: 'teco', p: [0, 0, 2.2], ry: 0.15, pose: 'wave', expr: 'grin'}]},
	// a virada
	{w: 221, mood: 'cold', set: (c) => <Rooms t={c.t} />, cam: {p: [2.3, 1.4, 0.6], p2: [2.1, 1.3, 0.1], t: [1.3, 0.9, -1.8], fov: 42}, actors: [{who: 'lia', p: [1.3, 0.72, -1.9], pose: 'sit', expr: 'neutral', prop: 'bunny'}]},
	{w: 228, mood: 'cold', set: () => <Trail mood="cold" steps={0} />, cam: {p: [0, 0.6, 4], p2: [0, 0.8, 2], t: [1.2, 9, -14], fov: 40}, actors: [{who: 'sombra', p: [1.2, 10, -12], ry: 0, pose: 'wave', expr: 'blank'}], extra: () => <><mesh position={[1.2, 4.5, -12]}><dodecahedronGeometry args={[6, 0]} /><meshStandardMaterial map={T.rock([2, 2], '#2a2a30')} flatShading /></mesh><sprite position={[1.0, 13.5, -22]} scale={[11, 11, 1]}><spriteMaterial map={T.glow('rgba(200,220,255,0.9)')} transparent depthWrite={false} fog={false} /></sprite>{[-0.13, 0.13].map((x) => <sprite key={x} position={[1.2 + x, 11.55, -11.6]} scale={[0.25, 0.25, 1]}><spriteMaterial map={T.glow('rgba(255,210,120,1)')} transparent depthWrite={false} fog={false} blending={THREE.AdditiveBlending} /></sprite>)}</>},
	{w: 236, mood: 'roomNight', set: (c) => <Sala t={c.t} day={false} />, cam: {p: [2.2, 1.6, 3.2], p2: [2.6, 1.6, 2.4], t: [4.2, 1.4, 0.3], fov: 42}, actors: [{who: 'mae', p: [4.2, 0, 0.4], ry: -0.6, pose: 'idle', expr: 'sad'}]},
	{w: 246, mood: 'cold', set: (c) => <Rooms t={c.t} lamp={false} />, cam: {p: [-1.6, 1.15, 2.5], p2: [-1.8, 1.15, 1.6], t: [-2, 1.12, 0], fov: 40}, actors: [{who: 'teco', p: [-2, 0, 0], ry: 0.3, pose: 'idle', expr: 'scared'}]},
	{w: 251, mood: 'void', set: (c) => <Pieces t={c.t} form={0} />, cam: {p: [0, 6, 12], p2: [0, 7, 9], t: [0, 7, -8], fov: 55}},
	{w: 258, mood: 'void', set: (c) => <Pieces t={c.t} form={c.k} />, cam: {p: [0, 1, 6], p2: [0, 0.8, 4], t: [1, 10, -8], fov: 55}},
	{w: 264, mood: 'void', set: (c) => <Pieces t={c.t} form={1} />, cam: {p: [2.5, 6, 1], p2: [3.2, 6.5, -2.5], t: [4.4, 7, -8], fov: 45}, extra: (c) => <Secret from={[0, 2, 4]} to={[4.4, 8.5, -8]} k={c.k} col="rgba(150,210,255,0.95)" />},
	// agora, toda noite
	{w: 267, mood: 'cold', set: (c) => <Rooms t={c.t} lamp={false} />, cam: {p: [-2.6, 1.7, 1.6], p2: [-2.3, 1.6, 1.2], t: [-1.3, 1.1, -1.6], fov: 48}, actors: [{who: 'teco', p: [-1.3, 0.72, -1.6], pose: 'sitcover', expr: 'scared'}], extra: () => <pointLight position={[-3.2, 1.8, -2.2]} color="#7fa8ff" intensity={5} distance={6} decay={1.5} />},
	{w: 270, mood: 'cold', set: (c) => <Rooms t={c.t} lamp={false} />, cam: {p: [-2.2, 1.15, 2.4], p2: [-2.0, 1.15, 2.1], t: [-0.4, 1.0, 0.3], fov: 45}, extra: (c) => <EchoRings p={[-0.12, 1.3, 0.4]} t={c.t * 1.4} size={1.6} n={2} face={[0, -Math.PI / 2, 0]} color="#9fc4ff" />},
	{w: 279, mood: 'cold', set: (c) => <Rooms t={c.t} lamp={false} />, cam: {p: [-1.3, 1.4, 0.2], p2: [-1.3, 1.38, -0.1], t: [-1.3, 1.3, -1.6], fov: 40}, actors: [{who: 'teco', p: [-1.3, 0.72, -1.6], pose: 'sitcover', expr: 'scared'}], extra: () => <pointLight position={[-2.2, 1.8, -0.4]} color="#7fa8ff" intensity={4} distance={5} decay={1.5} />},
	{w: 285, mood: 'cold', set: (c) => <Rooms t={c.t} lamp={false} />, cam: {p: [-1.6, 0.4, 1.8], p2: [-1.4, 0.35, 1.3], t: [-0.2, 2.0, 0], fov: 50}, extra: () => <ShadowHand />},
];

// sombra de uma mão gigante de bloco na parede do Teco (a coisa só aparece em parte)
const ShadowHand: React.FC = () => (
	<group position={[-0.105, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
		<mesh position={[0.2, 1.2, 0]}>
			<planeGeometry args={[0.9, 3]} />
			<meshBasicMaterial color="#000000" transparent opacity={0.85} />
		</mesh>
		{[0, 1, 2, 3].map((i) => (
			<mesh key={i} position={[-0.12 + i * 0.22, 2.95 + (i === 0 || i === 3 ? -0.12 : 0), 0]}>
				<planeGeometry args={[0.16, 0.5]} />
				<meshBasicMaterial color="#000000" transparent opacity={0.85} />
			</mesh>
		))}
		<sprite position={[0.2, 2.3, 0.05]} scale={[0.25, 0.25, 1]}>
			<spriteMaterial map={T.glow('rgba(255,210,130,1)')} transparent blending={THREE.AdditiveBlending} />
		</sprite>
	</group>
);

export {Blocky, Bunny, CAST, Bonfire, EchoStone};
