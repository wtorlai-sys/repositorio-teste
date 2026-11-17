import React from 'react';
import {Composition} from 'remotion';
import {FPS, TOTAL, Video} from './Video';

export const Root: React.FC = () => (
	<>
		<Composition id="Eco" component={Video} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} defaultProps={{audio: true}} />
		<Composition id="EcoMudo" component={Video} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} defaultProps={{audio: false}} />
		<Composition id="EcoPreview" component={Video} durationInFrames={TOTAL} fps={FPS} width={540} height={960} defaultProps={{audio: false}} />
	</>
);
