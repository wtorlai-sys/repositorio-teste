import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {CameraRig, Shot, T, money, shotCam, sr, useTime, win} from '../lib';
import {Person} from '../components/Person';
import {Box, Cables, Chair, Clutter, Desk, Phone, Screen, drawGame} from '../components/Props';
import {GameBanner, Notification, Title} from '../components/Overlays';

const START = 0;
const END = T.casa;

const HEAD: [number, number, number] = [0, 1.42, 0.58];
const PHONE: [number, number, number] = [0.6, 0.77, 0.12];

const shots: Shot[] = [
	{at: 0, p: [[1.0, 1.58, 0.0], [0.85, 1.52, 0.1]], l: [HEAD, HEAD], fov: 46},
	{at: 7.0, p: [[2.2, 2.1, 2.8], [1.6, 1.85, 2.1]], l: [[0, 1.0, 0], [0, 1.05, 0]], fov: 42},
	{at: T.missao, p: [[0.62, 1.6, 1.3], [0.52, 1.5, 1.0]], l: [[0, 1.18, -0.25], [0, 1.18, -0.25]], fov: 38},
	{at: T.vibra, p: [[0.95, 1.2, 0.55], [0.85, 1.1, 0.42]], l: [PHONE, PHONE], fov: 34},
	{at: T.jaqueta, p: [[-0.85, 1.62, 1.45], [-0.72, 1.56, 1.2]], l: [[0.05, 1.2, -0.3], [0.05, 1.2, -0.3]], fov: 36},
	{at: T.compra - 0.4, p: [[0.82, 1.12, 0.4], [0.78, 1.06, 0.34]], l: [PHONE, PHONE], fov: 32},
	{at: 46.6, p: [[1.05, 1.55, -0.05], [0.8, 1.5, 0.08]], l: [HEAD, HEAD], fov: 44},
	{at: T.carro, p: [[0.7, 1.62, 1.45], [0.55, 1.5, 1.0]], l: [[0, 1.18, -0.25], [0, 1.18, -0.25]], fov: 36},
	{at: T.eraReal - 0.5, p: [[0.6, 1.05, 0.3], [0.6, 0.98, 0.22]], l: [PHONE, PHONE], fov: 30},
];

