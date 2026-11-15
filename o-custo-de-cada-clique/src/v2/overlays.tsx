import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {sr, win} from './time';

const mono = '"JetBrains Mono", monospace';
const sans = 'Inter, sans-serif';

/** Notificação estilo celular (banco). Visível entre a e b. */
export const Notification: React.FC<{
	t: number;
	a: number;
	b: number;
	app?: string;
	title: string;
	body?: string;
	color?: string;
	pos?: 'top' | 'center';
}> = ({t, a, b, app = 'Banco', title, body, color = '#19c37d', pos = 'top'}) => {
	const o = win(t, a, b, 0.35);
	if (o <= 0) return null;
	const y = (1 - sr(t, a, a + 0.45)) * -60;
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: pos === 'top' ? 'flex-start' : 'center', paddingTop: pos === 'top' ? 130 : 0}}>
			<div
				style={{
					transform: `translateY(${y}px) scale(${0.96 + 0.04 * o})`,
					opacity: o,
					width: 620,
					background: 'rgba(22,24,28,0.86)',
					border: '1px solid rgba(255,255,255,0.12)',
					borderRadius: 26,
					padding: '22px 28px',
					boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
					fontFamily: sans,
					color: 'white',
					display: 'flex',
					gap: 20,
					alignItems: 'center',
				}}
			>
				<div style={{width: 60, height: 60, borderRadius: 16, background: color, display: 'grid', placeItems: 'center', fontSize: 30, fontWeight: 900}}>
					{app[0]}
				</div>
				<div style={{flex: 1}}>
					<div style={{fontSize: 18, opacity: 0.6, display: 'flex', justifyContent: 'space-between'}}>
						<span>{app.toUpperCase()}</span>
						<span>agora</span>
					</div>
					<div style={{fontSize: 30, fontWeight: 800, marginTop: 4}}>{title}</div>
					{body && <div style={{fontSize: 22, opacity: 0.85, marginTop: 4}}>{body}</div>}
				</div>
			</div>
		</AbsoluteFill>
	);
};

/** Faixa de HUD do jogo. */
export const GameBanner: React.FC<{t: number; a: number; b: number; text: string; sub?: string; color?: string}> = ({
	t,
	a,
	b,
	text,
	sub,
	color = '#ffe066',
}) => {
	const o = win(t, a, b, 0.3);
	if (o <= 0) return null;
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
			<div
				style={{
					opacity: o,
					transform: `scale(${1.15 - 0.15 * sr(t, a, a + 0.4)})`,
					fontFamily: sans,
					textAlign: 'center',
					background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.75) 20%, rgba(0,0,0,0.75) 80%, transparent)',
					width: '100%',
					padding: '26px 0',
				}}
			>
				<div style={{fontSize: 58, fontWeight: 900, color, letterSpacing: 4, textShadow: `0 0 24px ${color}88`}}>{text}</div>
				{sub && <div style={{fontSize: 44, fontWeight: 800, color: '#7CFFB2', fontFamily: mono, marginTop: 6}}>{sub}</div>}
			</div>
		</AbsoluteFill>
	);
};

export const Caption: React.FC<{t: number; a: number; b: number; text: string; corner?: boolean; size?: number}> = ({
	t,
	a,
	b,
	text,
	corner = true,
	size = 34,
}) => {
	const o = win(t, a, b, 0.6);
	if (o <= 0) return null;
	return (
		<AbsoluteFill
			style={{
				alignItems: corner ? 'flex-start' : 'center',
				justifyContent: corner ? 'flex-end' : 'center',
				padding: corner ? '0 0 170px 110px' : 0,
			}}
		>
			<div style={{opacity: o, fontFamily: mono, fontSize: size, color: 'rgba(255,255,255,0.92)', letterSpacing: 8, textTransform: 'uppercase'}}>
				{text}
			</div>
		</AbsoluteFill>
	);
};

export const Title: React.FC<{t: number; a: number; b: number; text: string; sub?: string}> = ({t, a, b, text, sub}) => {
	const o = win(t, a, b, 0.9);
	if (o <= 0) return null;
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
			<div style={{opacity: o, textAlign: 'center', fontFamily: mono, color: 'white'}}>
				<div style={{fontSize: 92, fontWeight: 800, letterSpacing: 10 + 6 * sr(t, a, b), textShadow: '0 0 40px rgba(80,160,255,0.6)'}}>{text}</div>
				{sub && <div style={{fontSize: 26, letterSpacing: 12, opacity: 0.7, marginTop: 18}}>{sub}</div>}
			</div>
		</AbsoluteFill>
	);
};

export const Counter: React.FC<{t: number; a: number; b: number; value: string; label?: string; color?: string}> = ({
	t,
	a,
	b,
	value,
	label,
	color = '#7CFFB2',
}) => {
	const o = win(t, a, b, 0.5);
	if (o <= 0) return null;
	return (
		<AbsoluteFill style={{alignItems: 'flex-end', justifyContent: 'flex-start', padding: '140px 110px 0 0'}}>
			<div style={{opacity: o, fontFamily: mono, textAlign: 'right'}}>
				{label && <div style={{fontSize: 20, letterSpacing: 6, color: 'rgba(255,255,255,0.6)'}}>{label}</div>}
				<div style={{fontSize: 46, fontWeight: 800, color, textShadow: `0 0 18px ${color}66`}}>{value}</div>
			</div>
		</AbsoluteFill>
	);
};

/** Moldura cinematográfica: letterbox 2.39:1, vinheta e grão já embutidos em PNG (rápido de compor). */
export const CinemaFrame: React.FC = () => {
	const frame = useCurrentFrame();
	return <Img src={staticFile(`frame_${frame % 4}.png`)} style={{position: 'absolute', inset: 0, width: 1920, height: 1080}} />;
};
