/* Sigeon Deck — editor core: state, storage, home, canvas and direct manipulation.
   panels.js adds the inspector, presenting, export and the command palette. */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uid = SD.uid, esc = SD.esc;
const deep = o => JSON.parse(JSON.stringify(o));
SD.injectCSS();

/* ---------- Icons ---------- */
const UI = {
  text: 'M4 7V4h16v3M9 20h6M12 4v16', shape: 'M8.5 3a5.5 5.5 0 1 0 0 11a5.5 5.5 0 1 0 0-11M13 13h8v8h-8z',
  image: 'M3 3h18v18H3zM8.5 7a1.5 1.5 0 1 0 0 3a1.5 1.5 0 1 0 0-3M21 15l-5-5L5 21', table: 'M3 3h18v18H3zM3 9h18M3 15h18M9 3v18',
  line: 'M4 20L20 4', video: 'M2 5h20v14H2zM10 9l5 3-5 3z', undo: 'M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3',
  redo: 'M15 14l5-5-5-5M20 9H9a5 5 0 0 0 0 10h3', grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  export: 'M12 3v12M7 8l5-5 5 5M5 14v7h14v-7', chev: 'M6 9l6 6 6-6', notes: 'M4 4h16v16H4zM8 9h8M8 13h8M8 17h5', minus: 'M5 12h14',
  dots: 'M5 5h.01M12 5h.01M19 5h.01M5 12h.01M12 12h.01M19 12h.01M5 19h.01M12 19h.01M19 19h.01', magnet: 'M6 3v8a6 6 0 0 0 12 0V3M6 7h4M14 7h4',
  focus: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5', sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  left: 'M15 18l-6-6 6-6', right: 'M9 18l6-6-6-6', pen: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  laser: 'M12 2v4M12 18v4M2 12h4M18 12h4M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6', presenter: 'M2 4h20v12H2zM8 20h8M12 16v4',
  keyboard: 'M2 6h20v12H2zM6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10', trash: 'M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15',
  copy: 'M8 8h12v12H8zM4 16V4h12', eyeoff: 'M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zM3 3l18 18',
  'al-l': 'M4 3v18M8 6h10v4H8zM8 14h6v4H8z', 'al-c': 'M12 3v18M6 6h12v4H6zM8 14h8v4H8z', 'al-r': 'M20 3v18M6 6h10v4H6zM10 14h6v4h-6z',
  'al-t': 'M3 4h18M6 8h4v10H6zM14 8h4v6h-4z', 'al-m': 'M3 12h18M6 6h4v12H6zM14 8h4v8h-4z', 'al-b': 'M3 20h18M6 6h4v10H6zM14 10h4v6h-4z',
  'di-h': 'M4 3v18M20 3v18M10 7h4v10h-4z', 'di-v': 'M3 4h18M3 20h18M7 10h10v4H7z',
  'ta-l': 'M4 6h16M4 10h10M4 14h16M4 18h10', 'ta-c': 'M4 6h16M7 10h10M4 14h16M7 18h10', 'ta-r': 'M4 6h16M10 10h10M4 14h16M10 18h10', 'ta-j': 'M4 6h16M4 10h16M4 14h16M4 18h16',
  'va-t': 'M4 4h16M9 8h6v6H9z', 'va-m': 'M4 12h4M16 12h4M9 8h6v8H9z', 'va-b': 'M4 20h16M9 10h6v6H9z',
  front: 'M4 4h11v11H4zM9 9h11v11H9z', back: 'M9 9h11v11H9zM4 4h11v11H4z', fwd: 'M12 19V5M5 12l7-7 7 7', bwd: 'M12 5v14M19 12l-7 7-7-7',
  ul: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01', ol: 'M10 6h10M10 12h10M10 18h10M4 4v4M3 8h2M3 14h2l-2 3h2',
  file: 'M14 2H6v20h12V6zM14 2v4h4', print: 'M6 9V2h12v7M6 18H4V9h16v9h-2M6 14h12v8H6z', refresh: 'M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5',
  palette: 'M12 2a10 10 0 1 0 0 20c1 0 1.5-.8 1.5-1.6 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.7-1.6 1.6-1.6H16a6 6 0 0 0 6-6C22 6 17.5 2 12 2zM7 12h.01M9 7h.01M15 7h.01',
  replace: 'M4 7h11M11 3l4 4-4 4M20 17H9M13 13l-4 4 4 4', layout: 'M3 3h18v18H3zM3 9h18M9 9v12', play: 'M7 4l13 8-13 8z',
  unlock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 7.5-2', dup: 'M8 8h12v12H8zM4 16V4h12M14 11v6M11 14h6', scissors: 'M6 3a3 3 0 1 0 0 6a3 3 0 1 0 0-6M6 15a3 3 0 1 0 0 6a3 3 0 1 0 0-6M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12',
  clip: 'M8 4H6v18h12V4h-2M9 2h6v4H9z', eye2: 'M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zM12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6'
};
const icon = (n, cls) => `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${UI[n] || SD.ICONS[n] || ''}"/></svg>`;

/* ---------- DOM helper ---------- */
function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') e.innerHTML = v;
    else if (typeof v !== 'string' && k in e) e[k] = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  kids.flat(Infinity).forEach(c => { if (c == null || c === false) return; e.appendChild(c.nodeType ? c : document.createTextNode(String(c))); });
  return e;
}
const strip = html => { const d = document.createElement('div'); d.innerHTML = html || ''; return (d.textContent || '').trim(); };
const isTyping = t => !!(t && t.closest && t.closest('input,textarea,select,[contenteditable="true"],[contenteditable="plaintext-only"]'));

/* ---------- State ---------- */
const S = {
  deck: null, si: 0, sel: [], editing: null, editNode: null, editCell: null,
  zoom: 0, z: .5, fit: .5, hist: { u: [], r: [], key: null, t: 0 }, clip: null, clipStamp: null,
  tab: 'format', view: 'edit', grid: false, snap: true, notes: false, focus: false,
  tplKind: 'all', tplCat: null, fxKind: 'in', hoverId: null, preview: null, modal: null,
  recentColors: []
};
const cur = () => S.deck.slides[S.si];
const getEl = id => cur() && cur().els.find(e => e.id === id);
const selEls = () => S.sel.map(getEl).filter(Boolean);
const nodeOf = id => S.slideNode && S.slideNode.querySelector(`[data-el-id="${id}"]`);
const th = () => (S.deck && S.deck.theme) || SDTemplates.BLANK.night.t;
const tpOf = () => (S.deck && S.deck.tp && S.deck.tp.t) ? S.deck.tp : SDTemplates.BLANK.night;

/* ---------- Storage ---------- */
const LS = { idx: 'sigeon.decks', deck: id => 'sigeon.deck.' + id, prefs: 'sigeon.prefs' };
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
function listDecks() { try { return JSON.parse(lsGet(LS.idx) || '[]'); } catch (e) { return []; } }
function loadDeck(id) { try { const d = JSON.parse(lsGet(LS.deck(id)) || 'null'); return d && d.slides ? normalize(d) : null; } catch (e) { return null; } }
function setSaveState(t) { const el = $('#saveState'); if (el) el.textContent = t; }
function saveDeckNow() {
  const d = S.deck; if (!d) return;
  clearTimeout(S.saveT);
  d.updated = Date.now();
  const ok = lsSet(LS.deck(d.id), JSON.stringify(d));
  if (ok) {
    const idx = listDecks().filter(x => x.id !== d.id);
    idx.unshift({ id: d.id, title: d.title, updated: d.updated, n: d.slides.length });
    lsSet(LS.idx, JSON.stringify(idx.slice(0, 60)));
    setSaveState('Saved');
  } else {
    setSaveState('Not saved');
    if (!S.warnedFull) { S.warnedFull = true; toast('Browser storage is full. Export the deck to keep a copy.', { label: 'Export', run: () => saveFile() }); }
  }
}
function scheduleSave() { setSaveState('Saving…'); clearTimeout(S.saveT); S.saveT = setTimeout(saveDeckNow, 600); }
function deleteDeck(id) {
  try { localStorage.removeItem(LS.deck(id)); } catch (e) { }
  lsSet(LS.idx, JSON.stringify(listDecks().filter(x => x.id !== id)));
}
function savePrefs() { lsSet(LS.prefs, JSON.stringify({ snap: S.snap, grid: S.grid, recentColors: S.recentColors.slice(0, 8) })); }
function loadPrefs() { try { const p = JSON.parse(lsGet(LS.prefs) || '{}'); if (p.snap != null) S.snap = p.snap; if (p.grid != null) S.grid = p.grid; S.recentColors = p.recentColors || []; } catch (e) { } }
function normalize(d) {
  d.slides = (d.slides || []).map(s => Object.assign({ id: uid(), bg: { color: '#000000' }, transition: { type: 'fade', dur: .6 }, notes: '', els: [], builds: [], hidden: false }, s));
  d.slides.forEach(s => { s.els.forEach(e => { if (!e.id) e.id = uid(); if (!e.mid) e.mid = uid(); }); s.builds = (s.builds || []).filter(b => b && b.el); });
  if (!d.slides.length) d.slides.push(SDTemplates.layout('title', SDTemplates.BLANK.night, 0));
  if (!d.theme) d.theme = deep((d.tp && d.tp.t) || SDTemplates.BLANK.night.t);
  if (!d.id) d.id = uid();
  if (!d.title) d.title = 'Untitled presentation';
  return d;
}

