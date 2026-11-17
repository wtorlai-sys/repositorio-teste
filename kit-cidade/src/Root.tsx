import React from 'react';
import {Composition} from 'remotion';
import {FPS, TOTAL, Video} from './Video';
import {Elenco, FichaMax, RostosMax} from './Ficha';

export const Root: React.FC = () => (
	<>
		<Composition id="Eco" component={Video} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} defaultProps={{audio: true}} />
		<Composition id="EcoMudo" component={Video} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} defaultProps={{audio: false}} />
		<Composition id="EcoPreview" component={Video} durationInFrames={TOTAL} fps={FPS} width={540} height={960} defaultProps={{audio: false}} />
		<Composition id="FichaMax" component={FichaMax} durationInFrames={1} fps={FPS} width={1600} height={1000} />
		<Composition id="RostosMax" component={RostosMax} durationInFrames={1} fps={FPS} width={1800} height={500} />
		<Composition id="Elenco" component={Elenco} durationInFrames={1} fps={FPS} width={1800} height={1000} />
	</>
);
