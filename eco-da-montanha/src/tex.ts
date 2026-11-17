// Texturas procedurais (canvas) — determinísticas (PRNG com seed), cacheadas por chave.
import * as THREE from 'three';

export const rng = (seed: number) => {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

const cache = new Map<string, THREE.Texture>();

const make = (key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void, repeat?: [number, number]) => {
	const k = key + (repeat ? `@${repeat.join('x')}` : '');
	const hit = cache.get(k);
	if (hit) return hit;
	const cv = document.createElement('canvas');
	cv.width = w;
	cv.height = h;
	const c = cv.getContext('2d')!;
	draw(c, w, h);
	const t = new THREE.CanvasTexture(cv);
	t.colorSpace = THREE.SRGBColorSpace;
	t.anisotropy = 8;
	if (repeat) {
		t.wrapS = t.wrapT = THREE.RepeatWrapping;
		t.repeat.set(repeat[0], repeat[1]);
	}
	cache.set(k, t);
	return t;
};

const shade = (hex: string, f: number) => {
	const c = new THREE.Color(hex);
	c.multiplyScalar(f);
	return '#' + c.getHexString();
};

// manchas grandes para quebrar a repetição
const blotches = (c: CanvasRenderingContext2D, w: number, h: number, r: () => number, n: number, alpha: number) => {
	for (let i = 0; i < n; i++) {
		const x = r() * w, y = r() * h, rad = (0.1 + r() * 0.3) * w;
		const g = c.createRadialGradient(x, y, 0, x, y, rad);
		const dark = r() < 0.5;
		g.addColorStop(0, dark ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha * 0.7})`);
		g.addColorStop(1, 'rgba(0,0,0,0)');
		c.fillStyle = g;
		c.fillRect(0, 0, w, h);
	}
};

const speckle = (c: CanvasRenderingContext2D, w: number, h: number, r: () => number, n: number, alpha: number) => {
	for (let i = 0; i < n; i++) {
		c.fillStyle = r() < 0.5 ? `rgba(0,0,0,${alpha * r()})` : `rgba(255,255,255,${alpha * r()})`;
		c.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
	}
};

export const T = {
	cobble: (rep: [number, number]) =>
		make('cobble', 512, 512, (c, w, h) => {
			const r = rng(11);
			c.fillStyle = '#5c5650';
			c.fillRect(0, 0, w, h);
			const rows = 8;
			for (let y = 0; y < rows; y++) {
				const off = (y % 2) * 32;
				for (let x = -1; x < 9; x++) {
					const bx = x * 64 + off + (r() - 0.5) * 6, by = y * 64 + (r() - 0.5) * 6;
					const base = 120 + r() * 50;
					c.fillStyle = `rgb(${base},${base - 6 + r() * 8},${base - 14})`;
					c.beginPath();
					c.roundRect(bx + 4, by + 4, 56, 56, 16);
					c.fill();
					const g = c.createLinearGradient(bx, by, bx, by + 60);
					g.addColorStop(0, 'rgba(255,255,255,0.18)');
					g.addColorStop(1, 'rgba(0,0,0,0.25)');
					c.fillStyle = g;
					c.fill();
				}
			}
			speckle(c, w, h, r, 3000, 0.25);
		}, rep),
	grass: (rep: [number, number]) =>
		make('grass', 512, 512, (c, w, h) => {
			const r = rng(21);
			c.fillStyle = '#4f8f2f';
			c.fillRect(0, 0, w, h);
			blotches(c, w, h, r, 14, 0.18);
			for (let i = 0; i < 9000; i++) {
				const x = r() * w, y = r() * h, l = 4 + r() * 9;
				const g = 110 + r() * 90;
				c.strokeStyle = `rgba(${40 + r() * 50},${g},${20 + r() * 30},0.8)`;
				c.lineWidth = 1.2;
				c.beginPath();
				c.moveTo(x, y);
				c.lineTo(x + (r() - 0.5) * 4, y - l);
				c.stroke();
			}
		}, rep),
	brick: (rep: [number, number], col = '#9c4a33') =>
		make('brick' + col, 512, 512, (c, w, h) => {
			const r = rng(31);
			c.fillStyle = '#c9bfae';
			c.fillRect(0, 0, w, h);
			for (let y = 0; y < 16; y++)
				for (let x = -1; x < 9; x++) {
					const off = (y % 2) * 32;
					c.fillStyle = shade(col, 0.8 + r() * 0.4);
					c.fillRect(x * 64 + off + 2, y * 32 + 2, 60, 28);
				}
			speckle(c, w, h, r, 4000, 0.3);
			blotches(c, w, h, r, 6, 0.12);
		}, rep),
	plaster: (rep: [number, number], col: string) =>
		make('plaster' + col, 256, 256, (c, w, h) => {
			const r = rng(41);
			c.fillStyle = col;
			c.fillRect(0, 0, w, h);
			blotches(c, w, h, r, 10, 0.08);
			speckle(c, w, h, r, 2500, 0.18);
		}, rep),
	siding: (rep: [number, number], col: string) =>
		make('siding' + col, 256, 256, (c, w, h) => {
			const r = rng(43);
			c.fillStyle = col;
			c.fillRect(0, 0, w, h);
			for (let y = 0; y < 8; y++) {
				const g = c.createLinearGradient(0, y * 32, 0, y * 32 + 32);
				g.addColorStop(0, 'rgba(255,255,255,0.12)');
				g.addColorStop(0.85, 'rgba(0,0,0,0.05)');
				g.addColorStop(1, 'rgba(0,0,0,0.35)');
				c.fillStyle = g;
				c.fillRect(0, y * 32, w, 32);
			}
			speckle(c, w, h, r, 1500, 0.15);
		}, rep),
	wood: (rep: [number, number], col = '#8a5a34') =>
		make('wood' + col, 512, 512, (c, w, h) => {
			const r = rng(51);
			const planks = 6;
			for (let i = 0; i < planks; i++) {
				c.fillStyle = shade(col, 0.85 + r() * 0.3);
				c.fillRect(i * (w / planks), 0, w / planks, h);
				for (let k = 0; k < 40; k++) {
					c.strokeStyle = `rgba(40,20,5,${0.08 + r() * 0.12})`;
					c.lineWidth = 1 + r() * 2;
					const x = i * (w / planks) + r() * (w / planks);
					c.beginPath();
					c.moveTo(x, 0);
					c.bezierCurveTo(x + (r() - 0.5) * 20, h * 0.3, x + (r() - 0.5) * 20, h * 0.7, x, h);
					c.stroke();
				}
				c.fillStyle = 'rgba(0,0,0,0.45)';
				c.fillRect(i * (w / planks), 0, 3, h);
			}
		}, rep),
	wallpaper: (rep: [number, number], bg: string, fg: string) =>
		make('wp' + bg + fg, 256, 256, (c, w, h) => {
			const r = rng(61);
			c.fillStyle = bg;
			c.fillRect(0, 0, w, h);
			c.strokeStyle = shade(bg, 0.9);
			c.lineWidth = 6;
			for (let x = 0; x < 4; x++) {
				c.beginPath();
				c.moveTo(x * 64 + 32, 0);
				c.lineTo(x * 64 + 32, h);
				c.stroke();
			}
			const flower = (x: number, y: number, s: number) => {
				c.fillStyle = fg;
				for (let p = 0; p < 5; p++) {
					const a = (p / 5) * Math.PI * 2;
					c.beginPath();
					c.arc(x + Math.cos(a) * s, y + Math.sin(a) * s, s * 0.7, 0, Math.PI * 2);
					c.fill();
				}
				c.fillStyle = shade(fg, 0.6);
				c.beginPath();
				c.arc(x, y, s * 0.5, 0, Math.PI * 2);
				c.fill();
				c.fillStyle = '#6f8f5a';
				c.beginPath();
				c.ellipse(x + s * 1.6, y + s * 1.4, s * 0.9, s * 0.4, 0.6, 0, Math.PI * 2);
				c.fill();
			};
			for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) flower(x * 64 + (y % 2) * 32 + 16, y * 64 + 24, 7 + r() * 2);
			speckle(c, w, h, r, 800, 0.1);
		}, rep),
	rock: (rep: [number, number], col = '#7d776e') =>
		make('rock' + col, 512, 512, (c, w, h) => {
			const r = rng(71);
			c.fillStyle = col;
			c.fillRect(0, 0, w, h);
			blotches(c, w, h, r, 26, 0.22);
			for (let i = 0; i < 60; i++) {
				c.strokeStyle = `rgba(30,25,20,${0.2 + r() * 0.3})`;
				c.lineWidth = 1 + r() * 2.5;
				let x = r() * w, y = r() * h;
				c.beginPath();
				c.moveTo(x, y);
				for (let k = 0; k < 5; k++) {
					x += (r() - 0.5) * 60;
					y += (r() - 0.5) * 60;
					c.lineTo(x, y);
				}
				c.stroke();
			}
			speckle(c, w, h, r, 6000, 0.3);
		}, rep),
	dirt: (rep: [number, number]) =>
		make('dirt', 256, 256, (c, w, h) => {
			const r = rng(81);
			c.fillStyle = '#8a6a48';
			c.fillRect(0, 0, w, h);
			blotches(c, w, h, r, 14, 0.2);
			speckle(c, w, h, r, 5000, 0.35);
		}, rep),
	// tecido da roupa: listras tricotadas
	knit: (a: string, b: string, stripe = 3) =>
		make(`knit${a}${b}${stripe}`, 128, 128, (c, w, h) => {
			for (let y = 0; y < 16; y++) {
				c.fillStyle = Math.floor(y / stripe) % 2 ? b : a;
				c.fillRect(0, y * 8, w, 8);
				for (let x = 0; x < 16; x++) {
					c.fillStyle = 'rgba(0,0,0,0.18)';
					c.beginPath();
					c.moveTo(x * 8, y * 8);
					c.lineTo(x * 8 + 4, y * 8 + 8);
					c.lineTo(x * 8 + 8, y * 8);
					c.lineTo(x * 8 + 4, y * 8 + 3);
					c.fill();
				}
			}
		}),
	plaid: (a: string, b: string) =>
		make(`plaid${a}${b}`, 128, 128, (c, w, h) => {
			c.fillStyle = a;
			c.fillRect(0, 0, w, h);
			c.fillStyle = b;
			c.globalAlpha = 0.5;
			for (let i = 0; i < 4; i++) {
				c.fillRect(i * 32 + 8, 0, 12, h);
				c.fillRect(0, i * 32 + 8, w, 12);
			}
			c.globalAlpha = 0.35;
			c.fillStyle = '#ffffff';
			for (let i = 0; i < 4; i++) {
				c.fillRect(i * 32 + 26, 0, 2, h);
				c.fillRect(0, i * 32 + 26, w, 2);
			}
			c.globalAlpha = 1;
		}),
	fabric: (col: string) =>
		make('fab' + col, 128, 128, (c, w, h) => {
			const r = rng(91);
			c.fillStyle = col;
			c.fillRect(0, 0, w, h);
			for (let y = 0; y < h; y += 2) {
				c.fillStyle = `rgba(0,0,0,${0.04 + r() * 0.05})`;
				c.fillRect(0, y, w, 1);
			}
			speckle(c, w, h, r, 600, 0.15);
		}),
	blob: () =>
		make('blob', 128, 128, (c, w, h) => {
			const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
			g.addColorStop(0, 'rgba(0,0,0,0.55)');
			g.addColorStop(0.6, 'rgba(0,0,0,0.25)');
			g.addColorStop(1, 'rgba(0,0,0,0)');
			c.fillStyle = g;
			c.fillRect(0, 0, w, h);
		}),
	glow: (col: string) =>
		make('glow' + col, 128, 128, (c, w, h) => {
			const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
			g.addColorStop(0, col);
			g.addColorStop(0.25, col);
			g.addColorStop(1, 'rgba(0,0,0,0)');
			c.fillStyle = g;
			c.fillRect(0, 0, w, h);
		}),
	ring: () =>
		make('ring', 256, 256, (c, w, h) => {
			const g = c.createRadialGradient(128, 128, 90, 128, 128, 128);
			g.addColorStop(0, 'rgba(255,255,255,0)');
			g.addColorStop(0.6, 'rgba(255,255,255,0.9)');
			g.addColorStop(1, 'rgba(255,255,255,0)');
			c.fillStyle = g;
			c.fillRect(0, 0, w, h);
		}),
	footprint: () =>
		make('foot', 64, 128, (c) => {
			c.fillStyle = 'rgba(40,30,15,0.75)';
			c.beginPath();
			c.ellipse(32, 80, 16, 30, 0, 0, Math.PI * 2);
			c.fill();
			for (let i = 0; i < 4; i++) {
				c.beginPath();
				c.arc(18 + i * 9, 36 - Math.abs(i - 1.5) * 3, 5, 0, Math.PI * 2);
				c.fill();
			}
		}),
	window: (lit: string | null) =>
		make('win' + lit, 128, 160, (c, w, h) => {
			c.fillStyle = '#f2efe6';
			c.fillRect(0, 0, w, h);
			const g = c.createLinearGradient(0, 0, w, h);
			if (lit) {
				g.addColorStop(0, lit);
				g.addColorStop(1, shade(lit, 0.75));
			} else {
				g.addColorStop(0, '#5f7d94');
				g.addColorStop(1, '#22313d');
			}
			c.fillStyle = g;
			c.fillRect(10, 10, w - 20, h - 20);
			c.fillStyle = '#f2efe6';
			c.fillRect(w / 2 - 4, 10, 8, h - 20);
			c.fillRect(10, h / 2 - 4, w - 20, 8);
			if (!lit) {
				c.fillStyle = 'rgba(255,255,255,0.25)';
				c.beginPath();
				c.moveTo(18, 20);
				c.lineTo(40, 20);
				c.lineTo(18, 60);
				c.fill();
			}
		}),
	clock: () =>
		make('clock', 256, 256, (c) => {
			c.fillStyle = '#f4ecd6';
			c.beginPath();
			c.arc(128, 128, 120, 0, Math.PI * 2);
			c.fill();
			c.lineWidth = 10;
			c.strokeStyle = '#2b2b2b';
			c.stroke();
			for (let i = 0; i < 12; i++) {
				const a = (i / 12) * Math.PI * 2;
				c.fillStyle = '#2b2b2b';
				c.fillRect(128 + Math.cos(a) * 100 - 4, 128 + Math.sin(a) * 100 - 4, 8, 8);
			}
		}),
	photo: (q: boolean) =>
		make('photo' + q, 256, 320, (c, w, h) => {
			c.fillStyle = '#6b4424';
			c.fillRect(0, 0, w, h);
			c.fillStyle = '#e9dcc0';
			c.fillRect(22, 22, w - 44, h - 44);
			c.fillStyle = '#c9b48f';
			c.fillRect(34, 34, w - 68, h - 68);
			// avó em bloco
			c.fillStyle = '#d9d2c8';
			c.fillRect(98, 70, 60, 26);
			c.fillStyle = '#f0c9a0';
			c.fillRect(100, 92, 56, 56);
			c.fillStyle = '#7b4b7a';
			c.fillRect(82, 150, 92, 110);
			c.fillStyle = '#1b1b1b';
			c.fillRect(114, 112, 6, 10);
			c.fillRect(136, 112, 6, 10);
			c.beginPath();
			c.arc(128, 130, 10, 0.1 * Math.PI, 0.9 * Math.PI);
			c.lineWidth = 3;
			c.strokeStyle = '#1b1b1b';
			c.stroke();
			if (q) {
				c.font = '900 150px Montserrat';
				c.textAlign = 'center';
				c.textBaseline = 'middle';
				c.lineWidth = 12;
				c.strokeStyle = '#1b1b1b';
				c.strokeText('?', 128, 170);
				c.fillStyle = '#ffffff';
				c.fillText('?', 128, 170);
			}
		}),
};

// Placas e bilhetes — sempre em português, legíveis em 0,5 s.
type SignOpts = {bg?: string; fg?: string; font?: string; border?: string; w?: number; h?: number; tilt?: number; paper?: boolean; size?: number};
export const signTex = (lines: string[], o: SignOpts = {}) => {
	const W = o.w ?? 1024, H = o.h ?? 512;
	return make('sign' + lines.join('|') + JSON.stringify(o), W, H, (c, w, h) => {
		const r = rng(lines.join('').length * 7 + 3);
		if (o.paper) {
			c.fillStyle = o.bg ?? '#f3ecd8';
			c.fillRect(0, 0, w, h);
			c.strokeStyle = 'rgba(70,110,170,0.35)';
			c.lineWidth = 3;
			for (let y = 90; y < h; y += 70) {
				c.beginPath();
				c.moveTo(0, y);
				c.lineTo(w, y);
				c.stroke();
			}
			blotches(c, w, h, r, 8, 0.07);
		} else {
			c.fillStyle = o.bg ?? '#2f5d3a';
			c.fillRect(0, 0, w, h);
			blotches(c, w, h, r, 6, 0.12);
			if (o.border !== 'none') {
				c.strokeStyle = o.border ?? '#f4ecd6';
				c.lineWidth = 18;
				c.strokeRect(24, 24, w - 48, h - 48);
			}
		}
		c.fillStyle = o.fg ?? '#f4ecd6';
		c.textAlign = 'center';
		c.textBaseline = 'middle';
		const size = o.size ?? Math.min(170, (h * 0.75) / lines.length);
		c.font = `${o.font ?? '900'} ${size}px ${o.font?.includes('Caveat') || o.font?.includes('Marker') ? '' : 'Montserrat'}`.trim();
		if (o.font?.includes('Caveat') || o.font?.includes('Marker')) c.font = `${size}px ${o.font}`;
		lines.forEach((ln, i) => {
			const y = h / 2 + (i - (lines.length - 1) / 2) * size * 1.05;
			c.save();
			c.translate(w / 2, y);
			c.rotate((o.tilt ?? 0) * (i % 2 ? -1 : 1));
			c.fillText(ln, 0, 0, w * 0.88);
			c.restore();
		});
	});
};

// Rostos (estilo bloco): olhos ovais pretos + boca, sobrancelhas por expressão.
export type Expr = 'neutral' | 'happy' | 'shock' | 'scared' | 'sad' | 'whisper' | 'blank' | 'determined' | 'sleep' | 'shout' | 'smirk' | 'angry' | 'grin';
export const faceTex = (expr: Expr, beard = false) =>
	make('face' + expr + beard, 256, 256, (c) => {
		c.clearRect(0, 0, 256, 256);
		const ink = '#1a1414';
		c.fillStyle = ink;
		c.strokeStyle = ink;
		c.lineCap = 'round';
		const eye = (x: number, sy = 1, sx = 1) => {
			c.fillStyle = ink;
			c.beginPath();
			c.ellipse(x, 112, 13 * sx, 22 * sy, 0, 0, Math.PI * 2);
			c.fill();
			c.fillStyle = '#ffffff';
			c.beginPath();
			c.arc(x + 4, 104, 5 * Math.min(sx, 1), 0, Math.PI * 2);
			c.fill();
		};
		const brow = (x: number, ang: number, y = 74) => {
			c.lineWidth = 9;
			c.strokeStyle = ink;
			c.beginPath();
			c.moveTo(x - 20, y + ang * 10 * (x < 128 ? 1 : -1));
			c.lineTo(x + 20, y - ang * 10 * (x < 128 ? 1 : -1));
			c.stroke();
		};
		c.lineWidth = 8;
		switch (expr) {
			case 'sleep':
				c.lineWidth = 7;
				c.beginPath();
				c.arc(92, 108, 16, 0.1 * Math.PI, 0.9 * Math.PI);
				c.stroke();
				c.beginPath();
				c.arc(164, 108, 16, 0.1 * Math.PI, 0.9 * Math.PI);
				c.stroke();
				c.beginPath();
				c.arc(128, 168, 12, 0.15 * Math.PI, 0.85 * Math.PI);
				c.stroke();
				break;
			case 'blank':
				eye(92, 0.6, 0.8);
				eye(164, 0.6, 0.8);
				c.beginPath();
				c.moveTo(108, 172);
				c.lineTo(148, 172);
				c.stroke();
				break;
			default: {
				const big = expr === 'shock' || expr === 'scared';
				eye(92, big ? 1.25 : 1, big ? 1.15 : 1);
				eye(164, big ? 1.25 : 1, big ? 1.15 : 1);
				if (expr === 'determined' || expr === 'angry') {
					brow(92, -1);
					brow(164, -1);
				} else if (expr === 'sad' || expr === 'scared') {
					brow(92, 1, 70);
					brow(164, 1, 70);
				} else if (expr === 'shock') {
					brow(92, 0, 58);
					brow(164, 0, 58);
				} else if (expr === 'smirk') {
					brow(164, 0.6, 72);
				}
				c.lineWidth = 8;
				c.beginPath();
				if (expr === 'happy' || expr === 'neutral') {
					c.arc(128, 150, expr === 'happy' ? 38 : 30, 0.18 * Math.PI, 0.82 * Math.PI);
					c.stroke();
				} else if (expr === 'grin') {
					c.fillStyle = ink;
					c.moveTo(86, 160);
					c.quadraticCurveTo(128, 218, 170, 160);
					c.closePath();
					c.fill();
					c.fillStyle = '#ffffff';
					c.fillRect(100, 160, 56, 10);
				} else if (expr === 'shock' || expr === 'shout') {
					c.fillStyle = ink;
					c.ellipse(128, 180, expr === 'shout' ? 26 : 16, expr === 'shout' ? 30 : 22, 0, 0, Math.PI * 2);
					c.fill();
					c.fillStyle = '#c0504a';
					c.beginPath();
					c.ellipse(128, 194, 12, 8, 0, 0, Math.PI * 2);
					c.fill();
				} else if (expr === 'scared' || expr === 'sad') {
					c.arc(128, 196, 26, 1.2 * Math.PI, 1.8 * Math.PI);
					c.stroke();
					if (expr === 'scared') {
						c.fillStyle = '#7fc7ff';
						c.beginPath();
						c.ellipse(196, 80, 7, 11, 0, 0, Math.PI * 2);
						c.fill();
					}
				} else if (expr === 'whisper') {
					c.fillStyle = ink;
					c.ellipse(128, 172, 9, 7, 0, 0, Math.PI * 2);
					c.fill();
				} else if (expr === 'determined' || expr === 'angry') {
					c.moveTo(104, 176);
					c.lineTo(152, 172);
					c.stroke();
				} else if (expr === 'smirk') {
					c.moveTo(102, 172);
					c.quadraticCurveTo(140, 178, 160, 156);
					c.stroke();
				}
			}
		}
		if (beard) {
			c.fillStyle = '#c9c4bc';
			c.beginPath();
			c.moveTo(40, 150);
			c.lineTo(216, 150);
			c.lineTo(200, 256);
			c.lineTo(56, 256);
			c.closePath();
			c.fill();
			c.fillStyle = '#b3ada4';
			c.fillRect(84, 146, 88, 14);
			if (expr === 'shout' || expr === 'shock') {
				c.fillStyle = ink;
				c.beginPath();
				c.ellipse(128, 182, 16, 12, 0, 0, Math.PI * 2);
				c.fill();
			} else {
				c.strokeStyle = '#6d675f';
				c.lineWidth = 6;
				c.beginPath();
				c.moveTo(108, 180);
				c.lineTo(148, 180);
				c.stroke();
			}
		}
	});