/* ---------- Toasts, popovers, modals ---------- */
function toast(msg, action) {
  const t = h('div', { class: 'toast', role: 'status' }, h('span', {}, msg));
  if (action) t.appendChild(h('button', { onclick: () => { action.run(); t.remove(); } }, action.label));
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), action ? 6000 : 2800);
}
let popEl = null, popAnchor = null;
function closePop() { if (popEl) { popEl.remove(); popEl = null; popAnchor = null; } }
function openPop(anchor, content, o) {
  o = o || {};
  if (popEl && popAnchor && popAnchor === anchor) { closePop(); return null; }
  closePop();
  const p = h('div', { class: 'pop ' + (o.cls || '') });
  p.appendChild(content);
  $('#popLayer').appendChild(p);
  popEl = p; popAnchor = anchor.nodeType ? anchor : null;
  const r = anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : { left: anchor.x, right: anchor.x, top: anchor.y, bottom: anchor.y };
  let x = o.alignRight ? r.right - p.offsetWidth : r.left, y = r.bottom + 6;
  if (x + p.offsetWidth > innerWidth - 8) x = innerWidth - 8 - p.offsetWidth;
  x = Math.max(8, x);
  if (y + p.offsetHeight > innerHeight - 8) y = Math.max(8, r.top - 6 - p.offsetHeight);
  p.style.left = x + 'px'; p.style.top = y + 'px';
  const f = p.querySelector('input:not([type=color]),button');
  if (f && o.focus !== false) setTimeout(() => f.focus({ preventScroll: true }), 0);
  return p;
}
document.addEventListener('pointerdown', e => {
  if (!popEl) return;
  if (popEl.contains(e.target)) return;
  if (popAnchor && popAnchor.contains(e.target)) return;
  closePop();
}, true);
function menu(items) {
  const m = h('div', { class: 'menu', role: 'menu' });
  items.forEach(it => {
    if (!it) return;
    if (it === '-') m.appendChild(h('hr'));
    else if (it.head) m.appendChild(h('div', { class: 'mh' }, it.head));
    else m.appendChild(h('button', { role: 'menuitem', class: it.dis ? 'dis' : '', html: (it.ic ? icon(it.ic) : '') + `<span>${esc(it.label)}</span>` + (it.kbd ? `<kbd>${esc(it.kbd)}</kbd>` : ''), onclick: () => { closePop(); it.run(); } }));
  });
  m.addEventListener('keydown', e => {
    const bs = $$('button:not(.dis)', m), i = bs.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); (bs[i + 1] || bs[0]).focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); (bs[i - 1] || bs[bs.length - 1]).focus(); }
  });
  return m;
}
// Right-click menus, the Export and Play menus, and the Text, Image, Chart and Line dropdowns get the liquid glass highlight: it follows the pointer, and press-and-hold lifts it into a lens you can glide.
function ctxMenu(items) {
  const m = menu(items);
  LiquidGlass.attach(m, { axis: 'y', item: 'button:not(.dis)', hover: true, initial: -1, lift: 1.04, hold: 200 });
  return m;
}
function modal(title, body, foot, o) {
  o = o || {};
  closeModal(); closePop();
  const back = h('div', { class: 'modal-back' });
  back.addEventListener('pointerdown', e => { if (e.target === back) closeModal(); });
  const m = h('div', { class: 'modal ' + (o.cls || ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': title || 'Dialog' });
  if (title) m.appendChild(h('div', { class: 'modal-h' }, h('h3', {}, title), h('button', { class: 'iconbtn', 'aria-label': 'Close', html: icon('x'), onclick: closeModal })));
  if (body) m.appendChild(o.raw ? body : h('div', { class: 'modal-b' }, body));
  if (foot) m.appendChild(h('div', { class: 'modal-f' }, ...foot));
  back.appendChild(m);
  $('#modalLayer').appendChild(back);
  S.modal = back;
  setTimeout(() => { const f = m.querySelector('input,textarea,select') || m.querySelector('.modal-f .primary'); if (f) f.focus(); }, 0);
  return m;
}
function closeModal() { if (S.modal) { S.modal.remove(); S.modal = null; } }
function askText(title, label, value, okLabel, cb, placeholder) {
  const inp = h('input', { class: 'in', value: value || '', placeholder: placeholder || '' });
  const go = () => { const v = inp.value.trim(); closeModal(); cb(v); };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  modal(title, h('div', { class: 'formrow' }, h('label', {}, label), inp), [h('button', { class: 'btn ghost', onclick: closeModal }, 'Cancel'), h('button', { class: 'btn primary', onclick: go }, okLabel)]);
}
function confirmBox(title, text, okLabel, cb, danger) {
  modal(title, h('p', { class: 'hint' }, text), [h('button', { class: 'btn ghost', onclick: closeModal }, 'Cancel'), h('button', { class: 'btn ' + (danger ? 'danger' : 'primary'), onclick: () => { closeModal(); cb(); } }, okLabel)]);
}

/* ---------- Thumbnails ---------- */
const thumbRO = new ResizeObserver(es => es.forEach(en => {
  const w = en.contentRect.width;
  const s = en.target.querySelector(':scope > .sd-slide');
  if (s && w) s.style.transform = `scale(${w / 1920})`;
}));
function thumb(slide, deck, idx, o) {
  const wrap = h('div', { class: 'thumbwrap' });
  const n = SD.renderSlide(slide, deck, Object.assign({ thumb: true, index: idx }, o || {}));
  n.style.transform = 'scale(.12)';
  wrap.appendChild(n);
  thumbRO.observe(wrap);
  return wrap;
}
function clearThumbs(root) { if (root) $$('.thumbwrap', root).forEach(w => thumbRO.unobserve(w)); }

/* ---------- Home ---------- */
const tplCache = {};
const tplDeck = id => tplCache[id] || (tplCache[id] = SDTemplates.build(id));
const FEATURED = ['aurora', 'orbit', 'neon', 'momentum', 'tidal', 'prism'];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const HERO = { i: 0, p: null, t: null };
function ago(t) {
  const s = (Date.now() - t) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return Math.round(s / 60) + ' min ago';
  if (s < 86400) return Math.round(s / 3600) + ' h ago';
  return new Date(t).toLocaleDateString();
}
function showHome() {
  endEdit(); stopPreview();
  if (S.deck) saveDeckNow();
  S.deck = null;
  $('#editor').hidden = true; $('#home').hidden = false;
  history.replaceState(null, '', location.pathname + location.search);
  renderHome();
}
function renderHome() {
  const idx = listDecks(), rl = $('#recentList');
  clearThumbs(rl); rl.innerHTML = '';
  let shown = 0;
  idx.slice(0, 12).forEach(it => {
    const d = loadDeck(it.id);
    if (!d) return;
    shown++;
    const card = h('div', { class: 'recent-item' });
    card.appendChild(h('button', { style: { display: 'block', width: '100%', textAlign: 'left' }, 'aria-label': `Open ${d.title}`, onclick: () => openDeck(d) },
      thumb(d.slides.find(s => !s.hidden) || d.slides[0], d, 0), h('span', { class: 'tpl-name' }, d.title || 'Untitled'),
      h('span', { class: 'tpl-sub' }, `${d.slides.length} slide${d.slides.length === 1 ? '' : 's'}, edited ${ago(d.updated || Date.now())}`)));
    card.appendChild(h('button', {
      class: 'iconbtn sm recent-del', title: 'Delete presentation', 'aria-label': `Delete ${d.title}`, html: icon('trash'),
      onclick: e => { e.stopPropagation(); confirmBox('Delete this presentation?', `“${d.title}” will be removed from this browser. Export it first if you want to keep a copy.`, 'Delete', () => { deleteDeck(d.id); renderHome(); toast('Presentation deleted'); }, true); }
    }));
    rl.appendChild(card);
  });
  $('#recentSec').hidden = !shown;
  const cats = $('#tplCats');
  cats.innerHTML = '';
  [null, ...SDTemplates.CATS].forEach(c => cats.appendChild(h('button', { class: S.tplCat === c ? 'on' : '', onclick: () => { S.tplCat = c; renderHome(); } }, c || 'Everything')));
  renderTplGrid();
  startHero();
}
function renderTplGrid() {
  const g = $('#tplGrid');
  clearThumbs(g); g.innerHTML = '';
  SDTemplates.TEMPLATES.filter(tp => (S.tplKind === 'all' || (S.tplKind === 'anim') === tp.animated) && (!S.tplCat || tp.cat === S.tplCat)).forEach(tp => {
    const deck = tplDeck(tp.id), tw = thumb(deck.slides[0], deck, 0);
    const b = h('button', { class: 'tpl', 'aria-label': `Start from the ${tp.name} template` }, tw,
      h('div', { class: 'tpl-meta' }, h('span', { class: 'tpl-name' }, tp.name), tp.animated ? h('span', { class: 'tag-anim' }, 'Animated') : h('span', { class: 'tpl-sub' }, tp.cat)));
    b.addEventListener('click', () => useTemplate(tp.id));
    b.addEventListener('mouseenter', () => hoverPlay(tw, deck));
    b.addEventListener('mouseleave', () => hoverStop(tw));
    b.addEventListener('focus', () => hoverPlay(tw, deck));
    b.addEventListener('blur', () => hoverStop(tw));
    g.appendChild(b);
  });
  if (!g.children.length) g.appendChild(h('p', { class: 'hint' }, 'No templates match these filters. Choose Everything to see them all.'));
}
function hoverPlay(tw, deck) {
  if (tw._p) return;
  const host = h('div', { style: { position: 'absolute', inset: '0' } });
  tw.appendChild(host);
  const p = new SD.Player(host, deck, { live: false, autoAdvance: 1.5, loop: true });
  p.go(0, { animate: false });
  tw._p = p; tw._h = host;
}
function hoverStop(tw) {
  if (!tw._p) return;
  tw._p.destroy(); tw._h.remove(); tw._p = null;
}
function startHero() {
  stopHero();
  const host = $('#heroPlayer');
  const id = FEATURED[HERO.i % FEATURED.length];
  const tp = SDTemplates.TEMPLATES.find(t => t.id === id);
  $('#heroCap').textContent = `Playing the ${tp.name} template`;
  HERO.id = id;
  HERO.p = new SD.Player(host, tplDeck(id), { live: false });
  HERO.p.go(0, { animate: false });
  if (reduceMotion) return;
  HERO.t = setInterval(() => {
    if ($('#home').hidden) return;
    if (!HERO.p.next()) { HERO.i++; startHero(); }
  }, 3000);
}
function stopHero() { clearInterval(HERO.t); if (HERO.p) { HERO.p.destroy(); HERO.p = null; } }
function useTemplate(id) { const d = SDTemplates.build(id); openDeck(d); toast(`Started from ${d.title}. Edit any text by double-clicking it.`); }
function newBlank(kind) { openDeck(SDTemplates.blank(kind || 'night')); }

/* ---------- Editor ---------- */
function openDeck(d) {
  stopHero();
  $$('.tpl .thumbwrap').forEach(hoverStop);
  S.deck = normalize(d); S.si = 0; S.sel = []; S.editing = null;
  S.hist = { u: [], r: [], key: null, t: 0 };
  S.view = 'edit'; S.zoom = 0;
  $('#home').hidden = true; $('#editor').hidden = false;
  $('#deckTitle').value = S.deck.title;
  $('#lightTable').hidden = true; $('#sizer').hidden = false; $('#tGrid').classList.remove('on');
  SD.fontsOf(S.deck).forEach(f => SD.loadFont(f));
  renderAll();
  requestAnimationFrame(applyZoom);
  saveDeckNow();
  history.replaceState(null, '', '#' + S.deck.id);
}
function renderAll() { renderNav(); renderCanvas(); renderInspector(); renderStatus(); updateUndo(); }
function renderStatus() {
  if (!S.deck) return;
  $('#sbSlide').textContent = `Slide ${S.si + 1} of ${S.deck.slides.length}`;
  $('#navCount').textContent = S.deck.slides.length;
  $('#sbGrid').classList.toggle('on', S.grid);
  $('#sbSnap').classList.toggle('on', S.snap);
  $('#sbNotes').classList.toggle('on', S.notes);
  $('#notesDrawer').hidden = !S.notes;
  const ni = $('#notesInput');
  if (document.activeElement !== ni) ni.value = cur().notes || '';
}

/* History */
function snapshot() { return JSON.stringify({ deck: S.deck, si: S.si }); }
function checkpoint(key) {
  const H = S.hist, now = Date.now();
  if (key && H.key === key && now - H.t < 1200) { H.t = now; return; }
  H.u.push(snapshot());
  if (H.u.length > 150) H.u.shift();
  H.r = []; H.key = key || null; H.t = now;
  updateUndo();
}
function mutate(fn, o) { o = o || {}; checkpoint(o.key); fn(); changed(o); }
function changed(o) {
  o = o || {};
  scheduleSave();
  if (o.canvas !== false) renderCanvas();
  if (o.nav) renderNav(); else refreshThumb(S.si);
  if (o.insp) renderInspector();
  renderStatus();
}
function restore(json) {
  const st = JSON.parse(json);
  S.deck = st.deck; S.si = clamp(st.si, 0, S.deck.slides.length - 1);
  S.sel = S.sel.filter(id => getEl(id));
  S.hist.key = null;
  $('#deckTitle').value = S.deck.title;
  renderAll(); scheduleSave();
}
function undo() { endEdit(); const H = S.hist; if (!H.u.length) return toast('Nothing to undo'); H.r.push(snapshot()); restore(H.u.pop()); }
function redo() { endEdit(); const H = S.hist; if (!H.r.length) return toast('Nothing to redo'); H.u.push(snapshot()); restore(H.r.pop()); }
function updateUndo() { $('#tUndo').disabled = !S.hist.u.length; $('#tRedo').disabled = !S.hist.r.length; }

/* ---------- Navigator ---------- */
function renderNav() {
  const list = $('#navList');
  clearThumbs(list); list.innerHTML = '';
  S.deck.slides.forEach((s, i) => list.appendChild(navItem(s, i)));
  $('#navCount').textContent = S.deck.slides.length;
  const on = list.querySelector('.on');
  if (on) on.scrollIntoView({ block: 'nearest' });
}
function navItem(s, i) {
  const it = h('div', { class: 'nv-item' + (i === S.si ? ' on' : '') + (s.hidden ? ' hid' : ''), 'data-i': i });
  it.appendChild(h('span', { class: 'nv-num' }, String(i + 1)));
  const tb = h('div', { class: 'nv-thumb', role: 'button', tabindex: '0', 'aria-label': `Slide ${i + 1}${s.hidden ? ', skipped' : ''}` });
  tb.appendChild(thumb(s, S.deck, i));
  it.appendChild(tb);
  const badges = h('div', { class: 'nv-badges' });
  if (s.builds.length) badges.appendChild(h('span', { class: 'nv-badge', title: `${s.builds.length} builds`, html: icon('sparkle') + s.builds.length }));
  if (s.notes) badges.appendChild(h('span', { class: 'nv-badge', title: 'Has speaker notes', html: icon('notes') }));
  it.appendChild(badges);
  tb.addEventListener('click', () => { if (Date.now() - (S.navDropAt || 0) < 350) return; goSlide(i); });
  tb.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goSlide(i); return; }
    // Alt + Up/Down moves the slide without a mouse.
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault(); e.stopPropagation();
      const to = i + (e.key === 'ArrowUp' ? -1 : 1);
      if (to < 0 || to >= S.deck.slides.length) return;
      moveSlide(i, to);
      const t2 = $(`#navList .nv-item[data-i="${to}"] .nv-thumb`);
      if (t2) t2.focus();
    }
  });
  tb.addEventListener('pointerdown', e => startSlideDrag(e, i, it));
  it.addEventListener('contextmenu', e => { e.preventDefault(); goSlide(i); openPop({ x: e.clientX, y: e.clientY }, slideMenu(i)); });
  return it;
}
/* Reorder slides: press and hold a thumbnail (or press and drag with a mouse), move it
   up or down, and release where it belongs. The other slides slide apart to show the gap. */
