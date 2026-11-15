import React from 'react';

type V3 = [number, number, number];

export type Pose = 'stand' | 'sit' | 'ground';

export type PersonProps = {
	position?: V3;
	rotationY?: number;
	pose?: Pose;
	shirt?: string;
	pants?: string;
	skin?: string;
	hair?: string;
	hairLen?: number; // 0..1 (cabelo crescendo)
	armL?: number; // rotação do braço (rad, positivo = para frente)
	armR?: number;
	armLSide?: number;
	armRSide?: number;
	headTilt?: number; // inclina a cabeça para frente
	headTurn?: number;
	lean?: number; // inclina o tronco
	walk?: number; // fase da caminhada (rad); 0 = parado
	walkAmp?: number;
	badge?: boolean;
	hood?: boolean;
	dress?: boolean;
	scale?: number;
	bald?: boolean;
	glow?: string; // cor de luz refletida no rosto
	watch?: boolean;
	smile?: number; // 0 = neutro, 1 = sorriso
};

const Limb: React.FC<{len: number; r: number; color: string}> = ({len, r, color}) => (
	<mesh position={[0, -len / 2, 0]}>
		<capsuleGeometry args={[r, len, 6, 12]} />
		<meshStandardMaterial color={color} roughness={0.8} />
	</mesh>
);

