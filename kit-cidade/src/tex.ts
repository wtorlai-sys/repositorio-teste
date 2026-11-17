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
		make('cobble', 1024, 1024, (c, w, h) => {
			const r = rng(11);
			c.fillStyle = '#4e4943';
			c.fillRect(0, 0, w, h);
			const rows = 12, rh = h / rows;
			for (let y = 0; y < rows; y++) {
				let x = -r() * 60;
				while (x < w + 60) {
					const sw = 70 + r() * 50;
					const bx = x + 4, by = y * rh + 4 + (r() - 0.5) * 6, bw = sw - 8, bh = rh - 8;
					const base = 118 + r() * 55, warm = r() * 14;
					c.fillStyle = `rgb(${base + warm},${base + warm * 0.5},${base - 8})`;
					c.beginPath();
					c.roundRect(bx, by, bw, bh, 18 + r() * 10);
					c.fill();
					const g = c.createRadialGradient(bx + bw * 0.4, by + bh * 0.3, 4, bx + bw / 2, by + bh / 2, bw * 0.75);
					g.addColorStop(0, 'rgba(255,255,255,0.22)');
					g.addColorStop(0.6, 'rgba(0,0,0,0)');
					g.addColorStop(1, 'rgba(0,0,0,0.35)');
					c.fillStyle = g;
					c.fill();
					x += sw;
				}
			}
			speckle(c, w, h, r, 9000, 0.22);
			blotches(c, w, h, r, 14, 0.1);
			// musgo nas juntas
			for (let i = 0; i < 400; i++) {
				c.fillStyle = `rgba(70,95,45,${0.15 + r() * 0.2})`;
				c.fillRect(r() * w, Math.floor(r() * rows) * rh + (r() < 0.5 ? 0 : rh - 4), 6 + r() * 10, 4);
			}
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
	// assoalho: tábuas de comprimento variado, emendas desencontradas, veio e brilho leve
	floor: (rep: [number, number], col = '#9a6a40') =>
		make('floor' + col, 1024, 1024, (c, w, h) => {
			const r = rng(57);
			const rows = 8, rh = h / rows;
			for (let y = 0; y < rows; y++) {
				let x = -r() * 300;
				while (x < w) {
					const len = 260 + r() * 380;
					const tone = 0.78 + r() * 0.36;
					c.fillStyle = shade(col, tone);
					c.fillRect(x, y * rh, len, rh);
					for (let k = 0; k < 14; k++) {
						c.strokeStyle = `rgba(50,25,8,${0.06 + r() * 0.1})`;
						c.lineWidth = 1 + r() * 2;
						const yy = y * rh + 6 + r() * (rh - 12);
						c.beginPath();
						c.moveTo(x, yy);
						c.bezierCurveTo(x + len * 0.3, yy + (r() - 0.5) * 10, x + len * 0.7, yy + (r() - 0.5) * 10, x + len, yy + (r() - 0.5) * 6);
						c.stroke();
					}
					if (r() < 0.35) {
						c.fillStyle = 'rgba(60,30,10,0.35)';
						c.beginPath();
						c.ellipse(x + r() * len, y * rh + rh / 2, 6 + r() * 6, 3 + r() * 3, 0, 0, Math.PI * 2);
						c.fill();
					}
					const g = c.createLinearGradient(0, y * rh, 0, y * rh + rh);
					g.addColorStop(0, 'rgba(255,255,255,0.10)');
					g.addColorStop(0.5, 'rgba(255,255,255,0)');
					g.addColorStop(1, 'rgba(0,0,0,0.12)');
					c.fillStyle = g;
					c.fillRect(x, y * rh, len, rh);
					c.fillStyle = 'rgba(25,12,4,0.65)';
					c.fillRect(x, y * rh, 3, rh);
					x += len;
				}
				c.fillStyle = 'rgba(25,12,4,0.7)';
				c.fillRect(0, y * rh, w, 3);
			}
			blotches(c, w, h, r, 10, 0.06);
		}, rep),
	// parede de quarto: papel de parede em cima, lambri pintado embaixo, rodameio e rodapé — repetir só em X
	wallPanel: (repX: number, bg: string, fg: string, panel = '#efe8dc') =>
		make('wpanel' + bg + fg + panel, 512, 1024, (c, w, h) => {
			const r = rng(63);
			const split = h * 0.64;
			c.fillStyle = bg;
			c.fillRect(0, 0, w, split);
			// listras discretas + flores
			for (let x = 0; x < w; x += 64) {
				c.fillStyle = shade(bg, 0.94);
				c.fillRect(x + 26, 0, 12, split);
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
				c.arc(x, y, s * 0.45, 0, Math.PI * 2);
				c.fill();
				c.fillStyle = '#7d9a66';
				c.beginPath();
				c.ellipse(x + s * 1.5, y + s * 1.3, s * 0.8, s * 0.35, 0.6, 0, Math.PI * 2);
				c.fill();
			};
			for (let y = 0; y < 5; y++) for (let x = 0; x < 3; x++) flower(x * 170 + (y % 2) * 85 + 42, y * 128 + 64, 15 + r() * 3);
			blotches(c, w, split, r, 6, 0.05);
			// sanca no topo
			c.fillStyle = panel;
			c.fillRect(0, 0, w, 22);
			c.fillStyle = 'rgba(0,0,0,0.18)';
			c.fillRect(0, 22, w, 5);
			// rodameio
			c.fillStyle = shade(panel, 0.92);
			c.fillRect(0, split - 6, w, 26);
			c.fillStyle = 'rgba(255,255,255,0.35)';
			c.fillRect(0, split - 6, w, 5);
			c.fillStyle = 'rgba(0,0,0,0.25)';
			c.fillRect(0, split + 18, w, 5);
			// lambri com almofadas
			c.fillStyle = panel;
			c.fillRect(0, split + 20, w, h - split - 20);
			for (let x = 0; x < w; x += 128) {
				c.strokeStyle = 'rgba(0,0,0,0.16)';
				c.lineWidth = 6;
				c.strokeRect(x + 18, split + 50, 92, h - split - 130);
				c.strokeStyle = 'rgba(255,255,255,0.45)';
				c.lineWidth = 3;
				c.strokeRect(x + 22, split + 54, 92, h - split - 130);
			}
			// rodapé
			c.fillStyle = shade(panel, 0.85);
			c.fillRect(0, h - 56, w, 56);
			c.fillStyle = 'rgba(0,0,0,0.3)';
			c.fillRect(0, h - 56, w, 4);
			speckle(c, w, h, r, 2500, 0.08);
		}, [repX, 1]),
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
	clock: (hh = 10, mm = 8) =>
		make('clock' + hh + ':' + mm, 512, 512, (c) => {
			const cx = 256;
			c.fillStyle = '#3a2a1c';
			c.beginPath();
			c.arc(cx, cx, 250, 0, Math.PI * 2);
			c.fill();
			const g = c.createRadialGradient(cx, cx - 40, 20, cx, cx, 230);
			g.addColorStop(0, '#fbf5e4');
			g.addColorStop(1, '#e2d6b8');
			c.fillStyle = g;
			c.beginPath();
			c.arc(cx, cx, 226, 0, Math.PI * 2);
			c.fill();
			const R = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
			c.fillStyle = '#1e1e1e';
			c.textAlign = 'center';
			c.textBaseline = 'middle';
			c.font = '700 40px serif';
			for (let i = 0; i < 12; i++) {
				const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
				c.fillText(R[i], cx + Math.cos(a) * 180, cx + Math.sin(a) * 180);
				c.fillRect(cx + Math.cos(a) * 214 - 3, cx + Math.sin(a) * 214 - 3, 6, 6);
			}
			const hand = (ang: number, len: number, wd: number) => {
				c.save();
				c.translate(cx, cx);
				c.rotate(ang);
				c.fillStyle = '#141414';
				c.beginPath();
				c.moveTo(-wd, 20);
				c.lineTo(-wd * 0.4, -len);
				c.lineTo(0, -len - 14);
				c.lineTo(wd * 0.4, -len);
				c.lineTo(wd, 20);
				c.closePath();
				c.fill();
				c.restore();
			};
			hand(((hh % 12) + mm / 60) / 12 * Math.PI * 2, 110, 12);
			hand((mm / 60) * Math.PI * 2, 165, 8);
			c.fillStyle = '#141414';
			c.beginPath();
			c.arc(cx, cx, 14, 0, Math.PI * 2);
			c.fill();
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
export const faceTex = (expr: Expr, beard = false, iris = false) =>
	make('face' + expr + beard + iris, 256, 256, (c) => {
		c.clearRect(0, 0, 256, 256);
		const ink = '#1a1414';
		c.fillStyle = ink;
		c.strokeStyle = ink;
		c.lineCap = 'round';
		const eye = (x: number, sy = 1, sx = 1) => {
			if (iris) {
				// olho moderno: branco amendoado, íris castanha, pupila, brilho
				c.fillStyle = '#ffffff';
				c.beginPath();
				c.ellipse(x, 114, 19 * sx, 14 * sy, 0, 0, Math.PI * 2);
				c.fill();
				c.lineWidth = 3;
				c.strokeStyle = ink;
				c.stroke();
				c.fillStyle = '#6b3a1c';
				c.beginPath();
				c.arc(x + 1, 115, 11 * Math.min(sy, 1.1), 0, Math.PI * 2);
				c.fill();
				c.fillStyle = ink;
				c.beginPath();
				c.arc(x + 1, 115, 5, 0, Math.PI * 2);
				c.fill();
				c.fillStyle = '#ffffff';
				c.beginPath();
				c.arc(x + 5, 110, 3.5, 0, Math.PI * 2);
				c.fill();
				c.lineWidth = 5;
				c.beginPath();
				c.moveTo(x - 20 * sx, 104 - 4 * sy);
				c.quadraticCurveTo(x, 96 - 8 * sy, x + 20 * sx, 104 - 4 * sy);
				c.stroke();
				return;
			}
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
			c.lineWidth = iris ? 12 : 9;
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
					if (iris) brow(92, 0, 76);
				} else if (iris) {
					brow(92, 0.15, 76);
					brow(164, 0.15, 76);
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

// Rosto do MAX (fiel ao conceito do Customuse): olhos amendoados com íris castanha, sobrancelhas grossas
// castanho-escuras, sorriso de canto. Uma textura por expressão.
export const faceMaxTex = (expr: Expr) =>
	make('faceMax' + expr, 512, 512, (c) => {
		c.clearRect(0, 0, 512, 512);
		const ink = '#2a1810', brow = '#2e1a0e';
		const E: Record<string, {open: number; browA: number; browY: number; look?: number}> = {
			neutral: {open: 1, browA: 0.05, browY: 0},
			happy: {open: 0.85, browA: 0.1, browY: -4},
			grin: {open: 0.75, browA: 0.1, browY: -6},
			shock: {open: 1.35, browA: 0, browY: -26},
			scared: {open: 1.25, browA: -0.35, browY: -14},
			sad: {open: 0.85, browA: -0.35, browY: -6},
			whisper: {open: 0.8, browA: 0.05, browY: 2},
			blank: {open: 0.55, browA: 0, browY: 6},
			determined: {open: 0.85, browA: 0.4, browY: 10},
			angry: {open: 0.8, browA: 0.5, browY: 12},
			shout: {open: 1.15, browA: 0.3, browY: -4},
			smirk: {open: 0.95, browA: 0.15, browY: -2},
			sleep: {open: 0, browA: 0, browY: 6},
		};
		const e = E[expr] ?? E.neutral;
		c.translate(256, 250);
		c.scale(1.42, 1.42);
		c.translate(-256, -262);
		const ey = 262;
		const eye = (x: number, side: number) => {
			const w = 44, h = 30 * e.open;
			if (e.open < 0.05) {
				c.strokeStyle = ink;
				c.lineWidth = 9;
				c.lineCap = 'round';
				c.beginPath();
				c.arc(x, ey - 4, 34, 0.15 * Math.PI, 0.85 * Math.PI);
				c.stroke();
				return;
			}
			c.save();
			c.beginPath();
			c.moveTo(x - w, ey + 4);
			c.bezierCurveTo(x - w * 0.6, ey - h * 1.25, x + w * 0.6, ey - h * 1.25, x + w, ey - 2);
			c.bezierCurveTo(x + w * 0.6, ey + h * 0.95, x - w * 0.6, ey + h * 0.95, x - w, ey + 4);
			c.closePath();
			c.fillStyle = '#fbf8f2';
			c.fill();
			c.clip();
			const g = c.createRadialGradient(x + 2, ey + 2, 4, x + 2, ey + 2, 30);
			g.addColorStop(0, '#9a5a2a');
			g.addColorStop(0.7, '#6e3a18');
			g.addColorStop(1, '#3e200c');
			c.fillStyle = g;
			c.beginPath();
			c.arc(x + 2, ey + 3, 29, 0, Math.PI * 2);
			c.fill();
			c.fillStyle = '#1a0e08';
			c.beginPath();
			c.arc(x + 2, ey + 3, 12, 0, Math.PI * 2);
			c.fill();
			c.fillStyle = '#ffffff';
			c.beginPath();
			c.arc(x + 12, ey - 8, 8, 0, Math.PI * 2);
			c.fill();
			c.beginPath();
			c.arc(x - 8, ey + 14, 3.5, 0, Math.PI * 2);
			c.fill();
			c.restore();
			// pálpebra superior grossa
			c.strokeStyle = ink;
			c.lineWidth = 9;
			c.lineCap = 'round';
			c.beginPath();
			c.moveTo(x - w - 4, ey + 6);
			c.bezierCurveTo(x - w * 0.6, ey - h * 1.3, x + w * 0.6, ey - h * 1.3, x + w + 4, ey - 4);
			c.stroke();
			c.lineWidth = 3;
			c.beginPath();
			c.moveTo(x - w * 0.7, ey + h * 0.75);
			c.quadraticCurveTo(x, ey + h * 1.0, x + w * 0.7, ey + h * 0.7);
			c.stroke();
			void side;
		};
		eye(172, -1);
		eye(340, 1);
		// sobrancelhas
		const browAt = (x: number, side: number) => {
			c.save();
			c.translate(x, 196 + e.browY);
			c.rotate(e.browA * side);
			c.scale(1.08, 1.7);
			c.fillStyle = brow;
			c.beginPath();
			c.moveTo(-48, 6);
			c.quadraticCurveTo(-10, -18, 50, -6);
			c.lineTo(52, 8);
			c.quadraticCurveTo(-8, -2, -46, 18);
			c.closePath();
			c.fill();
			c.restore();
		};
		browAt(172, 1);
		browAt(340, -1);
		// boca
		c.strokeStyle = ink;
		c.fillStyle = ink;
		c.lineCap = 'round';
		c.lineWidth = 7;
		const my = 372;
		c.beginPath();
		switch (expr) {
			case 'happy':
			case 'grin':
				c.moveTo(212, my - 6);
				c.quadraticCurveTo(256, my + (expr === 'grin' ? 48 : 30), 304, my - 10);
				if (expr === 'grin') {
					c.closePath();
					c.fill();
					c.fillStyle = '#ffffff';
					c.fillRect(226, my - 4, 62, 12);
				} else c.stroke();
				break;
			case 'shock':
			case 'shout':
				c.ellipse(256, my + 8, expr === 'shout' ? 34 : 20, expr === 'shout' ? 36 : 26, 0, 0, Math.PI * 2);
				c.fill();
				c.fillStyle = '#c0504a';
				c.beginPath();
				c.ellipse(256, my + 24, 14, 8, 0, 0, Math.PI * 2);
				c.fill();
				break;
			case 'scared':
			case 'sad':
				c.moveTo(220, my + 14);
				c.quadraticCurveTo(256, my - 14, 292, my + 14);
				c.stroke();
				if (expr === 'scared') {
					c.fillStyle = '#8fd0ff';
					c.beginPath();
					c.ellipse(420, 200, 10, 16, 0, 0, Math.PI * 2);
					c.fill();
				}
				break;
			case 'whisper':
				c.ellipse(256, my + 4, 12, 9, 0, 0, Math.PI * 2);
				c.fill();
				break;
			case 'blank':
			case 'determined':
			case 'angry':
				c.moveTo(228, my + 4);
				c.lineTo(286, my);
				c.stroke();
				break;
			case 'sleep':
				c.moveTo(236, my);
				c.quadraticCurveTo(256, my + 12, 276, my);
				c.stroke();
				break;
			default:
				// sorriso de canto (como no conceito)
				c.moveTo(220, my);
				c.quadraticCurveTo(262, my + 22, 298, my - 8);
				c.stroke();
				c.lineWidth = 3;
				c.beginPath();
				c.moveTo(232, my + 30);
				c.quadraticCurveTo(256, my + 36, 278, my + 28);
				c.stroke();
		}
		// nariz sutil
		c.strokeStyle = 'rgba(150,90,60,0.45)';
		c.lineWidth = 4;
		c.beginPath();
		c.moveTo(252, 322);
		c.quadraticCurveTo(262, 330, 254, 336);
		c.stroke();
	});

// tecido liso do moletom: cor chapada com leve variação (sem listras)
export const softFabric = (col: string, seed = 3) =>
	make('soft' + col + seed, 256, 256, (c, w, h) => {
		const r = rng(seed);
		c.fillStyle = col;
		c.fillRect(0, 0, w, h);
		blotches(c, w, h, r, 10, 0.05);
		for (let i = 0; i < 2500; i++) {
			c.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},${0.03 * r()})`;
			c.fillRect(r() * w, r() * h, 1, 1);
		}
	});
