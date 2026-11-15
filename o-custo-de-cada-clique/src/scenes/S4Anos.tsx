import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {CameraRig, Shot, T, lerp, mixColor, money, rng, shotCam, sr, useTime} from '../lib';
import {Penthouse, BattleStation} from '../components/Penthouse';
import {CENTER_MON, FACE_A, FACE_B, FACE_LOOK, MAX_HEAD, MaxAtDesk, Monitors} from '../components/Station';
import {Phone, drawGame} from '../components/Props';
import {Person} from '../components/Person';
import {Caption, Counter, Notification} from '../components/Overlays';

const PHONE: [number, number, number] = [0.75, 0.79, -0.95];

/** Partículas das estações do ano caindo do lado de fora da janela. */
const Seasons: React.FC<{t: number; color: string; size: number; on: number}> = ({t, color, size, on}) => {
	const base = useMemo(() => {
		const g = rng(77);
		return Array.from({length: 400}, () => [-14 + g() * 28, g() * 14, -7 - g() * 10, g()]);
	}, []);
	const geo = useMemo(() => new THREE.BufferGeometry(), []);
	useLayoutEffect(() => {
		const arr = new Float32Array(base.length * 3);
		base.forEach(([x, y, z, ph], i) => {
			arr[i * 3] = x + Math.sin(t * 1.5 + ph * 10) * 0.4;
			arr[i * 3 + 1] = ((((y - t * (0.8 + ph)) % 14) + 14) % 14) - 2;
			arr[i * 3 + 2] = z;
		});
		geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
	}, [t, base, geo]);
	if (on <= 0.01) return null;
	return (
		<points geometry={geo}>
			<pointsMaterial color={color} size={size} transparent opacity={on} sizeAttenuation />
		</points>
	);
};

const sky = (day: number) => ({
	top: mixColor('#02040c', '#3f78c8', day),
	bottom: mixColor('#13213f', '#d6e6f5', day),
	city: lerp(1, 0.15, day),
	amb: lerp(0.18, 0.75, day),
	ambC: mixColor('#5068a0', '#e8eef8', day),
});

const SEASON = [
	{c: '#ffffff', s: 0.12}, // inverno: neve
	{c: '#ffb3d1', s: 0.09}, // primavera: pétalas
	{c: '#fff6b0', s: 0.05}, // verão: pólen / luz
	{c: '#d9771f', s: 0.12}, // outono: folhas
];

// ---------------------------------------------------------------- ANOS
const A0 = T.cena4;
const A1 = T.tentativas;

const shotsA: Shot[] = [
	{at: A0, p: [[0, 1.75, 4.8], [0, 1.72, 4.5]], l: [[0, 1.3, -2], [0, 1.3, -2]], fov: 42},
	{at: T.ano3, p: [[1.7, 1.6, 0.5], [1.5, 1.55, 0.3]], l: [MAX_HEAD, MAX_HEAD], fov: 46},
	{at: 175.6, p: [[0, 1.75, 4.8], [0, 1.72, 4.6]], l: [[0, 1.3, -2], [0, 1.3, -2]], fov: 42},
	{at: T.ano9, p: [[1.05, 1.25, -0.5], [0.98, 1.18, -0.58]], l: [PHONE, PHONE], fov: 38},
	{at: T.silencia, p: [[1.7, 1.6, 0.5], [1.55, 1.55, 0.4]], l: [[0.3, 1.1, -0.6], [0.3, 1.1, -0.6]], fov: 46},
	{at: 185.0, p: [[0.42, 1.5, -0.1], [0.3, 1.45, -0.45]], l: [CENTER_MON, CENTER_MON], fov: 42},
	{at: T.manha, p: [[-3.6, 1.6, 2.6], [-3.0, 1.6, 2.2]], l: [[0, 1.3, -3], [0, 1.3, -3]], fov: 42},
	{at: 192.0, p: [FACE_A, FACE_B], l: [FACE_LOOK, FACE_LOOK], fov: 40},
	{at: T.paralisa, p: [[0.42, 1.5, -0.1], [0.32, 1.46, -0.5]], l: [CENTER_MON, CENTER_MON], fov: 42},
];

