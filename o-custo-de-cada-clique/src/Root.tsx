import React from 'react';
import {Composition} from 'remotion';
import {Video} from './v2/Video';
import {Thumbnail} from './v2/Thumbnail';
import {AUDIO_SECONDS, FPS} from './v2/time';

export const RemotionRoot: React.FC = () => (
	<>
	<Composition
		id="OCustoDeCadaClique"
		component={Video}
		durationInFrames={Math.ceil(AUDIO_SECONDS * FPS)}
		fps={FPS}
		width={1920}
		height={1080}
	/>
	<Composition id="Thumbnail" component={Thumbnail} durationInFrames={1} fps={30} width={1920} height={1080} />
	</>
);
