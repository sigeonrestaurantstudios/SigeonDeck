/* Sigeon Deck — inspector, presenting, export, command palette, keyboard, startup. */
'use strict';

/* ---------- Inspector controls ---------- */
function sec(title, ...kids) { return h('section', { class: 'is' }, h('h4', {}, ...[].concat(title)), ...kids); }
function row(label, ...c) { return h('div', { class: 'ir' }, h('label', {}, label), h('div', { class: 'ic-row' }, ...c)); }
const fmtN = v => v == null || isNaN(v) ? '' : String(Math.round(v * 100) / 100);
function numIn(v, on, o) {
  o = o || {};
  const i = h('input', { class: 'in num', type: 'number', step: String(o.step || 1), 'aria-label': o.label || '' });
  if (o.min != null) i.min = o.min;
  if (o.max != null) i.max = o.max;
  i.value = fmtN(v);
  i.addEventListener('input', () => { let n = parseFloat(i.value); if (isNaN(n)) return; if (o.min != null) n = Math.max(o.min, n); if (o.max != null) n = Math.min(o.max, n); on(n); });
  return i;
}
function slider(v, min, max, step, on, o) {
  o = o || {};
  const r = h('input', { type: 'range', min: String(min), max: String(max), step: String(step), 'aria-label': o.label || '' });
  r.value = v;
  const paint = () => r.style.setProperty('--p', ((r.value - min) / (max - min) * 100) + '%');
  const n = numIn(v, x => { r.value = x; paint(); on(x); }, { min, max, step, label: o.label });
  paint();
  r.addEventListener('input', () => { n.value = fmtN(+r.value); paint(); on(parseFloat(r.value)); });
  return h('div', { class: 'ic-row', style: { flex: '1' } }, r, n);
}
function segc(opts, v, on) {
  const w = h('div', { class: 'segc', role: 'group' });
  opts.forEach(([val, label, ic]) => {
    const b = h('button', { class: val === v ? 'on' : '', title: label, 'aria-label': label, 'aria-pressed': String(val === v), html: ic ? icon(ic) : esc(label) });
    b.addEventListener('click', () => { $$('button', w).forEach(x => { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); }); b.classList.add('on'); b.setAttribute('aria-pressed', 'true'); on(val); });
    w.appendChild(b);
  });
  return w;
}
function selIn(opts, v, on, o) {
  o = o || {};
  const s = h('select', { class: 'in', 'aria-label': o.label || '' });
  opts.forEach(([val, label]) => { const op = h('option', { value: String(val) }, label); if (o.fontPreview) op.style.fontFamily = SD.fontStack(val); s.appendChild(op); });
  s.value = v == null ? '' : String(v);
  s.addEventListener('change', () => on(s.value));
  return s;
}
function tog(v, on, label) {
  const i = h('input', { type: 'checkbox' });
  i.checked = !!v;
  i.addEventListener('change', () => on(i.checked));
  return h('label', { class: 'toggle' }, i, h('i'), label ? h('span', {}, label) : null);
}
function txtIn(v, on, ph) {
  const i = h('input', { class: 'in', value: v || '', placeholder: ph || '' });
  i.addEventListener('change', () => on(i.value.trim()));
  return i;
}
function iconBtn(ic, title, on, active) { return h('button', { class: 'iconbtn' + (active ? ' on' : ''), title, 'aria-label': title, html: icon(ic), onclick: on }); }
function lblIn(label, input) { return h('div', { class: 'lbl-in' }, h('span', {}, label), input); }
const PALETTE = ['#FFFFFF', '#E9EFFC', '#A3ACC2', '#56627F', '#1C2333', '#000000', '#0B1430', '#13274F',
  '#2E6BFF', '#9CC0FF', '#00C2FF', '#2BD4C9', '#3DDC97', '#C9E265', '#FFE14D', '#FFC145',
  '#FF8A3D', '#FF5A6A', '#FF4FA3', '#C77DFF', '#8B6CFF', '#5B2BFF', '#7B2FF7', '#B4362C'];