function startSlideDrag(e, from, item) {
  if (e.button !== 0 || S.deck.slides.length < 2) return;
  const list = $('#navList'), mouse = e.pointerType === 'mouse', s0 = { x: e.clientX, y: e.clientY, id: e.pointerId };
  let drag = null;
  const holdT = setTimeout(() => { if (!drag) begin(); }, mouse ? 350 : 260);
  const noScroll = ev => { if (drag) ev.preventDefault(); };
  function begin() {
    endEdit(); closePop();
    const items = $$('.nv-item', list);
    const tb = item.querySelector('.nv-thumb'), r = tb.getBoundingClientRect();
    const ghost = h('div', { class: 'nv-ghost', 'aria-hidden': 'true' });
    const tw = tb.querySelector('.thumbwrap').cloneNode(true);
    ghost.appendChild(tw);
    ghost.appendChild(h('span', { class: 'nv-ghost-num' }, String(from + 1)));
    Object.assign(ghost.style, { width: r.width + 'px', height: r.height + 'px', left: r.left + 'px', top: r.top + 'px' });
    document.body.appendChild(ghost);
    item.classList.add('nv-slot');
    list.classList.add('sorting');
    document.body.classList.add('nv-sorting');
    drag = { items, tops: items.map(x => x.offsetTop), hs: items.map(x => x.offsetHeight), ghost, off: s0.y - r.top, th: r.height, to: from, y: s0.y, raf: 0 };
    if (navigator.vibrate) try { navigator.vibrate(8); } catch (err) { }
    const loop = () => {
      if (!drag) return;
      const lr = list.getBoundingClientRect(), edge = 48;
      let v = 0;
      if (drag.y < lr.top + edge) v = -Math.ceil((lr.top + edge - drag.y) / 4);
      else if (drag.y > lr.bottom - edge) v = Math.ceil((drag.y - (lr.bottom - edge)) / 4);
      if (v) { list.scrollTop += v; update(drag.y); }
      drag.raf = requestAnimationFrame(loop);
    };
    drag.raf = requestAnimationFrame(loop);
    update(s0.y);
  }
  function update(cy) {
    drag.y = cy;
    drag.ghost.style.top = (cy - drag.off) + 'px';
    const lr = list.getBoundingClientRect();
    const center = cy - drag.off + drag.th / 2 - lr.top + list.scrollTop;
    let to = 0;
    drag.items.forEach((x, j) => { if (j !== from && drag.tops[j] + drag.hs[j] / 2 < center) to++; });
    drag.to = to;
    const H = drag.hs[from];
    drag.items.forEach((x, j) => {
      let dy = 0;
      if (j === from) dy = to > from ? drag.tops[to] + drag.hs[to] - H - drag.tops[from] : drag.tops[to] - drag.tops[from];
      else if (from < j && j <= to) dy = -H;
      else if (to <= j && j < from) dy = H;
      x.style.transform = dy ? `translateY(${dy}px)` : '';
    });
  }
  function finish(cancel) {
    cancelAnimationFrame(drag.raf);
    const d = drag;
    drag = null;
    const to = cancel ? from : d.to;
    if (cancel) d.items.forEach(x => { x.style.transform = ''; });
    const slot = item.querySelector('.nv-thumb').getBoundingClientRect();
    d.ghost.classList.add('landing');
    Object.assign(d.ghost.style, { left: slot.left + 'px', top: slot.top + 'px' });
    S.navDropAt = Date.now();
    setTimeout(() => {
      d.ghost.remove();
      list.classList.remove('sorting');
      document.body.classList.remove('nv-sorting');
      d.items.forEach(x => { x.style.transform = ''; });
      item.classList.remove('nv-slot');
      if (to !== from) { moveSlide(from, to); toast(`Moved slide ${from + 1} to position ${to + 1}`, { label: 'Undo', run: undo }); }
      else if (!cancel) goSlide(from);
    }, 200);
  }
  const mv = ev => {
    if (ev.pointerId !== s0.id) return;
    if (drag) { ev.preventDefault(); update(ev.clientY); return; }
    const dx = Math.abs(ev.clientX - s0.x), dy = Math.abs(ev.clientY - s0.y);
    if (mouse && dy > 6) { clearTimeout(holdT); begin(); update(ev.clientY); }
    else if (!mouse && (dx > 10 || dy > 10)) { clearTimeout(holdT); off(); }
  };
  const up = ev => {
    if (ev.pointerId !== s0.id) return;
    clearTimeout(holdT); off();
    if (drag) finish(ev.type === 'pointercancel');
  };
  const key = ev => { if (ev.key === 'Escape' && drag) { ev.preventDefault(); ev.stopPropagation(); clearTimeout(holdT); off(); finish(true); } };
  function off() {
    window.removeEventListener('pointermove', mv);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
    window.removeEventListener('keydown', key, true);
    list.removeEventListener('touchmove', noScroll);
  }
  window.addEventListener('pointermove', mv, { passive: false });
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  window.addEventListener('keydown', key, true);
  list.addEventListener('touchmove', noScroll, { passive: false });
}
function refreshThumb(i) {
  clearTimeout(S.thT);
  S.thT = setTimeout(() => {
    const it = $(`#navList .nv-item[data-i="${i}"]`), s = S.deck && S.deck.slides[i];
    if (!it || !s) return;
    const box = it.querySelector('.nv-thumb');
    clearThumbs(box); box.innerHTML = '';
    box.appendChild(thumb(s, S.deck, i));
    const fresh = navItem(s, i);
    it.querySelector('.nv-badges').replaceWith(fresh.querySelector('.nv-badges'));
  }, 150);
}
function markNav() {
  $$('#navList .nv-item').forEach((it, i) => it.classList.toggle('on', i === S.si));
  const on = $('#navList .on');
  if (on) on.scrollIntoView({ block: 'nearest' });
}
function goSlide(i) {
  if (!S.deck) return;
  i = clamp(i, 0, S.deck.slides.length - 1);
  endEdit(); stopPreview();
  S.si = i; S.sel = []; S.hoverId = null;
  markNav();
  if (S.view === 'grid') renderLight(); else renderCanvas();
  renderInspector(); renderStatus();
}
function slideMenu(i) {
  const s = S.deck.slides[i];
  return ctxMenu([
    { label: 'New slide after this', ic: 'plus', kbd: 'Ctrl+M', run: () => addSlide('content', i + 1) },
    { label: 'Duplicate', ic: 'dup', kbd: 'Ctrl+Shift+D', run: () => duplicateSlide(i) },
    { label: s.hidden ? 'Include in presentation' : 'Skip in presentation', ic: 'eyeoff', run: () => toggleSkip(i) },
    '-',
    { label: 'Move up', ic: 'fwd', dis: i === 0, run: () => moveSlide(i, i - 1) },
    { label: 'Move down', ic: 'bwd', dis: i === S.deck.slides.length - 1, run: () => moveSlide(i, i + 1) },
    '-',
    { label: 'Play from here', ic: 'play', run: () => present(i) },
    { label: 'Delete slide', ic: 'trash', run: () => deleteSlide(i) }
  ]);
}
function addSlide(kind, at) {
  endEdit();
  at = at == null ? S.si + 1 : at;
  const s = SDTemplates.layout(kind || 'content', tpOf(), at);
  if (S.deck.tp && S.deck.tp.t !== undefined) { /* template look carried through tpOf */ }
  mutate(() => { S.deck.slides.splice(at, 0, s); S.si = at; S.sel = []; }, { nav: true, insp: true });
}
function cloneSlide(s) {
  const c = deep(s), map = {};
  c.id = uid();
  c.els.forEach(e => { const n = uid(); map[e.id] = n; e.id = n; });
  c.builds.forEach(b => { b.id = uid(); b.el = map[b.el] || b.el; });
  return c;
}
function duplicateSlide(i) {
  endEdit();
  i = i == null ? S.si : i;
  const c = cloneSlide(S.deck.slides[i]);
  mutate(() => { S.deck.slides.splice(i + 1, 0, c); S.si = i + 1; S.sel = []; }, { nav: true, insp: true });
  toast('Slide duplicated. Move objects on the copy, then pick Magic Morph to animate between them.');
}
function deleteSlide(i) {
  endEdit();
  i = i == null ? S.si : i;
  if (S.deck.slides.length <= 1) return toast('A presentation needs at least one slide');
  mutate(() => { S.deck.slides.splice(i, 1); S.si = clamp(S.si >= i ? S.si - 1 : S.si, 0, S.deck.slides.length - 1); if (S.si < 0) S.si = 0; S.sel = []; }, { nav: true, insp: true });
  toast('Slide deleted', { label: 'Undo', run: undo });
}
function moveSlide(from, to) {
  if (from === to || to < 0 || to >= S.deck.slides.length) return;
  mutate(() => { const [s] = S.deck.slides.splice(from, 1); S.deck.slides.splice(to, 0, s); S.si = to; }, { nav: true, insp: true });
  if (S.view === 'grid') renderLight();
}
function toggleSkip(i) {
  i = i == null ? S.si : i;
  mutate(() => { S.deck.slides[i].hidden = !S.deck.slides[i].hidden; }, { nav: true, insp: true });
}

