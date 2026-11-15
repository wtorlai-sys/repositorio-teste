import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {CameraRig, Shot, T, lerp, money, shotCam, sr, useTime} from '../lib';
import {Penthouse, BattleStation} from '../components/Penthouse';
import {CENTER_MON, FACE_A, FACE_B, FACE_LOOK, MAX_HEAD, MaxAtDesk, Monitors} from '../components/Station';
import {drawGame} from '../components/Props';
import {Caption, GameBanner, Notification} from '../components/Overlays';

const START = T.cena3;
const END = T.cena4;


const shots: Shot[] = [
	{at: START, p: [[0, 1.75, 5.4], [0, 1.65, 4.3]], l: [[0, 1.25, -2], [0, 1.25, -2]], fov: 40},
	{at: T.aluguel, p: [[0.42, 1.5, -0.1], [0.3, 1.45, -0.4]], l: [CENTER_MON, CENTER_MON], fov: 42},
	{at: T.refem - 4, p: [[1.5, 1.7, -0.9], [1.3, 1.62, -0.8]], l: [MAX_HEAD, MAX_HEAD], fov: 44},
	{at: T.refem + 5, p: [[-4.2, 0.8, 1.6], [-3.6, 0.95, 1.2]], l: [[0, 1.0, -1], [0, 1.05, -1]], fov: 40},
	{at: 130.2, p: [[0.42, 1.5, -0.1], [0.3, 1.45, -0.45]], l: [CENTER_MON, CENTER_MON], fov: 42},
	{at: T.dormir, p: [FACE_A, FACE_B], l: [FACE_LOOK, FACE_LOOK], fov: 40},
	{at: T.prisao - 0.3, p: [[0, 1.6, 1.0], [0, 1.75, 3.9]], l: [[0, 1.45, -6], [0, 1.5, -6]], fov: 38},
];

export const S3Noite: React.FC = () => {
	const t = useTime(START);
	const cam = shotCam(t, shots, END);

	// saldo do jogo sendo drenado pela manutenção
	const drain = sr(t, T.refem - 4, 128);
	const heist = sr(t, 130.5, 135.5);
	const saldo = lerp(48_000_000, 31_500_000, drain) + heist * 2_000_000 * (t < 136 ? 1 : 0);
	const failed = t > 136 && t < T.dormir;
	const label =
		t > T.aluguel && t < T.aluguel + 7
			? 'MANUTENÇÃO EM 48 MIN'
			: t > 130.4 && t < 136
				? 'ASSALTO EM ANDAMENTO'
				: failed
					? 'ASSALTO FRACASSOU'
					: undefined;

	const yawn = sr(t, T.boceja, T.boceja + 0.6) * (1 - sr(t, T.boceja + 1.6, T.boceja + 2.2));
	const drink = sr(t, T.boceja + 2.2, T.boceja + 2.8) * (1 - sr(t, T.boceja + 3.8, T.boceja + 4.4));
	const cans = Math.min(9, Math.floor((t - START) / 5));
	const fadeIn = 1 - sr(t, START, START + 0.6);
	const fadeOut = sr(t, END - 0.5, END);

	return (
		<AbsoluteFill style={{background: '#000'}}>
			<ThreeCanvas width={1920} height={1080} gl={{antialias: false, powerPreference: "high-performance"}}>
				<CameraRig pos={cam.pos} look={cam.look} fov={cam.fov} />
				<Penthouse skyTop="#02040c" skyBottom="#13213f" cityLit={1} ambient={0.18} ambientColor="#5068a0">
					<BattleStation>
						{Array.from({length: cans}, (_, i) => (
							<mesh key={i} position={[-1.3 + (i % 5) * 0.09, 0.83, -0.95 - Math.floor(i / 5) * 0.1]}>
								<cylinderGeometry args={[0.03, 0.03, 0.12, 12]} />
								<meshStandardMaterial color="#2bd46b" metalness={0.7} roughness={0.3} />
							</mesh>
						))}
					</BattleStation>
					<Monitors
						t={t}
						on={1}
						k={Math.floor(t * 12)}
						draw={drawGame(t, {money: money(saldo, '$ '), label, tint: failed ? '#5a000066' : undefined})}
					/>
					{t > T.prisao - 0.3 && <pointLight position={[0, 2.4, 0.8]} intensity={5} distance={4} color="#6a8cd8" />}
					<MaxAtDesk
						t={t}
						typing={1 - Math.max(yawn, drink) * 0.6}
						headTilt={0.08 - yawn * 0.45}
						armR={drink > 0 ? 2.3 * drink : undefined}
						armRSide={drink > 0 ? -0.25 : 0.12}
						hairLen={0.15}
					/>
				</Penthouse>
			</ThreeCanvas>
			<Caption t={t} a={START + 0.8} b={T.aluguel + 6} text="04:00" />
			<Notification
				t={t}
				a={114.9}
				b={119.5}
				app="Banco"
				title="Débito automático"
				body="Manutenção Metrópole Zero · − R$ 480.000,00"
				color="#e5484d"
			/>
			<GameBanner t={t} a={136.1} b={T.dormir - 0.4} text="ASSALTO FRACASSOU" sub="− $ 2.000.000" color="#ff5a5a" />
			<AbsoluteFill style={{background: 'black', opacity: Math.max(fadeIn, fadeOut)}} />
		</AbsoluteFill>
	);
};
