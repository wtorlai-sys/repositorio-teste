import React from 'react';
import {Box, City, SkyDome} from './Props';

/** Cobertura de luxo: piso escuro brilhante, janela panorâmica e cidade lá fora. */
export const Penthouse: React.FC<{
	skyTop: string;
	skyBottom: string;
	cityLit?: number;
	ambient?: number;
	ambientColor?: string;
	sun?: number;
	sunColor?: string;
	children?: React.ReactNode;
}> = ({skyTop, skyBottom, cityLit = 1, ambient = 0.3, ambientColor = '#8090b0', sun = 0, sunColor = '#ffd7a0', children}) => (
	<group>
		<SkyDome top={skyTop} bottom={skyBottom} />
		<City seed={21} n={90} radius={[25, 80]} arc={[-Math.PI * 0.95, -Math.PI * 0.05]} lit={cityLit} center={[0, -30, 0]} />
		<City seed={33} n={40} radius={[90, 130]} arc={[-Math.PI * 0.95, -Math.PI * 0.05]} lit={cityLit * 0.7} center={[0, -25, 0]} />
		<ambientLight intensity={ambient} color={ambientColor} />
		<hemisphereLight args={[skyTop, '#0b0b0f', ambient * 0.8]} />
		{sun > 0 && <directionalLight position={[-6, 6, -10]} intensity={sun} color={sunColor} />}

		{/* piso, teto e paredes */}
		<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
			<planeGeometry args={[16, 12]} />
			<meshStandardMaterial color="#141519" roughness={0.18} metalness={0.4} />
		</mesh>
		<Box p={[0, 4.02, 0]} s={[16, 0.05, 12]} c="#101114" />
		<Box p={[-8, 2, 0]} s={[0.1, 4, 12]} c="#1b1c21" />
		<Box p={[8, 2, 0]} s={[0.1, 4, 12]} c="#1b1c21" />
		<Box p={[0, 2, 6]} s={[16, 4, 0.1]} c="#1b1c21" />
		{/* caixilhos da janela panorâmica */}
		{Array.from({length: 13}, (_, i) => (
			<Box key={i} p={[-7.5 + i * 1.25, 2, -5.95]} s={[0.07, 4, 0.07]} c="#08090b" metal={0.6} rough={0.3} />
		))}
		<Box p={[0, 0.06, -5.95]} s={[16, 0.12, 0.12]} c="#08090b" />
		<Box p={[0, 3.95, -5.95]} s={[16, 0.12, 0.12]} c="#08090b" />
		{/* sofá de couro e luminária */}
		<Box p={[-4.5, 0.25, 1.5]} s={[2.6, 0.5, 1]} c="#2b2522" rough={0.5} />
		<Box p={[-4.5, 0.65, 1.95]} s={[2.6, 0.5, 0.15]} c="#2b2522" rough={0.5} />
		<Box p={[4.8, 1.3, 2.5]} s={[0.04, 2.6, 0.04]} c="#b8964e" metal={0.9} rough={0.2} />
		<Box p={[4.8, 2.62, 2.5]} s={[0.5, 0.06, 0.5]} c="#b8964e" metal={0.9} rough={0.2} e="#ffcc80" ei={0.4} />
		{children}
	</group>
);

/** Mesa com três monitores gigantes. */
export const BattleStation: React.FC<{children?: React.ReactNode}> = ({children}) => (
	<group>
		<Box p={[0, 0.74, -1.2]} s={[3.2, 0.06, 0.9]} c="#0d0e12" rough={0.3} metal={0.4} />
		<Box p={[-1.5, 0.37, -1.2]} s={[0.06, 0.74, 0.8]} c="#0d0e12" />
		<Box p={[1.5, 0.37, -1.2]} s={[0.06, 0.74, 0.8]} c="#0d0e12" />
		<Box p={[0, 0.79, -0.95]} s={[0.9, 0.025, 0.25]} c="#0b0b0e" e="#ff3366" ei={0.25} />
		{children}
	</group>
);
