import React, {useMemo} from 'react';
import * as THREE from 'three';
import {rng, useCanvasTexture} from '../lib';

type V3 = [number, number, number];

export const Box: React.FC<{
	p: V3;
	s: V3;
	c: string;
	r?: V3;
	rough?: number;
	metal?: number;
	e?: string;
	ei?: number;
}> = ({p, s, c, r = [0, 0, 0], rough = 0.8, metal = 0, e, ei = 1}) => (
	<mesh position={p} rotation={r}>
		<boxGeometry args={s} />
		<meshStandardMaterial
			color={c}
			roughness={rough}
			metalness={metal}
			emissive={e ?? '#000000'}
			emissiveIntensity={e ? ei : 0}
		/>
	</mesh>
);

/** Céu em degradê (esfera invertida com shader simples). */
export const SkyDome: React.FC<{top: string; bottom: string; radius?: number}> = ({
	top,
	bottom,
	radius = 180,
}) => {
	const mat = useMemo(
		() =>
			new THREE.ShaderMaterial({
				side: THREE.BackSide,
				depthWrite: false,
				uniforms: {top: {value: new THREE.Color()}, bottom: {value: new THREE.Color()}},
				vertexShader:
					'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
				fragmentShader:
					'uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ float h = clamp(vP.y*1.6+0.15,0.0,1.0); gl_FragColor = vec4(mix(bottom, top, pow(h,0.8)),1.0);}',
			}),
		[],
	);
	mat.uniforms.top.value.set(top);
	mat.uniforms.bottom.value.set(bottom);
	return (
		<mesh material={mat} renderOrder={-1}>
			<sphereGeometry args={[radius, 32, 16]} />
		</mesh>
	);
};

/** Tela de monitor com textura desenhada por canvas. */
export const Screen: React.FC<{
	p: V3;
	r?: V3;
	w: number;
	h: number;
	draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
	k: unknown;
	res?: number;
	on?: number; // brilho 0..1
	bezel?: boolean;
}> = ({p, r = [0, 0, 0], w, h, draw, k, res = 512, on = 1, bezel = true}) => {
	const tex = useCanvasTexture(res, Math.round((res * h) / w), draw, k);
	return (
		<group position={p} rotation={r}>
			{bezel && <Box p={[0, 0, -0.03]} s={[w + 0.06, h + 0.06, 0.04]} c="#0b0c0f" rough={0.4} />}
			<mesh>
				<planeGeometry args={[w, h]} />
				<meshBasicMaterial map={tex} color={new THREE.Color(on, on, on)} toneMapped={false} />
			</mesh>
		</group>
	);
};

/** Desenho da "tela do jogo" Metrópole Zero: mapa estilizado + HUD. */
export const drawGame =
	(t: number, opts: {money?: string; tint?: string; dead?: boolean; label?: string} = {}) =>
	(ctx: CanvasRenderingContext2D, w: number, h: number) => {
		ctx.fillStyle = '#0a1622';
		ctx.fillRect(0, 0, w, h);
		const g = rng(7);
		const cell = w / 12;
		const ox = (t * 18) % cell;
		for (let x = -1; x < 14; x++)
			for (let y = -1; y < 9; y++) {
				const v = g();
				ctx.fillStyle = v > 0.82 ? '#1f6f8b' : v > 0.6 ? '#173447' : '#122636';
				ctx.fillRect(x * cell - ox + 4, y * cell + 4, cell - 8, cell - 8);
			}
		ctx.strokeStyle = '#3fd0ff55';
		ctx.lineWidth = 3;
		for (let x = 0; x < 14; x++) {
			ctx.beginPath();
			ctx.moveTo(x * cell - ox, 0);
			ctx.lineTo(x * cell - ox, h);
			ctx.stroke();
		}
		// alvo / jogador
		const px = w * 0.5 + Math.sin(t * 0.9) * w * 0.18;
		const py = h * 0.55 + Math.cos(t * 0.7) * h * 0.15;
		ctx.fillStyle = '#ffd34d';
		ctx.beginPath();
		ctx.arc(px, py, w * 0.012, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = '#ff4d6d';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(w * 0.72, h * 0.3, w * 0.03 + Math.sin(t * 4) * 3, 0, Math.PI * 2);
		ctx.stroke();
		// HUD
		ctx.fillStyle = '#00000088';
		ctx.fillRect(0, 0, w, h * 0.12);
		ctx.font = `700 ${Math.round(h * 0.07)}px "JetBrains Mono", monospace`;
		ctx.fillStyle = '#7CFFB2';
		ctx.textAlign = 'right';
		ctx.fillText(opts.money ?? '$ 0', w * 0.97, h * 0.09);
		ctx.textAlign = 'left';
		ctx.fillStyle = '#9fdcff';
		ctx.fillText('METRÓPOLE ZERO', w * 0.03, h * 0.09);
		if (opts.label) {
			ctx.fillStyle = '#000000aa';
			ctx.fillRect(0, h * 0.42, w, h * 0.18);
			ctx.textAlign = 'center';
			ctx.fillStyle = '#ffe066';
			ctx.font = `800 ${Math.round(h * 0.09)}px Inter, sans-serif`;
			ctx.fillText(opts.label, w / 2, h * 0.54);
		}
		if (opts.dead) {
			ctx.fillStyle = '#5a000099';
			ctx.fillRect(0, 0, w, h);
			ctx.textAlign = 'center';
			ctx.fillStyle = '#ff5a5a';
			ctx.font = `900 ${Math.round(h * 0.13)}px Inter, sans-serif`;
			ctx.fillText('MISSÃO FALHOU', w / 2, h * 0.55);
		}
		if (opts.tint) {
			ctx.fillStyle = opts.tint;
			ctx.fillRect(0, 0, w, h);
		}
		// scanlines
		ctx.fillStyle = '#00000022';
		for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 2);
	};