/* ---------- Canvas ---------- */
function renderCanvas() {
  if (!S.deck) return;
  if (S.view === 'grid') { renderLight(); return; }
  let restoreEdit = null;
  if (S.editing && S.editNode && !S.editCell) { restoreEdit = S.editing; commitEditText(); }
  const holder = $('#holder');
  const node = SD.renderSlide(cur(), S.deck, { editor: true, index: S.si });
  const old = holder.querySelector(':scope > .sd-slide');
  if (old) old.replaceWith(node); else holder.insertBefore(node, $('#overlay'));
  S.slideNode = node;
  autoFit();
  if (restoreEdit) { S.editing = null; beginEdit(restoreEdit, {}); }
  drawOverlay();
}
function rerenderEl(el) {
  const n = nodeOf(el.id);
  if (!n) return;
  const nn = SD.renderEl(el, { editor: true });
  if (el.hidden) nn.classList.add('sd-ghost');
  n.replaceWith(nn);
}
function fitOne(el) {
  const n = nodeOf(el.id);
  if (!n) return;
  const tx = n.querySelector('.sd-tx');
  if (!tx) return;
  const need = Math.ceil(tx.offsetHeight + 2 * (el.pad || 0) + 2 * (el.strokeW || 0));
  const minH = Math.round((el.size || 40) * (el.lh || 1.2));
  const v = Math.max(need, minH);
  if (Math.abs(v - el.h) > 1) { el.h = v; n.style.height = v + 'px'; }
}
function autoFit() { if (!S.deck) return; cur().els.forEach(el => { if (el.type === 'text' && el.autoH) fitOne(el); }); }
function applyZoom() {
  const st = $('#stage');
  if (!st || !st.clientWidth || !S.deck) return;
  const pad = st.clientWidth < 700 ? 18 : 52;
  S.fit = Math.max(.05, Math.min((st.clientWidth - pad * 2) / 1920, (st.clientHeight - pad * 2) / 1080));
  const z = S.zoom || S.fit;
  S.z = z;
  st.classList.toggle('fit', !S.zoom);
  const sz = $('#sizer');
  sz.style.width = Math.round(1920 * z) + 'px';
  sz.style.height = Math.round(1080 * z) + 'px';
  const hd = $('#holder');
  hd.style.transform = `scale(${z})`;
  hd.style.setProperty('--inv', (1 / z).toFixed(4));
  $('#zVal').textContent = S.zoom ? Math.round(z * 100) + '%' : 'Fit';
}
function zoomBy(k) { S.zoom = clamp((S.zoom || S.fit) * k, .08, 4); applyZoom(); }
function zoomFit() { S.zoom = 0; applyZoom(); }
function zoomTo(z) { S.zoom = z; applyZoom(); }