const cx2d = document.createElement('canvas').getContext('2d');
function toHex(v) {
  if (!v) return null;
  if (/^#[0-9a-f]{6}$/i.test(v)) return v;
  if (/^#[0-9a-f]{3}$/i.test(v)) return '#' + v.slice(1).split('').map(c => c + c).join('');
  cx2d.fillStyle = '#000'; cx2d.fillStyle = v;
  return /^#/.test(cx2d.fillStyle) ? cx2d.fillStyle : null;
}
function addRecent(c) { if (!c) return; S.recentColors = [c, ...S.recentColors.filter(x => x !== c)].slice(0, 8); savePrefs(); }
function openColorPop(anchor, v, on, o) {
  o = o || {};
  const t = th();
  const themeCols = [t.text, t.muted, t.accent, t.accent2, t.bg, t.surface, t.line, t.onAccent].filter((c, i, a) => c && a.indexOf(c) === i);
  const pick = c => { addRecent(c); on(c); closePop(); };
  const swb = c => h('button', { style: { background: c }, title: c, 'aria-label': c, onclick: () => pick(c) });
  const wrap = h('div', { class: 'colorpop' }, h('h5', {}, 'Theme'), h('div', { class: 'cgrid' }, ...themeCols.map(swb)));
  if (S.recentColors.length) wrap.append(h('h5', {}, 'Recent'), h('div', { class: 'cgrid' }, ...S.recentColors.map(swb)));
  wrap.append(h('h5', {}, 'Palette'), h('div', { class: 'cgrid' }, ...PALETTE.map(swb)));
  const native = h('input', { type: 'color', 'aria-label': 'Custom color' });
  native.value = toHex(v) || '#2E6BFF';
  native.addEventListener('input', () => on(native.value));
  native.addEventListener('change', () => addRecent(native.value));
  const r = h('div', { class: 'crow' }, native, h('span', { class: 'hint' }, 'Custom color'));
  if (o.none) r.append(h('button', { class: 'btn sm ghost', style: { marginLeft: 'auto' }, onclick: () => pick(null) }, 'None'));
  wrap.append(r);
  openPop(anchor, wrap, { focus: false });
}
function colorIn(v, on, o) {
  o = o || {};
  const sw = h('button', { class: 'sw' + (v ? '' : ' none'), title: 'Choose a color', 'aria-label': 'Choose a color' }, h('i', { style: { background: v || 'transparent' } }));
  const hex = h('input', { class: 'in', value: v || '', placeholder: o.none ? 'None' : '#', 'aria-label': 'Color value', spellcheck: 'false' });
  const set = c => { v = c; sw.classList.toggle('none', !c); sw.firstChild.style.background = c || 'transparent'; if (document.activeElement !== hex) hex.value = c || ''; on(c || null); };
  sw.addEventListener('click', () => openColorPop(sw, v, set, o));
  hex.addEventListener('change', () => {
    const c = hex.value.trim();
    if (!c) { if (o.none) set(null); else hex.value = v || ''; return; }
    if (CSS.supports('color', c)) set(c); else hex.value = v || '';
  });
  return h('div', { class: 'colorctl' }, sw, hex);
}

/* ---------- Property setting ---------- */
function setPath(o, path, v) { const ks = path.split('.'); let t = o; for (let i = 0; i < ks.length - 1; i++) { if (t[ks[i]] == null || typeof t[ks[i]] !== 'object') t[ks[i]] = {}; t = t[ks[i]]; } t[ks[ks.length - 1]] = v; }
function setP(prop, val, o) {
  o = o || {};
  const els = selEls();
  if (!els.length) return;
  mutate(() => els.forEach(el => { if (o.types && !o.types.includes(el.type)) return; setPath(el, prop, val); }), { key: 'p:' + prop + ':' + S.sel.join(','), insp: !!o.insp });
}
function setFn(fn, key, insp) { const els = selEls(); if (!els.length) return; mutate(() => els.forEach(fn), { key, insp: !!insp }); }

/* ---------- Inspector ---------- */
function syncTabs() { $$('.insp-tabs button').forEach(b => { const on = b.dataset.tab === S.tab; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); }); }
function renderInspector() {
  if (!S.deck) return;
  const body = $('#inspBody'), st = body.scrollTop;
  const tabKey = S.tab + '|' + S.sel.join(',') + '|' + S.si;
  syncTabs();
  body.innerHTML = '';
  const content = S.tab === 'animate' ? tabAnimate() : S.tab === 'slide' ? tabSlide() : S.tab === 'deck' ? tabDeck() : tabFormat();
  content.forEach(c => c && body.appendChild(c));
  if (S.lastTabKey === tabKey) body.scrollTop = st;
  S.lastTabKey = tabKey;
}
const TYPE_NAME = { text: 'Text', shape: 'Shape', image: 'Image', table: 'Table', chart: 'Chart', code: 'Code', icon: 'Icon', line: 'Line', embed: 'Video' };
function elName(el) {
  let s = '';
  if (el.html) s = strip(el.html);
  if (el.type === 'code') s = (el.code || '').split('\n')[0];
  if (el.type === 'icon') s = el.icon;
  if (el.type === 'chart') s = (SD.CHART_KINDS.find(k => k[0] === el.chart.kind) || [, ''])[1];
  if (el.type === 'image') s = el.alt || '';
  return s ? `${TYPE_NAME[el.type]}: ${s.slice(0, 42)}` : TYPE_NAME[el.type];
}

function tabFormat() {
  const els = selEls();
  if (!els.length) {
    const s = cur();
    return [h('div', { class: 'empty-insp' },
      h('h3', {}, 'Nothing selected'),
      h('p', { class: 'hint' }, 'Click an object to format it, or double-click text to edit. Drag on empty space to select several things at once.'),
      h('div', { class: 'quickgrid' },
        ...[['text', 'Text', () => insertText('body')], ['shape', 'Shape', () => insertShape('rect')], ['image', 'Image', () => pickImage(src => insertImageSrc(src))],
          ['chart', 'Chart', () => insertChart('bar')], ['table', 'Table', insertTable], ['code', 'Code', insertCode]].map(([ic, l, fn]) => h('button', { onclick: fn, html: icon(ic) + `<span>${l}</span>` })))),
    sec('Slide background', row('Color', colorIn(s.bg.color, c => mutate(() => { s.bg.color = c || '#000000'; s.bg.grad = null; }, { key: 'bgc' })))),
    h('div', { class: 'is' }, h('button', { class: 'btn ghost sm block', onclick: () => { S.tab = 'slide'; renderInspector(); } }, 'More slide options'))];
  }
  const el = els[0], types = [...new Set(els.map(e => e.type))], one = types.length === 1 ? types[0] : null;
  const out = [];
  if (S.editing && (el.type === 'text' || el.type === 'shape')) out.push(richBar());
  if (els.every(e => e.type === 'text' || e.type === 'shape')) out.push(textSec(el));
  if (one === 'text') out.push(boxSec(el));
  if (one === 'shape') out.push(shapeSec(el));
  if (one === 'image') out.push(imageSec(el));
  if (one === 'table') out.push(tableSec(el));
  if (one === 'chart') out.push(chartSec(el));
  if (one === 'code') out.push(codeSec(el));
  if (one === 'icon') out.push(iconSec(el));
  if (one === 'line') out.push(lineSec(el));
  if (one === 'embed') out.push(sec('Video', row('Link', txtIn(el.url, v => setP('url', v), 'https://youtube.com/…')), h('p', { class: 'hint' }, 'The video plays while presenting. In the editor it stays still so you can move it.')));
  out.push(effectsSec(el), arrangeSec(els));
  if (els.length === 1) out.push(sec('Link', row('Opens', txtIn(el.link, v => setP('link', v || null), 'https://…')), h('p', { class: 'hint' }, 'Clicking this object while presenting opens the address in a new tab.')));
  return out;
}
function richBar() {
  const cmd = (c, v) => e => { e.preventDefault(); document.execCommand(c, false, v); onEditInput(); };
  const b = (label, title, c, v) => h('button', { class: 'keep-edit', title, 'aria-label': title, html: label, onmousedown: cmd(c, v) });
  return sec('Selected text',
    h('div', { class: 'richbar' },
      b('<b>B</b>', 'Bold (Ctrl+B)', 'bold'), b('<i>I</i>', 'Italic (Ctrl+I)', 'italic'), b('<u>U</u>', 'Underline (Ctrl+U)', 'underline'),
      b('<s>S</s>', 'Strikethrough', 'strikeThrough'), b(icon('ul'), 'Bulleted list', 'insertUnorderedList'), b(icon('ol'), 'Numbered list', 'insertOrderedList'),
      b('x<sup>2</sup>', 'Superscript', 'superscript'), b('T<sub>x</sub>', 'Clear formatting', 'removeFormat')),
    h('div', { class: 'richbar', style: { marginTop: '8px' } }, ...[th().accent, th().accent2, th().text, th().muted, '#FF5A6A', '#FFC145'].map(c =>
      h('button', { class: 'keep-edit', title: `Color selected text ${c}`, 'aria-label': `Color selected text ${c}`, style: { background: c, borderColor: 'transparent' }, onmousedown: cmd('foreColor', c) }))),
    h('p', { class: 'hint', style: { marginTop: '10px' } }, 'These apply to the highlighted words. The controls below style the whole box.'));
}
function textSec(el) {
  const t = th();
  const fonts = SD.FONT_NAMES.map(f => [f, f]);
  if (el.font && !SD.FONTS[el.font]) fonts.unshift([el.font, el.font]);
  return sec('Text',
    row('Font', selIn(fonts, el.font, v => { SD.loadFont(v); setP('font', v); }, { fontPreview: true, label: 'Font' })),
    row('Size', slider(el.size || 40, 8, 400, 1, v => setP('size', v), { label: 'Font size' })),
    row('Weight', selIn([[200, 'Thin'], [300, 'Light'], [400, 'Regular'], [500, 'Medium'], [600, 'Semibold'], [700, 'Bold'], [800, 'Extra bold'], [900, 'Black']], el.weight || 400, v => setP('weight', +v), { label: 'Font weight' })),
    row('Color', colorIn(el.color, c => setP('color', c || t.text))),
    row('Style', h('div', { class: 'btnrow' },
      h('button', { class: 'iconbtn' + (el.italic ? ' on' : ''), title: 'Italic', 'aria-label': 'Italic', html: '<i style="font-family:serif;font-size:16px">I</i>', onclick: () => setP('italic', !el.italic, { insp: true }) }),
      h('button', { class: 'iconbtn' + (el.underline ? ' on' : ''), title: 'Underline', 'aria-label': 'Underline', html: '<u>U</u>', onclick: () => setP('underline', !el.underline, { insp: true }) }),
      h('button', { class: 'iconbtn' + (el.upper ? ' on' : ''), title: 'All capitals', 'aria-label': 'All capitals', html: '<span style="font-size:11px;font-weight:700">AA</span>', onclick: () => setP('upper', !el.upper, { insp: true }) }),
      h('button', { class: 'iconbtn' + (el.tshadow ? ' on' : ''), title: 'Text glow', 'aria-label': 'Text glow', html: '<span style="text-shadow:0 0 6px #9CC0FF;font-weight:700">G</span>', onclick: () => setP('tshadow', el.tshadow ? null : `0 0 40px ${t.accent}AA, 0 0 90px ${t.accent}55`, { insp: true }) }))),
    row('Align', segc([['left', 'Align left', 'ta-l'], ['center', 'Center', 'ta-c'], ['right', 'Align right', 'ta-r'], ['justify', 'Justify', 'ta-j']], el.align || 'left', v => setP('align', v))),
    row('Position', segc([['top', 'Top', 'va-t'], ['middle', 'Middle', 'va-m'], ['bottom', 'Bottom', 'va-b']], el.valign || 'top', v => setP('valign', v))),
    row('Line height', slider(el.lh || 1.2, .7, 3, .05, v => setP('lh', v))),
    row('Spacing', slider(el.ls || 0, -.1, .6, .01, v => setP('ls', v))),
    row('Gradient', tog(el.gradText, v => setP('gradText', v, { insp: true })), el.gradText ? colorIn(el.color2 || t.accent2, c => setP('color2', c)) : null)
  );
}
function fillRows(el, opts) {
  opts = opts || {};
  const t = th();
  return [
    row('Fill', colorIn(el.fill, c => setP('fill', c, { insp: !el.fill !== !c }), { none: true })),
    el.fill ? row('Gradient', tog(!!el.fill2, v => setP('fill2', v ? t.accent2 : null, { insp: true })), el.fill2 ? colorIn(el.fill2, c => setP('fill2', c || null)) : null) : null,
    el.fill && el.fill2 ? row('Angle', slider(el.fillAngle == null ? 135 : el.fillAngle, 0, 360, 1, v => setP('fillAngle', v))) : null,
    row('Border', colorIn(el.strokeW ? el.stroke : null, c => { if (!c) setP('strokeW', 0, { insp: true }); else { setFn(e => { e.stroke = c; if (!e.strokeW) e.strokeW = 4; }, 'stroke'); renderInspector(); } }, { none: true })),
    el.strokeW ? row('Width', slider(el.strokeW, 1, 40, 1, v => setP('strokeW', v))) : null,
    el.strokeW ? row('Style', segc([['solid', 'Solid'], ['dashed', 'Dashed'], ['dotted', 'Dotted']], el.dash || 'solid', v => setP('dash', v))) : null,
    opts.radius ? row('Corners', slider(el.radius || 0, 0, 300, 1, v => setP('radius', v))) : null
  ];
}
function boxSec(el) {
  return sec('Box', ...fillRows(el, { radius: true }),
    row('Padding', slider(el.pad || 0, 0, 200, 1, v => setP('pad', v))),
    row('Auto height', tog(el.autoH, v => setP('autoH', v, { insp: true }), 'Grow with text')));
}
function shapeSec(el) {
  return sec('Shape',
    row('Shape', selIn(SD.SHAPES, el.shape, v => setP('shape', v, { insp: true }), { label: 'Shape' })),
    ...fillRows(el, { radius: el.shape === 'rect' || el.shape === 'bubble' }),
    row('Padding', slider(el.pad || 0, 0, 200, 1, v => setP('pad', v))));
}
function imageSec(el) {
  const f = el.filters || {};
  const fl = (k, label, min, max, def) => row(label, slider(f[k] == null ? def : f[k], min, max, 1, v => setP('filters.' + k, v)));
  return sec('Image',
    row('Picture', h('button', { class: 'btn ghost sm', onclick: () => pickImage(src => mutate(() => { el.src = src; }, { insp: true })) }, el.src ? 'Replace' : 'Choose image')),
    row('Fit', segc([['cover', 'Fill frame'], ['contain', 'Show all']], el.fit || 'cover', v => setP('fit', v))),
    row('Mask', selIn([['none', 'None'], ['circle', 'Circle'], ['hexagon', 'Hexagon'], ['diamond', 'Diamond'], ['triangle', 'Triangle'], ['slant', 'Slant'], ['star', 'Star']], el.mask || 'none', v => setP('mask', v, { insp: true }))),
    (!el.mask || el.mask === 'none') ? row('Corners', slider(el.radius || 0, 0, 400, 1, v => setP('radius', v))) : null,
    row('Focus X', slider(el.px == null ? 50 : el.px, 0, 100, 1, v => setP('px', v))),
    row('Focus Y', slider(el.py == null ? 50 : el.py, 0, 100, 1, v => setP('py', v))),
    fl('bright', 'Brightness', 0, 200, 100), fl('contrast', 'Contrast', 0, 200, 100), fl('sat', 'Saturation', 0, 300, 100),
    fl('gray', 'Grayscale', 0, 100, 0), fl('sepia', 'Sepia', 0, 100, 0), fl('hue', 'Hue', 0, 360, 0),
    row('Border', colorIn(el.strokeW ? el.stroke : null, c => { if (!c) setP('strokeW', 0, { insp: true }); else { setFn(e => { e.stroke = c; if (!e.strokeW) e.strokeW = 6; }, 'stroke'); renderInspector(); } }, { none: true })),
    el.strokeW ? row('Width', slider(el.strokeW, 1, 40, 1, v => setP('strokeW', v))) : null,
    row('Alt text', txtIn(el.alt, v => setP('alt', v), 'Describe the image')),
    h('button', { class: 'btn ghost sm', style: { marginTop: '4px' }, onclick: () => setP('filters', {}, { insp: true }) }, 'Reset adjustments'));
}
function tableSec(el) {
  const T = el.table;
  const addRow = d => mutate(() => { if (d > 0) T.rows.push(T.rows[0].map(() => '')); else if (T.rows.length > 1) T.rows.pop(); el.h = Math.max(60, Math.round(el.h * T.rows.length / (T.rows.length - d))); }, { insp: true });
  const addCol = d => mutate(() => { T.rows.forEach(r => { if (d > 0) r.push(''); else if (r.length > 1) r.pop(); }); }, { insp: true });
  return sec('Table',
    row('Rows', h('div', { class: 'btnrow' }, iconBtn('minus', 'Remove a row', () => addRow(-1)), h('span', { style: { minWidth: '28px', textAlign: 'center', alignSelf: 'center' } }, String(T.rows.length)), iconBtn('plus', 'Add a row', () => addRow(1)))),
    row('Columns', h('div', { class: 'btnrow' }, iconBtn('minus', 'Remove a column', () => addCol(-1)), h('span', { style: { minWidth: '28px', textAlign: 'center', alignSelf: 'center' } }, String(T.rows[0].length)), iconBtn('plus', 'Add a column', () => addCol(1)))),
    row('Header row', tog(T.header !== false, v => setP('table.header', v))),
    row('Stripes', tog(T.stripe, v => setP('table.stripe', v))),
    row('Header fill', colorIn(T.headBg, c => setP('table.headBg', c || 'transparent'), { none: true })),
    row('Header text', colorIn(T.headColor, c => setP('table.headColor', c))),
    row('Text', colorIn(T.color, c => setP('table.color', c))),
    row('Lines', colorIn(T.border, c => setP('table.border', c || 'transparent'), { none: true })),
    row('Fill', colorIn(T.bg, c => setP('table.bg', c), { none: true })),
    row('Font', selIn(SD.FONT_NAMES.map(f => [f, f]), el.font, v => { SD.loadFont(v); setP('font', v); }, { fontPreview: true })),
    row('Size', slider(el.size || 28, 10, 80, 1, v => setP('size', v))),
    row('Align', segc([['left', 'Left', 'ta-l'], ['center', 'Center', 'ta-c'], ['right', 'Right', 'ta-r']], T.align || 'left', v => setP('table.align', v))),
    row('Corners', slider(el.radius || 0, 0, 60, 1, v => setP('radius', v))),
    h('p', { class: 'hint' }, 'Double-click a cell to type. Tab moves to the next cell.'));
}
function chartToCSV(c) {
  const head = ['label', ...c.series.map(s => s.name)].join(', ');
  return [head, ...c.labels.map((l, i) => [l, ...c.series.map(s => s.values[i] == null ? '' : s.values[i])].join(', '))].join('\n');
}
function csvToChart(txt, c) {
  const rows = txt.split(/\r?\n/).map(r => r.split(/[,\t;]/).map(x => x.trim())).filter(r => r.some(Boolean));
  if (rows.length < 2) return null;
  const names = rows[0].slice(1);
  const labels = rows.slice(1).map(r => r[0]);
  const series = names.map((n, j) => ({ name: n || `Series ${j + 1}`, values: rows.slice(1).map(r => parseFloat(String(r[j + 1] || '').replace(/[^0-9.\-]/g, '')) || 0) }));
  return { labels, series };
}
function chartSec(el) {
  const c = el.chart;
  const ta = h('textarea', { class: 'in', id: 'chartData', rows: String(Math.min(10, c.labels.length + 2)), spellcheck: 'false', style: { fontFamily: 'ui-monospace,Consolas,monospace', fontSize: '12px' } });
  ta.value = chartToCSV(c);
  ta.addEventListener('input', () => { const d = csvToChart(ta.value, c); if (d) mutate(() => { c.labels = d.labels; c.series = d.series; }, { key: 'chartdata' }); });
  const pie = c.kind === 'pie' || c.kind === 'donut';
  const n = pie ? c.labels.length : c.series.length;
  const cols = [];
  for (let i = 0; i < Math.min(n, 8); i++) cols.push(row(pie ? (c.labels[i] || `Slice ${i + 1}`) : (c.series[i].name || `Series ${i + 1}`), colorIn((c.colors || [])[i] || '#2E6BFF', col => mutate(() => { c.colors = c.colors || []; c.colors[i] = col; }, { key: 'chcol' + i }))));
  return sec('Chart',
    row('Type', selIn(SD.CHART_KINDS, c.kind, v => setP('chart.kind', v, { insp: true }))),
    h('div', { class: 'ir full' }, h('label', { for: 'chartData' }, 'Data. First row holds series names, then one row per label.'), ta),
    ...cols,
    row('Values', tog(c.values !== false, v => setP('chart.values', v))),
    row('Legend', tog(c.legend !== false, v => setP('chart.legend', v))),
    pie ? null : row('Gridlines', tog(c.gridlines !== false, v => setP('chart.gridlines', v))),
    row('Text', colorIn(c.text, col => setP('chart.text', col))),
    pie ? null : row('Grid color', colorIn(c.grid, col => setP('chart.grid', col))),
    row('Prefix', txtIn(c.prefix, v => setP('chart.prefix', v), '$')),
    row('Suffix', txtIn(c.suffix, v => setP('chart.suffix', v), '%')),
    row('Text size', slider(c.fs || Math.max(16, Math.round(Math.min(el.w, el.h) / 24)), 10, 60, 1, v => setP('chart.fs', v))),
    row('Font', selIn(SD.FONT_NAMES.map(f => [f, f]), el.font, v => { SD.loadFont(v); setP('font', v); }, { fontPreview: true })));
}
function codeSec(el) {
  return sec('Code',
    row('Edit', h('button', { class: 'btn ghost sm', onclick: () => beginEdit(el.id, { selectAll: false }) }, 'Edit code')),
    row('Theme', segc([['night', 'Night'], ['ocean', 'Ocean'], ['day', 'Day'], ['clear', 'Clear']], el.codeTheme || 'night', v => setP('codeTheme', v))),
    row('Size', slider(el.size || 28, 10, 80, 1, v => setP('size', v))),
    row('Line numbers', tog(el.lineNo, v => setP('lineNo', v))),
    row('Window bar', tog(el.chrome, v => setP('chrome', v))),
    row('Corners', slider(el.radius == null ? 18 : el.radius, 0, 60, 1, v => setP('radius', v))),
    h('p', { class: 'hint' }, 'Double-click the code on the slide to edit it. Keywords, strings, numbers and comments are colored automatically.'));
}
function iconSec(el) {
  const btn = h('button', { class: 'btn ghost sm', html: icon(el.icon) + '<span>Change icon</span>' });
  btn.addEventListener('click', () => iconPicker(btn, n => setP('icon', n, { insp: true })));
  return sec('Icon', row('Icon', btn),
    row('Color', colorIn(el.color, c => setP('color', c))),
    row('Stroke', slider(el.sw || 1.6, .5, 4, .1, v => setP('sw', v))),
    row('Background', colorIn(el.bg, c => setP('bg', c, { insp: !el.bg !== !c }), { none: true })),
    el.bg ? row('Badge', segc([['circle', 'Circle'], ['square', 'Rounded square']], el.bgShape || 'circle', v => setP('bgShape', v))) : null);
}
function lineSec(el) {
  return sec('Line',
    row('Color', colorIn(el.stroke, c => setP('stroke', c))),
    row('Width', slider(el.strokeW || 6, 1, 40, 1, v => setP('strokeW', v))),
    row('Style', segc([['solid', 'Solid'], ['dashed', 'Dashed'], ['dotted', 'Dotted']], el.dash || 'solid', v => setP('dash', v))),
    row('Arrows', tog(el.arrowStart, v => setP('arrowStart', v), 'Start'), tog(el.arrowEnd, v => setP('arrowEnd', v), 'End')),
    h('p', { class: 'hint' }, 'Drag the rotate handle to angle the line. Hold Shift to snap to 15°.'));
}
const SHADOWS = { none: null, soft: { x: 0, y: 18, b: 40, c: 'rgba(0,0,0,.35)' }, lifted: { x: 0, y: 40, b: 80, c: 'rgba(0,0,0,.55)' }, hard: { x: 16, y: 16, b: 0, c: 'rgba(0,0,0,.9)' }, color: { x: 0, y: 24, b: 60, c: 'rgba(46,107,255,.55)' } };
function shadowKey(s) { if (!s) return 'none'; for (const [k, v] of Object.entries(SHADOWS)) if (v && v.x === s.x && v.y === s.y && v.b === s.b) return k; return 'custom'; }
function effectsSec(el) {
  const sk = shadowKey(el.shadow);
  return sec('Effects',
    row('Opacity', slider(Math.round((el.opacity == null ? 1 : el.opacity) * 100), 0, 100, 1, v => setP('opacity', v / 100))),
    row('Shadow', selIn([['none', 'None'], ['soft', 'Soft'], ['lifted', 'Lifted'], ['hard', 'Hard offset'], ['color', 'Blue glow'], ...(sk === 'custom' ? [['custom', 'Custom']] : [])], sk, v => { if (v !== 'custom') setP('shadow', SHADOWS[v] ? deep(SHADOWS[v]) : null, { insp: true }); })),
    el.shadow ? row('Shadow color', colorIn(el.shadow.c, c => setP('shadow.c', c || 'rgba(0,0,0,.4)'))) : null,
    row('Glow', colorIn(el.glow, c => setP('glow', c, { insp: !el.glow !== !c }), { none: true })),
    el.glow ? row('Glow size', slider(el.glowSize || 28, 4, 120, 1, v => setP('glowSize', v))) : null,
    row('Blur', slider(el.blur || 0, 0, 40, 1, v => setP('blur', v))),
    row('Blend', selIn([['normal', 'Normal'], ['multiply', 'Multiply'], ['screen', 'Screen'], ['overlay', 'Overlay'], ['soft-light', 'Soft light'], ['difference', 'Difference'], ['color-dodge', 'Dodge'], ['luminosity', 'Luminosity']], el.blend || 'normal', v => setP('blend', v))));
}
function arrangeSec(els) {
  const el = els[0], one = els.length === 1;
  const geo = (k, label) => lblIn(label, numIn(el[k], v => { setFn(e => { e[k] = Math.round(v); if (k === 'h' && e.type === 'text') e.autoH = false; }, 'geo' + k); drawOverlay(); }, { label }));
  return sec(['Arrange', h('small', {}, one ? TYPE_NAME[el.type] : `${els.length} objects`)],
    one ? h('div', { class: 'pair', style: { marginBottom: '8px' } }, geo('x', 'X'), geo('y', 'Y'), geo('w', 'W'), geo('h', 'H')) : null,
    one ? row('Rotate', slider(el.rot || 0, -180, 180, 1, v => setP('rot', v))) : null,
    row('Align', h('div', { class: 'btnrow' }, ...[['l', 'al-l', 'Align left'], ['c', 'al-c', 'Align centers'], ['r', 'al-r', 'Align right'], ['t', 'al-t', 'Align top'], ['m', 'al-m', 'Align middles'], ['b', 'al-b', 'Align bottom']].map(([k, ic, l]) => iconBtn(ic, l + (one ? ' of slide' : ''), () => alignEls(k))))),
    els.length > 2 ? row('Distribute', h('div', { class: 'btnrow' }, iconBtn('di-h', 'Space evenly across', () => alignEls('dh')), iconBtn('di-v', 'Space evenly down', () => alignEls('dv')))) : null,
    row('Order', h('div', { class: 'btnrow' }, iconBtn('front', 'Bring to front', () => arrange('front')), iconBtn('fwd', 'Bring forward', () => arrange('forward')), iconBtn('bwd', 'Send backward', () => arrange('backward')), iconBtn('back', 'Send to back', () => arrange('back')))),
    row('Lock', tog(el.locked, v => setP('locked', v, { insp: true }), 'Stop accidental moves')),
    row('Presenting', tog(!el.hidden, v => setP('hidden', !v, { insp: true }), 'Show this object')),
    h('div', { class: 'btnrow', style: { marginTop: '8px' } }, h('button', { class: 'btn ghost sm', onclick: duplicateEls, html: icon('dup') + 'Duplicate' }), h('button', { class: 'btn danger sm', onclick: deleteSel, html: icon('trash') + 'Delete' })));
}

/* ---------- Animate tab ---------- */
function tabAnimate() {
  const s = cur(), els = selEls(), out = [];
  if (els.length) {
    const kind = S.fxKind || 'in';
    out.push(sec('Add a build',
      segc([['in', 'Build in'], ['emph', 'Emphasis'], ['out', 'Build out']], kind, v => { S.fxKind = v; renderInspector(); }),
      h('div', { class: 'fxgrid', style: { marginTop: '10px' } }, ...SD.FX_LABELS[kind].map(([fx, label]) => h('button', { title: `Add ${label}`, onclick: () => addBuild(kind, fx) }, h('i', { class: 'dot' }), label))),
      h('p', { class: 'hint', style: { marginTop: '10px' } }, 'Each click adds a build and plays it once so you can see it.')));
  } else out.push(sec('Add a build', h('p', { class: 'hint' }, 'Select an object on the slide, then choose how it enters, draws attention, or leaves.')));
  const list = h('div', { class: 'buildlist' });
  s.builds.forEach((b, i) => {
    const el = s.els.find(e => e.id === b.el);
    if (!el) return;
    const upd = (k, v) => mutate(() => { b[k] = v; }, { key: 'b:' + b.id + k, canvas: false });
    list.appendChild(h('div', { class: 'bl' + (S.sel.includes(b.el) ? ' sel' : '') },
      h('div', { class: 'bl-top' },
        h('span', { class: 'bl-n' }, String(i + 1)),
        h('span', { class: 'bl-name', title: elName(el), onclick: () => { S.sel = [b.el]; drawOverlay(); renderInspector(); } }, elName(el)),
        h('span', { class: 'bl-kind ' + b.kind }, { in: 'In', emph: 'Emphasis', out: 'Out' }[b.kind]),
        h('button', { class: 'iconbtn sm', title: 'Play this build', 'aria-label': 'Play this build', html: icon('play'), onclick: () => previewFx(el, b) }),
        h('button', { class: 'iconbtn sm', title: 'Move earlier', 'aria-label': 'Move earlier', html: icon('fwd'), disabled: i === 0, onclick: () => mutate(() => { [s.builds[i - 1], s.builds[i]] = [s.builds[i], s.builds[i - 1]]; }, { insp: true }) }),
        h('button', { class: 'iconbtn sm', title: 'Remove build', 'aria-label': 'Remove build', html: icon('x'), onclick: () => mutate(() => { s.builds.splice(i, 1); }, { insp: true }) })),
      h('div', { class: 'bl-grid' },
        selIn(SD.FX_LABELS[b.kind], b.fx, v => upd('fx', v), { label: 'Effect' }),
        selIn([['click', 'On click'], ['with', 'With previous'], ['after', 'After previous']], b.trigger || 'click', v => upd('trigger', v), { label: 'Start' }),
        lblIn('Time', numIn(b.dur || SD.DEF_DUR[b.kind], v => upd('dur', v), { step: .1, min: .1, max: 20, label: 'Duration in seconds' })),
        lblIn('Delay', numIn(b.delay || 0, v => upd('delay', v), { step: .1, min: 0, max: 30, label: 'Delay in seconds' })))));
  });
  out.push(sec(['Build order', h('small', {}, s.builds.length ? `${SD.buildSteps(s).length} clicks` : '')],
    s.builds.length ? list : h('p', { class: 'hint' }, 'No builds on this slide yet.'),
    s.builds.length ? h('div', { class: 'btnrow', style: { marginTop: '10px' } },
      h('button', { class: 'btn ghost sm', onclick: previewBuilds, html: icon('play') + 'Preview builds' }),
      h('button', { class: 'btn ghost sm', onclick: () => mutate(() => { s.builds = []; }, { insp: true }) }, 'Remove all')) : null));
  const tr = s.transition || { type: 'none', dur: .8 };
  out.push(sec('Transition into this slide',
    h('div', { class: 'fxgrid trgrid' }, ...SD.TRANSITIONS.map(([t, l]) => h('button', { class: (tr.type || 'none') === t ? 'on' : '', title: l, onclick: () => { mutate(() => { s.transition = { type: t, dur: tr.dur || .8 }; }, { key: 'tr', insp: true, nav: false }); if (t !== 'none') previewTransition(); } }, h('i', { class: 'mini' }), l))),
    tr.type === 'magic' ? h('p', { class: 'hint', style: { marginTop: '10px' } }, 'Magic Morph moves, resizes and recolors objects that also appear on the previous slide. Duplicate a slide and rearrange it to try it.') : null,
    h('div', { style: { marginTop: '12px' } }, row('Duration', slider(tr.dur || .8, .1, 4, .1, v => mutate(() => { s.transition = Object.assign({}, s.transition || { type: 'fade' }, { dur: v }); }, { key: 'trd', canvas: false })))),
    h('div', { class: 'btnrow' },
      h('button', { class: 'btn ghost sm', onclick: previewTransition, html: icon('play') + 'Preview' }),
      h('button', { class: 'btn ghost sm', onclick: () => { mutate(() => S.deck.slides.forEach(x => { x.transition = deep(s.transition || tr); }), { nav: true }); toast('Transition applied to every slide'); } }, 'Use on all slides'))));
  out.push(sec('Timing', row('Auto-advance', slider(s.auto || 0, 0, 60, .5, v => mutate(() => { s.auto = v; }, { key: 'auto', canvas: false }))),
    h('p', { class: 'hint' }, 'Seconds to wait after the last build before moving on. Leave at 0 to wait for a click.')));
  return out;
}
function addBuild(kind, fx) {
  const els = selEls();
  if (!els.length) return;
  const s = cur(), added = [];
  mutate(() => els.forEach(el => { const b = { id: uid(), el: el.id, kind, fx, dur: SD.DEF_DUR[kind], delay: 0, trigger: 'click' }; s.builds.push(b); added.push([el, b]); }), { insp: true });
  added.forEach(([el, b]) => previewFx(el, b));
}
function previewFx(el, b) {
  const n = nodeOf(el.id);
  if (!n) return;
  const a = SD.runBuild(n, el, b, 0);
  a.addEventListener('finish', () => { n.style.visibility = ''; });
}
function previewHost() {
  const sz = $('#sizer');
  const host = h('div', { class: 'preview-host', style: { left: '0', top: '0', width: sz.style.width, height: sz.style.height } });
  sz.appendChild(host);
  host.addEventListener('pointerdown', e => { e.stopPropagation(); stopPreview(); });
  return host;
}
function stopPreview() {
  if (!S.preview) return;
  clearTimeout(S.preview.t);
  S.preview.p.destroy();
  S.preview.host.remove();
  S.preview = null;
}
function previewBuilds() {
  endEdit(); stopPreview();
  if (S.view !== 'edit') setView('edit');
  const host = previewHost();
  const p = new SD.Player(host, S.deck, { live: false });
  S.preview = { p, host };
  p.go(S.si, { animate: false });
  const tick = () => {
    if (!S.preview) return;
    if (p.step < p.steps.length) { const st = p.steps[p.step]; p.next(); S.preview.t = setTimeout(tick, st.end + 500); }
    else S.preview.t = setTimeout(stopPreview, 900);
  };
  S.preview.t = setTimeout(tick, p.step > 0 ? p.steps[0].end + 500 : 450);
}
function previewTransition() {
  endEdit(); stopPreview();
  if (S.view !== 'edit') setView('edit');
  const s = cur(), prev = S.deck.slides[S.si - 1] || { id: 'x', bg: { color: '#000000' }, els: [], builds: [] };
  const tmp = Object.assign({}, S.deck, { slides: [prev, s] });
  const host = previewHost();
  const p = new SD.Player(host, tmp, { live: false });
  S.preview = { p, host };
  p.go(0, { animate: false, built: true });
  S.preview.t = setTimeout(() => {
    if (!S.preview) return;
    p.go(1, { dir: 1 });
    const steps = SD.buildSteps(s);
    const extra = steps[0] && steps[0].auto ? steps[0].end : 0;
    S.preview.t = setTimeout(stopPreview, ((s.transition && s.transition.dur) || .8) * 1000 + extra + 900);
  }, 350);
}

/* ---------- Slide tab ---------- */
function tabSlide() {
  const s = cur(), bg = s.bg, t = th();
  const type = bg.img ? 'image' : bg.grad ? 'gradient' : 'solid';
  const setBg = (fn, key, insp) => mutate(() => fn(s.bg), { key: key || 'bg', insp: !!insp });
  const fillSeg = segc([['solid', 'Solid'], ['gradient', 'Gradient'], ['image', 'Image']], type, v => {
    if (v === 'solid') setBg(b => { b.grad = null; b.img = null; }, null, true);
    if (v === 'gradient') setBg(b => { b.img = null; b.grad = b.grad || { c1: b.color || t.bg, c2: t.accent, angle: 135 }; }, null, true);
    if (v === 'image') { pickBg(); }
  });
  LiquidGlass.attach(fillSeg, { item: 'button', lift: 1.12, initial: ['solid', 'gradient', 'image'].indexOf(type) });
  const rows = [row('Fill', fillSeg)];
  if (type === 'solid') rows.push(row('Color', colorIn(bg.color, c => setBg(b => { b.color = c || '#000000'; }, 'bgc'))));
  if (type === 'gradient') rows.push(
    row('From', colorIn(bg.grad.c1, c => setBg(b => { b.grad.c1 = c; }, 'g1'))),
    row('To', colorIn(bg.grad.c2, c => setBg(b => { b.grad.c2 = c; }, 'g2'))),
    row('Radial', tog(bg.grad.radial, v => setBg(b => { b.grad.radial = v; }, null, true))),
    bg.grad.radial ? null : row('Angle', slider(bg.grad.angle == null ? 135 : bg.grad.angle, 0, 360, 1, v => setBg(b => { b.grad.angle = v; }, 'ga'))));
  if (type === 'image') rows.push(
    row('Picture', h('button', { class: 'btn ghost sm', onclick: pickBg }, 'Replace'), h('button', { class: 'btn ghost sm', onclick: () => setBg(b => { b.img = null; }, null, true) }, 'Remove')),
    row('Darken', slider(Math.round((bg.dim || 0) * 100), 0, 90, 1, v => setBg(b => { b.dim = v / 100; }, 'dim'))));
  rows.push(row('Motion', selIn(SD.BG_ANIMS, bg.anim || '', v => setBg(b => { b.anim = v || null; if (v && !b.a1) { b.a1 = t.a1 || t.accent; b.a2 = t.a2 || t.accent2; b.a3 = t.a3 || t.accent; } }, null, true), { label: 'Animated background' })));
  if (bg.anim) rows.push(
    row('Motion colors', colorIn(bg.a1, c => setBg(b => { b.a1 = c; }, 'a1'))), row('', colorIn(bg.a2, c => setBg(b => { b.a2 = c; }, 'a2'))), row('', colorIn(bg.a3, c => setBg(b => { b.a3 = c; }, 'a3'))));
  rows.push(row('Film grain', tog(bg.grain, v => setBg(b => { b.grain = v; }, null, true))),
    h('button', { class: 'btn ghost sm block', style: { marginTop: '6px' }, onclick: () => { mutate(() => S.deck.slides.forEach(x => { x.bg = deep(s.bg); }), { nav: true }); toast('Background applied to every slide'); } }, 'Use this background on all slides'));
  const ta = h('textarea', { class: 'in', rows: '5', placeholder: 'What you want to say on this slide. Shown in presenter view.' });
  ta.value = s.notes || '';
  ta.addEventListener('input', () => { mutate(() => { s.notes = ta.value; }, { key: 'notes:' + s.id, canvas: false }); $('#notesInput').value = ta.value; });
  const lb = h('button', { class: 'btn ghost sm', html: icon('layout') + 'Add slide with a layout' });
  lb.addEventListener('click', () => layoutPop(lb));
  return [
    sec('Background', ...rows),
    sec(['This slide', h('small', {}, `${S.si + 1} of ${S.deck.slides.length}`)],
      row('Presenting', tog(!s.hidden, v => { mutate(() => { s.hidden = !v; }, { nav: true }); }, 'Include this slide')),
      h('div', { class: 'btnrow' }, lb, h('button', { class: 'btn ghost sm', onclick: () => duplicateSlide(), html: icon('dup') + 'Duplicate' }), h('button', { class: 'btn danger sm', onclick: () => deleteSlide(), html: icon('trash') + 'Delete' }))),
    sec('Speaker notes', ta)
  ];
}
function pickBg() { const f = $('#fileBg'); f.value = ''; f.click(); }
function layoutPop(anchor, at) {
  const g = h('div', { class: 'layoutgrid' });
  const tp = tpOf();
  SDTemplates.LAYOUTS.forEach(([k, l]) => {
    const s = SDTemplates.layout(k, tp, 0);
    g.appendChild(h('button', { onclick: () => { closePop(); addSlide(k, at); } }, thumb(s, S.deck, null), l));
  });
  openPop(anchor, g, { alignRight: false });
}

/* ---------- Deck tab ---------- */
function deckStats() {
  let words = 0, notes = 0, objs = 0, builds = 0;
  const count = s => (String(s || '').match(/[\p{L}\p{N}’']+/gu) || []).length;
  S.deck.slides.forEach(s => {
    objs += s.els.length; builds += s.builds.length; notes += count(s.notes);
    s.els.forEach(e => { if (e.html) words += count(strip(e.html)); if (e.table) e.table.rows.forEach(r => r.forEach(c => { words += count(strip(c)); })); });
  });
  const mins = Math.max(1, Math.round((notes + words) / 130 + S.deck.slides.filter(s => !s.hidden).length * .35));
  return { words, notes, objs, builds, mins };
}
function tabDeck() {
  const d = S.deck, t = d.theme, st = deckStats();
  const fonts = SD.FONT_NAMES.map(f => [f, f]);
  return [
    sec('Presentation',
      row('Title', txtIn(d.title, v => { d.title = v || 'Untitled presentation'; $('#deckTitle').value = d.title; scheduleSave(); })),
      row('Numbers', tog(d.numbers, v => mutate(() => { d.numbers = v; }, { nav: true }), 'Show slide numbers'))),
    sec(['Theme colors', h('small', {}, t.name || 'Custom')],
      h('p', { class: 'hint', style: { marginBottom: '10px' } }, 'Recolor every slide at once. Fonts follow the theme too. Undo brings the old look back.'),
      h('div', { class: 'themegrid' }, ...SDTemplates.THEMES.map(nt => h('button', { class: 'themechip' + (nt.name === t.name ? ' on' : ''), onclick: () => recolor(nt) },
        h('span', { class: 'sws' }, ...[nt.bg, nt.accent, nt.accent2, nt.text].map(c => h('i', { style: { background: c } }))), nt.name)))),
    sec('Fonts',
      row('Headings', selIn(fonts, t.head, v => setDeckFont('head', v), { fontPreview: true })),
      row('Body', selIn(fonts, t.body, v => setDeckFont('body', v), { fontPreview: true }))),
    sec('Transitions',
      row('All slides', selIn(SD.TRANSITIONS, '', v => { if (!v) return; mutate(() => d.slides.forEach(s => { s.transition = { type: v, dur: (s.transition && s.transition.dur) || .8 }; }), { nav: true }); toast(`${SD.TRANSITIONS.find(x => x[0] === v)[1]} applied to every slide`); }, { label: 'Transition for all slides' }))),
    sec('At a glance', h('div', { class: 'stats' },
      h('div', {}, h('b', {}, String(d.slides.length)), h('span', {}, 'slides')),
      h('div', {}, h('b', {}, String(st.words)), h('span', {}, 'words on slides')),
      h('div', {}, h('b', {}, String(st.builds)), h('span', {}, 'builds')),
      h('div', {}, h('b', {}, `~${st.mins} min`), h('span', {}, 'to present')))),
    sec('Share and export', h('div', { class: 'stack' },
      h('button', { class: 'btn primary sm block', onclick: exportHTML, html: icon('export') + 'Export as a playable HTML file' }),
      h('button', { class: 'btn ghost sm block', onclick: saveFile, html: icon('file') + 'Download editable .sdeck file' }),
      h('button', { class: 'btn ghost sm block', onclick: printDeck, html: icon('print') + 'Print or save as PDF' })))
  ];
}
function setDeckFont(role, f) {
  SD.loadFont(f);
  mutate(() => {
    S.deck.slides.forEach(s => s.els.forEach(e => { if (e.role === role || (!e.role && role === 'body' && e.font === S.deck.theme.body)) e.font = f; }));
    S.deck.theme[role] = f;
    if (S.deck.tp && S.deck.tp.t) S.deck.tp.t[role] = f;
  }, { nav: true, insp: true });
}
function recolor(nt) {
  const ot = S.deck.theme;
  const fb = { a1: nt.accent, a2: nt.accent2, a3: nt.accent, bg2: nt.bg, onAccent: '#FFFFFF' };
  const keys = ['bg', 'bg2', 'surface', 'line', 'muted', 'text', 'accent', 'accent2', 'onAccent', 'a1', 'a2', 'a3'];
  mutate(() => {
    let s = JSON.stringify(S.deck.slides);
    const toks = [];
    keys.forEach((k, i) => {
      const ov = ot[k], nv = nt[k] != null ? nt[k] : fb[k];
      if (!ov || nv == null || toks.some(x => x.ov === ov)) return;
      const tok = `@@SDC${i}@@`;
      s = s.split(JSON.stringify(ov).slice(1, -1)).join(tok);
      toks.push({ tok, ov, nv });
    });
    toks.forEach(x => { s = s.split(x.tok).join(JSON.stringify(x.nv).slice(1, -1)); });
    const slides = JSON.parse(s);
    slides.forEach(sl => {
      if (sl.bg && !sl.bg.img) {
        if (nt.grad) sl.bg.grad = { c1: nt.bg, c2: nt.bg2, angle: nt.gradAngle == null ? 135 : nt.gradAngle };
        else if (ot.grad) sl.bg.grad = null;
      }
      sl.els.forEach(e => {
        if (e.role === 'head') { e.font = nt.head; e.weight = nt.headW || 700; e.italic = !!nt.headItalic; e.upper = !!nt.headUpper; }
        else if (e.role === 'body') e.font = nt.body;
      });
    });
    S.deck.slides = slides;
    S.deck.theme = deep(nt);
    if (S.deck.tp) S.deck.tp.t = deep(nt);
  }, { nav: true, insp: true });
  [nt.head, nt.body].forEach(f => SD.loadFont(f));
  toast(`Recolored with ${nt.name}`, { label: 'Undo', run: undo });
}

/* ---------- Export ---------- */
function slug(s) { return String(s || 'presentation').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'presentation'; }
function download(data, name, type) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = h('a', { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
function exportHTML() {
  endEdit();
  const d = deep(S.deck);
  const LS1 = String.fromCharCode(0x2028), LS2 = String.fromCharCode(0x2029), BS = String.fromCharCode(92);
  const json = JSON.stringify(d).split('<').join(BS + 'u003c').split(LS1).join(BS + 'u2028').split(LS2).join(BS + 'u2029');
  const html = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    `<title>${esc(d.title)}</title><meta name="generator" content="Sigeon Deck"></head><body><script>\n` +
    SDRuntimeFactory.toString() + '\nvar SD=SDRuntimeFactory();SD.standalone(' + json + ');\n<' + '/script></body></html>';
  download(html, slug(d.title) + '.html', 'text/html');
  toast('Exported. Open the file in any browser and press F for full screen.');
}
function saveFile() { endEdit(); download(JSON.stringify(S.deck), slug(S.deck.title) + '.sdeck', 'application/json'); toast('Downloaded the editable .sdeck file'); }
function printDeck() {
  endEdit();
  const p = $('#print');
  clearThumbs(p); p.innerHTML = '';
  S.deck.slides.forEach((s, i) => {
    if (s.hidden) return;
    const pg = h('div', { class: 'print-page' });
    const n = SD.renderSlide(s, S.deck, { index: i, thumb: true });
    SD.applyFinal(n, s);
    pg.appendChild(n); p.appendChild(pg);
  });
  setTimeout(() => { window.print(); setTimeout(() => { p.innerHTML = ''; }, 800); }, 350);
}
function openFile(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d || !Array.isArray(d.slides)) throw new Error('bad');
      d.id = uid();
      openDeck(d);
      toast(`Opened ${d.title || 'presentation'}`);
    } catch (e) { toast('That file isn’t a Sigeon Deck presentation. Choose a .sdeck file.'); }
  };
  r.readAsText(file);
}

/* ---------- Find and replace ---------- */
function findReplace() {
  const f = h('input', { class: 'in', placeholder: 'Find' }), rp = h('input', { class: 'in', placeholder: 'Replace with' });
  const mc = h('input', { type: 'checkbox' });
  const info = h('p', { class: 'hint' }, 'Searches text boxes, shapes, tables and speaker notes on every slide.');
  const re = () => { const q = f.value; if (!q) return null; return new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), mc.checked ? 'g' : 'gi'); };
  const walk = (html, rx, rep, cnt) => {
    const t = document.createElement('template'); t.innerHTML = html;
    const w = document.createTreeWalker(t.content, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) { const m = n.nodeValue.match(rx); if (m) { cnt.n += m.length; if (rep != null) n.nodeValue = n.nodeValue.replace(rx, rep); } }
    return t.innerHTML;
  };
  const run = rep => {
    const rx = re(); if (!rx) return;
    const cnt = { n: 0 };
    const apply = () => S.deck.slides.forEach(s => {
      s.els.forEach(e => { if (e.html) e.html = walk(e.html, rx, rep, cnt); if (e.table) e.table.rows = e.table.rows.map(r => r.map(c => walk(c, rx, rep, cnt))); });
      if (s.notes) { const m = s.notes.match(rx); if (m) { cnt.n += m.length; if (rep != null) s.notes = s.notes.replace(rx, rep); } }
    });
    if (rep == null) { const backup = JSON.stringify(S.deck.slides); apply(); S.deck.slides = JSON.parse(backup); info.textContent = cnt.n ? `${cnt.n} match${cnt.n > 1 ? 'es' : ''} found.` : 'No matches.'; }
    else { mutate(apply, { nav: true, insp: true }); info.textContent = `Replaced ${cnt.n} match${cnt.n === 1 ? '' : 'es'}.`; }
  };
  f.addEventListener('input', () => run(null));
  f.addEventListener('keydown', e => { if (e.key === 'Enter') run(null); });
  modal('Find and replace', h('div', {}, h('div', { class: 'formrow' }, f), h('div', { class: 'formrow' }, rp), h('label', { class: 'toggle', style: { marginBottom: '12px' } }, mc, h('i'), h('span', {}, 'Match case')), info),
    [h('button', { class: 'btn ghost', onclick: closeModal }, 'Close'), h('button', { class: 'btn primary', onclick: () => run(rp.value) }, 'Replace all')]);
}

/* ---------- Shortcuts ---------- */
const KEYS = [
  ['Editing'], ['Undo / redo', 'Ctrl+Z / Ctrl+Shift+Z'], ['Copy, cut, paste', 'Ctrl+C, X, V'], ['Duplicate', 'Ctrl+D'], ['Delete', 'Delete'],
  ['Select all', 'Ctrl+A'], ['Nudge', 'Arrows (Shift for 10 px)'], ['Edit text', 'Enter or double-click'], ['Stop editing', 'Esc'],
  ['Lock / unlock', 'Ctrl+L'], ['Bring forward / back', 'Ctrl+] / Ctrl+['], ['Duplicate while dragging', 'Alt + drag'], ['Keep proportions', 'Shift + resize'],
  ['Inserting'], ['Text box', 'T'], ['Rectangle', 'R'], ['Ellipse', 'O'], ['Line', 'L'], ['New slide', 'Ctrl+M'],
  ['View'], ['Command search', 'Ctrl+K'], ['Find and replace', 'Ctrl+F'], ['Zoom in / out', 'Ctrl + / Ctrl −'], ['Fit to window', 'Ctrl+0'],
  ['Light table', 'Ctrl+G'], ['Previous / next slide', 'Page Up / Page Down'], ['Speaker notes', 'Ctrl+Shift+N'],
  ['Presenting'], ['Play from start', 'F5'], ['Play from this slide', 'Ctrl+Enter or Shift+F5'], ['Presenter view', 'S while playing'], ['Draw / laser', 'D / L'],
  ['Black / white screen', 'B / W'], ['All slides', 'G'], ['Go to slide', 'Type a number, then Enter']
];
function keysGrid(list) { return h('div', { class: 'keys' }, ...list.map(k => k.length === 1 ? h('h4', {}, k[0]) : h('div', {}, h('span', {}, k[0]), h('kbd', {}, k[1])))); }
function showShortcuts() { modal('Keyboard shortcuts', keysGrid(KEYS), null, { cls: 'wide' }); }

/* ---------- Command palette ---------- */
function slideTitle(s) {
  const e = s.els.find(x => x.role === 'head' && x.html && strip(x.html).length > 1) || s.els.find(x => x.type === 'text' && x.html);
  return e ? strip(e.html).slice(0, 50) : 'Untitled slide';
}
function commands() {
  const c = [], add = (label, run, ic, kbd) => c.push({ label, run, ic, kbd });
  add('Play from the beginning', () => present(firstPlayable()), 'play', 'F5');
  add('Play from this slide', () => present(S.si), 'play', 'Ctrl+Enter');
  add('Open presenter view', () => present(S.si, { pres: true }), 'presenter');
  SDTemplates.LAYOUTS.forEach(([k, l]) => add(`New slide: ${l}`, () => addSlide(k), 'layout'));
  add('Duplicate slide', () => duplicateSlide(), 'dup', 'Ctrl+Shift+D');
  add('Delete slide', () => deleteSlide(), 'trash');
  add(cur().hidden ? 'Include slide in presentation' : 'Skip slide in presentation', () => toggleSkip(), 'eyeoff');
  [['title', 'Title'], ['heading', 'Heading'], ['body', 'Text box'], ['bullets', 'Bulleted list'], ['numbered', 'Numbered list'], ['caption', 'Caption']].forEach(([k, l]) => add(`Insert ${l.toLowerCase()}`, () => insertText(k), 'text'));
  SD.SHAPES.forEach(([k, l]) => add(`Insert shape: ${l}`, () => insertShape(k), 'shape'));
  SD.CHART_KINDS.forEach(([k, l]) => add(`Insert chart: ${l}`, () => insertChart(k), 'chart'));
  add('Insert image from this device', () => { pickCb = null; const f = $('#fileImg'); f.multiple = true; f.value = ''; f.click(); }, 'image');
  add('Insert table', insertTable, 'table'); add('Insert icon', () => iconPicker($('[data-ins="icon"]'), insertIcon), 'star');
  add('Insert code block', insertCode, 'code'); add('Insert line', () => insertLine('line'), 'line'); add('Insert arrow', () => insertLine('arrow'), 'arrow-right'); add('Insert video', insertEmbed, 'video');
  SD.TRANSITIONS.forEach(([k, l]) => add(`Transition: ${l}`, () => mutate(() => { cur().transition = { type: k, dur: (cur().transition && cur().transition.dur) || .8 }; }, { insp: true }), 'sparkle'));
  SDTemplates.THEMES.forEach(t => add(`Recolor with ${t.name}`, () => recolor(t), 'palette'));
  add('Light table', () => setView(S.view === 'grid' ? 'edit' : 'grid'), 'grid', 'Ctrl+G');
  add('Zoom to fit', zoomFit, 'focus', 'Ctrl+0'); add('Zoom to 100%', () => zoomTo(1), 'focus');
  add(S.grid ? 'Hide grid' : 'Show grid', toggleGrid, 'dots'); add(S.snap ? 'Turn off smart guides' : 'Turn on smart guides', toggleSnap, 'magnet');
  add('Focus mode', toggleFocus, 'focus'); add('Speaker notes', toggleNotes, 'notes', 'Ctrl+Shift+N');
  add('Undo', undo, 'undo', 'Ctrl+Z'); add('Redo', redo, 'redo', 'Ctrl+Shift+Z'); add('Select all', selectAll, null, 'Ctrl+A');
  add('Find and replace', findReplace, 'replace', 'Ctrl+F'); add('Keyboard shortcuts', showShortcuts, 'keyboard', '?');
  add('Export as playable HTML', exportHTML, 'export'); add('Download .sdeck file', saveFile, 'file', 'Ctrl+Shift+S'); add('Print or save as PDF', printDeck, 'print', 'Ctrl+P');
  add('Open a file', () => $('#fileDeck').click(), 'file', 'Ctrl+O'); add('All presentations', showHome, 'grid'); add('New presentation', () => newBlank('night'), 'plus');
  add(S.deck.numbers ? 'Hide slide numbers' : 'Show slide numbers', () => mutate(() => { S.deck.numbers = !S.deck.numbers; }, { nav: true }), 'ol');
  S.deck.slides.forEach((s, i) => add(`Go to slide ${i + 1}: ${slideTitle(s)}`, () => goSlide(i), 'right'));
  return c;
}
function openPalette() {
  if (!S.deck || $('#editor').hidden) return;
  endEdit();
  const all = commands();
  const inp = h('input', { placeholder: 'Search commands, slides, shapes, themes…', 'aria-label': 'Search commands' });
  const list = h('div', { class: 'pal-list', role: 'listbox' });
  let items = [], idx = 0;
  const draw = () => {
    const q = inp.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    items = all.filter(c => q.every(w => c.label.toLowerCase().includes(w))).slice(0, 60);
    idx = Math.min(idx, Math.max(0, items.length - 1));
    list.innerHTML = '';
    if (!items.length) list.appendChild(h('div', { class: 'pal-empty' }, 'No matching commands. Try fewer words.'));
    items.forEach((c, i) => list.appendChild(h('button', { class: 'pal-item' + (i === idx ? ' on' : ''), role: 'option', html: (c.ic ? icon(c.ic) : '<span style="width:18px"></span>') + `<span>${esc(c.label)}</span>` + (c.kbd ? `<small>${esc(c.kbd)}</small>` : ''), onclick: () => { closeModal(); c.run(); }, onmousemove: () => { if (idx !== i) { idx = i; mark(); } } })));
  };
  const mark = () => $$('.pal-item', list).forEach((b, i) => { b.classList.toggle('on', i === idx); if (i === idx) b.scrollIntoView({ block: 'nearest' }); });
  inp.addEventListener('input', () => { idx = 0; draw(); });
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(items.length - 1, idx + 1); mark(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(0, idx - 1); mark(); }
    else if (e.key === 'Enter' && items[idx]) { e.preventDefault(); const c = items[idx]; closeModal(); c.run(); }
    else if (e.key === 'Escape') closeModal();
  });
  draw();
  modal(null, h('div', {}, inp, list), null, { cls: 'palette', raw: true });
}