export const Desk: React.FC<{p?: V3; w?: number; d?: number; c?: string}> = ({
	p = [0, 0, 0],
	w = 1.8,
	d = 0.8,
	c = '#2a2420',
}) => (
	<group position={p}>
		<Box p={[0, 0.74, 0]} s={[w, 0.05, d]} c={c} rough={0.6} />
		{[
			[-w / 2 + 0.05, -d / 2 + 0.05],
			[w / 2 - 0.05, -d / 2 + 0.05],
			[-w / 2 + 0.05, d / 2 - 0.05],
			[w / 2 - 0.05, d / 2 - 0.05],
		].map(([x, z], i) => (
			<Box key={i} p={[x, 0.36, z]} s={[0.05, 0.72, 0.05]} c="#111" />
		))}
	</group>
);

export const Chair: React.FC<{p?: V3; ry?: number; c?: string; fancy?: boolean}> = ({
	p = [0, 0, 0],
	ry = 0,
	c = '#1d1f24',
	fancy,
}) => (
	<group position={p} rotation={[0, ry, 0]}>
		<Box p={[0, 0.48, 0]} s={[0.55, 0.08, 0.55]} c={c} />
		<Box p={[0, 0.95, -0.27]} s={[0.52, fancy ? 1.0 : 0.8, 0.07]} c={c} r={[-0.1, 0, 0]} />
		{fancy && <Box p={[0, 1.5, -0.33]} s={[0.3, 0.22, 0.08]} c={c} />}
		{fancy && (
			<>
				<Box p={[-0.3, 0.7, 0]} s={[0.06, 0.05, 0.4]} c="#c1121f" />
				<Box p={[0.3, 0.7, 0]} s={[0.06, 0.05, 0.4]} c="#c1121f" />
			</>
		)}
		<mesh position={[0, 0.25, 0]}>
			<cylinderGeometry args={[0.03, 0.03, 0.45, 8]} />
			<meshStandardMaterial color="#222" metalness={0.6} roughness={0.3} />
		</mesh>
		<mesh position={[0, 0.03, 0]}>
			<cylinderGeometry args={[0.3, 0.3, 0.04, 5]} />
			<meshStandardMaterial color="#222" />
		</mesh>
	</group>
);

/** Celular sobre a mesa: vibra e acende a tela. */
export const Phone: React.FC<{p: V3; ry?: number; buzz?: number; screen?: number; color?: string}> = ({
	p,
	ry = 0,
	buzz = 0,
	screen = 0,
	color = '#ffffff',
}) => {
	const j = buzz > 0 ? Math.sin(buzz * 90) * 0.006 : 0;
	return (
		<group position={[p[0] + j, p[1], p[2]]} rotation={[0, ry + j * 4, 0]}>
			<Box p={[0, 0.006, 0]} s={[0.08, 0.012, 0.16]} c="#111" rough={0.3} />
			<mesh position={[0, 0.0125, 0]} rotation={[-Math.PI / 2, 0, 0]}>
				<planeGeometry args={[0.072, 0.15]} />
				<meshBasicMaterial color={new THREE.Color(color).multiplyScalar(0.05 + screen * 0.95)} toneMapped={false} />
			</mesh>
			{screen > 0.05 && <pointLight position={[0, 0.12, 0]} intensity={screen * 0.6} distance={1.2} color={color} />}
		</group>
	);
};