function place(n, b) {
  n.style.left = b.x + 'px'; n.style.top = b.y + 'px'; n.style.width = b.w + 'px'; n.style.height = b.h + 'px';
  n.style.transform = b.rot ? `rotate(${b.rot}deg)` : '';
}
function bbox(els) {
  const x = Math.min(...els.map(e => e.x)), y = Math.min(...els.map(e => e.y));
  const x2 = Math.max(...els.map(e => e.x + e.w)), y2 = Math.max(...els.map(e => e.y + e.h));
  return { x, y, w: x2 - x, h: y2 - y };
}
function drawOverlay() {
  const ov = $('#overlay');
  if (!ov || !S.deck) return;
  ov.innerHTML = '';
  ov.classList.toggle('gridon', S.grid);
  const els = selEls(), single = els.length === 1;
  els.forEach(el => {
    const b = h('div', { class: 'sb' + (el.locked ? ' locked' : '') + (S.editing === el.id ? ' editbox' : '') + (els.length > 1 ? ' multi' : '') });
    place(b, el);
    if (single && !el.locked && S.editing !== el.id) {
      (el.type === 'line' ? ['e', 'w'] : ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']).forEach(k => b.appendChild(h('i', { class: 'hd hd-' + k, 'data-h': k })));
      b.appendChild(h('i', { class: 'rot', 'data-h': 'rot', title: 'Rotate. Hold Shift to snap to 15°' }));
    }
    if (el.locked) b.appendChild(h('span', { class: 'lockbadge', html: icon('lock') }));
    ov.appendChild(b);
  });
  if (els.length > 1) { const g = h('div', { class: 'groupbox' }); place(g, bbox(els)); ov.appendChild(g); }
  if (S.hoverId && !S.sel.includes(S.hoverId)) { const he = getEl(S.hoverId); if (he) { const hv = h('div', { class: 'hov' }); place(hv, he); ov.appendChild(hv); } }
}
function setHover(id) {
  if (S.hoverId === id) return;
  S.hoverId = id;
  const ov = $('#overlay'), old = ov.querySelector('.hov');
  if (old) old.remove();
  if (id && !S.sel.includes(id)) { const el = getEl(id); if (el) { const hv = h('div', { class: 'hov' }); place(hv, el); ov.appendChild(hv); } }
}
function drawGuides(g) {
  const ov = $('#overlay');
  (g || []).forEach(x => { const d = h('div', { class: 'guide ' + (x.v ? 'v' : 'h') }); if (x.v) d.style.left = x.at + 'px'; else d.style.top = x.at + 'px'; ov.appendChild(d); });
}
function measure(text, x, y) {
  const m = h('div', { class: 'measure' }, text);
  m.style.left = x + 'px'; m.style.top = y + 'px';
  $('#overlay').appendChild(m);
}
function toSlide(e) { const r = $('#holder').getBoundingClientRect(); return { x: (e.clientX - r.left) / S.z, y: (e.clientY - r.top) / S.z }; }
function elAt(target) {
  const n = target && target.closest && target.closest('.sd-el');
  return n && S.slideNode && S.slideNode.contains(n) ? n.dataset.elId : null;
}
function snapTargets(excl) {
  const xs = [0, 960, 1920], ys = [0, 540, 1080];
  cur().els.forEach(el => {
    if (excl.includes(el.id) || el.locked) return;
    xs.push(el.x, el.x + el.w / 2, el.x + el.w);
    ys.push(el.y, el.y + el.h / 2, el.y + el.h);
  });
  return { xs, ys };
}
function snap(b, T) {
  const g = [];
  if (!S.snap || !T) return { dx: 0, dy: 0, guides: g };
  const thr = 7 / S.z;
  let bx = null, by = null;
  [b.x, b.x + b.w / 2, b.x + b.w].forEach(v => T.xs.forEach(t => { const d = t - v; if (Math.abs(d) <= thr && (!bx || Math.abs(d) < Math.abs(bx.d))) bx = { d, t }; }));
  [b.y, b.y + b.h / 2, b.y + b.h].forEach(v => T.ys.forEach(t => { const d = t - v; if (Math.abs(d) <= thr && (!by || Math.abs(d) < Math.abs(by.d))) by = { d, t }; }));
  let dx = bx ? bx.d : 0, dy = by ? by.d : 0;
  if (bx) g.push({ v: true, at: bx.t });
  if (by) g.push({ v: false, at: by.t });
  if (S.grid) { if (!bx) dx = Math.round(b.x / 40) * 40 - b.x; if (!by) dy = Math.round(b.y / 40) * 40 - b.y; }
  return { dx, dy, guides: g };
}
function snapEdge(v, list) {
  if (!S.snap) return null;
  const thr = 7 / S.z;
  let best = null;
  list.forEach(t => { const d = t - v; if (Math.abs(d) <= thr && (!best || Math.abs(d) < Math.abs(best.d))) best = { d, t }; });
  return best;
}

function setupStage() {
  const stage = $('#stage');
  stage.addEventListener('pointerdown', onDown);
  stage.addEventListener('pointermove', e => { if (!e.buttons && S.view === 'edit') setHover(elAt(e.target)); });
  stage.addEventListener('pointerleave', () => setHover(null));
  stage.addEventListener('dblclick', onDbl);
  stage.addEventListener('contextmenu', onCtx);
  stage.addEventListener('wheel', e => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); zoomBy(e.deltaY < 0 ? 1.1 : 1 / 1.1); } }, { passive: false });
  stage.addEventListener('dragover', e => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); stage.classList.add('dragover'); } });
  stage.addEventListener('dragleave', e => { if (e.target === stage || !stage.contains(e.relatedTarget)) stage.classList.remove('dragover'); });
  stage.addEventListener('drop', e => {
    stage.classList.remove('dragover');
    const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    e.preventDefault();
    insertImageFiles(files, S.view === 'edit' ? toSlide(e) : null);
  });
  new ResizeObserver(() => applyZoom()).observe(stage);
}
function onDown(e) {
  if (e.button !== 0 || S.view !== 'edit') return;
  if (S.preview) { stopPreview(); return; }
  if (S.editing) {
    if (e.target.closest('[contenteditable="true"],[contenteditable="plaintext-only"]')) return;
    endEdit();
  }
  if (document.activeElement && document.activeElement !== document.body && !isTyping(e.target)) document.activeElement.blur();
  const hd = e.target.closest('[data-h]');
  if (hd) {
    e.preventDefault();
    const el = selEls()[0];
    if (!el) return;
    if (hd.dataset.h === 'rot') startRotate(e, el); else startResize(e, el, hd.dataset.h);
    return;
  }
  const id = elAt(e.target), p = toSlide(e), multi = e.shiftKey || e.ctrlKey || e.metaKey;
  if (id) {
    e.preventDefault();
    if (multi) { S.sel = S.sel.includes(id) ? S.sel.filter(x => x !== id) : [...S.sel, id]; selectionChanged(); return; }
    if (!S.sel.includes(id)) { S.sel = [id]; selectionChanged(); }
    startMove(e, p);
  } else {
    if (!multi && S.sel.length) { S.sel = []; selectionChanged(); }
    startMarquee(e, p);
  }
}
function selectionChanged() { drawOverlay(); renderInspector(); }
function track(mv, up) {
  const u = ev => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', u); window.removeEventListener('pointercancel', u); up(ev); };
  window.addEventListener('pointermove', mv);
  window.addEventListener('pointerup', u);
  window.addEventListener('pointercancel', u);
}
function startMove(e, p0) {
  let els = selEls().filter(x => !x.locked);
  if (!els.length) return;
  const base = els.map(el => ({ x: el.x, y: el.y }));
  const bb = bbox(els);
  let moved = false, T = null;
  track(ev => {
    const p = toSlide(ev);
    let dx = p.x - p0.x, dy = p.y - p0.y;
    if (!moved) {
      if (Math.hypot(dx, dy) * S.z < 4) return;
      moved = true;
      checkpoint();
      if (ev.altKey) {
        const copies = els.map(el => Object.assign(deep(el), { id: uid(), mid: uid() }));
        cur().els.push(...copies);
        S.sel = copies.map(c => c.id);
        renderCanvas();
        els = selEls();
      }
      T = snapTargets(S.sel);
      setHover(null);
    }
    if (ev.shiftKey) { if (Math.abs(dx) > Math.abs(dy)) dy = 0; else dx = 0; }
    const sn = snap({ x: bb.x + dx, y: bb.y + dy, w: bb.w, h: bb.h }, T);
    dx += sn.dx; dy += sn.dy;
    els.forEach((el, i) => {
      el.x = Math.round(base[i].x + dx); el.y = Math.round(base[i].y + dy);
      const n = nodeOf(el.id);
      if (n) { n.style.left = el.x + 'px'; n.style.top = el.y + 'px'; }
    });
    drawOverlay(); drawGuides(sn.guides);
    measure(`${Math.round(bb.x + dx)}, ${Math.round(bb.y + dy)}`, bb.x + dx + bb.w / 2, bb.y + dy + bb.h + 14);
  }, () => { if (moved) { changed({ canvas: false, insp: true }); drawOverlay(); } });
}
function startResize(e, el, hk) {
  const p0 = toSlide(e), o = { x: el.x, y: el.y, w: el.w, h: el.h };
  const th0 = (el.rot || 0) * Math.PI / 180, cos = Math.cos(th0), sin = Math.sin(th0);
  const sx = hk.includes('e') ? 1 : hk.includes('w') ? -1 : 0, sy = hk.includes('s') ? 1 : hk.includes('n') ? -1 : 0;
  const keepDefault = ['image', 'icon', 'chart'].includes(el.type) && sx && sy;
  const T = snapTargets([el.id]);
  checkpoint();
  if (sy && el.type === 'text') el.autoH = false;
  track(ev => {
    const p = toSlide(ev), dx = p.x - p0.x, dy = p.y - p0.y;
    const lx = dx * cos + dy * sin, ly = -dx * sin + dy * cos;
    let w = sx ? o.w + sx * lx : o.w, h2 = sy ? o.h + sy * ly : o.h;
    const keep = keepDefault !== ev.shiftKey && sx && sy;
    const g = [];
    if (keep) { const k = Math.max(w / o.w, h2 / o.h); w = o.w * k; h2 = o.h * k; }
    else if (!el.rot) {
      if (sx) { const edge = sx > 0 ? o.x + w : o.x + o.w - w, s1 = snapEdge(edge, T.xs); if (s1) { w += sx * s1.d; g.push({ v: true, at: s1.t }); } }
      if (sy) { const edge = sy > 0 ? o.y + h2 : o.y + o.h - h2, s2 = snapEdge(edge, T.ys); if (s2) { h2 += sy * s2.d; g.push({ v: false, at: s2.t }); } }
    }
    w = Math.max(10, w); h2 = Math.max(10, h2);
    if (el.type === 'line') h2 = o.h;
    const dcx = sx * (w - o.w) / 2, dcy = sy * (h2 - o.h) / 2;
    const wx = dcx * cos - dcy * sin, wy = dcx * sin + dcy * cos;
    const cx = o.x + o.w / 2 + wx, cy = o.y + o.h / 2 + wy;
    el.w = Math.round(w); el.h = Math.round(h2); el.x = Math.round(cx - w / 2); el.y = Math.round(cy - h2 / 2);
    rerenderEl(el);
    if (el.type === 'text' && el.autoH) fitOne(el);
    drawOverlay(); drawGuides(g);
    measure(`${el.w} × ${el.h}`, el.x + el.w / 2, el.y + el.h + 14);
  }, () => { changed({ insp: true }); });
}
function startRotate(e, el) {
  checkpoint();
  const cx = el.x + el.w / 2, cy = el.y + el.h / 2;
  track(ev => {
    const p = toSlide(ev);
    let a = Math.atan2(p.y - cy, p.x - cx) * 180 / Math.PI + 90;
    if (ev.shiftKey) a = Math.round(a / 15) * 15;
    else { const r = Math.round(a / 90) * 90; if (Math.abs(a - r) < 3) a = r; }
    a = ((a + 180) % 360 + 360) % 360 - 180;
    el.rot = Math.round(a * 10) / 10;
    const n = nodeOf(el.id);
    if (n) n.style.transform = el.rot ? `rotate(${el.rot}deg)` : '';
    drawOverlay();
    measure(`${Math.round(el.rot)}°`, cx, el.y + el.h + 14);
  }, () => changed({ insp: true }));
}
function startMarquee(e, p0) {
  const base = (e.shiftKey || e.ctrlKey || e.metaKey) ? [...S.sel] : [];
  let active = false;
  track(ev => {
    const p = toSlide(ev);
    const r = { x: Math.min(p.x, p0.x), y: Math.min(p.y, p0.y), w: Math.abs(p.x - p0.x), h: Math.abs(p.y - p0.y) };
    if (!active && r.w * S.z < 4 && r.h * S.z < 4) return;
    active = true;
    const hit = cur().els.filter(el => !el.locked && !(el.x > r.x + r.w || el.x + el.w < r.x || el.y > r.y + r.h || el.y + el.h < r.y)).map(el => el.id);
    S.sel = [...new Set([...base, ...hit])];
    drawOverlay();
    const m = h('div', { class: 'marquee' }); place(m, r); $('#overlay').appendChild(m);
  }, () => { drawOverlay(); if (active) renderInspector(); });
}
function onDbl(e) {
  if (S.view !== 'edit') return;
  const id = elAt(e.target);
  if (!id) return;
  const el = getEl(id);
  if (!el || el.locked) return;
  switch (el.type) {
    case 'text': case 'shape': case 'code': beginEdit(id, { point: e }); break;
    case 'table': { const td = e.target.closest('td,th'); if (td) editCell(el, td); break; }
    case 'image': pickImage(src => mutate(() => { el.src = src; }, { insp: true })); break;
    case 'chart': S.tab = 'format'; renderInspector(); setTimeout(() => { const t = $('#chartData'); if (t) t.focus(); }, 0); break;
    case 'icon': iconPicker({ x: e.clientX, y: e.clientY }, name => mutate(() => { el.icon = name; }, { insp: true })); break;
    case 'embed': askText('Video link', 'YouTube or Vimeo address', el.url, 'Update video', v => mutate(() => { el.url = v; })); break;
  }
}
function onCtx(e) {
  if (S.view !== 'edit') return;
  e.preventDefault();
  const id = elAt(e.target);
  if (id && !S.sel.includes(id)) { S.sel = [id]; selectionChanged(); }
  const has = S.sel.length > 0, one = selEls()[0];
  openPop({ x: e.clientX, y: e.clientY }, ctxMenu(has ? [
    { label: 'Cut', ic: 'scissors', kbd: 'Ctrl+X', run: cutEls },
    { label: 'Copy', ic: 'copy', kbd: 'Ctrl+C', run: copyEls },
    { label: 'Paste', ic: 'clip', kbd: 'Ctrl+V', dis: !S.clip, run: pasteEls },
    { label: 'Duplicate', ic: 'dup', kbd: 'Ctrl+D', run: duplicateEls },
    '-',
    { label: 'Bring to front', ic: 'front', kbd: 'Ctrl+Shift+]', run: () => arrange('front') },
    { label: 'Send to back', ic: 'back', kbd: 'Ctrl+Shift+[', run: () => arrange('back') },
    { label: one && one.locked ? 'Unlock' : 'Lock', ic: one && one.locked ? 'unlock' : 'lock', kbd: 'Ctrl+L', run: toggleLock },
    '-',
    { label: 'Add a build', ic: 'sparkle', run: () => { S.tab = 'animate'; renderInspector(); syncTabs(); } },
    { label: 'Delete', ic: 'trash', kbd: 'Del', run: deleteSel }
  ] : [
    { label: 'Paste', ic: 'clip', kbd: 'Ctrl+V', dis: !S.clip, run: pasteEls },
    { label: 'Select all', kbd: 'Ctrl+A', run: selectAll },
    '-',
    { label: 'Add text', ic: 'text', kbd: 'T', run: () => insertText('body') },
    { label: 'Add shape', ic: 'shape', kbd: 'R', run: () => insertShape('rect') },
    { label: 'Add image', ic: 'image', run: () => pickImage(src => insertImageSrc(src)) },
    '-',
    { label: 'Slide background', ic: 'palette', run: () => { S.tab = 'slide'; renderInspector(); syncTabs(); } },
    { label: S.grid ? 'Hide grid' : 'Show grid', ic: 'dots', run: toggleGrid }
  ]));
}