/* ---------- Presenting ---------- */
const PV = { on: false, ink: '#FF3344' };
function firstPlayable() { const i = S.deck.slides.findIndex(s => !s.hidden); return i < 0 ? 0 : i; }
function present(from, o) {
  o = o || {};
  if (!S.deck) return;
  endEdit(); closePop(); closeModal(); stopPreview();
  if (S.deck.slides.every(s => s.hidden)) return toast('Every slide is skipped. Include at least one slide to present.');
  const P = $('#present');
  P.hidden = false;
  P.className = 'present' + (o.pres ? ' pres' : '');
  Object.assign(PV, { on: true, tool: null, start: Date.now(), pausedFor: 0, pauseAt: null, jump: '', ended: false, lastIndex: -1 });
  const host = $('#pvHost');
  host.innerHTML = '';
  PV.player = new SD.Player(host, S.deck, { live: true, onChange: pvChange });
  let i = from == null ? S.si : from;
  if (!S.deck.slides[i] || S.deck.slides[i].hidden) { i = PV.player.nextIdx(i, 1); if (i < 0) i = PV.player.first(); }
  PV.player.go(i, { animate: false });
  curtain('');
  if (!o.noFs && P.requestFullscreen) P.requestFullscreen().then(() => { PV.fs = true; setTimeout(sizeInk, 120); }).catch(() => { });
  clearInterval(PV.clockT);
  PV.clockT = setInterval(pvTick, 500);
  pvTick(); sizeInk(); pokeBar(); setTool(null);
}
function exitPresent() {
  if (!PV.on) return;
  PV.on = false;
  clearInterval(PV.clockT);
  const idx = PV.player ? PV.player.index : S.si;
  if (PV.player) PV.player.destroy();
  PV.player = null;
  $('#present').hidden = true;
  $('#pvOverview').hidden = true; $('#pvHelp').hidden = true; $('#pvJump').hidden = true;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
  PV.fs = false;
  if (idx >= 0) S.si = idx;
  renderAll();
  requestAnimationFrame(applyZoom);
}
function pvNext() {
  if (PV.ended) { exitPresent(); return; }
  if (!PV.player.next()) { PV.ended = true; curtain('end'); }
  pokeBar();
}
function pvPrev() {
  if (PV.ended) { PV.ended = false; curtain(''); return; }
  PV.player.prev(); pokeBar();
}
function pvChange(p) {
  const slides = S.deck.slides, vis = slides.map((s, i) => i).filter(i => !slides[i].hidden);
  $('#pvCount').textContent = `${vis.indexOf(p.index) + 1} / ${vis.length}`;
  const remaining = p.steps.length - p.step;
  $('#pvNext').previousElementSibling.textContent = remaining > 0 ? `Next on this slide: ${remaining} more build${remaining > 1 ? 's' : ''}` : 'Next slide';
  if (PV.lastIndex !== p.index) {
    PV.lastIndex = p.index;
    $('#pvNotes').textContent = slides[p.index].notes || '';
    const nb = $('#pvNext');
    clearThumbs(nb); nb.innerHTML = '';
    const j = p.nextIdx(p.index, 1);
    nb.appendChild(j >= 0 ? thumb(slides[j], S.deck, j) : h('div', { class: 'pv-end' }, 'End of presentation'));
    clearInk();
    if (!$('#pvOverview').hidden) buildOverview();
  }
}
function pvTick() {
  const now = Date.now();
  const el = (PV.pauseAt || now) - PV.start - PV.pausedFor;
  const s = Math.max(0, Math.floor(el / 1000)), hh = Math.floor(s / 3600), mm = Math.floor(s / 60) % 60, ss = s % 60;
  $('#pvTimer').textContent = (hh ? hh + ':' + String(mm).padStart(2, '0') : String(mm).padStart(2, '0')) + ':' + String(ss).padStart(2, '0');
  $('#pvClock').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function curtain(kind) {
  const c = $('#pvCurtain');
  c.className = 'pv-curtain' + (kind === 'black' || kind === 'end' ? ' black' : kind === 'white' ? ' white' : '');
  c.innerHTML = kind === 'end' ? '<div style="position:absolute;inset:0;display:grid;place-items:center;color:#8390B0;font:500 18px Onest,system-ui">End of presentation. Click or press Esc to exit.</div>' : '';
  PV.curtain = kind;
}
function setTool(t) {
  PV.tool = PV.tool === t ? null : t;
  const P = $('#present');
  P.classList.toggle('tool-pen', PV.tool === 'pen');
  P.classList.toggle('tool-laser', PV.tool === 'laser');
  $('#pvPen').classList.toggle('on', PV.tool === 'pen');
  $('#pvLaserBtn').classList.toggle('on', PV.tool === 'laser');
}
function sizeInk() {
  const c = $('#pvInk'), w = $('#pvMainWrap'), dpr = window.devicePixelRatio || 1;
  const img = c.width && c.height ? c.getContext('2d').getImageData(0, 0, c.width, c.height) : null;
  c.width = Math.max(1, w.clientWidth * dpr); c.height = Math.max(1, w.clientHeight * dpr);
  if (img) try { c.getContext('2d').putImageData(img, 0, 0); } catch (e) { }
}
function clearInk() { const c = $('#pvInk'); c.getContext('2d').clearRect(0, 0, c.width, c.height); }
let barT;
function pokeBar() {
  const b = $('#pvBar');
  b.classList.remove('hide');
  clearTimeout(barT);
  barT = setTimeout(() => { if (!b.matches(':hover')) b.classList.add('hide'); }, 2400);
}
function buildOverview() {
  const ov = $('#pvOverview');
  clearThumbs(ov); ov.innerHTML = '';
  S.deck.slides.forEach((s, i) => {
    if (s.hidden) return;
    ov.appendChild(h('button', { class: 'pv-ov-item' + (PV.player && PV.player.index === i ? ' on' : ''), onclick: () => { ov.hidden = true; PV.ended = false; curtain(''); PV.player.go(i, { animate: false }); } }, thumb(s, S.deck, i), `${i + 1}. ${slideTitle(s)}`));
  });
}
function toggleOverview() { const ov = $('#pvOverview'); ov.hidden = !ov.hidden; if (!ov.hidden) buildOverview(); }
function togglePresenter() { $('#present').classList.toggle('pres'); setTimeout(() => { sizeInk(); clearInk(); }, 60); }
function setupPresent() {
  const wrap = $('#pvMainWrap'), ink = $('#pvInk');
  wrap.addEventListener('click', e => {
    if (PV.tool === 'pen' || e.target.closest('.sd-link')) return;
    pvNext();
  });
  wrap.addEventListener('contextmenu', e => { e.preventDefault(); pvPrev(); });
  wrap.addEventListener('pointermove', e => {
    const r = wrap.getBoundingClientRect();
    const l = $('#pvLaser'); l.style.left = (e.clientX - r.left) + 'px'; l.style.top = (e.clientY - r.top) + 'px';
  });
  $('#present').addEventListener('pointermove', pokeBar);
  let drawing = null;
  ink.addEventListener('pointerdown', e => {
    if (PV.tool !== 'pen') return;
    ink.setPointerCapture(e.pointerId);
    const r = ink.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    drawing = { r, dpr, last: [(e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr] };
  });
  ink.addEventListener('pointermove', e => {
    if (!drawing) return;
    const ctx = ink.getContext('2d'), { r, dpr } = drawing, p = [(e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr];
    ctx.strokeStyle = PV.ink; ctx.lineWidth = 5 * dpr; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(...drawing.last); ctx.lineTo(...p); ctx.stroke();
    drawing.last = p;
  });
  ink.addEventListener('pointerup', () => { drawing = null; });
  const inks = $('#pvInks');
  ['#FF3344', '#FFC145', '#2E6BFF', '#3DDC97', '#FFFFFF'].forEach((c, i) => inks.appendChild(h('button', { class: i === 0 ? 'on' : '', style: { background: c }, 'aria-label': `Pen color ${c}`, onclick: e => { PV.ink = c; $$('button', inks).forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); } })));
  $('#pvPrev').onclick = pvPrev; $('#pvNextBtn').onclick = pvNext; $('#pvExit').onclick = exitPresent;
  $('#pvPen').onclick = () => setTool('pen'); $('#pvLaserBtn').onclick = () => setTool('laser');
  $('#pvOverviewBtn').onclick = toggleOverview; $('#pvPresBtn').onclick = togglePresenter;
  $('#pvHelpBtn').onclick = () => toggleHelp();
  $('#pvPause').onclick = () => { if (PV.pauseAt) { PV.pausedFor += Date.now() - PV.pauseAt; PV.pauseAt = null; $('#pvPause').textContent = 'Pause'; } else { PV.pauseAt = Date.now(); $('#pvPause').textContent = 'Resume'; } pvTick(); };
  $('#pvReset').onclick = () => { PV.start = Date.now(); PV.pausedFor = 0; if (PV.pauseAt) PV.pauseAt = Date.now(); pvTick(); };
  let nfs = 20;
  $('#pvNotesSm').onclick = () => { nfs = Math.max(12, nfs - 2); $('#pvNotes').style.setProperty('--nfs', nfs + 'px'); };
  $('#pvNotesLg').onclick = () => { nfs = Math.min(44, nfs + 2); $('#pvNotes').style.setProperty('--nfs', nfs + 'px'); };
  new ResizeObserver(() => { if (PV.on) sizeInk(); }).observe(wrap);
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && PV.on && PV.fs) { PV.fs = false; exitPresent(); } });
}
function toggleHelp() {
  const hp = $('#pvHelp');
  if (!hp.hidden) { hp.hidden = true; return; }
  hp.innerHTML = '';
  hp.appendChild(h('h3', { style: { margin: '0 0 12px', fontSize: '17px' } }, 'While presenting'));
  hp.appendChild(keysGrid([['Next', 'Right, Space, click'], ['Previous', 'Left, right-click'], ['First / last slide', 'Home / End'], ['Go to slide', 'Number, then Enter'],
    ['Presenter view', 'S'], ['All slides', 'G'], ['Draw', 'D'], ['Clear drawing', 'C'], ['Laser pointer', 'L'], ['Black / white screen', 'B / W'], ['Reset timer', 'T'], ['End show', 'Esc']]));
  hp.hidden = false;
}
function presentKey(e) {
  const k = e.key;
  if (!$('#pvHelp').hidden && (k === 'Escape' || k === '?')) { $('#pvHelp').hidden = true; return; }
  if (!$('#pvOverview').hidden && k === 'Escape') { $('#pvOverview').hidden = true; return; }
  if (/^[0-9]$/.test(k)) { PV.jump += k; const j = $('#pvJump'); j.hidden = false; j.textContent = `Go to slide ${PV.jump}`; clearTimeout(PV.jumpT); PV.jumpT = setTimeout(() => { PV.jump = ''; j.hidden = true; }, 2500); return; }
  if (k === 'Enter' && PV.jump) { const n = parseInt(PV.jump, 10) - 1; PV.jump = ''; $('#pvJump').hidden = true; if (S.deck.slides[n]) { PV.ended = false; curtain(''); PV.player.go(n, { animate: false }); } return; }
  if (PV.curtain === 'black' || PV.curtain === 'white') { if (['b', 'B', 'w', 'W', '.', 'Escape', ' ', 'ArrowRight'].includes(k)) { e.preventDefault(); curtain(''); return; } }
  switch (k) {
    case 'ArrowRight': case 'ArrowDown': case ' ': case 'PageDown': case 'Enter': case 'n': case 'N': e.preventDefault(); pvNext(); break;
    case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace': case 'p': case 'P': e.preventDefault(); pvPrev(); break;
    case 'Home': PV.ended = false; curtain(''); PV.player.go(PV.player.first(), { animate: false }); break;
    case 'End': { let j = S.deck.slides.length - 1; while (j > 0 && S.deck.slides[j].hidden) j--; PV.ended = false; curtain(''); PV.player.go(j, { animate: false, built: true }); break; }
    case 'Escape': exitPresent(); break;
    case 'b': case 'B': case '.': curtain('black'); break;
    case 'w': case 'W': case ',': curtain('white'); break;
    case 'l': case 'L': setTool('laser'); break;
    case 'd': case 'D': setTool('pen'); break;
    case 'c': case 'C': case 'e': case 'E': clearInk(); break;
    case 'g': case 'G': toggleOverview(); break;
    case 's': case 'S': togglePresenter(); break;
    case 't': case 'T': $('#pvReset').click(); break;
    case 'f': case 'F': { const P = $('#present'); if (document.fullscreenElement) { PV.fs = false; document.exitFullscreen(); } else if (P.requestFullscreen) P.requestFullscreen().then(() => { PV.fs = true; }).catch(() => { }); break; }
    case '?': toggleHelp(); break;
  }
}

