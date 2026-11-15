import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Shot2, T, cam2, lerp, money, sr, useTime} from '../time';
import {GameOpts, Stage} from '../parts';
import {PenthouseBack, PenthouseSide} from '../penthouse';
import {OverShoulder, PhoneDesk} from './S1Quarto';
import {Caption} from '../overlays';

const START = T.cena3;
const END = T.cena4;
const NIGHT: [string, string] = ['#151a44', '#3a2f6e'];

const shots: Shot2[] = [
	{at: START, a: {x: 960, y: 560, s: 1.0}, b: {x: 960, y: 580, s: 1.12}, ease: 'smooth'}, // 0 amplo
	{at: T.aluguel, a: {x: 960, y: 560, s: 1.0}, b: {x: 960, y: 570, s: 1.08}}, // 1 ombro
	{at: 114.6, a: {x: 960, y: 545, s: 0.95}, b: {x: 960, y: 545, s: 1.05}}, // 2 celular
	{at: 120.0, a: {x: 1180, y: 600, s: 1.7}, b: {x: 1200, y: 600, s: 1.85}}, // 3 lado
	{at: 130.2, a: {x: 960, y: 560, s: 1.0}, b: {x: 960, y: 570, s: 1.08}}, // 4 ombro (assalto)
	{at: T.dormir, a: {x: 1190, y: 580, s: 2.4}, b: {x: 1195, y: 585, s: 2.7}}, // 5 rosto
	{at: T.prisao - 0.4, a: {x: 960, y: 640, s: 1.6}, b: {x: 960, y: 560, s: 0.85}, ease: 'smooth'}, // 6 prisão
];

export const S3Noite: React.FC = () => {
	const t = useTime(START);
	const {index, transform} = cam2(t, shots, END);

	const drain = sr(t, 114.8, 128);
	const heist = sr(t, 130.5, 135.5);
	const failed = t > 136;
	const saldo = lerp(48e6, 31.5e6, drain) + (failed ? 0 : heist * 2e6);
	const game: GameOpts = {
		t,
		money: money(saldo, '$ '),
		night: true,
		mode: t > 130.4 && t < 136 ? 'heist' : 'city',
		banner:
			index === 1 ? 'MANUTENÇÃO EM 48 MIN' : index === 4 ? (failed ? 'ASSALTO FRACASSOU' : 'ASSALTO EM ANDAMENTO') : undefined,
		bannerSub: index === 1 ? 'aluguel + manutenção das propriedades' : failed && index === 4 ? '− $ 2.000.000' : undefined,
		bannerColor: failed ? '#ff6b6b' : '#ffd34d',
	};
	const yawn = sr(t, T.boceja, T.boceja + 0.5) * (1 - sr(t, T.boceja + 1.8, T.boceja + 2.3));
	const drink = sr(t, T.boceja + 2.3, T.boceja + 2.8) * (1 - sr(t, T.boceja + 4, T.boceja + 4.5));
	const cans = Math.floor((t - START) / 4);
	const blink = t % 2.6 < 0.15 || (index === 5 && t % 1.3 < 0.35) ? 1 : 0;

	return (
		<AbsoluteFill>
			<Stage bg="#1d1f45" cam={transform}>
				{(index === 0 || index === 6) && <PenthouseBack t={t} sky={NIGHT} game={game} cans={cans} bars={index === 6 ? sr(t, T.prisao - 0.2, T.prisao + 0.8) : 0} />}
				{(index === 1 || index === 4) && <OverShoulder t={t} game={game} three />}
				{index === 2 && <PhoneDesk x={960} y={545} s={0.95} rot={6} buzz={t < 116 ? t : 0} on={1} clock="04:12" app="Banco" title="Débito automático" body="Manutenção Metrópole Zero" color="#e5484d" big="− R$ 480.000,00" bigColor="#ff8080" />}
				{(index === 3 || index === 5) && (
					<PenthouseSide
						t={t}
						sky={NIGHT}
						max={{
							blink,
							eye: yawn > 0.3 ? 'closed' : index === 5 ? 'tired' : t > 124 ? 'angry' : 'focus',
							mouth: yawn > 0.3 ? 'yawn' : index === 5 ? 'sad' : 'flat',
							headTilt: -yawn * 14 + (index === 5 ? 6 : 0),
							armF: drink > 0 ? [lerp(52, 150, drink), lerp(42, 30, drink)] : [52 + Math.sin(t * 13) * 2, 42],
							hold: drink > 0.3 ? 'can' : 'pad',
						}}
					/>
				)}
			</Stage>
			<Caption t={t} a={START + 0.6} b={T.aluguel - 0.2} text="04:00" />
			<AbsoluteFill style={{background: '#000', opacity: Math.max(1 - sr(t, START, START + 0.6), sr(t, END - 0.5, END))}} />
		</AbsoluteFill>
	);
};
