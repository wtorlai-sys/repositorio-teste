import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Shot2, T, cam2, mixColor, money, sr, useTime} from '../time';
import {GameOpts, Stage} from '../parts';
import {PenthouseBack, PenthouseSide} from '../penthouse';
import {OverShoulder, PhoneDesk} from './S1Quarto';
import {Caption, Counter, Notification} from '../overlays';

const sky = (day: number): [string, string] => [mixColor('#151a44', '#5b9be6', day), mixColor('#3a2f6e', '#cfe6ff', day)];
const SEASONS = [
	{color: '#ffffff', r: 5},
	{color: '#ffb3d1', r: 4},
	{color: '#fff6b0', r: 2},
	{color: '#e07a2a', r: 6},
];

// ------------------------------------------------------------------ OS ANOS
const A0 = T.cena4;
const A1 = T.tentativas;

const shotsA: Shot2[] = [
	{at: A0, a: {x: 960, y: 560, s: 1.0}, b: {x: 960, y: 560, s: 1.02}}, // 0 timelapse
	{at: T.ano3, a: {x: 1220, y: 600, s: 1.55}, b: {x: 1240, y: 600, s: 1.7}}, // 1 ligação do Duda
	{at: 175.6, a: {x: 960, y: 560, s: 1.0}, b: {x: 960, y: 560, s: 1.02}}, // 2 timelapse
	{at: T.ano9, a: {x: 960, y: 545, s: 0.95}, b: {x: 960, y: 545, s: 1.05}}, // 3 celular mãe
	{at: 185.0, a: {x: 960, y: 560, s: 1.0}, b: {x: 960, y: 570, s: 1.08}}, // 4 ombro assalto
	{at: T.manha, a: {x: 960, y: 560, s: 1.0}, b: {x: 960, y: 560, s: 1.06}, ease: 'smooth'}, // 5 manhã
	{at: 191.6, a: {x: 960, y: 545, s: 0.95}, b: {x: 960, y: 545, s: 1.0}}, // 6 mensagem
	{at: T.paralisa, a: {x: 1190, y: 580, s: 2.3}, b: {x: 1195, y: 582, s: 2.45}}, // 7 rosto
	{at: 197.2, a: {x: 960, y: 560, s: 1.0}, b: {x: 960, y: 560, s: 1.1}}, // 8 tela morte
];

export const S4Anos: React.FC = () => {
	const t = useTime(A0);
	const {index, transform} = cam2(t, shotsA, A1);
	const lapse = index === 0 || index === 2;
	let day = 0;
	if (lapse) day = 0.5 + 0.5 * Math.sin((t - A0) * 2.2);
	if (index === 1) day = 0.85;
	if (index >= 5) day = sr(t, T.manha, T.manha + 2) * 0.75;
	const season = SEASONS[Math.floor(((t - A0) / 1.5) % 4)];
	const saldo = 50e6 * Math.pow(800, sr(t, A0, 199));
	const hairLong = lapse ? ((t - A0) % 4.4) / 4.4 > 0.5 : false;
	const year = 1 + Math.floor((t - A0) / 6);
	const game: GameOpts = {
		t,
		money: money(saldo, '$ '),
		night: day < 0.5,
		mode: index === 8 ? 'dead' : index === 4 ? 'heist' : 'city',
		banner: index === 4 ? 'ASSALTO DECISIVO' : undefined,
	};
	const ring = index === 3 && t < T.silencia + 0.8;
	const frozen = index === 7;

	return (
		<AbsoluteFill>
			<Stage bg="#1d1f45" cam={transform}>
				{(lapse || index === 5) && (
					<PenthouseBack
						t={t}
						sky={sky(day)}
						lit={0.4 * (1 - day)}
						game={game}
						particles={lapse ? season : undefined}
						sun={index === 5 ? sr(t, T.manha, T.manha + 3) * 0.6 : undefined}
						room={mixColor('#272a55', '#4a4f86', day)}
						maxProps={{longHair: hairLong, hair: hairLong ? '#20170f' : undefined}}
					/>
				)}
				{(index === 1 || index === 7) && (
					<PenthouseSide
						t={frozen ? T.paralisa : t}
						sky={index === 1 ? sky(0.85) : sky(0.7)}
						lit={0.1}
						sunlight={index === 7 ? 1 : 0}
						phone={index === 1 ? 1 : 0}
						phoneColor="#5dff9b"
						room={index === 1 ? '#3d4280' : '#3a3d78'}
						max={{
							eye: frozen ? (t > 197.5 ? 'sad' : 'shock') : index === 1 ? 'angry' : 'focus',
							mouth: index === 1 && t > 171.2 && t < 175 ? (Math.sin(t * 14) > 0 ? 'open' : 'flat') : frozen ? (t > 197.5 ? 'sad' : 'o') : 'flat',
							tears: frozen && t > 197.6 ? t : undefined,
							hair: '#20170f',
							longHair: true,
							armF: frozen ? [40, 30] : [52 + Math.sin(t * 13) * 2, 42],
						}}
					/>
				)}
				{(index === 4 || index === 8) && <OverShoulder t={t} game={game} three />}
				{index === 3 && (
					<PhoneDesk
						x={960}
						y={545}
						s={0.95}
						rot={4}
						buzz={ring ? t : 0}
						on={t < T.silencia + 0.8 ? 1 : 0}
						clock="23:40"
						app="Telefone"
						title="Mãe"
						body="14 chamadas perdidas"
						color="#e5484d"
						big="Mãe chamando…"
						bigColor="#ffb0b0"
					/>
				)}
				{index === 6 && <PhoneDesk x={960} y={545} s={0.95} rot={4} on={1} clock="07:12" app="Mensagens" title="Dona Cida (vizinha)" body="Sinto muito, Max…" color="#8e8e93" big="sua mãe faleceu." bigColor="#ffffff" night={false} />}
			</Stage>
			<Counter t={t} a={A0 + 0.5} b={T.ano3 - 0.2} label="SALDO" value={money(saldo)} />
			<Counter t={t} a={175.7} b={T.ano9 - 0.1} label="SALDO" value={money(saldo)} />
			{index === 0 && <Caption t={t} a={A0} b={t + 1} text={`ANO ${Math.min(year, 2)}`} />}
			<Caption t={t} a={T.ano3} b={T.ano3 + 4} text="ANO 3" />
			<Caption t={t} a={T.ano9} b={T.ano9 + 4} text="ANO 9" />
			<Notification t={t} a={T.ano3 + 0.6} b={171.2} app="Telefone" title="Duda" body="Chamada recebida · churrasco no domingo?" color="#34c759" />
			<AbsoluteFill style={{background: '#000', opacity: Math.max(1 - sr(t, A0, A0 + 0.5), sr(t, 199.9, T.preto))}} />
		</AbsoluteFill>
	);
};

