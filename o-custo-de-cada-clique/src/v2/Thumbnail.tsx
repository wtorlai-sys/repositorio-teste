import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Char, MAX_LOOK} from './Char';
import {Glow, PhoneBig, Skyline, Stage} from './parts';

const SPLIT = 'M0 0 H1010 L960 300 L1030 520 L930 760 L990 1080 H0 Z';

const Title: React.FC<{x: number; y: number; text: string; fill: string; size: number; anchor?: 'start' | 'end' | 'middle'; rot?: number}> = ({
	x,
	y,
	text,
	fill,
	size,
	anchor = 'middle',
	rot = 0,
}) => (
	<g transform={`rotate(${rot} ${x} ${y})`}>
		<text x={x + 6} y={y + 10} fontFamily="Inter" fontWeight={900} fontSize={size} textAnchor={anchor} fill="#05060c" opacity={0.85} letterSpacing={-2}>
			{text}
		</text>
		<text
			x={x}
			y={y}
			fontFamily="Inter"
			fontWeight={900}
			fontSize={size}
			textAnchor={anchor}
			fill={fill}
			stroke="#05060c"
			strokeWidth={14}
			paintOrder="stroke"
			strokeLinejoin="round"
			letterSpacing={-2}
		>
			{text}
		</text>
	</g>
);

/** Thumbnail: antes (euforia, dinheiro) x depois (bilhões e solidão). */
export const Thumbnail: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<Stage
			bg="#0d0e1f"
			defs={
				<>
					<clipPath id="leftSide">
						<path d={SPLIT} />
					</clipPath>
					<linearGradient id="lBg" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0" stopColor="#2b2f72" />
						<stop offset="1" stopColor="#151738" />
					</linearGradient>
					<linearGradient id="rBg" x1="1" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#2a2238" />
						<stop offset="1" stopColor="#0c0b16" />
					</linearGradient>
					<radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
						<stop offset="0.55" stopColor="#000" stopOpacity={0} />
						<stop offset="1" stopColor="#000" stopOpacity={0.75} />
					</radialGradient>
				</>
			}
		>
			{/* ---------------- DIREITA: 15 anos depois */}
			<rect width={1920} height={1080} fill="url(#rBg)" />
			<Skyline x={1000} y={900} w={1000} h={520} seed={12} c="#1d1a33" win="#7a6a4a" lit={0.18} n={7} />
			{[1150, 1450, 1750].map((x) => (
				<rect key={x} x={x} y={0} width={18} height={900} fill="#0b0a14" />
			))}
			<rect x={1000} y={900} width={920} height={180} fill="#0e0d1a" />
			{/* saldo gigante */}
			<text x={1470} y={250} fontFamily="JetBrains Mono" fontWeight={800} fontSize={74} fill="#5dff9b" textAnchor="middle" opacity={0.9}>
				US$ 100.000.000.000
			</text>
			<Glow x={1470} y={230} r={420} o={0.18} />
			{/* post-it */}
			<g transform="translate(1790 470) rotate(8)">
				<rect x={-85} y={-85} width={170} height={170} fill="#f6e27a" />
				<text x={0} y={-20} fontFamily="DejaVu Serif" fontStyle="italic" fontSize={30} fill="#1b2a6b" textAnchor="middle">
					Parar no
				</text>
				<text x={0} y={18} fontFamily="DejaVu Serif" fontStyle="italic" fontSize={30} fill="#1b2a6b" textAnchor="middle">
					primeiro
				</text>
				<text x={0} y={56} fontFamily="DejaVu Serif" fontStyle="italic" fontSize={30} fill="#1b2a6b" textAnchor="middle">
					bilhão
				</text>
			</g>
			<Char
				x={1440}
				y={1250}
				scale={3.4}
				view="front"
				{...MAX_LOOK}
				shirt="#2b2d44"
				shirtDark="#202236"
				hood={false}
				headphones={false}
				head="#141522"
				hair="#cfcad8"
				eye="tired"
				mouth="sad"
				tears={0.35}
				headTilt={5}
				armF={[6, 0]}
				armB={[6, 0]}
				rim={{c: '#7fb8ff', dx: -7, dy: -5, o: 0.55}}
			/>

			{/* ---------------- ESQUERDA: a primeira noite */}
			<g clipPath="url(#leftSide)">
				<rect width={1920} height={1080} fill="url(#lBg)" />
				<Glow x={300} y={430} r={700} o={0.5} />
				{/* notas de dinheiro voando */}
				{[
					[150, 180, -18],
					[860, 140, 22],
					[110, 560, 12],
					[880, 470, -28],
					[520, 90, 8],
				].map(([x, y, r], i) => (
					<g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
						<rect x={-70} y={-34} width={140} height={68} rx={8} fill="#3fbf6f" stroke="#0d3a20" strokeWidth={5} />
						<circle cx={0} cy={0} r={20} fill="#2a9d55" />
						<text x={0} y={10} fontFamily="Inter" fontWeight={900} fontSize={28} fill="#d9ffe6" textAnchor="middle">
							R$
						</text>
					</g>
				))}
				<Char
					x={560}
					y={1240}
					scale={3.4}
					view="front"
					{...MAX_LOOK}
					eye="shock"
					mouth="grin"
					headTilt={-4}
					armF={[6, 0]}
					armB={[40, -150]}
					rim={{c: '#a9dcff', dx: -8, dy: -6}}
				/>
				{/* celular com o Pix */}
				<g transform="translate(240 760) rotate(-14) scale(0.95)">
					<Glow x={0} y={0} r={360} o={0.9} />
				</g>
				<PhoneBig x={240} y={760} s={0.95} rot={-14} on={1} app="Banco" title="Pix recebido" body="Metrópole Zero" big="+ R$ 25.000,00" bigColor="#5dff9b" clock="02:00" />
			</g>
			{/* rachadura brilhante entre os dois tempos */}
			<path d={SPLIT.replace('M0 0 H1010', 'M1010 0').replace(' H0 Z', '')} stroke="#dff3ff" strokeWidth={9} fill="none" />
			<path d={SPLIT.replace('M0 0 H1010', 'M1010 0').replace(' H0 Z', '')} stroke="#7fd4ff" strokeWidth={26} fill="none" opacity={0.35} />

			{/* textos */}
			<Title x={505} y={985} text="GANHEI BILHÕES" fill="#5dff9b" size={104} rot={-3} />
			<Title x={1420} y={975} text="PERDI TUDO" fill="#ff5d5d" size={126} rot={-3} />
			<rect width={1920} height={1080} fill="url(#vig)" />
		</Stage>
	</AbsoluteFill>
);