export const S1Quarto: React.FC = () => {
	const t = useTime(START);
	const cam = shotCam(t, shots, END);

	const buzz = (a: number, d = 1.2) => (t >= a && t < a + d ? t - a : 0);
	const phoneBuzz = buzz(T.vibra) || buzz(T.pix - 0.3) || buzz(T.compra - 0.3) || buzz(58.6, 1.4);
	const phoneScreen = Math.max(win(t, T.vibra, T.pix + 4), win(t, T.compra - 0.3, T.compra + 4), win(t, 58.6, END + 1));

	let gameMoney = 312;
	if (t > T.missao) gameMoney = 25312;
	if (t > T.jaqueta + 4) gameMoney = 20812;
	const label =
		t > T.jaqueta + 2 && t < T.jaqueta + 6
				? 'JAQUETA  $ 4.500'
				: t > T.carro && t < 60.5
					? 'CARRO  $ 1.200.000'
					: undefined;

	const breathe = Math.sin(t * 1.4) * 0.02;
	const laugh = t > T.jaqueta && t < T.jaqueta + 2.5 ? Math.sin(t * 22) * 0.05 : 0;
	const fadeOut = sr(t, END - 0.6, END);
	const monitorFlicker = 0.85 + Math.sin(t * 13) * 0.04 + Math.sin(t * 31) * 0.03;

	return (
		<AbsoluteFill style={{background: '#000'}}>
			<ThreeCanvas width={1920} height={1080} gl={{antialias: false, powerPreference: "high-performance"}}>
				<color attach="background" args={['#03050a']} />
				<fog attach="fog" args={['#03050a', 3, 9]} />
				<CameraRig pos={cam.pos} look={cam.look} fov={cam.fov} />
				<ambientLight intensity={0.35} color="#4a6496" />
				<hemisphereLight args={["#3a5a9a", "#0a0a12", 0.5]} />
				{/* luz azul do monitor */}
				<pointLight position={[0, 1.2, 0.05]} intensity={9 * monitorFlicker} distance={6} decay={1.3} color="#4aa3ff" />
				<pointLight position={[0, 1.3, 0.45]} intensity={4 * monitorFlicker} distance={3} decay={1.3} color="#6fb6ff" />
				<pointLight position={[-1.6, 2.4, 2.2]} intensity={3} distance={7} decay={1.2} color="#3b4f8a" />
				<pointLight position={[1.8, 2.2, 1.6]} intensity={1.5} distance={6} decay={1.2} color="#7a4cff" />

				{/* quarto */}
				<Box p={[0, -0.01, 0.8]} s={[5, 0.02, 4]} c="#15161a" />
				<Box p={[0, 1.4, -0.72]} s={[5, 2.8, 0.05]} c="#1a1d26" />
				<Box p={[-2.1, 1.4, 0.8]} s={[0.05, 2.8, 4]} c="#171a22" />
				<Box p={[1.5, 1.6, -0.69]} s={[0.9, 0.6, 0.02]} c="#2b2f3d" />
				{/* cama bagunçada ao fundo */}
				<Box p={[-1.4, 0.25, 1.6]} s={[1.2, 0.5, 2]} c="#1f2430" />
				<Box p={[-1.5, 0.55, 1.3]} s={[0.9, 0.12, 1.2]} c="#2c3346" r={[0, 0.2, 0.05]} />

				<Desk p={[0, 0, -0.3]} w={1.9} d={0.75} />
				<Clutter seed={4} area={[-0.9, 0.9, -0.55, 0.0]} n={12} />
				<Clutter seed={9} area={[-1.6, 1.4, 0.2, 2.4]} y={0} n={14} />
				<Cables />
				<Box p={[0, 0.82, -0.32]} s={[0.25, 0.04, 0.2]} c="#111" />
				<Box p={[0, 0.98, -0.32]} s={[0.04, 0.3, 0.04]} c="#111" />
				<Screen
					p={[0, 1.18, -0.3]}
					w={1.0}
					h={0.56}
					on={monitorFlicker}
					k={Math.floor(t * 15)}
					draw={drawGame(t, {money: money(gameMoney, '$ '), label})}
				/>
				{/* teclado e mouse */}
				<Box p={[-0.05, 0.775, -0.05]} s={[0.5, 0.02, 0.16]} c="#0d0d10" e="#3355ff" ei={0.25} />
				<Box p={[0.35, 0.775, -0.02]} s={[0.07, 0.025, 0.11]} c="#0d0d10" />
				{/* torre do PC com LEDs */}
				<Box p={[0.75, 0.25, -0.35]} s={[0.22, 0.5, 0.45]} c="#0c0d10" e="#7a3cff" ei={0.15} />

				<Phone p={PHONE} ry={0.3} buzz={phoneBuzz} screen={phoneScreen} color="#bfe6ff" />

				<Chair p={[0, 0, 0.62]} ry={Math.PI} fancy />
				<Person
					position={[0, 0, 0.6]}
					rotationY={Math.PI}
					pose="sit"
					shirt="#2a2f3a"
					hood
					hair="#20170f"
					armL={1.15}
					armR={1.15 + (t > 54 && t < 58 ? Math.sin(t * 9) * 0.06 : 0)}
					armLSide={0.15}
					armRSide={0.1}
					lean={0.18 + breathe}
					headTilt={0.12 + laugh}
					headTurn={t > T.vibra && t < T.jaqueta ? 0.55 * sr(t, T.vibra, T.vibra + 0.6) : t > T.eraReal - 1 ? 0.5 : 0}
					glow="#2f7dff"
				/>
			</ThreeCanvas>

			<Title t={t} a={T.title} b={7.2} text="O CUSTO DE CADA CLIQUE" sub="UM CURTA-METRAGEM" />
			<GameBanner t={t} a={T.missao + 0.4} b={T.vibra} text="MISSÃO CONCLUÍDA" sub="+ $ 25.000" />
			<Notification t={t} a={T.pix} b={T.jaqueta} title="Pix recebido" body="R$ 25.000,00 — Metrópole Zero Ltda." />
			<Notification t={t} a={T.compra} b={T.compra + 3.2} title="Compra aprovada" body="− R$ 4.500,00" color="#e5484d" />
			<Notification t={t} a={T.eraReal - 0.4} b={END} title="Compra aprovada" body="− R$ 1.200.000,00" color="#e5484d" />
			<AbsoluteFill style={{background: 'black', opacity: Math.max(1 - sr(t, 0.4, 2.2), fadeOut)}} />
		</AbsoluteFill>
	);
};