/* ---------- Keyboard ---------- */
document.addEventListener('keydown', e => {
  if (PV.on) { presentKey(e); return; }
  if (!S.deck || $('#editor').hidden) return;
  const mod = e.ctrlKey || e.metaKey, k = e.key, lk = k.toLowerCase();
  if (mod && lk === 'k') { e.preventDefault(); openPalette(); return; }
  if (S.modal) { if (k === 'Escape') closeModal(); return; }
  if (k === 'Escape' && popEl) { closePop(); return; }
  if (k === 'F5') { e.preventDefault(); present(e.shiftKey ? S.si : firstPlayable()); return; }
  if (mod && k === 'Enter') { e.preventDefault(); present(S.si); return; }
  if (isTyping(e.target)) {
    if (mod && lk === 's') { e.preventDefault(); saveDeckNow(); toast('Saved in this browser'); }
    return;
  }
  if (mod) {
    switch (lk) {
      case 'z': e.preventDefault(); e.shiftKey ? redo() : undo(); return;
      case 'y': e.preventDefault(); redo(); return;
      case 'c': if (S.sel.length) { e.preventDefault(); copyEls(); } return;
      case 'x': if (S.sel.length) { e.preventDefault(); cutEls(); } return;
      case 'd': e.preventDefault(); e.shiftKey ? duplicateSlide() : duplicateEls(); return;
      case 'a': e.preventDefault(); selectAll(); return;
      case 'l': e.preventDefault(); toggleLock(); return;
      case 'm': e.preventDefault(); addSlide('content'); return;
      case 'g': e.preventDefault(); setView(S.view === 'grid' ? 'edit' : 'grid'); return;
      case 'f': e.preventDefault(); findReplace(); return;
      case 'p': e.preventDefault(); printDeck(); return;
      case 'o': e.preventDefault(); $('#fileDeck').click(); return;
      case 's': e.preventDefault(); if (e.shiftKey) saveFile(); else { saveDeckNow(); toast('Saved in this browser. Use Export to download a copy.'); } return;
      case 'n': if (e.shiftKey) { e.preventDefault(); toggleNotes(); } return;
      case '=': case '+': e.preventDefault(); zoomBy(1.2); return;
      case '-': e.preventDefault(); zoomBy(1 / 1.2); return;
      case '0': e.preventDefault(); zoomFit(); return;
      case ']': e.preventDefault(); arrange(e.shiftKey ? 'front' : 'forward'); return;
      case '[': e.preventDefault(); arrange(e.shiftKey ? 'back' : 'backward'); return;
      case '}': e.preventDefault(); arrange('front'); return;
      case '{': e.preventDefault(); arrange('back'); return;
    }
    return;
  }
  if (k === 'Delete' || k === 'Backspace') { if (S.sel.length) { e.preventDefault(); deleteSel(); } else if (document.activeElement && document.activeElement.closest('#navList')) { e.preventDefault(); deleteSlide(); } return; }
  if (k === 'Escape') { if (S.preview) stopPreview(); else if (S.sel.length) { S.sel = []; selectionChanged(); } return; }
  if (k.startsWith('Arrow')) {
    if (S.sel.length) { e.preventDefault(); const d = e.shiftKey ? 10 : 1; nudge(k === 'ArrowLeft' ? -d : k === 'ArrowRight' ? d : 0, k === 'ArrowUp' ? -d : k === 'ArrowDown' ? d : 0); }
    else if (k === 'ArrowUp' || k === 'ArrowLeft') { e.preventDefault(); goSlide(S.si - 1); }
    else { e.preventDefault(); goSlide(S.si + 1); }
    return;
  }
  if (k === 'PageDown') { e.preventDefault(); goSlide(S.si + 1); return; }
  if (k === 'PageUp') { e.preventDefault(); goSlide(S.si - 1); return; }
  if (k === 'Enter' && S.sel.length === 1) { const el = selEls()[0]; if (['text', 'shape', 'code'].includes(el.type)) { e.preventDefault(); beginEdit(el.id, { selectAll: true }); } return; }
  if (k === '?') { showShortcuts(); return; }
  if (S.view !== 'edit') return;
  if (lk === 't') insertText('body');
  else if (lk === 'r') insertShape('rect');
  else if (lk === 'o') insertShape('ellipse');
  else if (lk === 'l') insertLine('line');
});
document.addEventListener('paste', e => {
  if (PV.on || !S.deck || $('#editor').hidden || isTyping(e.target) || S.modal) return;
  const cd = e.clipboardData;
  if (!cd) return;
  const files = [...cd.files].filter(f => f.type.startsWith('image/'));
  const text = cd.getData('text/plain');
  if (S.clip && (text === S.clipStamp || (!text && !files.length))) { e.preventDefault(); pasteEls(); return; }
  if (files.length) { e.preventDefault(); insertImageFiles(files); return; }
  if (text) {
    e.preventDefault();
    if (/^https?:\/\/\S+\.(png|jpe?g|gif|webp|svg)(\?\S*)?$/i.test(text.trim())) { insertImageSrc(text.trim()); return; }
    const t = th();
    const el = { id: uid(), mid: uid(), type: 'text', x: 0, y: 0, w: 1100, h: 60, rot: 0, opacity: 1, html: esc(text).replace(/\n/g, '<br>'), font: t.body, role: 'body', size: 40, weight: t.bodyW || 400, color: t.text, align: 'left', valign: 'top', lh: 1.3, ls: 0, pad: 0, autoH: true };
    Object.assign(el, centerBox(el.w, 120));
    addEl(el);
  }
});

