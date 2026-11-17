import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {Blocky, CAST} from './Blocky';
import {Env} from './sets';
import {Cam, Shot, SHOTS, wordTime} from './shots';

export const FPS = 30;
export const TOTAL = Math.ceil((101.72 + 0.4) * FPS);

const fonts: [string, string, string][] = [
	['Montserrat', 'fonts/montserrat-latin-900-normal.woff2', '900'],
	['Montserrat', 'fonts/montserrat-latin-800-normal.woff2', '800'],
	['Caveat', 'fonts/caveat-latin-700-normal.woff2', '400'],
];
let fontsReady: Promise<void> | null = null;
const loadFonts = () =>
	(fontsReady ??= Promise.all(
		fonts.map(async ([fam, url, weight]) => {
			const f = new FontFace(fam, `url(${staticFile(url)})`, {weight});
			await f.load();
			document.fonts.add(f);
		}),
	).then(() => undefined));

const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
	const [ok, setOk] = useState(false);
	const [h] = useState(() => delayRender('fonts'));
	useEffect(() => {
		loadFonts().then(() => {
			setOk(true);
			continueRender(h);
		});
	}, [h]);
	return ok ? <>{children}</> : null;
};

const ease = {
	io: (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
	out: (x: number) => 1 - Math.pow(1 - x, 3),
	lin: (x: number) => x,
};
const lerp3 = (a: number[], b: number[] | undefined, k: number) => (b ? a.map((v, i) => v + (b[i] - v) * k) : a) as [number, number, number];

const CameraRig: React.FC<{cam: Cam; t: number; k: number}> = ({cam, t, k}) => {
	const {camera, size} = useThree();
	const e = ease[cam.ease ?? 'io'](k);
	const p = lerp3(cam.p, cam.p2, e);
	const tg = lerp3(cam.t, cam.t2, e);
	// respiração de câmera na mão (leve: é narração, não pânico)
	const amp = 0.012 + (cam.shake ?? 0) * 0.05 * Math.max(0, 1 - t * 2);
	p[0] += Math.sin(t * 1.3) * amp + Math.sin(t * 31) * (cam.shake ?? 0) * 0.02 * Math.max(0, 1 - t * 2);
	p[1] += Math.sin(t * 1.7 + 1) * amp;
	let fov = (cam.fov ?? 45) + ((cam.fov2 ?? cam.fov ?? 45) - (cam.fov ?? 45)) * e;
	if (cam.crash) fov *= 1 + 0.55 * Math.pow(Math.max(0, 1 - t / 0.3), 2);
	const c = camera as THREE.PerspectiveCamera;
	c.fov = fov;
	c.aspect = size.width / size.height;
	c.near = 0.05;
	c.far = 600;
	c.position.set(...p);
	c.lookAt(new THREE.Vector3(...tg));
	if (cam.roll) c.rotateZ(cam.roll);
	c.updateProjectionMatrix();
	return null;
};

const ShotView: React.FC<{shot: Shot; dur: number}> = ({shot, dur}) => {
	const f = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const t = f / FPS;
	const k = Math.min(1, t / Math.max(0.1, dur));
	const t0 = wordTime(shot.w);
	const ctx = {t, k, dur, wt: (i: number) => wordTime(i) - t0};
	return (
		<ThreeCanvas width={width} height={height} gl={{antialias: true, powerPreference: 'high-performance'}} dpr={1}>
			<Env mood={shot.mood} />
			<CameraRig cam={shot.cam} t={t} k={k} />
			{shot.set(ctx)}
			{(shot.actors ?? []).map((a, i) => {
				let expr = a.expr ?? 'neutral';
				let pose = a.pose ?? 'idle';
				for (const [wi, ex, po] of a.at ?? []) {
					if (t >= wordTime(wi) - t0) {
						if (ex) expr = ex;
						if (po) pose = po;
					}
				}
				const look = typeof a.who === 'string' ? CAST[a.who] : a.who;
				const p = lerp3(a.p, a.p2, k);
				return <Blocky key={i} look={look} pos={p} ry={a.ry} rx={a.rx} pose={pose} expr={expr} t={t + i * 0.37} prop={a.prop} />;
			})}
			{shot.extra?.(ctx)}
		</ThreeCanvas>
	);
};

// gradação final leve: vinheta
const Vignette: React.FC = () => <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)', pointerEvents: 'none'}} />;

export const Video: React.FC<{audio?: boolean}> = ({audio = true}) => (
	<AbsoluteFill style={{background: '#000'}}>
		<FontGate>
			{SHOTS.map((s, i) => {
				const from = Math.round(wordTime(s.w) * FPS);
				const to = i + 1 < SHOTS.length ? Math.round(wordTime(SHOTS[i + 1].w) * FPS) : TOTAL;
				return (
					<Sequence key={i} from={from} durationInFrames={to - from} name={`P${i + 1}`}>
						<ShotView shot={s} dur={(to - from) / FPS} />
					</Sequence>
				);
			})}
			<Vignette />
		</FontGate>
		{audio && <Audio src={staticFile('mix.wav')} />}
	</AbsoluteFill>
);

export const shotStarts = () => SHOTS.map((s) => Math.round(wordTime(s.w) * FPS));