/** Bagunça: caixas de fast-food, copos, latas e cabos. */
export const Clutter: React.FC<{seed?: number; area?: [number, number, number, number]; y?: number; n?: number}> = ({
	seed = 3,
	area = [-0.8, 0.8, -0.3, 0.3],
	y = 0.765,
	n = 10,
}) => {
	const items = useMemo(() => {
		const g = rng(seed);
		return Array.from({length: n}, () => ({
			x: area[0] + g() * (area[1] - area[0]),
			z: area[2] + g() * (area[3] - area[2]),
			k: Math.floor(g() * 4),
			r: g() * Math.PI,
		}));
	}, [seed, n, area]);
	return (
		<group>
			{items.map((it, i) =>
				it.k === 0 ? (
					<Box key={i} p={[it.x, y + 0.05, it.z]} s={[0.16, 0.1, 0.12]} c="#c8281e" r={[0, it.r, 0]} />
				) : it.k === 1 ? (
					<mesh key={i} position={[it.x, y + 0.08, it.z]}>
						<cylinderGeometry args={[0.04, 0.03, 0.16, 12]} />
						<meshStandardMaterial color="#f2c230" />
					</mesh>
				) : it.k === 2 ? (
					<mesh key={i} position={[it.x, y + 0.06, it.z]}>
						<cylinderGeometry args={[0.03, 0.03, 0.12, 12]} />
						<meshStandardMaterial color="#2bd46b" metalness={0.7} roughness={0.3} />
					</mesh>
				) : (
					<Box key={i} p={[it.x, y + 0.01, it.z]} s={[0.2, 0.02, 0.2]} c="#e9e3d6" r={[0, it.r, 0]} />
				),
			)}
		</group>
	);
};

export const Cables: React.FC<{seed?: number; n?: number}> = ({seed = 11, n = 6}) => {
	const geos = useMemo(() => {
		const g = rng(seed);
		return Array.from({length: n}, () => {
			const pts = Array.from(
				{length: 6},
				(_, i) => new THREE.Vector3(-1 + g() * 2, 0.02 + (i === 5 ? 0.7 : 0), -0.2 + g() * 1.4),
			);
			return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.012, 6);
		});
	}, [seed, n]);
	return (
		<group>
			{geos.map((geo, i) => (
				<mesh key={i} geometry={geo}>
					<meshStandardMaterial color="#0a0a0a" roughness={0.5} />
				</mesh>
			))}
		</group>
	);
};

/** Prédios com janelas acesas. */
export const City: React.FC<{
	seed?: number;
	n?: number;
	radius?: [number, number];
	arc?: [number, number];
	lit?: number;
	color?: string;
	center?: V3;
}> = ({seed = 5, n = 70, radius = [30, 70], arc = [-Math.PI * 0.9, -Math.PI * 0.1], lit = 1, color = '#1a1f2b', center = [0, 0, 0]}) => {
	const winTex = useCanvasTexture(
		64,
		128,
		(ctx, w, h) => {
			ctx.fillStyle = '#000';
			ctx.fillRect(0, 0, w, h);
			const g = rng(seed + 1);
			for (let y = 4; y < h; y += 8)
				for (let x = 4; x < w; x += 8) {
					const v = g();
					ctx.fillStyle = v > 0.55 ? (v > 0.9 ? '#ffffff' : '#ffcf7a') : '#05070a';
					ctx.fillRect(x, y, 4, 5);
				}
		},
		seed,
	);
	const bs = useMemo(() => {
		const g = rng(seed);
		return Array.from({length: n}, () => {
			const a = arc[0] + g() * (arc[1] - arc[0]);
			const r = radius[0] + g() * (radius[1] - radius[0]);
			const h = 6 + g() * g() * 38;
			const w = 3 + g() * 5;
			return {x: Math.cos(a) * r, z: Math.sin(a) * r, h, w, d: 3 + g() * 5};
		});
	}, [seed, n, radius, arc]);
	return (
		<group position={center}>
			{bs.map((b, i) => (
				<mesh key={i} position={[b.x, b.h / 2 - 2, b.z]}>
					<boxGeometry args={[b.w, b.h, b.d]} />
					<meshStandardMaterial
						color={color}
						roughness={0.9}
						emissiveMap={winTex}
						emissive="#ffffff"
						emissiveIntensity={lit}
					/>
				</mesh>
			))}
		</group>
	);
};
