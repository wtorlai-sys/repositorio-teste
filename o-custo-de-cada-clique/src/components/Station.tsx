import React from 'react';
import {Box, Chair, Screen, drawGame} from './Props';
import {Person, PersonProps} from './Person';

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

export const MAX_HEAD: [number, number, number] = [0, 1.42, -0.32];
export const FACE_A: [number, number, number] = [1.0, 1.52, -0.95];
export const FACE_B: [number, number, number] = [0.88, 1.48, -0.88];
export const FACE_LOOK: [number, number, number] = [0, 1.36, -0.32];
export const CENTER_MON: [number, number, number] = [0, 1.32, -1.45];

/** Três monitores gigantes + luz que eles projetam. */
export const Monitors: React.FC<{t: number; on: number; draw: Draw; k: unknown; children?: React.ReactNode}> = ({
	t,
	on,
	draw,
	k,
	children,
}) => {
	const fl = on * (0.9 + Math.sin(t * 13) * 0.05);
	const sideK = on > 0.01 ? Math.floor(t * 8) : -1;
	const off: Draw = (ctx, w, h) => {
		ctx.fillStyle = '#050608';
		ctx.fillRect(0, 0, w, h);
	};
	return (
		<group>
			<Screen p={CENTER_MON} w={1.3} h={0.73} on={Math.max(fl, 0.04)} draw={on > 0.01 ? draw : off} k={on > 0.01 ? k : 'off'} res={768} />
			<Screen
				p={[-1.33, 1.32, -1.2]}
				r={[0, 0.5, 0]}
				w={1.3}
				h={0.73}
				on={Math.max(fl, 0.04)}
				draw={on > 0.01 ? drawGame(t + 40, {money: 'SETOR 7'}) : off}
				k={sideK}
			/>
			<Screen
				p={[1.33, 1.32, -1.2]}
				r={[0, -0.5, 0]}
				w={1.3}
				h={0.73}
				on={Math.max(fl, 0.04)}
				draw={on > 0.01 ? drawGame(t + 90, {money: 'ALVOS 3'}) : off}
				k={sideK}
			/>
			{[-1.33, 0, 1.33].map((x) => (
				<Box key={x} p={[x * 0.92, 0.97, x === 0 ? -1.47 : -1.25]} s={[0.05, 0.38, 0.05]} c="#0d0e12" />
			))}
			<pointLight position={[0, 1.35, -0.95]} intensity={9 * fl} distance={6} decay={1.3} color="#4aa3ff" />
			<pointLight position={[0, 1.6, -0.6]} intensity={3 * fl} distance={3} decay={1.3} color="#8cc8ff" />
			{children}
		</group>
	);
};

/** Max sentado na cadeira gamer de frente para os monitores. */
export const MaxAtDesk: React.FC<Partial<PersonProps> & {typing?: number; t: number}> = ({typing = 1, t, ...rest}) => {
	const clean = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined));
	return (
	<group>
		<Chair p={[0, 0, -0.26]} ry={Math.PI} fancy />
		<Person
			position={[0, 0, -0.3]}
			rotationY={Math.PI}
			pose="sit"
			shirt="#2a2f3a"
			hood
			hair="#20170f"
			armL={1.15 * typing}
			armR={1.15 * typing + Math.sin(t * 17) * 0.03 * typing}
			armLSide={0.15}
			armRSide={0.12}
			lean={0.15 + Math.sin(t * 1.3) * 0.015}
			headTilt={0.08}
			glow="#2f7dff"
			{...clean}
		/>
	</group>
	);
};
