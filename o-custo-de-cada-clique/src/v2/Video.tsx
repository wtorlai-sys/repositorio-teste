import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {FPS, T} from './time';
import {CinemaFrame} from './overlays';
import {S1Quarto} from './scenes/S1Quarto';
import {S2Casa} from './scenes/S2Casa';
import {S2bMontagem} from './scenes/S2bMontagem';
import {S3Noite} from './scenes/S3Noite';
import {S4Anos, S4Tentativas} from './scenes/S4Anos';
import {S5Gala} from './scenes/S5Gala';
import {S6Campo} from './scenes/S6Campo';

const seq = (a: number, b: number) => ({
	from: Math.round(a * FPS),
	durationInFrames: Math.round((b - a) * FPS),
});

export const Video: React.FC = () => (
	<AbsoluteFill style={{background: 'black'}}>
		<Audio src={staticFile('narracao.mp3')} />
		<Sequence {...seq(0, T.casa)} name="1 · Quarto">
			<S1Quarto />
		</Sequence>
		<Sequence {...seq(T.casa, T.montagem)} name="2 · Casa dos pais">
			<S2Casa />
		</Sequence>
		<Sequence {...seq(T.montagem, T.cena3)} name="2b · Montagem">
			<S2bMontagem />
		</Sequence>
		<Sequence {...seq(T.cena3, T.cena4)} name="3 · Madrugada">
			<S3Noite />
		</Sequence>
		<Sequence {...seq(T.cena4, T.tentativas)} name="4 · Os anos">
			<S4Anos />
		</Sequence>
		<Sequence {...seq(T.tentativas, T.cena5)} name="4b · Tentativas">
			<S4Tentativas />
		</Sequence>
		<Sequence {...seq(T.cena5, T.cena6)} name="5 · Festa de gala">
			<S5Gala />
		</Sequence>
		<Sequence {...seq(T.cena6, T.end)} name="6 · Campo de terra">
			<S6Campo />
		</Sequence>
		<CinemaFrame />
	</AbsoluteFill>
);