export const Person: React.FC<PersonProps> = ({
	position = [0, 0, 0],
	rotationY = 0,
	pose = 'stand',
	shirt = '#3b4a5a',
	pants = '#22252b',
	skin = '#d9a988',
	hair = '#1c1612',
	hairLen = 0,
	armL = 0,
	armR = 0,
	armLSide = 0.08,
	armRSide = 0.08,
	headTilt = 0,
	headTurn = 0,
	lean = 0,
	walk = 0,
	walkAmp = 0,
	badge = false,
	hood = false,
	dress = false,
	scale = 1,
	bald = false,
	glow,
	watch = false,
	smile = 0,
}) => {
	const hipY = pose === 'stand' ? 0.92 : pose === 'sit' ? 0.56 : 0.16;
	const swing = Math.sin(walk) * walkAmp;
	const bounce = walkAmp > 0 ? Math.abs(Math.cos(walk)) * 0.03 : 0;

	const legs =
		pose === 'stand' ? (
			<>
				<group position={[-0.11, hipY, 0]} rotation={[swing, 0, 0]}>
					<Limb len={0.66} r={0.085} color={pants} />
					<mesh position={[0, -0.86, 0.06]}>
						<boxGeometry args={[0.13, 0.08, 0.26]} />
						<meshStandardMaterial color="#111" roughness={0.6} />
					</mesh>
				</group>
				<group position={[0.11, hipY, 0]} rotation={[-swing, 0, 0]}>
					<Limb len={0.66} r={0.085} color={pants} />
					<mesh position={[0, -0.86, 0.06]}>
						<boxGeometry args={[0.13, 0.08, 0.26]} />
						<meshStandardMaterial color="#111" roughness={0.6} />
					</mesh>
				</group>
			</>
		) : (
			<>
				{[-0.11, 0.11].map((x) => (
					<group key={x}>
						<group position={[x, hipY, 0]} rotation={[Math.PI / 2, 0, 0]}>
							<Limb len={0.42} r={0.09} color={pants} />
						</group>
						{pose === 'sit' ? (
							<group position={[x, hipY, 0.5]}>
								<Limb len={0.42} r={0.08} color={pants} />
							</group>
						) : (
							<group position={[x, hipY, 0.5]} rotation={[Math.PI / 2.2, 0, 0]}>
								<Limb len={0.36} r={0.08} color={pants} />
							</group>
						)}
					</group>
				))}
			</>
		);

	const torsoY = hipY + 0.33;
	const shoulderY = hipY + 0.6;
	const headY = hipY + 0.86;

	return (
		<group position={position} rotation={[0, rotationY, 0]} scale={scale}>
			<group position={[0, bounce, 0]}>
				{legs}
				<group position={[0, hipY, 0]} rotation={[lean, 0, 0]}>
					<group position={[0, -hipY, 0]}>
						{/* tronco */}
						<mesh position={[0, torsoY, 0]} scale={[1, 1, 0.72]}>
							<capsuleGeometry args={[0.22, 0.38, 6, 14]} />
							<meshStandardMaterial color={shirt} roughness={0.85} />
						</mesh>
						{dress && (
							<mesh position={[0, hipY - 0.12, 0]}>
								<coneGeometry args={[0.36, 0.7, 16, 1, true]} />
								<meshStandardMaterial color={shirt} roughness={0.85} side={2} />
							</mesh>
						)}
						{badge && (
							<mesh position={[0.1, torsoY + 0.12, 0.17]}>
								<boxGeometry args={[0.1, 0.13, 0.01]} />
								<meshStandardMaterial color="#f4f4f0" emissive="#ffffff" emissiveIntensity={0.25} />
							</mesh>
						)}
						{/* braços */}
						<group position={[-0.29, shoulderY, 0]} rotation={[-armL + swing * 0.8, 0, -armLSide]}>
							<Limb len={0.5} r={0.065} color={shirt} />
							{watch && (
								<mesh position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
									<torusGeometry args={[0.07, 0.022, 10, 24]} />
									<meshStandardMaterial color="#ffcc44" metalness={1} roughness={0.15} emissive="#aa7700" emissiveIntensity={0.6} />
								</mesh>
							)}
							<mesh position={[0, -0.6, 0]}>
								<sphereGeometry args={[0.065, 10, 10]} />
								<meshStandardMaterial color={skin} />
							</mesh>
						</group>
						<group position={[0.29, shoulderY, 0]} rotation={[-armR - swing * 0.8, 0, armRSide]}>
							<Limb len={0.5} r={0.065} color={shirt} />
							<mesh position={[0, -0.6, 0]}>
								<sphereGeometry args={[0.065, 10, 10]} />
								<meshStandardMaterial color={skin} />
							</mesh>
						</group>
						{/* pescoço + cabeça */}
						<mesh position={[0, shoulderY + 0.06, 0]}>
							<cylinderGeometry args={[0.06, 0.07, 0.14, 10]} />
							<meshStandardMaterial color={skin} />
						</mesh>
						<group position={[0, headY, 0]} rotation={[headTilt, headTurn, 0]}>
							<mesh scale={[1, 1.12, 1]}>
								<sphereGeometry args={[0.16, 20, 20]} />
								<meshStandardMaterial
									color={skin}
									roughness={0.6}
									emissive={glow ?? '#000000'}
									emissiveIntensity={glow ? 0.25 : 0}
								/>
							</mesh>
							{/* olhos */}
							{[-0.055, 0.055].map((x) => (
								<mesh key={x} position={[x, 0.02, 0.15]}>
									<sphereGeometry args={[0.018, 8, 8]} />
									<meshStandardMaterial color="#0d0d0d" />
								</mesh>
							))}
							{/* boca */}
							<mesh position={[0, -0.085 + smile * 0.012, 0.142]} rotation={[0.25, 0, Math.PI]} scale={[1, 0.3 + smile * 0.7, 1]}>
								<torusGeometry args={[0.04, 0.009, 6, 16, Math.PI]} />
								<meshStandardMaterial color="#5a2a24" />
							</mesh>
							{/* nariz */}
							<mesh position={[0, -0.03, 0.16]}>
								<sphereGeometry args={[0.025, 8, 8]} />
								<meshStandardMaterial color={skin} />
							</mesh>
							{!bald && (
								<mesh
									position={[0, 0.02, -0.01]}
									rotation={[-0.45, 0, 0]}
									scale={[1.08, 1.12 + hairLen * 0.1, 1.08 + hairLen * 0.12]}
								>
									<sphereGeometry args={[0.165, 20, 14, 0, Math.PI * 2, 0, Math.PI * (0.47 + hairLen * 0.22)]} />
									<meshStandardMaterial color={hair} roughness={0.9} side={2} />
								</mesh>
							)}
							{hood && (
								<mesh position={[0, -0.02, -0.06]} rotation={[0.3, 0, 0]}>
									<torusGeometry args={[0.2, 0.06, 8, 20, Math.PI * 1.1]} />
									<meshStandardMaterial color={shirt} roughness={0.9} />
								</mesh>
							)}
						</group>
					</group>
				</group>
			</group>
		</group>
	);
};