export const S4Anos: React.FC = () => {
	const t = useTime(A0);
	const cam = shotCam(t, shotsA, A1);

	// ciclo dia/noite acelerado nos trechos de timelapse
	const lapse = t < T.ano3 || (t > 175.6 && t < T.ano9);
	let day = 0;
	if (lapse) day = 0.5 + 0.5 * Math.sin((t - A0) * 2.2);
	else if (t >= T.ano3 && t < 175.6) day = 0.9;
	else if (t >= T.manha) day = sr(t, T.manha, T.manha + 2) * 0.85;
	const s = sky(day);
	const season = SEASON[Math.floor(((t - A0) / 1.4) % 4)];
	const hairLen = lapse ? (((t - A0) % 4.2) / 4.2) * 0.9 : t < T.ano9 ? 0.35 : 0.6;

	const saldo = 50e6 * Math.pow(800, sr(t, A0, 199));
	const year = t < T.ano3 ? 1 + Math.floor((t - A0) / 6) : t < T.ano9 ? 3 : 9;

	const call = t > T.ano3 + 0.3 && t < 172.2;
	const ring = t > T.ano9 && t < 184.3;
	const msg = t > 192.0 && t < 199;
	const dead = t > 197.3;
	const reach = sr(t, T.silencia, T.silencia + 0.6) * (1 - sr(t, 184.6, 185.2));
	const frozen = sr(t, 194.6, 195.6);
	const black = sr(t, 199.9, T.preto);

	return (
		<AbsoluteFill style={{background: '#000'}}>
			<ThreeCanvas width={1920} height={1080} gl={{antialias: false, powerPreference: "high-performance"}}>
				<CameraRig pos={cam.pos} look={cam.look} fov={cam.fov} />
				<Penthouse
					skyTop={s.top}
					skyBottom={s.bottom}
					cityLit={s.city}
					ambient={s.amb}
					ambientColor={s.ambC}
					sun={t >= T.manha ? 2.2 * sr(t, T.manha, T.manha + 2) : day * 1.5}
					sunColor={t >= T.manha ? '#ffc58a' : '#fff4e0'}
				>
					<Seasons t={t} color={season.c} size={season.s} on={lapse ? 1 : 0} />
					<BattleStation />
					<Phone p={PHONE} ry={0.2} buzz={call || ring ? (t * 1.3) % 1 : 0} screen={call || ring ? 1 : msg ? 1 : 0.0} color={ring ? '#ff6b6b' : '#bfe6ff'} />
					<Monitors
						t={t}
						on={1}
						k={Math.floor(t * 12)}
						draw={drawGame(t, {
							money: money(saldo, '$ '),
							label: t > 185 && t < 192 ? 'ASSALTO DECISIVO' : undefined,
							dead,
						})}
					/>
					<MaxAtDesk
						t={t * (1 - frozen)}
						typing={1 - reach * 0.4}
						armR={reach > 0 ? 1.15 + reach * 0.35 : undefined}
						armRSide={reach > 0 ? 0.12 + reach * 0.5 : undefined}
						hairLen={hairLen}
						headTurn={call ? 0.15 : 0}
						headTilt={frozen > 0 ? 0.08 - frozen * 0.05 : undefined}
					/>
				</Penthouse>
			</ThreeCanvas>

			<Counter t={t} a={A0 + 0.5} b={T.ano3 - 0.2} label="SALDO" value={money(saldo)} />
			<Counter t={t} a={175.7} b={T.ano9 - 0.1} label="SALDO" value={money(saldo)} />
			{lapse && <Caption t={t} a={A0} b={t + 1} text={`ANO ${year}`} />}
			<Caption t={t} a={T.ano3} b={T.ano3 + 4} text="ANO 3" />
			<Caption t={t} a={T.ano9} b={T.ano9 + 4} text="ANO 9" />
			<Notification t={t} a={T.ano3 + 0.6} b={171.5} app="Telefone" title="Duda" body="Chamada recebida · churrasco no domingo?" color="#34c759" />
			<Notification t={t} a={T.ano9 + 0.4} b={T.silencia + 1.2} app="Telefone" title="Mãe" body="14 chamadas perdidas" color="#e5484d" />
			<Notification
				t={t}
				a={192.2}
				b={198.6}
				app="Mensagens"
				title="Dona Cida (vizinha)"
				body="Max, sinto muito… sua mãe faleceu esta madrugada."
				color="#8e8e93"
			/>
			<AbsoluteFill style={{background: 'black', opacity: Math.max(1 - sr(t, A0, A0 + 0.5), black)}} />
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- TENTATIVAS
const B0 = T.tentativas;
const B1 = T.cena5;

const shotsB: Shot[] = [
	{at: B0, p: [[0.2, 1.7, 1.2], [0.4, 1.68, 0.2]], l: [[0.6, 1.5, -6], [0.6, 1.5, -6]], fov: 44},
	{at: T.voltou1, p: [[0, 1.75, 3.6], [0, 1.7, 3.2]], l: [[0, 1.3, -2], [0, 1.3, -2]], fov: 42},
	{at: 210.4, p: [[-1.6, 1.4, -0.6], [-1.9, 1.35, -0.3]], l: [[-4.5, 1.0, 1.4], [-4.5, 1.0, 1.4]], fov: 42},
	{at: T.voltou2, p: [[0, 1.75, 3.6], [0, 1.7, 3.2]], l: [[0, 1.3, -2], [0, 1.3, -2]], fov: 42},
	{at: 215.4, p: [FACE_A, FACE_B], l: [FACE_LOOK, FACE_LOOK], fov: 42},
];

export const S4Tentativas: React.FC = () => {
	const t = useTime(B0);
	const cam = shotCam(t, shotsB, B1);

	const away1 = t < T.voltou1;
	const away2 = t >= 210.4 && t < T.voltou2;
	const away = away1 || away2;
	const monOn = away ? 0 : sr(t, away1 ? 0 : t < 210.4 ? T.voltou1 : T.voltou2, (t < 210.4 ? T.voltou1 : T.voltou2) + 0.25);

	let day = 0.2;
	if (t > 203.6 && t < T.voltou1) day = 0.5 + 0.5 * Math.sin((t - 203.6) * 3.2 - 1.5);
	if (away2) day = 0.5 + 0.5 * Math.sin((t - 210.4) * 7 - 1.5);
	const s = sky(day);
	const dayN = t < T.voltou1 ? 1 + Math.min(2, Math.floor((t - 203.6) / 1.96)) : 7;
	const saldo = 41e9 * (1 - 0.18 * sr(t, B0, T.voltou1) - 0.2 * sr(t, 210.4, T.voltou2));

	return (
		<AbsoluteFill style={{background: '#000'}}>
			<ThreeCanvas width={1920} height={1080} gl={{antialias: false, powerPreference: "high-performance"}}>
				<CameraRig pos={cam.pos} look={cam.look} fov={cam.fov} />
				<Penthouse skyTop={s.top} skyBottom={s.bottom} cityLit={s.city} ambient={s.amb} ambientColor={s.ambC} sun={day * 1.5}>
					<BattleStation />
					<Monitors
						t={t}
						on={monOn}
						k={monOn > 0 ? Math.floor(t * 12) : 'off'}
						draw={drawGame(t, {money: money(saldo, '$ ')})}
					/>
					{away2 && <pointLight position={[-4.2, 2.3, 0.4]} intensity={4} distance={5} color="#ffc98a" />}
					{away1 ? (
						<Person position={[0.6, 0, -5.0]} rotationY={Math.PI} shirt="#2a2f3a" hood hair="#20170f" hairLen={0.6} headTilt={0.1} />
					) : away2 ? (
						<Person position={[-4.5, 0, 1.5]} rotationY={Math.PI} pose="sit" shirt="#2a2f3a" hood hair="#20170f" hairLen={0.6} headTilt={0.35} lean={0.3} armL={0.6} armR={0.6} />
					) : (
						<MaxAtDesk t={t} hairLen={0.6} typing={sr(t, T.voltou1, T.voltou1 + 1) * (t > 215.7 ? 1 - sr(t, 216, 218) * 0.7 : 1)} />
					)}
				</Penthouse>
			</ThreeCanvas>
			<Caption t={t} a={203.6} b={T.voltou1 - 0.2} text={`DIA ${dayN}`} />
			<Caption t={t} a={210.8} b={T.voltou2 - 0.2} text="DIA 7" />
			<Notification t={t} a={205.2} b={208.2} app="Banco" title="Débito automático" body="Manutenção Metrópole Zero · − R$ 2.400.000,00" color="#e5484d" />
			<Counter t={t} a={B0 + 1} b={T.voltou1} label="SALDO" value={money(saldo)} color="#ff6b6b" />
			<AbsoluteFill style={{background: 'white', opacity: 0.5 * (Math.max(0, 1 - Math.abs(t - T.voltou1) / 0.2) + Math.max(0, 1 - Math.abs(t - T.voltou2) / 0.2))}} />
			<AbsoluteFill style={{background: 'black', opacity: Math.max(1 - sr(t, B0, B0 + 0.8), sr(t, B1 - 0.8, B1))}} />
		</AbsoluteFill>
	);
};