/* ---------- Text editing ---------- */
function cleanHTML(html) {
  const t = document.createElement('template');
  t.innerHTML = html;
  t.content.querySelectorAll('script,style,iframe,object,embed,link,meta').forEach(n => n.remove());
  t.content.querySelectorAll('*').forEach(n => [...n.attributes].forEach(a => {
    if (/^on/i.test(a.name) || (a.name === 'href' && /^\s*javascript:/i.test(a.value))) n.removeAttribute(a.name);
  }));
  return t.innerHTML.replace(/(<br\s*\/?>)+$/i, '');
}
function beginEdit(id, o) {
  o = o || {};
  const el = getEl(id);
  if (!el || el.locked || !['text', 'shape', 'code'].includes(el.type)) return;
  if (S.editing && S.editing !== id) endEdit();
  S.editing = id; S.sel = [id];
  const n = nodeOf(id);
  if (!n) return;
  n.classList.add('editing');
  let tx;
  if (el.type === 'code') {
    tx = n.querySelector('pre');
    tx.textContent = el.code || '';
    tx.setAttribute('contenteditable', 'plaintext-only');
    if (tx.contentEditable !== 'plaintext-only') tx.setAttribute('contenteditable', 'true');
  } else {
    tx = n.querySelector('.sd-tx');
    tx.setAttribute('contenteditable', 'true');
  }
  tx.spellcheck = el.type !== 'code';
  S.editNode = tx;
  tx.addEventListener('input', onEditInput);
  tx.addEventListener('keydown', onEditKey);
  tx.addEventListener('paste', onEditPaste);
  tx.focus({ preventScroll: true });
  const sel = getSelection(), r = document.createRange();
  let placed = false;
  if (o.point && document.caretRangeFromPoint) {
    const cr = document.caretRangeFromPoint(o.point.clientX, o.point.clientY);
    if (cr && tx.contains(cr.startContainer)) { sel.removeAllRanges(); sel.addRange(cr); placed = true; }
  }
  if (!placed) { r.selectNodeContents(tx); if (!o.selectAll) r.collapse(false); sel.removeAllRanges(); sel.addRange(r); }
  drawOverlay();
  renderInspector();
}
function onEditKey(e) {
  if (e.key === 'Escape') { e.preventDefault(); endEdit(); return; }
  const el = getEl(S.editing);
  if (e.key === 'Tab' && el && el.type === 'code') { e.preventDefault(); document.execCommand('insertText', false, '  '); }
}
function onEditPaste(e) { e.preventDefault(); document.execCommand('insertText', false, e.clipboardData.getData('text/plain')); }
function onEditInput() {
  const el = getEl(S.editing);
  if (el && el.type === 'text' && el.autoH) { fitOne(el); drawOverlay(); }
}
function commitEditText() {
  const el = getEl(S.editing), tx = S.editNode;
  if (!el || !tx) return;
  if (el.type === 'code') el.code = tx.innerText.replace(/\n$/, '');
  else el.html = cleanHTML(tx.innerHTML);
}
function endEdit(o) {
  o = o || {};
  const id = S.editing;
  if (!id) return;
  const tx = S.editNode, cell = S.editCell;
  S.editing = null; S.editNode = null; S.editCell = null;
  const el = getEl(id);
  if (el && tx) {
    if (cell && el.type === 'table') {
      const v = cleanHTML(tx.innerHTML);
      if (el.table.rows[cell.r] && v !== el.table.rows[cell.r][cell.c]) { checkpoint(); el.table.rows[cell.r][cell.c] = v; }
    } else if (el.type === 'code') {
      const v = tx.innerText.replace(/\n$/, '');
      if (v !== el.code) { checkpoint(); el.code = v; }
    } else {
      const v = cleanHTML(tx.innerHTML);
      if (el.type === 'text' && !strip(v)) { checkpoint(); removeEls([id]); }
      else if (v !== el.html) { checkpoint(); el.html = v; }
    }
  }
  if (tx) tx.removeAttribute('contenteditable');
  changed({ insp: o.quiet ? false : true });
}
function editCell(el, td) {
  endEdit();
  const n = nodeOf(el.id);
  td = n && n.querySelector(`[data-r="${td.dataset.r}"][data-c="${td.dataset.c}"]`) || td;
  S.editing = el.id; S.sel = [el.id];
  S.editCell = { r: +td.dataset.r, c: +td.dataset.c };
  td.setAttribute('contenteditable', 'true');
  S.editNode = td;
  td.addEventListener('paste', onEditPaste);
  td.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); endEdit(); return; }
    if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
      e.preventDefault();
      const rows = el.table.rows;
      let { r, c } = S.editCell;
      if (e.key === 'Enter') r++;
      else { c += e.shiftKey ? -1 : 1; if (c >= rows[0].length) { c = 0; r++; } if (c < 0) { c = rows[0].length - 1; r--; } }
      endEdit();
      if (r < 0 || r >= rows.length) return;
      const n2 = nodeOf(el.id), td2 = n2 && n2.querySelector(`[data-r="${r}"][data-c="${c}"]`);
      if (td2) editCell(getEl(el.id), td2);
    }
  });
  td.focus();
  const r = document.createRange(); r.selectNodeContents(td);
  const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
  drawOverlay();
}