/* ---------- Wiring ---------- */
function setupUI() {
  $$('[data-ic]').forEach(b => b.insertAdjacentHTML('afterbegin', icon(b.dataset.ic)));
  // home
  $('#hNew').onclick = () => newBlank('night');
  $('#hBlankDark').onclick = () => newBlank('night');
  $('#hBlankLight').onclick = () => newBlank('day');
  $('#hOpen').onclick = () => $('#fileDeck').click();
  $('#heroUse').onclick = () => useTemplate(HERO.id || 'aurora');
  $('#heroPlayer').onclick = () => useTemplate(HERO.id || 'aurora');
  $$('#tplKind button').forEach(b => b.onclick = () => { if (S.tplKind === b.dataset.k) return; S.tplKind = b.dataset.k; $$('#tplKind button').forEach(x => x.classList.toggle('on', x === b)); renderTplGrid(); });
  LiquidGlass.attach($('#tplKind'), { item: 'button', lift: 1.16, initial: 0 });
  LiquidGlass.attach($('.tb-insert'), { item: '.tool', lift: 1.1, initial: 0 });
  // topbar
  $('#tHome').onclick = showHome;
  $('#deckTitle').addEventListener('input', e => { S.deck.title = e.target.value || 'Untitled presentation'; scheduleSave(); });
  $('#deckTitle').addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });
  $('#tUndo').onclick = undo; $('#tRedo').onclick = redo;
  $$('[data-ins]').forEach(b => b.addEventListener('click', () => insertMenu(b.dataset.ins, b)));
  $('#tSearch').onclick = openPalette;
  $('#tGrid').onclick = () => setView(S.view === 'grid' ? 'edit' : 'grid');
  $('#tFocus').onclick = toggleFocus;
  $('#tInsp').onclick = () => $('#editor').classList.toggle('insp-open');
  $('#tPlay').onclick = () => present(S.si);
  $('#tPlayMenu').onclick = e => openPop(e.currentTarget, ctxMenu([
    { label: 'Play from this slide', ic: 'play', kbd: 'Ctrl+Enter', run: () => present(S.si) },
    { label: 'Play from the beginning', ic: 'play', kbd: 'F5', run: () => present(firstPlayable()) },
    { label: 'Presenter view', ic: 'presenter', run: () => present(S.si, { pres: true }) },
    { label: 'Rehearse with timer', ic: 'clock', run: () => present(firstPlayable(), { pres: true }) },
    { label: 'Play in this window', ic: 'focus', run: () => present(S.si, { noFs: true }) }
  ]), { alignRight: true });
  $('#tExport').onclick = e => openPop(e.currentTarget, ctxMenu([
    { label: 'Playable HTML file', ic: 'export', run: exportHTML },
    { label: 'Editable .sdeck file', ic: 'file', kbd: 'Ctrl+Shift+S', run: saveFile },
    { label: 'Print or save as PDF', ic: 'print', kbd: 'Ctrl+P', run: printDeck },
    '-',
    { label: 'Open a file', ic: 'file', kbd: 'Ctrl+O', run: () => $('#fileDeck').click() },
    { label: 'All presentations', ic: 'grid', run: showHome }
  ]), { alignRight: true });
  // nav
  $('#addSlide').onclick = () => addSlide('content');
  $('#addSlideMenu').onclick = e => layoutPop(e.currentTarget);
  // status
  $('#sbNotes').onclick = toggleNotes;
  $('#sbGrid').onclick = toggleGrid;
  $('#sbSnap').onclick = toggleSnap;
  $('#zIn').onclick = () => zoomBy(1.2); $('#zOut').onclick = () => zoomBy(1 / 1.2);
  $('#zVal').onclick = zoomFit;
  $('#notesInput').addEventListener('input', e => { const s = cur(); mutate(() => { s.notes = e.target.value; }, { key: 'notes:' + s.id, canvas: false }); });
  // inspector
  $$('.insp-tabs button').forEach(b => b.onclick = () => { S.tab = b.dataset.tab; renderInspector(); });
  $('#insp').addEventListener('focusin', e => { if (S.editing && !e.target.closest('.keep-edit')) endEdit({ quiet: true }); });
  // files
  $('#fileImg').addEventListener('change', async e => {
    const files = [...e.target.files];
    if (!files.length) return;
    if (pickCb) { const cb = pickCb; pickCb = null; try { const r = await readImage(files[0]); cb(r.src); } catch (err) { toast('That image couldn’t be read. Try a PNG, JPG or WebP.'); } }
    else insertImageFiles(files);
  });
  $('#fileBg').addEventListener('change', async e => {
    const f = e.target.files[0];
    if (!f) return;
    try { const r = await readImage(f); const s = cur(); mutate(() => { s.bg.img = r.src; s.bg.dim = s.bg.dim || .2; }, { insp: true }); } catch (err) { toast('That image couldn’t be read.'); }
  });
  $('#fileDeck').addEventListener('change', e => { const f = e.target.files[0]; if (f) openFile(f); e.target.value = ''; });
  $('#home').addEventListener('dragover', e => { if (e.dataTransfer.types.includes('Files')) e.preventDefault(); });
  $('#home').addEventListener('drop', e => { const f = [...e.dataTransfer.files].find(x => /\.(sdeck|json)$/i.test(x.name)); if (f) { e.preventDefault(); openFile(f); } });
  window.addEventListener('beforeunload', () => { if (S.deck) saveDeckNow(); });
  if (document.fonts) document.fonts.addEventListener('loadingdone', () => { if (S.deck && S.view === 'edit' && !$('#editor').hidden) { autoFit(); drawOverlay(); } });
}
function init() {
  loadPrefs();
  setupUI();
  setupStage();
  setupPresent();
  const load = () => SD.FONT_NAMES.forEach(f => SD.loadFont(f));
  if (window.requestIdleCallback) requestIdleCallback(load, { timeout: 1500 }); else setTimeout(load, 300);
  const id = location.hash.slice(1);
  const nm = id.match(/^new=([\w-]+)/);
  const d = !nm && id && loadDeck(id);
  if (nm && (SDTemplates.TEMPLATES.some(t => t.id === nm[1]) || SDTemplates.BLANK[nm[1]])) openDeck(SDTemplates.BLANK[nm[1]] ? SDTemplates.blank(nm[1]) : SDTemplates.build(nm[1]));
  else if (d) openDeck(d); else renderHome();
}
init();
