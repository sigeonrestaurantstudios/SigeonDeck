/* Sigeon Deck runtime — rendering, builds, transitions and the player.
   Everything lives inside one factory function so an exported deck can embed
   it verbatim (SDRuntimeFactory.toString()) and play without the editor. */
function SDRuntimeFactory() {
  'use strict';
  const W = 1920, H = 1080;
  const uid = () => Math.random().toString(36).slice(2, 10);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const EASE = {
    out: 'cubic-bezier(.16,1,.3,1)', inout: 'cubic-bezier(.65,0,.35,1)',
    spring: 'cubic-bezier(.34,1.56,.64,1)', in: 'cubic-bezier(.55,0,1,.45)'
  };

  /* ---------- Fonts ---------- */
  const FONTS = {
    'Onest': 'Onest:wght@100..900', 'Inter': 'Inter:wght@100..900', 'Unbounded': 'Unbounded:wght@200..900',
    'Fraunces': 'Fraunces:ital,wght@0,100..900;1,100..900', 'Playfair Display': 'Playfair Display:ital,wght@0,400..900;1,400..900',
    'DM Serif Display': 'DM Serif Display:ital@0;1', 'Instrument Serif': 'Instrument Serif:ital@0;1',
    'Cormorant Garamond': 'Cormorant Garamond:ital,wght@0,300..700;1,300..700', 'Lora': 'Lora:ital,wght@0,400..700;1,400..700',
    'Libre Baskerville': 'Libre Baskerville:ital,wght@0,400;0,700;1,400', 'Space Grotesk': 'Space Grotesk:wght@300..700',
    'Syne': 'Syne:wght@400..800', 'Bricolage Grotesque': 'Bricolage Grotesque:wght@200..800', 'Manrope': 'Manrope:wght@200..800',
    'Sora': 'Sora:wght@100..800', 'Outfit': 'Outfit:wght@100..900', 'Archivo': 'Archivo:wght@100..900',
    'Archivo Black': 'Archivo Black', 'Anton': 'Anton', 'Bebas Neue': 'Bebas Neue', 'Montserrat': 'Montserrat:wght@100..900',
    'Poppins': 'Poppins:wght@300;400;600;700;800', 'Rubik': 'Rubik:wght@300..900', 'Barlow Condensed': 'Barlow Condensed:wght@400;600;800',
    'IBM Plex Sans': 'IBM Plex Sans:wght@300;400;600;700', 'JetBrains Mono': 'JetBrains Mono:wght@100..800',
    'Caveat': 'Caveat:wght@400..700', 'Righteous': 'Righteous', 'Major Mono Display': 'Major Mono Display'
  };
  const FONT_NAMES = Object.keys(FONTS);
  function loadFont(name, doc) {
    doc = doc || document;
    const spec = FONTS[name]; if (!spec) return;
    const id = 'sdf-' + name.replace(/\s+/g, '-');
    if (doc.getElementById(id)) return;
    const l = doc.createElement('link');
    l.id = id; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + spec.replace(/ /g, '+') + '&display=swap';
    doc.head.appendChild(l);
  }
  function fontsOf(deck) {
    const set = new Set();
    (deck.slides || []).forEach(s => (s.els || []).forEach(e => {
      if (e.font) set.add(e.font);
      if (e.type === 'code') set.add('JetBrains Mono');
    }));
    return [...set];
  }
  const fontStack = f => f ? `'${f}', system-ui, sans-serif` : 'system-ui, sans-serif';

  /* ---------- Icons (24px stroke) ---------- */
  const C = 'a10 10 0 1 0 0 20a10 10 0 1 0 0-20';
  const ICONS = {
    check: 'M20 6 9 17l-5-5', x: 'M18 6 6 18M6 6l12 12', plus: 'M12 5v14M5 12h14',
    'arrow-right': 'M5 12h14M13 5l7 7-7 7', 'arrow-up-right': 'M7 17 17 7M8 7h9v9',
    star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
    heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z',
    bolt: 'M13 2 3 14h9l-1 8 10-12h-9z', globe: 'M12 2' + C + 'M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20',
    user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8',
    users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
    chart: 'M3 3v18h18M7 15v3M12 10v8M17 6v12', trend: 'M22 7 13.5 15.5 8.5 10.5 2 17M16 7h6v6',
    target: 'M12 2' + C + 'M12 6a6 6 0 1 0 0 12a6 6 0 1 0 0-12M12 10a2 2 0 1 0 0 4a2 2 0 1 0 0-4',
    clock: 'M12 2' + C + 'M12 6v6l4 2', mail: 'M2 5h20v14H2zM2 5l10 8 10-8',
    lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4', bulb: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z',
    rocket: 'M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1zM12 15l-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2zM9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', home: 'M3 10l9-7 9 7v11H3zM9 21v-7h6v7',
    cloud: 'M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9z', code: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
    play: 'M6 3l14 9-14 9z', camera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 9a4 4 0 1 0 0 8a4 4 0 1 0 0-8',
    flag: 'M4 22V4M4 4h13l-2 4 2 4H4', pin: 'M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13zM12 6a3 3 0 1 0 0 6a3 3 0 1 0 0-6',
    search: 'M11 3a8 8 0 1 0 0 16a8 8 0 1 0 0-16M21 21l-4.3-4.3', layers: 'M12 2 2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    dollar: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    cpu: 'M5 5h14v14H5zM9 9h6v6H9zM9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4',
    leaf: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10zM2 21c0-3 1.9-5.4 5.1-6',
    smile: 'M12 2' + C + 'M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01',
    music: 'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0a3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0a3 3 0 0 1 6 0z',
    quote: 'M3 21c3 0 7-1 7-8V5H3v7h4c0 4-2 6-4 6zM14 21c3 0 7-1 7-8V5h-7v7h4c0 4-2 6-4 6z',
    sun: 'M12 7a5 5 0 1 0 0 10a5 5 0 1 0 0-10M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
    moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z', calendar: 'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18',
    briefcase: 'M2 7h20v14H2zM16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16', gift: 'M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z',
    book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5',
    compass: 'M12 2' + C + 'M16.2 7.8l-2.1 6.3-6.3 2.1 2.1-6.3z', award: 'M12 2a7 7 0 1 0 0 14a7 7 0 1 0 0-14M8.2 13.9 7 23l5-3 5 3-1.2-9.1',
    zap: 'M13 2 3 14h9l-1 8 10-12h-9z', wifi: 'M5 12.6a10 10 0 0 1 14 0M1.4 9a15 15 0 0 1 21.2 0M8.5 16.1a5 5 0 0 1 7 0M12 20h.01',
    phone: 'M7 2h10v20H7zM11 18h2', truck: 'M1 3h15v13H1zM16 8h4l3 3v5h-7zM5.5 16a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5M18.5 16a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5',
    coffee: 'M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4zM6 1v3M10 1v3M14 1v3',
    puzzle: 'M4 7h3a2 2 0 1 1 4 0h3v3a2 2 0 1 1 0 4v3h-3a2 2 0 1 0-4 0H4v-3a2 2 0 1 0 0-4z',
    sparkle: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z', eye: 'M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zM12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6',
    key: 'M15 7a4 4 0 1 0 0.01 0M12 10 3 19v2h3v-2h2v-2h2l2.2-2.2', link: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7'
  };

  /* ---------- Shapes ---------- */
  const SHAPES = [['rect', 'Rectangle'], ['ellipse', 'Ellipse'], ['triangle', 'Triangle'], ['rtriangle', 'Right triangle'], ['diamond', 'Diamond'],
    ['pentagon', 'Pentagon'], ['hexagon', 'Hexagon'], ['octagon', 'Octagon'], ['star', 'Star'], ['star4', 'Sparkle'], ['burst', 'Burst'],
    ['arrow', 'Arrow'], ['chevron', 'Chevron'], ['parallelogram', 'Parallelogram'], ['trapezoid', 'Trapezoid'], ['plus', 'Plus'],
    ['heart', 'Heart'], ['bubble', 'Speech bubble'], ['ring', 'Ring'], ['arch', 'Arch'], ['blob', 'Blob'], ['halfcircle', 'Half circle']];
  const f1 = n => (Math.round(n * 10) / 10);
  function shapePath(k, w, h, r) {
    const P = pts => 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
    const poly = (n, rot) => { const pts = []; for (let i = 0; i < n; i++) { const a = (rot + 360 * i / n) * Math.PI / 180; pts.push([w / 2 + w / 2 * Math.cos(a), h / 2 + h / 2 * Math.sin(a)]); } return P(pts); };
    const star = (n, k2) => { const pts = []; for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n; const q = i % 2 ? k2 : 1; pts.push([w / 2 + Math.cos(a) * w / 2 * q, h / 2 + Math.sin(a) * h / 2 * q]); } return P(pts); };
    const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)} ${f1(cy)}A${f1(rx)} ${f1(ry)} 0 1 0 ${f1(cx + rx)} ${f1(cy)}A${f1(rx)} ${f1(ry)} 0 1 0 ${f1(cx - rx)} ${f1(cy)}Z`;
    switch (k) {
      case 'ellipse': return ell(w / 2, h / 2, w / 2, h / 2);
      case 'triangle': return P([[w / 2, 0], [w, h], [0, h]]);
      case 'rtriangle': return P([[0, 0], [w, h], [0, h]]);
      case 'diamond': return P([[w / 2, 0], [w, h / 2], [w / 2, h], [0, h / 2]]);
      case 'pentagon': return poly(5, -90);
      case 'hexagon': return poly(6, 0);
      case 'octagon': return poly(8, 22.5);
      case 'star': return star(5, .45);
      case 'star4': return star(4, .32);
      case 'burst': return star(14, .78);
      case 'arrow': return P([[0, h * .3], [w * .6, h * .3], [w * .6, 0], [w, h / 2], [w * .6, h], [w * .6, h * .7], [0, h * .7]]);
      case 'chevron': return P([[0, 0], [w * .7, 0], [w, h / 2], [w * .7, h], [0, h], [w * .3, h / 2]]);
      case 'parallelogram': return P([[w * .25, 0], [w, 0], [w * .75, h], [0, h]]);
      case 'trapezoid': return P([[w * .2, 0], [w * .8, 0], [w, h], [0, h]]);
      case 'plus': { const a = w * .34, b = h * .34; return P([[a, 0], [w - a, 0], [w - a, b], [w, b], [w, h - b], [w - a, h - b], [w - a, h], [a, h], [a, h - b], [0, h - b], [0, b], [a, b]]); }
      case 'heart': return `M${f1(w / 2)} ${f1(h * .96)}C${f1(w * .05)} ${f1(h * .62)} ${f1(-w * .04)} ${f1(h * .22)} ${f1(w * .24)} ${f1(h * .08)}C${f1(w * .38)} ${f1(h * .01)} ${f1(w * .48)} ${f1(h * .1)} ${f1(w / 2)} ${f1(h * .22)}C${f1(w * .52)} ${f1(h * .1)} ${f1(w * .62)} ${f1(h * .01)} ${f1(w * .76)} ${f1(h * .08)}C${f1(w * 1.04)} ${f1(h * .22)} ${f1(w * .95)} ${f1(h * .62)} ${f1(w / 2)} ${f1(h * .96)}Z`;
      case 'bubble': { const hb = h * .8, q = Math.min(r || 24, w / 2, hb / 2); return `M${q} 0H${f1(w - q)}Q${w} 0 ${w} ${q}V${f1(hb - q)}Q${w} ${f1(hb)} ${f1(w - q)} ${f1(hb)}H${f1(w * .36)}L${f1(w * .18)} ${h}L${f1(w * .22)} ${f1(hb)}H${q}Q0 ${f1(hb)} 0 ${f1(hb - q)}V${q}Q0 0 ${q} 0Z`; }
      case 'ring': return ell(w / 2, h / 2, w / 2, h / 2) + ell(w / 2, h / 2, w * .3, h * .3);
      case 'arch': { const ry = Math.min(h * .5, w / 2); return `M0 ${h}V${f1(ry)}A${f1(w / 2)} ${f1(ry)} 0 0 1 ${w} ${f1(ry)}V${h}Z`; }
      case 'halfcircle': return `M0 ${h}A${f1(w / 2)} ${h} 0 0 1 ${w} ${h}Z`;
      case 'blob': {
        const rs = [1, .84, .97, .8, .95, .87, 1, .82], n = rs.length;
        const pts = rs.map((q, i) => { const a = i / n * 2 * Math.PI; return [w / 2 + Math.cos(a) * w / 2 * q, h / 2 + Math.sin(a) * h / 2 * q]; });
        let d = '';
        for (let i = 0; i < n; i++) {
          const p = pts[i], q = pts[(i + 1) % n];
          if (i === 0) { const pm = pts[n - 1]; d += `M${f1((pm[0] + p[0]) / 2)} ${f1((pm[1] + p[1]) / 2)}`; }
          d += `Q${f1(p[0])} ${f1(p[1])} ${f1((p[0] + q[0]) / 2)} ${f1((p[1] + q[1]) / 2)}`;
        }
        return d + 'Z';
      }
      default: { // rect
        const q = Math.max(0, Math.min(r || 0, w / 2, h / 2));
        if (!q) return `M0 0H${f1(w)}V${f1(h)}H0Z`;
        return `M${q} 0H${f1(w - q)}A${q} ${q} 0 0 1 ${f1(w)} ${q}V${f1(h - q)}A${q} ${q} 0 0 1 ${f1(w - q)} ${f1(h)}H${q}A${q} ${q} 0 0 1 0 ${f1(h - q)}V${q}A${q} ${q} 0 0 1 ${q} 0Z`;
      }
    }
  }

  /* ---------- Charts ---------- */
  function niceMax(v) { if (v <= 0) return 1; const e = Math.pow(10, Math.floor(Math.log10(v))); const f = v / e; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * e; }
  function fmtNum(v) { const a = Math.abs(v); if (a >= 1e6) return +(v / 1e6).toFixed(1) + 'M'; if (a >= 1e4) return +(v / 1e3).toFixed(1) + 'k'; return String(+(+v).toFixed(2)); }
  const CHART_KINDS = [['bar', 'Columns'], ['hbar', 'Bars'], ['line', 'Line'], ['area', 'Area'], ['pie', 'Pie'], ['donut', 'Donut']];
  function chartSVG(el) {
    const c = el.chart || {}, w = el.w, h = el.h;
    const fs = c.fs || Math.max(16, Math.round(Math.min(w, h) / 24));
    const col = c.text || '#ffffff', grid = c.grid || 'rgba(255,255,255,.14)';
    const colors = c.colors && c.colors.length ? c.colors : ['#2E6BFF', '#9CC0FF', '#FF8A5B', '#3DDC97', '#C77DFF'];
    const series = (c.series || []).filter(s => s && s.values);
    const labels = c.labels || [];
    const pre = c.prefix || '', suf = c.suffix || '';
    const kind = c.kind || 'bar';
    let s = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" font-family="${esc(fontStack(el.font))}" font-size="${fs}" fill="${esc(col)}">`;
    if (kind === 'pie' || kind === 'donut') {
      const vals = (series[0] && series[0].values || []).map(v => Math.max(0, +v || 0));
      const total = vals.reduce((a, b) => a + b, 0) || 1;
      const showLeg = c.legend !== false;
      const cx = showLeg ? Math.min(w * .38, h / 2 + 10) : w / 2, cy = h / 2;
      const r = Math.max(10, Math.min(h / 2 - 8, cx - 8)), ir = kind === 'donut' ? r * .58 : 0;
      let a0 = -Math.PI / 2;
      vals.forEach((v, i) => {
        const a1 = a0 + v / total * Math.PI * 2, big = a1 - a0 > Math.PI ? 1 : 0, color = colors[i % colors.length];
        const p = (rad, a) => [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad].map(f1).join(' ');
        if (v / total >= .9999) {
          s += `<circle cx="${cx}" cy="${cy}" r="${f1((r + ir) / 2)}" fill="none" stroke="${esc(color)}" stroke-width="${f1(r - ir || r * 2)}"/>`;
        } else if (ir) s += `<path d="M${p(r, a0)}A${r} ${r} 0 ${big} 1 ${p(r, a1)}L${p(ir, a1)}A${ir} ${ir} 0 ${big} 0 ${p(ir, a0)}Z" fill="${esc(color)}"/>`;
        else s += `<path d="M${cx} ${cy}L${p(r, a0)}A${r} ${r} 0 ${big} 1 ${p(r, a1)}Z" fill="${esc(color)}"/>`;
        if (v / total > .05 && c.values !== false) {
          const am = (a0 + a1) / 2, lr = ir ? (r + ir) / 2 : r * .64;
          s += `<text x="${f1(cx + Math.cos(am) * lr)}" y="${f1(cy + Math.sin(am) * lr)}" text-anchor="middle" dominant-baseline="central" fill="#fff" font-weight="700" font-size="${f1(fs * .95)}">${Math.round(v / total * 100)}%</text>`;
        }
        a0 = a1;
      });
      if (showLeg) {
        const lx = cx + r + fs * 2, lh = fs * 1.9, ly = cy - (vals.length * lh) / 2 + lh / 2;
        vals.forEach((v, i) => {
          s += `<rect x="${f1(lx)}" y="${f1(ly + i * lh - fs * .45)}" width="${f1(fs * .9)}" height="${f1(fs * .9)}" rx="${f1(fs * .2)}" fill="${esc(colors[i % colors.length])}"/>`;
          s += `<text x="${f1(lx + fs * 1.5)}" y="${f1(ly + i * lh)}" dominant-baseline="central">${esc(labels[i] || '')}<tspan opacity=".6" dx="${f1(fs * .6)}">${esc(pre + fmtNum(v) + suf)}</tspan></text>`;
        });
      }
      return s + '</svg>';
    }
    const all = series.flatMap(x => x.values.map(v => +v || 0));
    const max = niceMax(Math.max(0, ...all)), n = Math.max(1, labels.length);
    const legH = series.length > 1 && c.legend !== false ? fs * 2.4 : fs * .6;
    if (kind === 'hbar') {
      const L = fs * Math.max(4, Math.min(9, Math.max(...labels.map(l => String(l).length), 1) * .62)), Rr = fs * 3, T = legH, B = fs * 2;
      const pw = w - L - Rr, ph = h - T - B, gh = ph / n, bh = gh * .7 / Math.max(1, series.length);
      for (let i = 0; i <= 4; i++) { const x = L + pw * i / 4; if (c.gridlines !== false) s += `<line x1="${f1(x)}" x2="${f1(x)}" y1="${T}" y2="${f1(T + ph)}" stroke="${esc(grid)}" stroke-width="2"/>`; s += `<text x="${f1(x)}" y="${f1(h - fs * .4)}" text-anchor="middle" opacity=".6">${esc(fmtNum(max * i / 4))}</text>`; }
      labels.forEach((lb, i) => {
        s += `<text x="${f1(L - fs * .6)}" y="${f1(T + gh * i + gh / 2)}" text-anchor="end" dominant-baseline="central">${esc(lb)}</text>`;
        series.forEach((se, j) => {
          const v = +se.values[i] || 0, bw = Math.max(0, v / max * pw), y = T + gh * i + gh * .15 + j * bh;
          s += `<rect x="${f1(L)}" y="${f1(y)}" width="${f1(bw)}" height="${f1(bh * .9)}" rx="${f1(Math.min(8, bh / 4))}" fill="${esc(colors[j % colors.length])}"/>`;
          if (c.values !== false) s += `<text x="${f1(L + bw + fs * .5)}" y="${f1(y + bh * .45)}" dominant-baseline="central" font-weight="600" font-size="${f1(fs * .85)}">${esc(pre + fmtNum(v) + suf)}</text>`;
        });
      });
    } else {
      const L = fs * 3.4, Rr = fs, T = legH + fs, B = fs * 2.4;
      const pw = w - L - Rr, ph = h - T - B;
      for (let i = 0; i <= 4; i++) { const y = T + ph * (1 - i / 4); if (c.gridlines !== false || i === 0) s += `<line x1="${L}" x2="${f1(L + pw)}" y1="${f1(y)}" y2="${f1(y)}" stroke="${esc(grid)}" stroke-width="2"/>`; s += `<text x="${f1(L - fs * .6)}" y="${f1(y)}" text-anchor="end" dominant-baseline="central" opacity=".6">${esc(fmtNum(max * i / 4))}</text>`; }
      if (kind === 'bar') {
        const gw = pw / n, bw = gw * .7 / Math.max(1, series.length);
        labels.forEach((lb, i) => {
          s += `<text x="${f1(L + gw * i + gw / 2)}" y="${f1(h - fs * .5)}" text-anchor="middle">${esc(lb)}</text>`;
          series.forEach((se, j) => {
            const v = +se.values[i] || 0, bh = Math.max(0, v / max * ph), x = L + gw * i + gw * .15 + j * bw;
            s += `<rect x="${f1(x + bw * .05)}" y="${f1(T + ph - bh)}" width="${f1(bw * .9)}" height="${f1(bh)}" rx="${f1(Math.min(10, bw / 5))}" fill="${esc(colors[j % colors.length])}"/>`;
            if (c.values !== false) s += `<text x="${f1(x + bw / 2)}" y="${f1(T + ph - bh - fs * .5)}" text-anchor="middle" font-weight="600" font-size="${f1(fs * .85)}">${esc(pre + fmtNum(v) + suf)}</text>`;
          });
        });
      } else {
        const px = i => L + (n === 1 ? pw / 2 : pw * i / (n - 1));
        labels.forEach((lb, i) => { s += `<text x="${f1(px(i))}" y="${f1(h - fs * .5)}" text-anchor="middle">${esc(lb)}</text>`; });
        series.forEach((se, j) => {
          const color = colors[j % colors.length];
          const pts = labels.map((_, i) => [px(i), T + ph - Math.max(0, (+se.values[i] || 0) / max * ph)]);
          const d = pts.map((p, i) => (i ? 'L' : 'M') + f1(p[0]) + ' ' + f1(p[1])).join('');
          if (kind === 'area') s += `<path d="${d}L${f1(px(n - 1))} ${f1(T + ph)}L${f1(px(0))} ${f1(T + ph)}Z" fill="${esc(color)}" opacity=".28"/>`;
          s += `<path d="${d}" fill="none" stroke="${esc(color)}" stroke-width="${f1(fs * .28)}" stroke-linejoin="round" stroke-linecap="round"/>`;
          pts.forEach((p, i) => {
            s += `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${f1(fs * .36)}" fill="${esc(color)}"/>`;
            if (c.values !== false) s += `<text x="${f1(p[0])}" y="${f1(p[1] - fs * .9)}" text-anchor="middle" font-weight="600" font-size="${f1(fs * .85)}">${esc(pre + fmtNum(+se.values[i] || 0) + suf)}</text>`;
          });
        });
      }
    }
    if (series.length > 1 && c.legend !== false) {
      let x = kind === 'hbar' ? fs : fs * 3.4;
      series.forEach((se, j) => {
        s += `<rect x="${f1(x)}" y="${f1(fs * .3)}" width="${f1(fs * .9)}" height="${f1(fs * .9)}" rx="${f1(fs * .2)}" fill="${esc(colors[j % colors.length])}"/>`;
        s += `<text x="${f1(x + fs * 1.4)}" y="${f1(fs * .75)}" dominant-baseline="central">${esc(se.name || '')}</text>`;
        x += fs * 2.6 + String(se.name || '').length * fs * .58;
      });
    }
    return s + '</svg>';
  }

  /* ---------- Code highlighting ---------- */
  const KW = 'const|let|var|function|return|if|else|for|while|class|new|import|from|export|default|async|await|def|in|of|try|catch|throw|true|false|null|undefined|None|True|False|self|this|public|private|static|void|int|string|fn|pub|struct|impl|match|use|elif|lambda|print|type|interface|extends|yield|break|continue|switch|case|SELECT|FROM|WHERE|JOIN|ON|GROUP|BY|ORDER|AS';
  const HL = new RegExp('(\\/\\/[^\\n]*|#[^\\n]*|--\\s[^\\n]*)|("(?:[^"\\\\\\n]|\\\\.)*"|\'(?:[^\'\\\\\\n]|\\\\.)*\'|`(?:[^`\\\\]|\\\\.)*`)|\\b(' + KW + ')\\b|\\b(\\d+(?:\\.\\d+)?)\\b|\\b([A-Za-z_]\\w*)(?=\\()', 'g');
  function highlightLine(src) {
    let out = '', last = 0, m; HL.lastIndex = 0;
    while ((m = HL.exec(src))) {
      out += esc(src.slice(last, m.index));
      const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'k' : m[4] ? 'n' : 'f';
      out += `<span class="sd-${cls}">${esc(m[0])}</span>`;
      last = HL.lastIndex;
      if (m[0].length === 0) HL.lastIndex++;
    }
    return out + esc(src.slice(last));
  }

  /* ---------- Element rendering ---------- */
  const MASKS = {
    none: '', circle: 'ellipse(50% 50% at 50% 50%)', hexagon: 'polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)',
    diamond: 'polygon(50% 0,100% 50%,50% 100%,0 50%)', triangle: 'polygon(50% 0,100% 100%,0 100%)',
    slant: 'polygon(12% 0,100% 0,88% 100%,0 100%)', star: 'polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)'
  };
  function embedUrl(u) {
    u = String(u || '');
    let m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
    if (m) return 'https://www.youtube.com/embed/' + m[1];
    m = u.match(/vimeo\.com\/(\d+)/);
    if (m) return 'https://player.vimeo.com/video/' + m[1];
    return /^https?:\/\//.test(u) ? u : '';
  }
  function textBox(el) {
    const t = document.createElement('div');
    t.className = 'sd-text';
    const st = t.style;
    st.justifyContent = { top: 'flex-start', middle: 'center', bottom: 'flex-end' }[el.valign || 'top'];
    st.padding = (el.pad || 0) + 'px';
    st.fontFamily = fontStack(el.font);
    st.fontSize = (el.size || 40) + 'px';
    st.fontWeight = el.weight || 400;
    st.color = el.color || '#ffffff';
    st.textAlign = el.align || 'left';
    st.lineHeight = el.lh || 1.2;
    st.letterSpacing = (el.ls || 0) + 'em';
    if (el.italic) st.fontStyle = 'italic';
    if (el.underline) st.textDecoration = 'underline';
    if (el.upper) st.textTransform = 'uppercase';
    if (el.tshadow) st.textShadow = el.tshadow;
    const tx = document.createElement('div');
    tx.className = 'sd-tx';
    tx.innerHTML = el.html || '';
    if (el.gradText) {
      tx.classList.add('sd-gt');
      tx.style.backgroundImage = `linear-gradient(${el.gradAngle == null ? 90 : el.gradAngle}deg, ${el.color || '#fff'}, ${el.color2 || el.color || '#fff'})`;
    }
    t.appendChild(tx);
    return t;
  }
  function gradStops(angle) {
    const a = (angle == null ? 135 : angle) * Math.PI / 180, sx = Math.sin(a) * 50, cy = Math.cos(a) * 50;
    return `x1="${f1(50 - sx)}%" y1="${f1(50 + cy)}%" x2="${f1(50 + sx)}%" y2="${f1(50 - cy)}%"`;
  }
  function renderEl(el, opts) {
    opts = opts || {};
    const d = document.createElement('div');
    d.className = 'sd-el sd-' + el.type;
    d.dataset.elId = el.id;
    d.dataset.mid = el.mid || el.id;
    const s = d.style;
    s.left = el.x + 'px'; s.top = el.y + 'px'; s.width = el.w + 'px'; s.height = el.h + 'px';
    if (el.rot) s.transform = `rotate(${el.rot}deg)`;
    if (el.opacity != null && el.opacity !== 1) s.opacity = el.opacity;
    const filters = [];
    if (el.shadow) filters.push(`drop-shadow(${el.shadow.x || 0}px ${el.shadow.y || 0}px ${el.shadow.b || 0}px ${el.shadow.c || 'rgba(0,0,0,.4)'})`);
    if (el.glow) filters.push(`drop-shadow(0 0 ${el.glowSize || 28}px ${el.glow})`);
    if (el.blur) filters.push(`blur(${el.blur}px)`);
    if (filters.length) s.filter = filters.join(' ');
    if (el.blend && el.blend !== 'normal') s.mixBlendMode = el.blend;
    switch (el.type) {
      case 'text': {
        if (el.fill) s.background = el.fill2 ? `linear-gradient(${el.fillAngle == null ? 135 : el.fillAngle}deg, ${el.fill}, ${el.fill2})` : el.fill;
        if (el.radius) s.borderRadius = el.radius + 'px';
        if (el.strokeW) s.border = `${el.strokeW}px ${el.dash || 'solid'} ${el.stroke || '#fff'}`;
        d.appendChild(textBox(el));
        break;
      }
      case 'shape': {
        const sw = el.strokeW || 0, w = Math.max(1, el.w - sw), h = Math.max(1, el.h - sw);
        let defs = '', fill = el.fill || 'none';
        if (el.fill && el.fill2) {
          const gid = 'g' + el.id + uid();
          defs = `<defs><linearGradient id="${gid}" ${gradStops(el.fillAngle)}><stop offset="0" stop-color="${esc(el.fill)}"/><stop offset="1" stop-color="${esc(el.fill2)}"/></linearGradient></defs>`;
          fill = `url(#${gid})`;
        }
        const dash = !sw ? '' : el.dash === 'dashed' ? `${sw * 3} ${sw * 2}` : el.dash === 'dotted' ? `0.1 ${sw * 2}` : '';
        d.innerHTML = `<svg class="sd-svg" viewBox="0 0 ${el.w} ${el.h}" preserveAspectRatio="none" width="100%" height="100%">${defs}<path class="sd-p" d="${shapePath(el.shape, w, h, el.radius || 0)}" transform="translate(${sw / 2} ${sw / 2})" fill="${esc(fill)}" stroke="${sw ? esc(el.stroke || '#fff') : 'none'}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}" stroke-linecap="round"` : ''} fill-rule="evenodd" stroke-linejoin="round"/></svg>`;
        d.appendChild(textBox(el));
        break;
      }
      case 'image': {
        const box = document.createElement('div');
        box.className = 'sd-imgbox';
        if (el.radius && (!el.mask || el.mask === 'none')) box.style.borderRadius = el.radius + 'px';
        if (el.mask && MASKS[el.mask]) box.style.clipPath = MASKS[el.mask];
        if (el.strokeW) box.style.border = `${el.strokeW}px solid ${el.stroke || '#fff'}`;
        if (el.src) {
          const img = document.createElement('img');
          img.src = el.src; img.alt = el.alt || ''; img.draggable = false;
          img.style.objectFit = el.fit || 'cover';
          img.style.objectPosition = `${el.px == null ? 50 : el.px}% ${el.py == null ? 50 : el.py}%`;
          const fl = el.filters || {};
          const f = [];
          if (fl.bright != null && fl.bright !== 100) f.push(`brightness(${fl.bright}%)`);
          if (fl.contrast != null && fl.contrast !== 100) f.push(`contrast(${fl.contrast}%)`);
          if (fl.sat != null && fl.sat !== 100) f.push(`saturate(${fl.sat}%)`);
          if (fl.gray) f.push(`grayscale(${fl.gray}%)`);
          if (fl.sepia) f.push(`sepia(${fl.sepia}%)`);
          if (fl.hue) f.push(`hue-rotate(${fl.hue}deg)`);
          if (f.length) img.style.filter = f.join(' ');
          box.appendChild(img);
        } else {
          box.classList.add('sd-imgph');
          box.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3zM8.5 7a1.5 1.5 0 1 0 0 3a1.5 1.5 0 1 0 0-3M21 15l-5-5L5 21"/></svg><span>Double-click to add an image</span>`;
        }
        d.appendChild(box);
        break;
      }
      case 'table': {
        const T = el.table || { rows: [['']] };
        const tb = document.createElement('table');
        tb.className = 'sd-table';
        tb.style.fontFamily = fontStack(el.font);
        tb.style.fontSize = (el.size || 28) + 'px';
        tb.style.color = T.color || '#fff';
        (T.rows || []).forEach((r, ri) => {
          const tr = tb.insertRow();
          r.forEach((cell, ci) => {
            const head = ri === 0 && T.header !== false;
            const td = document.createElement(head ? 'th' : 'td');
            td.innerHTML = cell;
            td.dataset.r = ri; td.dataset.c = ci;
            td.style.borderColor = T.border || 'rgba(255,255,255,.2)';
            td.style.textAlign = ci === 0 ? 'left' : (T.align || 'left');
            if (head) { td.style.background = T.headBg || 'transparent'; td.style.color = T.headColor || T.color || '#fff'; }
            else if (T.stripe && ri % 2 === 0) td.style.background = T.stripeBg || 'rgba(255,255,255,.05)';
            tr.appendChild(td);
          });
        });
        if (el.radius) { d.style.borderRadius = el.radius + 'px'; d.style.overflow = 'hidden'; }
        if (T.bg) d.style.background = T.bg;
        d.appendChild(tb);
        break;
      }
      case 'chart': d.innerHTML = chartSVG(el); break;
      case 'code': {
        const pre = document.createElement('pre');
        pre.className = 'sd-code sd-ct-' + (el.codeTheme || 'night') + (el.lineNo ? ' sd-ln' : '');
        pre.style.fontSize = (el.size || 28) + 'px';
        if (el.radius != null) pre.style.borderRadius = el.radius + 'px';
        if (el.chrome) pre.classList.add('sd-chrome');
        pre.innerHTML = String(el.code || '').split('\n').map(l => `<span class="sd-line">${highlightLine(l) || ' '}</span>`).join('\n');
        d.appendChild(pre);
        break;
      }
      case 'icon': {
        let pad = 0;
        if (el.bg) {
          s.background = el.bg;
          s.borderRadius = el.bgShape === 'square' ? (el.radius || Math.min(el.w, el.h) * .22) + 'px' : '50%';
          pad = Math.min(el.w, el.h) * .24;
        }
        d.innerHTML = `<svg viewBox="0 0 24 24" style="position:absolute;left:${pad}px;top:${pad}px;width:calc(100% - ${2 * pad}px);height:calc(100% - ${2 * pad}px)" fill="none" stroke="${esc(el.color || '#fff')}" stroke-width="${el.sw || 1.75}" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONS[el.icon] || ICONS.star}"/></svg>`;
        break;
      }
      case 'line': {
        const sw = el.strokeW || 6, y = el.h / 2, ah = sw * 3.2, col = esc(el.stroke || '#fff');
        const x1 = el.arrowStart ? ah * .8 : sw / 2, x2 = el.w - (el.arrowEnd ? ah * .8 : sw / 2);
        const dash = el.dash === 'dashed' ? ` stroke-dasharray="${sw * 3} ${sw * 2}"` : el.dash === 'dotted' ? ` stroke-dasharray="0.1 ${sw * 2}"` : '';
        let g = `<line x1="${f1(x1)}" y1="${f1(y)}" x2="${f1(x2)}" y2="${f1(y)}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"${dash}/>`;
        if (el.arrowEnd) g += `<path d="M${f1(el.w)} ${f1(y)}L${f1(el.w - ah)} ${f1(y - ah * .6)}L${f1(el.w - ah)} ${f1(y + ah * .6)}Z" fill="${col}"/>`;
        if (el.arrowStart) g += `<path d="M0 ${f1(y)}L${f1(ah)} ${f1(y - ah * .6)}L${f1(ah)} ${f1(y + ah * .6)}Z" fill="${col}"/>`;
        d.innerHTML = `<svg viewBox="0 0 ${el.w} ${el.h}" width="100%" height="100%" style="overflow:visible">${g}</svg>`;
        break;
      }
      case 'embed': {
        const url = embedUrl(el.url);
        if (opts.thumb || !url) {
          d.innerHTML = `<div class="sd-embedph"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5l11 7-11 7z"/></svg><span>${url ? 'Video' : 'Add a YouTube or Vimeo link'}</span></div>`;
        } else {
          const f = document.createElement('iframe');
          f.src = url; f.allow = 'autoplay; fullscreen; picture-in-picture'; f.allowFullscreen = true;
          f.setAttribute('frameborder', '0');
          if (opts.editor) f.style.pointerEvents = 'none';
          d.appendChild(f);
        }
        if (el.radius) { s.borderRadius = el.radius + 'px'; s.overflow = 'hidden'; }
        break;
      }
    }
    if (opts.live && el.link) {
      d.classList.add('sd-link');
      d.addEventListener('click', e => { e.stopPropagation(); window.open(el.link, '_blank', 'noopener'); });
    }
    return d;
  }

  /* ---------- Backgrounds ---------- */
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function starLayer(n, color, size) {
    seed = 11 + n + size * 3;
    const out = [];
    for (let i = 0; i < n; i++) out.push(`${Math.round(rnd() * W)}px ${Math.round(rnd() * H)}px ${color}`);
    return `<i style="width:${size}px;height:${size}px;box-shadow:${out.join(',')}"></i>`;
  }
  function wavePath(k, amp, base) {
    let d = `M0 ${base}`;
    for (let x = 0; x <= W * 2; x += 40) d += `L${x} ${f1(base + Math.sin(x / W * Math.PI * 2 * k) * amp)}`;
    return d + `L${W * 2} 400L0 400Z`;
  }
  const BG_ANIMS = [['', 'None'], ['aurora', 'Aurora'], ['grid', 'Neon grid'], ['stars', 'Star field'], ['waves', 'Waves'], ['shift', 'Color shift'],
    ['orbs', 'Floating orbs'], ['beams', 'Light beams'], ['particles', 'Rising particles'], ['blueprint', 'Blueprint scan'], ['pulse', 'Pulse rings']];
  function animLayer(bg) {
    const a1 = esc(bg.a1 || '#2E6BFF'), a2 = esc(bg.a2 || '#8A4DFF'), a3 = esc(bg.a3 || '#00C2FF');
    switch (bg.anim) {
      case 'aurora': return `<div class="sd-anim sd-aurora"><i style="background:${a1}"></i><i style="background:${a2}"></i><i style="background:${a3}"></i></div>`;
      case 'grid': return `<div class="sd-anim sd-gridfloor" style="--c:${a1}"><b style="background:radial-gradient(ellipse 60% 50% at 50% 55%, ${a2}66, transparent 70%)"></b><i></i></div>`;
      case 'stars': return `<div class="sd-anim sd-stars">${starLayer(120, a1, 2)}${starLayer(60, a2, 3)}${starLayer(30, '#ffffff', 4)}</div>`;
      case 'waves': return `<div class="sd-anim sd-waves"><svg viewBox="0 0 ${W * 2} 400" preserveAspectRatio="none"><path d="${wavePath(2, 40, 120)}" fill="${a1}" opacity=".35"/></svg><svg viewBox="0 0 ${W * 2} 400" preserveAspectRatio="none"><path d="${wavePath(3, 30, 170)}" fill="${a2}" opacity=".35"/></svg><svg viewBox="0 0 ${W * 2} 400" preserveAspectRatio="none"><path d="${wavePath(1, 50, 230)}" fill="${a3}" opacity=".4"/></svg></div>`;
      case 'shift': return `<div class="sd-anim sd-shift" style="background-image:linear-gradient(120deg, ${a1}, ${a2}, ${a3}, ${a1})"></div>`;
      case 'orbs': {
        seed = 5; let h = '';
        for (let i = 0; i < 7; i++) { const sz = 140 + rnd() * 320; h += `<i style="left:${f1(rnd() * 90)}%;top:${f1(rnd() * 80)}%;width:${f1(sz)}px;height:${f1(sz)}px;background:${[a1, a2, a3][i % 3]};animation-duration:${f1(12 + rnd() * 10)}s;animation-delay:${f1(-rnd() * 10)}s"></i>`; }
        return `<div class="sd-anim sd-orbs">${h}</div>`;
      }
      case 'beams': return `<div class="sd-anim sd-beams"><i style="background:conic-gradient(from 0deg at 50% 50%, transparent 0deg 20deg, ${a1} 32deg, transparent 46deg 150deg, ${a2} 165deg, transparent 182deg 290deg, ${a3} 305deg, transparent 322deg)"></i></div>`;
      case 'particles': {
        seed = 9; let h = '';
        for (let i = 0; i < 34; i++) { const sz = 4 + rnd() * 10; h += `<i style="left:${f1(rnd() * 100)}%;width:${f1(sz)}px;height:${f1(sz)}px;background:${[a1, a2, a3][i % 3]};animation-duration:${f1(9 + rnd() * 10)}s;animation-delay:${f1(-rnd() * 18)}s"></i>`; }
        return `<div class="sd-anim sd-particles">${h}</div>`;
      }
      case 'blueprint': return `<div class="sd-anim sd-blueprint" style="--c:${a1}"><i></i><b style="background:linear-gradient(180deg, transparent, ${a2}55 70%, ${a2} 100%)"></b></div>`;
      case 'pulse': return `<div class="sd-anim sd-pulse" style="--c:${a1}"><i></i><i></i><i></i><i></i></div>`;
    }
    return '';
  }
  function renderBg(bg) {
    bg = bg || {};
    const d = document.createElement('div');
    d.className = 'sd-bg';
    if (bg.grad) {
      const g = bg.grad;
      d.style.background = g.radial ? `radial-gradient(circle at ${g.cx == null ? 50 : g.cx}% ${g.cy == null ? 40 : g.cy}%, ${g.c1}, ${g.c2})` : `linear-gradient(${g.angle == null ? 135 : g.angle}deg, ${g.c1}, ${g.c2})`;
    } else d.style.background = bg.color || '#000';
    if (bg.img) {
      const im = document.createElement('div');
      im.className = 'sd-bgimg';
      im.style.backgroundImage = `url("${bg.img}")`;
      d.appendChild(im);
      if (bg.dim) { const dm = document.createElement('div'); dm.className = 'sd-dim'; dm.style.opacity = bg.dim; d.appendChild(dm); }
    }
    if (bg.anim) d.insertAdjacentHTML('beforeend', animLayer(bg));
    if (bg.grain) d.insertAdjacentHTML('beforeend', '<div class="sd-grain"></div>');
    return d;
  }

  function renderSlide(slide, deck, opts) {
    opts = opts || {};
    const s = document.createElement('div');
    s.className = 'sd-slide' + (opts.thumb ? ' sd-thumb' : '') + (opts.editor ? ' sd-editing' : '');
    s.dataset.slideId = slide.id;
    s.appendChild(renderBg(slide.bg));
    const pre = new Set();
    if (opts.hideBuilds) (slide.builds || []).forEach(b => { if (b.kind === 'in') pre.add(b.el); });
    (slide.els || []).forEach(el => {
      if (el.hidden && !opts.editor) return;
      const n = renderEl(el, opts);
      if (pre.has(el.id)) n.classList.add('sd-pre');
      if (el.hidden) n.classList.add('sd-ghost');
      s.appendChild(n);
    });
    if (deck && deck.numbers && opts.index != null) {
      const nb = document.createElement('div');
      nb.className = 'sd-num';
      nb.textContent = opts.index + 1;
      nb.style.color = (deck.theme && deck.theme.muted) || 'rgba(255,255,255,.55)';
      nb.style.fontFamily = fontStack(deck.theme && deck.theme.body);
      s.appendChild(nb);
    }
    return s;
  }

  /* ---------- Builds ---------- */
  const FX_LABELS = {
    in: [['appear', 'Appear'], ['fade', 'Fade'], ['rise', 'Rise'], ['fly-left', 'Fly from left'], ['fly-right', 'Fly from right'], ['fly-top', 'Fly from top'],
      ['fly-bottom', 'Fly from bottom'], ['zoom', 'Zoom'], ['pop', 'Pop'], ['blur', 'Focus'], ['drop', 'Drop'], ['spin', 'Spin'], ['flip', 'Flip'],
      ['wipe-right', 'Wipe'], ['wipe-up', 'Wipe up'], ['iris', 'Iris'], ['typewriter', 'Typewriter'], ['elastic', 'Elastic'], ['skew', 'Skew']],
    emph: [['pulse', 'Pulse'], ['heartbeat', 'Heartbeat'], ['shake', 'Shake'], ['bounce', 'Bounce'], ['wobble', 'Wobble'], ['flash', 'Flash'],
      ['spin360', 'Spin'], ['jelly', 'Jelly'], ['glow', 'Glow'], ['tada', 'Tada']],
    out: [['fade', 'Fade out'], ['sink', 'Sink'], ['fly-out-left', 'Fly to left'], ['fly-out-right', 'Fly to right'], ['fly-out-top', 'Fly to top'],
      ['fly-out-bottom', 'Fly to bottom'], ['zoom-out', 'Shrink'], ['blur-out', 'Blur'], ['spin-out', 'Spin away'], ['wipe-out', 'Wipe'], ['pop-out', 'Pop']]
  };
  function FX(el, bf) {
    const r = el.rot ? ` rotate(${el.rot}deg)` : '';
    const T = t => ((t || '') + r).trim() || 'none';
    const O = el.opacity == null ? 1 : el.opacity;
    const bfx = bf && bf !== 'none' ? bf : '';
    const L = -(el.x + el.w + 60), R = W - el.x + 60, U = -(el.y + el.h + 60), D = H - el.y + 60;
    const tr = (a, b, e) => [[{ transform: T(a) }, { transform: T(b) }], e];
    return {
      in: {
        appear: [[{ opacity: 0 }, { opacity: O }], 'steps(1,start)'],
        fade: [[{ opacity: 0 }, { opacity: O }], 'ease'],
        rise: [[{ opacity: 0, transform: T('translateY(80px)') }, { opacity: O, transform: T('') }], EASE.out],
        'fly-left': tr(`translateX(${L}px)`, '', EASE.out), 'fly-right': tr(`translateX(${R}px)`, '', EASE.out),
        'fly-top': tr(`translateY(${U}px)`, '', EASE.out), 'fly-bottom': tr(`translateY(${D}px)`, '', EASE.out),
        zoom: [[{ opacity: 0, transform: T('scale(.3)') }, { opacity: O, transform: T('') }], EASE.out],
        pop: [[{ opacity: 0, transform: T('scale(.4)') }, { opacity: O, transform: T('scale(1.08)'), offset: .65 }, { opacity: O, transform: T('') }], 'ease-out'],
        blur: [[{ opacity: 0, filter: `${bfx} blur(40px)`.trim(), transform: T('scale(1.08)') }, { opacity: O, filter: `${bfx} blur(0px)`.trim(), transform: T('') }], EASE.out],
        drop: [[{ transform: T(`translateY(${U}px)`), easing: 'cubic-bezier(.55,0,1,.45)' }, { transform: T(''), offset: .6, easing: 'cubic-bezier(0,0,.4,1)' }, { transform: T('translateY(-40px)'), offset: .8, easing: 'cubic-bezier(.6,0,1,1)' }, { transform: T('') }], 'linear'],
        spin: [[{ opacity: 0, transform: T('rotate(-270deg) scale(.2)') }, { opacity: O, transform: T('') }], EASE.out],
        flip: [[{ opacity: 0, transform: T('perspective(1600px) rotateY(90deg)') }, { opacity: O, transform: T('perspective(1600px) rotateY(0deg)') }], EASE.out],
        'wipe-right': [[{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], EASE.inout],
        'wipe-up': [[{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)' }], EASE.inout],
        iris: [[{ clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)' }], EASE.inout],
        typewriter: [[{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], 'steps(28,end)'],
        elastic: [[{ opacity: 0, transform: T('scale(0)') }, { opacity: O, transform: T('scale(1.25,.8)'), offset: .4 }, { transform: T('scale(.88,1.12)'), offset: .6 }, { transform: T('scale(1.05,.95)'), offset: .8 }, { opacity: O, transform: T('') }], 'ease-out'],
        skew: [[{ opacity: 0, transform: T('translateX(-300px) skewX(-35deg)') }, { opacity: O, transform: T('translateX(20px) skewX(8deg)'), offset: .7 }, { opacity: O, transform: T('') }], EASE.out]
      },
      emph: {
        pulse: [[{ transform: T('') }, { transform: T('scale(1.15)') }, { transform: T('') }], 'ease-in-out'],
        heartbeat: [[{ transform: T('') }, { transform: T('scale(1.18)'), offset: .15 }, { transform: T(''), offset: .3 }, { transform: T('scale(1.12)'), offset: .45 }, { transform: T('') }], 'ease-in-out'],
        shake: [[0, -30, 30, -24, 24, -12, 12, 0].map(v => ({ transform: T(`translateX(${v}px)`) })), 'linear'],
        bounce: [[{ transform: T('') }, { transform: T('translateY(-90px)'), offset: .35 }, { transform: T(''), offset: .6 }, { transform: T('translateY(-30px)'), offset: .8 }, { transform: T('') }], 'ease-in-out'],
        wobble: [[0, -10, 8, -6, 4, 0].map(v => ({ transform: T(`rotate(${v}deg)`) })), 'ease-in-out'],
        flash: [[O, 0, O, 0, O].map(v => ({ opacity: v })), 'linear'],
        spin360: [[{ transform: T('rotate(0deg)') }, { transform: T('rotate(360deg)') }], EASE.inout],
        jelly: [[{ transform: T('') }, { transform: T('scale(1.25,.75)'), offset: .3 }, { transform: T('scale(.75,1.25)'), offset: .4 }, { transform: T('scale(1.15,.85)'), offset: .5 }, { transform: T('scale(.95,1.05)'), offset: .65 }, { transform: T('') }], 'ease'],
        glow: [[{ filter: `${bfx} brightness(1)`.trim() }, { filter: `${bfx} brightness(1.5) drop-shadow(0 0 40px rgba(156,192,255,.95))`.trim() }, { filter: `${bfx} brightness(1)`.trim() }], 'ease-in-out'],
        tada: [[{ transform: T('') }, { transform: T('scale(.9) rotate(-4deg)'), offset: .15 }, { transform: T('scale(1.12) rotate(4deg)'), offset: .35 }, { transform: T('scale(1.12) rotate(-4deg)'), offset: .55 }, { transform: T('scale(1.12) rotate(3deg)'), offset: .75 }, { transform: T('') }], 'ease']
      },
      out: {
        fade: [[{ opacity: O }, { opacity: 0 }], 'ease'],
        sink: [[{ opacity: O, transform: T('') }, { opacity: 0, transform: T('translateY(80px)') }], EASE.in],
        'fly-out-left': tr('', `translateX(${L}px)`, EASE.in), 'fly-out-right': tr('', `translateX(${R}px)`, EASE.in),
        'fly-out-top': tr('', `translateY(${U}px)`, EASE.in), 'fly-out-bottom': tr('', `translateY(${D}px)`, EASE.in),
        'zoom-out': [[{ opacity: O, transform: T('') }, { opacity: 0, transform: T('scale(.2)') }], EASE.in],
        'blur-out': [[{ opacity: O, filter: bfx || 'none' }, { opacity: 0, filter: `${bfx} blur(40px)`.trim() }], 'ease'],
        'spin-out': [[{ opacity: O, transform: T('') }, { opacity: 0, transform: T('rotate(270deg) scale(.2)') }], EASE.in],
        'wipe-out': [[{ clipPath: 'inset(0 0% 0 0)' }, { clipPath: 'inset(0 0 0 100%)' }], EASE.inout],
        'pop-out': [[{ opacity: O, transform: T('') }, { opacity: O, transform: T('scale(1.12)'), offset: .3 }, { opacity: 0, transform: T('scale(0)') }], 'ease-in']
      }
    };
  }
  const DEF_DUR = { in: .8, emph: 1, out: .7 };
  function runBuild(node, el, b, start) {
    const bf = node.style.filter || '';
    const set = FX(el, bf)[b.kind] || FX(el, bf).in;
    const def = set[b.fx] || set.fade || Object.values(set)[0];
    const dur = b.fx === 'appear' ? 1 : Math.max(50, (b.dur || DEF_DUR[b.kind] || .8) * 1000);
    const a = node.animate(def[0], { duration: dur, delay: start || 0, easing: def[1], fill: b.kind === 'in' ? 'both' : b.kind === 'out' ? 'forwards' : 'none' });
    a.onfinish = () => { if (b.kind === 'out') node.style.visibility = 'hidden'; try { a.cancel(); } catch (e) { } };
    return a;
  }
  function buildSteps(slide) {
    const steps = [], ids = new Set((slide.els || []).map(e => e.id));
    let cur = null, ps = 0, pe = 0;
    (slide.builds || []).forEach(b => {
      if (!ids.has(b.el)) return;
      const dur = b.fx === 'appear' ? 0 : (b.dur || DEF_DUR[b.kind] || .8) * 1000, dl = (b.delay || 0) * 1000;
      let st;
      if (!cur || !b.trigger || b.trigger === 'click') {
        cur = { auto: !cur && (b.trigger === 'after' || b.trigger === 'with'), items: [], end: 0 };
        steps.push(cur); st = dl;
      } else if (b.trigger === 'with') st = ps + dl;
      else st = pe + dl;
      cur.items.push({ b, start: st });
      ps = st; pe = st + dur;
      cur.end = Math.max(cur.end, pe);
    });
    return steps;
  }
  function applyFinal(node, slide) {
    const last = {};
    (slide.builds || []).forEach(b => { last[b.el] = b.kind; });
    Object.keys(last).forEach(id => {
      if (last[id] !== 'out') return;
      const n = node.querySelector(`[data-el-id="${id}"]`);
      if (n) n.style.visibility = 'hidden';
    });
  }

  /* ---------- Transitions ---------- */
  const TRANSITIONS = [['none', 'None'], ['fade', 'Fade'], ['dissolve', 'Dissolve'], ['magic', 'Magic Morph'], ['push', 'Push'], ['slide', 'Slide in'],
    ['reveal', 'Reveal'], ['zoom', 'Zoom'], ['flip', 'Flip'], ['cube', 'Cube'], ['wipe', 'Wipe'], ['iris', 'Iris'], ['split', 'Split'],
    ['drop', 'Drop'], ['swirl', 'Swirl'], ['blur', 'Blur'], ['swap', 'Swap']];
  function transition(vp, oldN, newN, tr, dir, ctx) {
    tr = tr || {};
    const type = tr.type || 'none', dur = Math.max(100, (tr.dur || .8) * 1000), X = dir < 0 ? -1 : 1;
    const A = [];
    const an = (n, k, o) => { const a = n.animate(k, Object.assign({ duration: dur, easing: EASE.inout, fill: 'both' }, o || {})); A.push(a); return a; };
    switch (type) {
      case 'fade': an(newN, [{ opacity: 0 }, { opacity: 1 }], { easing: 'ease' }); break;
      case 'dissolve':
        an(oldN, [{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(24px)' }]);
        an(newN, [{ opacity: 0, filter: 'blur(24px)' }, { opacity: 1, filter: 'blur(0px)' }]); break;
      case 'blur':
        an(oldN, [{ filter: 'blur(0px)', transform: 'scale(1)', opacity: 1 }, { filter: 'blur(40px)', transform: 'scale(1.08)', opacity: 0 }]);
        an(newN, [{ opacity: 0, filter: 'blur(40px)', transform: 'scale(.94)' }, { opacity: 1, filter: 'blur(0px)', transform: 'scale(1)' }]); break;
      case 'push':
        an(oldN, [{ transform: 'translateX(0)' }, { transform: `translateX(${-X * 100}%)` }]);
        an(newN, [{ transform: `translateX(${X * 100}%)` }, { transform: 'translateX(0)' }]); break;
      case 'slide': an(newN, [{ transform: `translateX(${X * 100}%)` }, { transform: 'translateX(0)' }], { easing: EASE.out }); break;
      case 'reveal':
        vp.appendChild(oldN);
        an(oldN, [{ transform: 'translateX(0)' }, { transform: `translateX(${-X * 100}%)` }]); break;
      case 'zoom':
        an(oldN, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.35)', opacity: 0 }]);
        an(newN, [{ transform: 'scale(.7)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { easing: EASE.out }); break;
      case 'flip':
        an(oldN, [{ transform: 'rotateY(0deg)' }, { transform: `rotateY(${X * 90}deg)` }], { duration: dur / 2, easing: 'ease-in' });
        an(newN, [{ transform: `rotateY(${-X * 90}deg)` }, { transform: 'rotateY(0deg)' }], { duration: dur / 2, delay: dur / 2, easing: 'ease-out' }); break;
      case 'cube': {
        const oo = X > 0 ? '100% 50%' : '0% 50%', no = X > 0 ? '0% 50%' : '100% 50%';
        an(oldN, [{ transformOrigin: oo, transform: 'translateX(0) rotateY(0deg)' }, { transformOrigin: oo, transform: `translateX(${-X * 100}%) rotateY(${-X * 90}deg)` }]);
        an(newN, [{ transformOrigin: no, transform: `translateX(${X * 100}%) rotateY(${X * 90}deg)` }, { transformOrigin: no, transform: 'translateX(0) rotateY(0deg)' }]); break;
      }
      case 'wipe': an(newN, [{ clipPath: X > 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0)' }]); break;
      case 'iris': an(newN, [{ clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)' }]); break;
      case 'split': an(newN, [{ clipPath: 'inset(0 50% 0 50%)' }, { clipPath: 'inset(0 0% 0 0%)' }]); break;
      case 'drop':
        an(newN, [{ transform: 'translateY(-100%)', easing: 'cubic-bezier(.5,0,.75,0)' }, { transform: 'translateY(0)', offset: .62, easing: 'ease-out' }, { transform: 'translateY(-5%)', offset: .8, easing: 'ease-in' }, { transform: 'translateY(0)' }], { easing: 'linear' }); break;
      case 'swirl':
        an(oldN, [{ opacity: 1 }, { opacity: 0 }]);
        an(newN, [{ transform: 'rotate(-200deg) scale(0)', opacity: 0 }, { transform: 'rotate(0deg) scale(1)', opacity: 1 }], { easing: EASE.out }); break;
      case 'swap':
        an(oldN, [{ transform: 'translateX(0) scale(1)', opacity: 1 }, { transform: `translateX(${-X * 30}%) scale(.8)`, opacity: 0 }]);
        an(newN, [{ transform: `translateX(${X * 30}%) scale(.8)`, opacity: 0 }, { transform: 'translateX(0) scale(1)', opacity: 1 }], { easing: EASE.out }); break;
      case 'magic': magic(oldN, newN, dur, ctx || {}, an); break;
    }
    return A;
  }
  function magic(oldN, newN, dur, ctx, an) {
    const os = ctx.oldSlide, ns = ctx.newSlide;
    if (!os || !ns) { an(newN, [{ opacity: 0 }, { opacity: 1 }]); return; }
    const om = new Map((os.els || []).map(e => [e.mid || e.id, e]));
    an(oldN, [{ opacity: 1 }, { opacity: 0 }], { easing: 'ease' });
    const bg = newN.querySelector('.sd-bg');
    if (bg) an(bg, [{ opacity: 0 }, { opacity: 1 }], { easing: 'ease' });
    const num = newN.querySelector('.sd-num');
    if (num) an(num, [{ opacity: 0 }, { opacity: 1 }]);
    (ns.els || []).forEach(e => {
      const node = newN.querySelector(`[data-el-id="${e.id}"]`);
      if (!node || node.classList.contains('sd-pre')) return;
      const o = om.get(e.mid || e.id);
      if (o && o.type === e.type) {
        const on = oldN.querySelector(`[data-el-id="${o.id}"]`);
        if (on) on.style.visibility = 'hidden';
        an(node, [
          { left: o.x + 'px', top: o.y + 'px', width: o.w + 'px', height: o.h + 'px', transform: `rotate(${o.rot || 0}deg)`, opacity: o.opacity == null ? 1 : o.opacity },
          { left: e.x + 'px', top: e.y + 'px', width: e.w + 'px', height: e.h + 'px', transform: `rotate(${e.rot || 0}deg)`, opacity: e.opacity == null ? 1 : e.opacity }
        ]);
        const tx = node.querySelector('.sd-text');
        if (tx && (o.size !== e.size || o.color !== e.color)) an(tx, [{ fontSize: (o.size || 40) + 'px', color: o.color || '#fff' }, { fontSize: (e.size || 40) + 'px', color: e.color || '#fff' }]);
        const p = node.querySelector('path.sd-p');
        if (p && o.fill && e.fill && !o.fill2 && !e.fill2 && o.fill !== e.fill) an(p, [{ fill: o.fill }, { fill: e.fill }]);
        if (e.type === 'icon' && o.bg && e.bg && o.bg !== e.bg) an(node, [{ backgroundColor: o.bg }, { backgroundColor: e.bg }]);
      } else {
        an(node, [{ opacity: 0 }, { opacity: e.opacity == null ? 1 : e.opacity }], { delay: dur * .35, duration: dur * .65, easing: 'ease' });
      }
    });
  }

  /* ---------- Player ---------- */
  class Player {
    constructor(host, deck, opts) {
      this.host = host; this.deck = deck; this.opts = opts || {};
      host.classList.add('sd-player');
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      this.vp = document.createElement('div');
      this.vp.className = 'sd-pv';
      host.appendChild(this.vp);
      this.index = -1; this.cur = null; this.curSlide = null; this.steps = []; this.step = 0;
      this.anims = []; this.trans = []; this.timer = null; this.tok = 0;
      this.fit = this.fit.bind(this);
      if (window.ResizeObserver) { this.ro = new ResizeObserver(this.fit); this.ro.observe(host); }
      else window.addEventListener('resize', this.fit);
      this.fit();
    }
    destroy() {
      this.dead = true;
      clearTimeout(this.timer);
      if (this.ro) this.ro.disconnect(); else window.removeEventListener('resize', this.fit);
      this.anims.forEach(a => { try { a.cancel(); } catch (e) { } });
      this.trans.forEach(a => { try { a.cancel(); } catch (e) { } });
      this.vp.remove();
      this.host.classList.remove('sd-player');
    }
    fit() {
      const w = this.host.clientWidth, h = this.host.clientHeight;
      if (!w || !h) return;
      const s = Math.min(w / W, h / H);
      this.scale = s;
      this.vp.style.transform = `translate(${(w - W * s) / 2}px, ${(h - H * s) / 2}px) scale(${s})`;
    }
    get slides() { return this.deck.slides; }
    nextIdx(i, d) {
      let j = i + d;
      while (j >= 0 && j < this.slides.length && this.slides[j].hidden) j += d;
      return j >= 0 && j < this.slides.length ? j : -1;
    }
    first() { return this.nextIdx(-1, 1); }
    finishAll() {
      this.anims.forEach(a => { try { a.finish(); } catch (e) { } });
      this.anims = [];
      this.trans.forEach(a => { try { a.finish(); } catch (e) { } });
      this.trans = [];
    }
    go(i, o) {
      o = o || {};
      const s = this.slides[i];
      if (!s || this.dead) return;
      clearTimeout(this.timer);
      this.finishAll();
      [...this.vp.children].forEach(c => { if (c !== this.cur) c.remove(); });
      if (this.cur) { this.cur.getAnimations({ subtree: true }).forEach(a => { try { a.cancel(); } catch (e) { } }); this.cur.style.visibility = ''; }
      const built = !!o.built;
      const node = renderSlide(s, this.deck, { hideBuilds: !built, index: i, live: this.opts.live !== false, thumb: this.opts.thumb });
      const steps = buildSteps(s);
      if (built) applyFinal(node, s);
      const old = this.cur, oldSlide = this.curSlide;
      this.vp.appendChild(node);
      this.cur = node; this.curSlide = s; this.index = i; this.steps = steps; this.step = built ? steps.length : 0;
      const tok = ++this.tok;
      const after = () => {
        if (tok !== this.tok || this.dead) return;
        if (!built && steps[0] && steps[0].auto) this.playStep();
        this.schedule();
      };
      const tr = o.dir < 0 ? (oldSlide && oldSlide.transition) : s.transition;
      if (old && o.animate !== false && tr && tr.type && tr.type !== 'none') {
        const A = transition(this.vp, old, node, tr, o.dir || 1, { oldSlide, newSlide: s });
        this.trans = A;
        if (!A.length) { old.remove(); after(); }
        else Promise.all(A.map(a => a.finished)).then(() => {
          old.remove();
          A.forEach(a => { try { a.cancel(); } catch (e) { } });
          if (tok === this.tok) this.trans = [];
          after();
        }).catch(() => { old.remove(); });
      } else { if (old) old.remove(); after(); }
      if (this.opts.onChange) this.opts.onChange(this);
    }
    playStep() {
      const st = this.steps[this.step];
      if (!st || !this.cur) return;
      this.step++;
      st.items.forEach(({ b, start }) => {
        const node = this.cur.querySelector(`[data-el-id="${b.el}"]`);
        const el = this.curSlide.els.find(e => e.id === b.el);
        if (!node || !el) return;
        if (b.kind === 'in') { node.classList.remove('sd-pre'); node.style.visibility = ''; }
        this.anims.push(runBuild(node, el, b, start));
      });
      if (this.opts.onChange) this.opts.onChange(this);
    }
    next() {
      if (this.trans.length) { this.finishAll(); return true; }
      if (this.step < this.steps.length) {
        this.anims.forEach(a => { try { a.finish(); } catch (e) { } });
        this.anims = [];
        this.playStep(); this.schedule();
        return true;
      }
      const j = this.nextIdx(this.index, 1);
      if (j < 0) return false;
      this.go(j, { dir: 1 });
      return true;
    }
    prev() {
      if (this.trans.length) this.finishAll();
      const j = this.nextIdx(this.index, -1);
      if (j < 0) return false;
      this.go(j, { dir: -1, built: true });
      return true;
    }
    schedule() {
      clearTimeout(this.timer);
      const s = this.curSlide;
      const sec = (s && s.auto) || this.opts.autoAdvance;
      if (!sec || this.dead) return;
      const st = this.steps[this.step - 1];
      const wait = sec * 1000 + (st ? st.end : 0);
      this.timer = setTimeout(() => {
        if (this.dead) return;
        const ok = this.next();
        if (!ok && this.opts.loop) this.go(this.first(), { dir: 1 });
      }, wait);
    }
  }

  /* ---------- Standalone player (exported decks) ---------- */
  function standalone(deck) {
    injectCSS();
    fontsOf(deck).forEach(f => loadFont(f));
    document.title = deck.title || 'Presentation';
    document.body.style.cssText = 'margin:0;background:#000;overflow:hidden;height:100vh;cursor:default';
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;inset:0';
    document.body.appendChild(host);
    const hud = document.createElement('div');
    hud.style.cssText = 'position:fixed;right:20px;bottom:16px;font:600 13px system-ui;color:#fff;background:rgba(0,0,0,.55);padding:6px 12px;border-radius:999px;opacity:0;transition:opacity .3s;pointer-events:none';
    document.body.appendChild(hud);
    let hideT;
    const vis = deck.slides.filter(s => !s.hidden).length;
    const p = new Player(host, deck, { live: true, onChange: pl => { const k = deck.slides.slice(0, pl.index + 1).filter(s => !s.hidden).length; hud.textContent = k + ' / ' + vis; } });
    const poke = () => { hud.style.opacity = 1; clearTimeout(hideT); hideT = setTimeout(() => hud.style.opacity = 0, 1800); };
    const start = Math.max(0, p.first());
    p.go(start, { animate: false });
    document.addEventListener('keydown', e => {
      const k = e.key;
      if (['ArrowRight', 'ArrowDown', ' ', 'PageDown', 'Enter', 'n'].includes(k)) { e.preventDefault(); p.next(); poke(); }
      else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace', 'p'].includes(k)) { e.preventDefault(); p.prev(); poke(); }
      else if (k === 'Home') p.go(p.first(), { animate: false });
      else if (k === 'End') { let j = deck.slides.length - 1; while (j > 0 && deck.slides[j].hidden) j--; p.go(j, { animate: false, built: true }); }
      else if (k === 'f' || k === 'F') { if (!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); else document.exitFullscreen(); }
    });
    host.addEventListener('click', () => { p.next(); poke(); });
    host.addEventListener('contextmenu', e => { e.preventDefault(); p.prev(); poke(); });
    document.addEventListener('mousemove', poke);
    return p;
  }

  /* ---------- Shared CSS ---------- */
  const CSS = `
.sd-slide{position:relative;width:1920px;height:1080px;overflow:hidden;transform-origin:0 0;contain:layout paint;user-select:none;-webkit-user-select:none;isolation:isolate}
.sd-bg{position:absolute;inset:0;overflow:hidden;z-index:0}
.sd-bgimg{position:absolute;inset:0;background-size:cover;background-position:center}
.sd-dim{position:absolute;inset:0;background:#000}
.sd-grain{position:absolute;inset:-50%;opacity:.14;mix-blend-mode:overlay;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.sd-el{position:absolute;box-sizing:border-box;z-index:1}
.sd-pre{visibility:hidden}
.sd-ghost{opacity:.25!important;outline:2px dashed rgba(156,192,255,.6)}
.sd-text{position:absolute;inset:0;display:flex;flex-direction:column;box-sizing:border-box;overflow-wrap:break-word;white-space:pre-wrap}
.sd-shape .sd-text{display:flex}
.sd-tx{outline:none;min-height:1em}
.sd-tx ul,.sd-tx ol{margin:0;padding-left:1.1em}
.sd-tx li{margin:.15em 0}
.sd-tx li::marker{color:inherit}
.sd-tx a{color:inherit}
.sd-gt{-webkit-background-clip:text;background-clip:text;color:transparent!important;-webkit-text-fill-color:transparent}
.sd-svg{position:absolute;inset:0;overflow:visible;display:block}
.sd-imgbox{position:absolute;inset:0;overflow:hidden;box-sizing:border-box}
.sd-imgbox img{width:100%;height:100%;display:block}
.sd-imgph{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:repeating-linear-gradient(135deg,rgba(156,192,255,.08) 0 24px,rgba(156,192,255,.03) 24px 48px);border:3px dashed rgba(156,192,255,.4);color:rgba(156,192,255,.85);font:500 30px system-ui,sans-serif}
.sd-imgph svg{width:96px;height:96px}
.sd-table{width:100%;height:100%;border-collapse:collapse;table-layout:fixed}
.sd-table th,.sd-table td{border-bottom:2px solid;padding:.45em .7em;vertical-align:middle;overflow-wrap:break-word;outline:none}
.sd-table th{font-weight:700}
.sd-code{position:absolute;inset:0;margin:0;padding:1.1em 1.3em;box-sizing:border-box;font-family:'JetBrains Mono',ui-monospace,Consolas,monospace;line-height:1.55;overflow:hidden;white-space:pre;border-radius:18px;tab-size:2;outline:none}
.sd-code.sd-chrome{padding-top:2.6em}
.sd-code.sd-chrome::before{content:"";position:absolute;left:1.2em;top:1em;width:.6em;height:.6em;border-radius:50%;background:#FF5F57;box-shadow:1em 0 0 #FEBC2E,2em 0 0 #28C840}
.sd-ln{counter-reset:ln}
.sd-ln .sd-line::before{counter-increment:ln;content:counter(ln);display:inline-block;width:2.2em;margin-right:1em;text-align:right;opacity:.35}
.sd-ct-night{background:#0A1022;color:#D6E2FF}.sd-ct-night .sd-k{color:#7AA2FF}.sd-ct-night .sd-s{color:#9EE6A0}.sd-ct-night .sd-c{color:#5D6B8F;font-style:italic}.sd-ct-night .sd-n{color:#FFB86B}.sd-ct-night .sd-f{color:#D7A6FF}
.sd-ct-day{background:#F5F7FB;color:#1F2433}.sd-ct-day .sd-k{color:#2F55D4}.sd-ct-day .sd-s{color:#1B8A4B}.sd-ct-day .sd-c{color:#8A93A6;font-style:italic}.sd-ct-day .sd-n{color:#B5560F}.sd-ct-day .sd-f{color:#8A3FD1}
.sd-ct-ocean{background:#011627;color:#D6DEEB}.sd-ct-ocean .sd-k{color:#C792EA}.sd-ct-ocean .sd-s{color:#ECC48D}.sd-ct-ocean .sd-c{color:#637777;font-style:italic}.sd-ct-ocean .sd-n{color:#F78C6C}.sd-ct-ocean .sd-f{color:#82AAFF}
.sd-ct-clear{background:transparent;color:inherit}.sd-ct-clear .sd-k{color:#7AA2FF}.sd-ct-clear .sd-s{color:#9EE6A0}.sd-ct-clear .sd-c{opacity:.5}.sd-ct-clear .sd-n{color:#FFB86B}.sd-ct-clear .sd-f{color:#D7A6FF}
.sd-embed iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.sd-embedph{position:absolute;inset:0;display:flex;flex-direction:column;gap:20px;align-items:center;justify-content:center;background:#05070f;color:#9CC0FF;font:500 32px system-ui,sans-serif;border:3px solid rgba(156,192,255,.25)}
.sd-embedph svg{width:120px;height:120px}
.sd-link{cursor:pointer}
.sd-num{position:absolute;right:56px;bottom:40px;font-size:26px;font-weight:600;z-index:5;font-variant-numeric:tabular-nums}
.sd-anim{position:absolute;inset:0;pointer-events:none}
.sd-thumb .sd-anim *, .sd-thumb .sd-anim{animation-play-state:paused!important}
.sd-aurora i{position:absolute;width:70%;height:85%;border-radius:50%;filter:blur(140px);opacity:.6;animation:sdAur 18s ease-in-out infinite alternate}
.sd-aurora i:nth-child(1){left:-15%;top:-30%}
.sd-aurora i:nth-child(2){right:-20%;top:5%;animation-duration:22s;animation-delay:-6s}
.sd-aurora i:nth-child(3){left:15%;bottom:-45%;animation-duration:26s;animation-delay:-12s}
@keyframes sdAur{0%{transform:translate(0,0) scale(1)}50%{transform:translate(12%,8%) scale(1.15)}100%{transform:translate(-8%,14%) scale(.9)}}
.sd-gridfloor{overflow:hidden;perspective:520px}
.sd-gridfloor b{position:absolute;inset:0}
.sd-gridfloor i{position:absolute;left:-60%;right:-60%;top:52%;height:130%;background-image:linear-gradient(var(--c) 3px,transparent 3px),linear-gradient(90deg,var(--c) 3px,transparent 3px);background-size:120px 120px;transform:rotateX(72deg);transform-origin:50% 0;opacity:.6;animation:sdGrid 2.4s linear infinite;-webkit-mask-image:linear-gradient(to bottom,transparent,#000 35%);mask-image:linear-gradient(to bottom,transparent,#000 35%)}
@keyframes sdGrid{to{background-position:0 120px}}
.sd-stars i{position:absolute;left:0;top:0;border-radius:50%;animation:sdTw 5s ease-in-out infinite alternate}
.sd-stars i:nth-child(2){animation-duration:7s;animation-delay:-2s}
.sd-stars i:nth-child(3){animation:sdTw 3.2s ease-in-out infinite alternate,sdDrift 60s linear infinite}
@keyframes sdTw{from{opacity:.25}to{opacity:1}}
@keyframes sdDrift{to{transform:translateX(-120px)}}
.sd-waves svg{position:absolute;left:0;bottom:0;width:200%;height:42%;animation:sdWave 16s linear infinite}
.sd-waves svg:nth-child(2){animation-duration:11s;animation-direction:reverse;height:36%}
.sd-waves svg:nth-child(3){animation-duration:22s;height:30%}
@keyframes sdWave{to{transform:translateX(-50%)}}
.sd-shift{background-size:300% 300%;opacity:.95;animation:sdShift 14s ease-in-out infinite}
@keyframes sdShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
.sd-orbs i{position:absolute;border-radius:50%;filter:blur(40px);opacity:.5;animation:sdFloat 16s ease-in-out infinite alternate}
@keyframes sdFloat{0%{transform:translate(0,0)}33%{transform:translate(80px,-60px)}66%{transform:translate(-60px,50px)}100%{transform:translate(40px,30px)}}
.sd-beams{overflow:hidden}
.sd-beams i{position:absolute;left:-50%;top:-90%;width:200%;height:280%;opacity:.35;filter:blur(40px);animation:sdSpin 30s linear infinite}
@keyframes sdSpin{to{transform:rotate(360deg)}}
.sd-particles i{position:absolute;bottom:-20px;border-radius:50%;opacity:0;animation:sdRise 12s linear infinite;box-shadow:0 0 18px currentColor}
@keyframes sdRise{0%{transform:translateY(0);opacity:0}10%{opacity:.9}80%{opacity:.6}100%{transform:translateY(-1150px);opacity:0}}
.sd-blueprint i{position:absolute;inset:0;opacity:.35;background-image:linear-gradient(var(--c) 1px,transparent 1px),linear-gradient(90deg,var(--c) 1px,transparent 1px),linear-gradient(var(--c) 2px,transparent 2px),linear-gradient(90deg,var(--c) 2px,transparent 2px);background-size:40px 40px,40px 40px,200px 200px,200px 200px}
.sd-blueprint b{position:absolute;left:0;right:0;height:160px;top:-160px;opacity:.5;animation:sdScan 7s linear infinite}
@keyframes sdScan{to{transform:translateY(1240px)}}
.sd-pulse i{position:absolute;left:50%;top:50%;width:400px;height:400px;margin:-200px 0 0 -200px;border-radius:50%;border:3px solid var(--c);opacity:0;animation:sdPulse 8s ease-out infinite}
.sd-pulse i:nth-child(2){animation-delay:-2s}.sd-pulse i:nth-child(3){animation-delay:-4s}.sd-pulse i:nth-child(4){animation-delay:-6s}
@keyframes sdPulse{0%{transform:scale(.2);opacity:.8}100%{transform:scale(5);opacity:0}}
.sd-player{overflow:hidden;background:#000}
.sd-pv{position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0;perspective:2600px}
.sd-pv>.sd-slide{position:absolute;left:0;top:0;backface-visibility:hidden;-webkit-backface-visibility:hidden}
@media (prefers-reduced-motion: reduce){.sd-anim *,.sd-anim{animation-play-state:paused!important}}
`;
  function injectCSS(doc) {
    doc = doc || document;
    if (doc.getElementById('sd-rt-css')) return;
    const s = doc.createElement('style');
    s.id = 'sd-rt-css';
    s.textContent = CSS;
    doc.head.appendChild(s);
  }

  return {
    W, H, uid, esc, EASE, FONTS, FONT_NAMES, loadFont, fontsOf, fontStack, ICONS, SHAPES, shapePath, CHART_KINDS, chartSVG,
    MASKS, embedUrl, renderEl, renderBg, renderSlide, BG_ANIMS, FX_LABELS, DEF_DUR, runBuild, buildSteps, applyFinal,
    TRANSITIONS, transition, Player, standalone, injectCSS, CSS
  };
}
window.SD = SDRuntimeFactory();