/* ---------- Element operations ---------- */
function removeEls(ids) {
  const s = cur();
  s.els = s.els.filter(e => !ids.includes(e.id));
  s.builds = s.builds.filter(b => !ids.includes(b.el));
  S.sel = S.sel.filter(id => !ids.includes(id));
}
function deleteSel() {
  if (!S.sel.length) return;
  const ids = [...S.sel];
  mutate(() => removeEls(ids), { insp: true });
}
function selectAll() { endEdit(); S.sel = cur().els.filter(e => !e.locked).map(e => e.id); selectionChanged(); }
function copyEls() {
  const els = selEls();
  if (!els.length) return;
  const ids = new Set(els.map(e => e.id));
  S.clip = { els: deep(els), builds: deep(cur().builds.filter(b => ids.has(b.el))), from: cur().id, n: 0 };
  S.clipStamp = 'sigeon-deck:' + uid();
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(S.clipStamp).catch(() => { });
  toast(`Copied ${els.length} object${els.length > 1 ? 's' : ''}`);
}
function cutEls() { copyEls(); deleteSel(); }
function pasteEls() {
  if (!S.clip) return;
  const s = cur(), same = S.clip.from === s.id;
  S.clip.n = same ? S.clip.n + 1 : 0;
  const off = same ? 30 * S.clip.n : 0, map = {};
  const used = new Set(s.els.map(e => e.mid));
  const els = S.clip.els.map(e => {
    const c = deep(e), n = uid();
    map[e.id] = n; c.id = n;
    if (used.has(c.mid)) c.mid = uid();
    c.x += off; c.y += off;
    return c;
  });
  const builds = S.clip.builds.map(b => Object.assign(deep(b), { id: uid(), el: map[b.el] }));
  mutate(() => { s.els.push(...els); s.builds.push(...builds); S.sel = els.map(e => e.id); }, { insp: true });
}
function duplicateEls() {
  const els = selEls();
  if (!els.length) return;
  const copies = els.map(e => Object.assign(deep(e), { id: uid(), mid: uid(), x: e.x + 30, y: e.y + 30 }));
  mutate(() => { cur().els.push(...copies); S.sel = copies.map(c => c.id); }, { insp: true });
}
function arrange(how) {
  const s = cur(), ids = S.sel;
  if (!ids.length) return;
  mutate(() => {
    const picked = s.els.filter(e => ids.includes(e.id)), rest = s.els.filter(e => !ids.includes(e.id));
    if (how === 'front') s.els = [...rest, ...picked];
    else if (how === 'back') s.els = [...picked, ...rest];
    else {
      const arr = s.els, d = how === 'forward' ? 1 : -1;
      const order = d > 0 ? [...arr.keys()].reverse() : [...arr.keys()];
      order.forEach(i => { if (ids.includes(arr[i].id)) { const j = i + d; if (j >= 0 && j < arr.length && !ids.includes(arr[j].id)) [arr[i], arr[j]] = [arr[j], arr[i]]; } });
    }
  });
}
function toggleLock() {
  const els = selEls();
  if (!els.length) return;
  const v = !els[0].locked;
  mutate(() => els.forEach(e => { e.locked = v; }), { insp: true });
}
function nudge(dx, dy) {
  const els = selEls().filter(e => !e.locked);
  if (!els.length) return;
  mutate(() => els.forEach(e => { e.x += dx; e.y += dy; }), { key: 'nudge', insp: true });
}
function alignEls(how) {
  const els = selEls().filter(e => !e.locked);
  if (!els.length) return;
  const B = els.length === 1 ? { x: 0, y: 0, w: 1920, h: 1080 } : bbox(els);
  mutate(() => {
    if (how === 'dh' || how === 'dv') {
      const k = how === 'dh' ? 'x' : 'y', sz = how === 'dh' ? 'w' : 'h';
      const sorted = [...els].sort((a, b) => a[k] - b[k]);
      const total = sorted.reduce((a, e) => a + e[sz], 0), span = (how === 'dh' ? B.w : B.h) - total, gap = span / (sorted.length - 1);
      let pos = how === 'dh' ? B.x : B.y;
      sorted.forEach(e => { e[k] = Math.round(pos); pos += e[sz] + gap; });
      return;
    }
    els.forEach(e => {
      if (how === 'l') e.x = B.x; if (how === 'c') e.x = Math.round(B.x + B.w / 2 - e.w / 2); if (how === 'r') e.x = B.x + B.w - e.w;
      if (how === 't') e.y = B.y; if (how === 'm') e.y = Math.round(B.y + B.h / 2 - e.h / 2); if (how === 'b') e.y = B.y + B.h - e.h;
    });
  }, { insp: true });
}