// ------------------------------------------------------------------ TENTATIVAS
const B0 = T.tentativas;
const B1 = T.cena5;

const shotsB: Shot2[] = [
	{at: B0, a: {x: 960, y: 520, s: 1.15}, b: {x: 960, y: 540, s: 1.0}}, // 0 janela
	{at: T.voltou1, a: {x: 960, y: 560, s: 1.0}, b: {x: 960, y: 570, s: 1.06}}, // 1 voltou
	{at: 210.4, a: {x: 420, y: 720, s: 1.6}, b: {x: 430, y: 715, s: 1.7}}, // 2 sofá
	{at: T.voltou2, a: {x: 960, y: 560, s: 1.0}, b: {x: 960, y: 570, s: 1.06}}, // 3 voltou
	{at: 215.4, a: {x: 1180, y: 590, s: 1.9}, b: {x: 1195, y: 585, s: 2.4}, ease: 'smooth'}, // 4 rosto
];

export const S4Tentativas: React.FC = () => {
	const t = useTime(B0);
	const {index, transform} = cam2(t, shotsB, B1);
	let day = 0.15;
	if (index === 0 && t > 203.6) day = 0.5 + 0.5 * Math.sin((t - 203.6) * 3.2 - 1.5);
	if (index === 2) day = 0.5 + 0.5 * Math.sin((t - 210.4) * 7 - 1.5);
	const monOn = index === 1 || index === 3 ? sr(t, index === 1 ? T.voltou1 : T.voltou2, (index === 1 ? T.voltou1 : T.voltou2) + 0.3) : index === 4 ? 1 : 0;
	const saldo = 41e9 * (1 - 0.18 * sr(t, B0, T.voltou1) - 0.2 * sr(t, 210.4, T.voltou2));
	const dayN = 1 + Math.min(2, Math.max(0, Math.floor((t - 203.6) / 1.96)));
	const game: GameOpts = {t, money: money(saldo, '$ '), night: true};
	const flash = Math.max(0, 1 - Math.abs(t - T.voltou1) / 0.2) + Math.max(0, 1 - Math.abs(t - T.voltou2) / 0.2);

	return (
		<AbsoluteFill>
			<Stage bg="#1d1f45" cam={transform}>
				{index !== 4 ? (
					<PenthouseBack
						t={t}
						sky={sky(day)}
						lit={0.4 * (1 - day)}
						monOn={monOn}
						game={game}
						room={mixColor('#272a55', '#4a4f86', day)}
						max={index === 0 ? 'window' : index === 2 ? 'sofa' : 'chair'}
						maxProps={{longHair: true, hair: '#20170f'}}
					/>
				) : (
					<PenthouseSide t={t} sky={sky(0.05)} lit={0.4} max={{eye: 'tired', mouth: 'sad', longHair: true, hair: '#20170f', armF: [52, 42], blink: t % 3 < 0.15 ? 1 : 0}} />
				)}
			</Stage>
			<Caption t={t} a={203.6} b={T.voltou1 - 0.2} text={`DIA ${dayN}`} />
			<Caption t={t} a={210.8} b={T.voltou2 - 0.2} text="DIA 7" />
			<Notification t={t} a={205.2} b={208.2} app="Banco" title="Débito automático" body="Manutenção Metrópole Zero · − R$ 2.400.000,00" color="#e5484d" />
			<Counter t={t} a={B0 + 1} b={T.voltou1} label="SALDO" value={money(saldo)} color="#ff6b6b" />
			<AbsoluteFill style={{background: '#fff', opacity: flash * 0.5}} />
			<AbsoluteFill style={{background: '#000', opacity: Math.max(1 - sr(t, B0, B0 + 0.8), sr(t, B1 - 0.8, B1))}} />
		</AbsoluteFill>
	);
};