/* ---------- Inserting ---------- */
function centerBox(w, h2) { return { x: Math.round((1920 - w) / 2), y: Math.round((1080 - h2) / 2) }; }
function addEl(el, o) {
  o = o || {};
  endEdit();
  if (S.view === 'grid') setView('edit');
  mutate(() => { cur().els.push(el); S.sel = [el.id]; }, { insp: true });
  if (o.edit) beginEdit(el.id, { selectAll: true });
}
function insertText(preset) {
  const t = th();
  const P = {
    title: { size: 110, role: 'head', html: 'Title', w: 1400 }, heading: { size: 72, role: 'head', html: 'Heading', w: 1200 },
    body: { size: 40, role: 'body', html: 'Your text here', w: 900 }, caption: { size: 26, role: 'body', html: 'Caption', w: 700, color: t.muted },
    bullets: { size: 40, role: 'body', html: '<ul><li>First point</li><li>Second point</li><li>Third point</li></ul>', w: 1000 },
    numbered: { size: 40, role: 'body', html: '<ol><li>First step</li><li>Second step</li><li>Third step</li></ol>', w: 1000 }
  }[preset || 'body'];
  const head = P.role === 'head';
  const el = {
    id: uid(), mid: uid(), type: 'text', x: 0, y: 0, w: P.w, h: Math.round(P.size * 1.35), rot: 0, opacity: 1, html: P.html,
    font: head ? t.head : t.body, role: P.role, size: P.size, weight: head ? (t.headW || 700) : (t.bodyW || 400), color: P.color || t.text,
    align: 'left', valign: 'top', lh: head ? 1.05 : 1.3, ls: 0, italic: head && !!t.headItalic, upper: head && !!t.headUpper, pad: 0, autoH: true
  };
  Object.assign(el, centerBox(el.w, el.h));
  addEl(el, { edit: !/<[uo]l>/.test(P.html) });
}
function insertShape(kind) {
  const t = th();
  const dims = { arrow: [480, 240], bubble: [480, 360], parallelogram: [480, 280], halfcircle: [480, 240], trapezoid: [480, 300], chevron: [360, 300] }[kind] || [360, 360];
  const el = {
    id: uid(), mid: uid(), type: 'shape', shape: kind, x: 0, y: 0, w: dims[0], h: dims[1], rot: 0, opacity: 1, fill: t.accent, strokeW: 0, stroke: t.text,
    radius: kind === 'rect' ? 24 : kind === 'bubble' ? 32 : 0, html: '', font: t.body, role: 'body', size: 40, weight: 600, color: t.onAccent || '#FFFFFF',
    align: 'center', valign: 'middle', lh: 1.2, pad: 24
  };
  Object.assign(el, centerBox(el.w, el.h));
  addEl(el);
}
function readImage(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onerror = rej;
    r.onload = () => {
      const src = r.result;
      if (file.type === 'image/svg+xml' || file.type === 'image/gif') { const im0 = new Image(); im0.onload = () => res({ src, w: im0.naturalWidth || 800, h: im0.naturalHeight || 600 }); im0.onerror = () => res({ src, w: 800, h: 600 }); im0.src = src; return; }
      const img = new Image();
      img.onerror = rej;
      img.onload = () => {
        const w = img.naturalWidth, h2 = img.naturalHeight, max = 2200;
        if (file.size > 700000 || w > max || h2 > max) {
          const k = Math.min(1, max / Math.max(w, h2)), c = document.createElement('canvas');
          c.width = Math.round(w * k); c.height = Math.round(h2 * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          let out = c.toDataURL('image/webp', .88);
          if (!out.startsWith('data:image/webp')) out = c.toDataURL('image/jpeg', .88);
          res({ src: out, w: c.width, h: c.height });
        } else res({ src, w, h: h2 });
      };
      img.src = src;
    };
    r.readAsDataURL(file);
  });
}
function imageEl(src, w, h2, at, alt) {
  const k = Math.min(1, 1100 / w, 760 / h2);
  const W = Math.round(w * k), Hh = Math.round(h2 * k);
  const pos = at ? { x: Math.round(at.x - W / 2), y: Math.round(at.y - Hh / 2) } : centerBox(W, Hh);
  return { id: uid(), mid: uid(), type: 'image', src, alt: alt || '', x: pos.x, y: pos.y, w: W, h: Hh, rot: 0, opacity: 1, fit: 'cover', radius: 0, filters: {} };
}
async function insertImageFiles(files, at) {
  const els = [];
  for (const [i, f] of files.entries()) {
    try {
      const r = await readImage(f);
      const el = imageEl(r.src, r.w, r.h, at ? { x: at.x + i * 40, y: at.y + i * 40 } : null, f.name.replace(/\.[^.]+$/, ''));
      if (!at) { el.x += i * 40; el.y += i * 40; }
      els.push(el);
    } catch (e) { toast(`Couldn’t read ${f.name}. Try a PNG, JPG, WebP, GIF or SVG.`); }
  }
  if (!els.length) return;
  endEdit();
  if (S.view === 'grid') setView('edit');
  mutate(() => { cur().els.push(...els); S.sel = els.map(e => e.id); }, { insp: true });
}
function insertImageSrc(src) {
  const img = new Image();
  img.onload = () => addEl(imageEl(src, img.naturalWidth || 1000, img.naturalHeight || 700, null));
  img.onerror = () => toast('That image couldn’t be loaded. Check the address and try again.');
  img.src = src;
}
let pickCb = null;
function pickImage(cb) { pickCb = cb; const f = $('#fileImg'); f.multiple = false; f.value = ''; f.click(); }
function insertTable() {
  const t = th();
  const el = {
    id: uid(), mid: uid(), type: 'table', x: 0, y: 0, w: 1200, h: 420, rot: 0, opacity: 1, font: t.body, size: 30, radius: 0,
    table: { rows: [['Plan', 'Users', 'Price'], ['Starter', '1', '$9'], ['Team', '10', '$49'], ['Company', 'Unlimited', 'Talk to us']], header: true, stripe: true, headBg: t.accent, headColor: t.onAccent || '#FFFFFF', color: t.text, border: t.line, stripeBg: 'rgba(127,140,170,.10)', align: 'left' }
  };
  Object.assign(el, centerBox(el.w, el.h));
  addEl(el);
}
function sampleChart(kind) {
  if (kind === 'pie' || kind === 'donut') return { kind, labels: ['Product', 'Services', 'Licensing', 'Other'], series: [{ name: 'Share', values: [46, 28, 18, 8] }] };
  return { kind, labels: ['2022', '2023', '2024', '2025', '2026'], series: [{ name: 'Revenue', values: [24, 38, 51, 70, 96] }, { name: 'Costs', values: [18, 25, 30, 36, 41] }] };
}
function insertChart(kind) {
  const t = th();
  const el = {
    id: uid(), mid: uid(), type: 'chart', x: 0, y: 0, w: 1100, h: 620, rot: 0, opacity: 1, font: t.body,
    chart: Object.assign({ colors: [t.accent, t.accent2, t.muted, t.text, '#FF8A5B'], text: t.text, grid: t.line, values: true, legend: true, gridlines: true }, sampleChart(kind || 'bar'))
  };
  Object.assign(el, centerBox(el.w, el.h));
  addEl(el);
}
function insertIcon(name) {
  const t = th();
  const el = { id: uid(), mid: uid(), type: 'icon', icon: name, x: 0, y: 0, w: 200, h: 200, rot: 0, opacity: 1, color: t.accent, sw: 1.6, bg: null, bgShape: 'circle' };
  Object.assign(el, centerBox(200, 200));
  addEl(el);
}
const SAMPLE_CODE = ['// Highlighted right on the slide', 'function greet(name) {', '  const hour = new Date().getHours();', '  return hour < 12 ? "Good morning, " + name : "Hello, " + name;', '}', '', 'console.log(greet("team"));'].join('\n');
function insertCode() {
  const el = { id: uid(), mid: uid(), type: 'code', x: 0, y: 0, w: 1180, h: 480, rot: 0, opacity: 1, code: SAMPLE_CODE, codeTheme: 'night', size: 30, chrome: true, lineNo: true, radius: 18 };
  Object.assign(el, centerBox(el.w, el.h));
  addEl(el);
}
function insertLine(variant) {
  const t = th();
  const el = { id: uid(), mid: uid(), type: 'line', x: 0, y: 0, w: 640, h: 40, rot: 0, opacity: 1, stroke: t.text, strokeW: 6, dash: variant === 'dashed' ? 'dashed' : 'solid', arrowStart: variant === 'double', arrowEnd: variant === 'arrow' || variant === 'double' };
  Object.assign(el, centerBox(el.w, el.h));
  addEl(el);
}
function insertEmbed() {
  askText('Add a video', 'Paste a YouTube or Vimeo link', '', 'Add video', v => {
    if (!v) return;
    if (!SD.embedUrl(v)) return toast('That doesn’t look like a web address. Paste a link that starts with https://');
    const el = { id: uid(), mid: uid(), type: 'embed', url: v, x: 0, y: 0, w: 1280, h: 720, rot: 0, opacity: 1, radius: 16 };
    Object.assign(el, centerBox(el.w, el.h));
    addEl(el);
  }, 'https://www.youtube.com/watch?v=…');
}
function shapeIcon(k) { return `<svg viewBox="0 0 30 30"><path d="${SD.shapePath(k, 26, 26, 5)}" transform="translate(2 2)" fill="currentColor" fill-rule="evenodd"/></svg>`; }
function iconPicker(anchor, cb) {
  const q = h('input', { class: 'in', placeholder: 'Search icons', 'aria-label': 'Search icons' });
  const grid = h('div', { class: 'icongrid' });
  const draw = () => {
    grid.innerHTML = '';
    Object.keys(SD.ICONS).filter(n => n.includes(q.value.trim().toLowerCase())).forEach(n => grid.appendChild(h('button', { title: n, 'aria-label': n, html: icon(n), onclick: () => { closePop(); cb(n); } })));
  };
  q.addEventListener('input', draw);
  draw();
  openPop(anchor, h('div', {}, q, grid));
}
function insertMenu(kind, anchor) {
  switch (kind) {
    case 'text': return openPop(anchor, ctxMenu([
      { label: 'Title', ic: 'text', run: () => insertText('title') }, { label: 'Heading', ic: 'text', run: () => insertText('heading') },
      { label: 'Body text', ic: 'text', kbd: 'T', run: () => insertText('body') }, { label: 'Caption', ic: 'text', run: () => insertText('caption') },
      { label: 'Bulleted list', ic: 'ul', run: () => insertText('bullets') }, { label: 'Numbered list', ic: 'ol', run: () => insertText('numbered') }]));
    case 'shape': {
      const g = h('div', { class: 'shapegrid' });
      SD.SHAPES.forEach(([k, l]) => g.appendChild(h('button', { title: l, 'aria-label': l, html: shapeIcon(k), onclick: () => { closePop(); insertShape(k); } })));
      return openPop(anchor, g);
    }
    case 'image': return openPop(anchor, ctxMenu([
      { label: 'Upload from this device', ic: 'image', run: () => { pickCb = null; const f = $('#fileImg'); f.multiple = true; f.value = ''; f.click(); } },
      { label: 'From a web address', ic: 'link', run: () => askText('Add an image from the web', 'Image address', '', 'Add image', v => v && insertImageSrc(v), 'https://…') },
      { label: 'Image placeholder', ic: 'layout', run: () => { const el = imageEl('', 960, 540, null); addEl(el); } }]));
    case 'chart': return openPop(anchor, ctxMenu(SD.CHART_KINDS.map(([k, l]) => ({ label: l, ic: 'chart', run: () => insertChart(k) }))));
    case 'icon': return iconPicker(anchor, insertIcon);
    case 'line': return openPop(anchor, ctxMenu([
      { label: 'Line', ic: 'line', kbd: 'L', run: () => insertLine('line') }, { label: 'Arrow', ic: 'arrow-right', run: () => insertLine('arrow') },
      { label: 'Double arrow', ic: 'line', run: () => insertLine('double') }, { label: 'Dashed line', ic: 'line', run: () => insertLine('dashed') }]));
    case 'table': return insertTable();
    case 'code': return insertCode();
    case 'embed': return insertEmbed();
  }
}

/* ---------- Light table ---------- */
function renderLight() {
  const lt = $('#lightTable');
  clearThumbs(lt); lt.innerHTML = '';
  S.deck.slides.forEach((s, i) => {
    const tr = SD.TRANSITIONS.find(t => t[0] === ((s.transition && s.transition.type) || 'none'));
    const it = h('div', { class: 'lt-item' + (i === S.si ? ' on' : ''), draggable: 'true', tabindex: '0', 'aria-label': `Slide ${i + 1}` },
      thumb(s, S.deck, i), h('div', { class: 'lt-cap' }, h('span', {}, `${i + 1}${s.hidden ? ', skipped' : ''}`), h('span', {}, tr ? tr[1] : '')));
    it.addEventListener('click', () => { S.si = i; $$('.lt-item', lt).forEach((x, j) => x.classList.toggle('on', j === i)); markNav(); renderStatus(); renderInspector(); });
    it.addEventListener('dblclick', () => { S.si = i; setView('edit'); });
    it.addEventListener('keydown', e => { if (e.key === 'Enter') { S.si = i; setView('edit'); } });
    it.addEventListener('contextmenu', e => { e.preventDefault(); S.si = i; openPop({ x: e.clientX, y: e.clientY }, slideMenu(i)); });
    it.addEventListener('dragstart', e => e.dataTransfer.setData('text/sd-slide', String(i)));
    it.addEventListener('dragover', e => { if (e.dataTransfer.types.includes('text/sd-slide')) { e.preventDefault(); it.classList.add('drop-before'); } });
    it.addEventListener('dragleave', () => it.classList.remove('drop-before'));
    it.addEventListener('drop', e => { e.preventDefault(); it.classList.remove('drop-before'); const from = +e.dataTransfer.getData('text/sd-slide'); let to = i; if (from < to) to--; moveSlide(from, to); });
    lt.appendChild(it);
  });
}
function setView(v) {
  endEdit(); stopPreview();
  S.view = v;
  $('#lightTable').hidden = v !== 'grid';
  $('#sizer').hidden = v === 'grid';
  $('#tGrid').classList.toggle('on', v === 'grid');
  if (v === 'edit') { renderCanvas(); requestAnimationFrame(applyZoom); }
  else { S.sel = []; renderLight(); }
  renderInspector();
}
function toggleGrid() { S.grid = !S.grid; savePrefs(); drawOverlay(); renderStatus(); }
function toggleSnap() { S.snap = !S.snap; savePrefs(); renderStatus(); toast(S.snap ? 'Smart guides on' : 'Smart guides off'); }
function toggleNotes() { S.notes = !S.notes; renderStatus(); requestAnimationFrame(applyZoom); if (S.notes) $('#notesInput').focus(); }
function toggleFocus() { S.focus = !S.focus; $('#editor').classList.toggle('focus', S.focus); $('#tFocus').classList.toggle('on', S.focus); requestAnimationFrame(applyZoom); }
