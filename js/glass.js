/* Sigeon Deck — liquid glass selector.
   Tap an item: the pill springs over to it.
   Press and hold (or press and drag with a mouse): the pill lifts into a clear glass lens
   that follows your finger, refracting what's beneath it. Release to pick the nearest item.
   Works on horizontal bars and vertical menus. No blur anywhere: the glass effect is
   refraction (SVG displacement), rim light and saturation. */
'use strict';
const LiquidGlass = (() => {
  let filter = null, mapURL = null;
  const live = new Set();

  // Lens displacement map: neutral in the middle, bending light inward near the rim.
  function lensMap() {
    if (mapURL) return mapURL;
    const W = 256, H = 128, c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d'), img = ctx.createImageData(W, H), d = img.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const u = (x + .5) / W * 2 - 1, v = (y + .5) / H * 2 - 1;
      const r = Math.pow(Math.pow(Math.abs(u), 4) + Math.pow(Math.abs(v), 4), .25);
      const t = Math.min(1, Math.max(0, (r - .45) / .55));
      const m = t * t * (3 - 2 * t);
      const len = Math.hypot(u, v) || 1;
      const i = (y * W + x) * 4;
      d[i] = 128 - (u / len) * m * 127;
      d[i + 1] = 128 - (v / len) * m * 127;
      d[i + 2] = 128; d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return (mapURL = c.toDataURL());
  }
  // One shared filter: only one lens can be lifted at a time.
  function getFilter() {
    if (filter) return filter;
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    filter = document.createElementNS(NS, 'filter');
    filter.id = 'lg-refract';
    filter.setAttribute('filterUnits', 'userSpaceOnUse');
    filter.setAttribute('color-interpolation-filters', 'sRGB');
    filter.innerHTML = `<feImage href="${lensMap()}" x="0" y="0" width="100" height="40" preserveAspectRatio="none" result="map"/>` +
      `<feDisplacementMap in="SourceGraphic" in2="map" scale="16" xChannelSelector="R" yChannelSelector="G"/>`;
    svg.appendChild(filter);
    document.body.appendChild(svg);
    return filter;
  }
  function prune() { live.forEach(t => { if (!t.track.isConnected) { t.ro.disconnect(); live.delete(t); } }); }

  function attach(track, o) {
    o = Object.assign({ item: 'button', hold: 220, lift: 1.14, initial: 0, axis: 'x', hover: false }, o || {});
    prune();
    const Y = o.axis === 'y';
    const all = () => [...track.querySelectorAll(o.item)].filter(el => el.parentElement === track);
    track.classList.add('lg-track', Y ? 'lg-y' : 'lg-x');
    if (o.cls) track.classList.add(o.cls);

    const pill = document.createElement('div');
    pill.className = 'lg-pill';
    pill.setAttribute('aria-hidden', 'true');
    pill.innerHTML = '<i class="lg-spec"></i><i class="lg-caustic"></i>';
    track.prepend(pill);
    const fImg = getFilter().firstElementChild;

    let idx = o.initial, pos = 0, size = 0, m = 1, c = 1, glide = null, suppressUntil = 0, allowNext = false, raf = 0;
    const paint = () => {
      if (Y) { pill.style.height = size + 'px'; pill.style.transform = `translate3d(0,${pos}px,0) scale(${c},${m})`; }
      else { pill.style.width = size + 'px'; pill.style.transform = `translate3d(${pos}px,0,0) scale(${m},${c})`; }
    };
    const start_ = el => Y ? el.offsetTop : el.offsetLeft;
    const len_ = el => Y ? el.offsetHeight : el.offsetWidth;
    const client = ev => Y ? ev.clientY : ev.clientX;
    function mark(i, cls) { all().forEach((b, j) => b.classList.toggle(cls, j === i)); }
    function cross(it) {
      if (Y) { pill.style.left = it.offsetLeft + 'px'; pill.style.width = it.offsetWidth + 'px'; }
    }
    function moveTo(i, animate) {
      const it = all()[i];
      if (!it || !len_(it)) return;
      const p = start_(it), far = Math.abs(p - pos) > 4 && animate !== false && size > 0;
      pill.classList.toggle('lg-instant', animate === false || size === 0);
      idx = i; pos = p; size = len_(it);
      cross(it);
      if (far) { m = 1.1; c = .9; paint(); setTimeout(() => { if (!glide) { m = 1; c = 1; paint(); } }, 170); }
      else { m = 1; c = 1; paint(); }
      pill.classList.add('lg-ready');
      mark(i, 'lg-sel');
    }
    function nearest(center) {
      let best = 0, bd = Infinity;
      all().forEach((b, i) => { if (!len_(b)) return; const d = Math.abs(start_(b) + len_(b) / 2 - center); if (d < bd) { bd = d; best = i; } });
      return best;
    }
    function local(v) { const r = track.getBoundingClientRect(); return Y ? v - r.top + track.scrollTop : v - r.left + track.scrollLeft; }
    function begin(v, prev) {
      const list = all().filter(len_);
      if (!list.length) return;
      const first = list[0], last = list[list.length - 1];
      glide = {
        prev, off: local(v) - (pos + size / 2), last: v, t: performance.now(), vel: 0,
        min: start_(first) + len_(first) / 2, max: start_(last) + len_(last) / 2
      };
      pill.classList.remove('lg-instant');
      pill.classList.add('lg-glide');
      track.classList.add('lg-gliding');
      const r = pill.getBoundingClientRect();
      fImg.setAttribute('width', String(Math.round(r.width * o.lift)));
      fImg.setAttribute('height', String(Math.round(r.height * o.lift)));
      m = o.lift; c = o.lift; paint();
      if (navigator.vibrate) try { navigator.vibrate(8); } catch (e) { }
      const tick = () => {
        if (!glide) return;
        glide.vel *= .86;
        const s = Math.min(.32, Math.abs(glide.vel) * .18);
        m = o.lift * (1 + s); c = o.lift * (1 - s * .55);
        paint();
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    function follow(v) {
      const now = performance.now(), dt = Math.max(1, now - glide.t);
      glide.vel = glide.vel * .5 + ((v - glide.last) / dt) * .5;
      glide.last = v; glide.t = now;
      const ctr = Math.max(glide.min, Math.min(glide.max, local(v) - glide.off));
      const k = nearest(ctr), it = all()[k];
      size += (len_(it) - size) * .35;
      pos = ctr - size / 2;
      mark(k, 'lg-hot');
      paint();
    }
    function end(cancel) {
      cancelAnimationFrame(raf);
      const g = glide;
      glide = null;
      pill.classList.remove('lg-glide');
      track.classList.remove('lg-gliding');
      mark(-1, 'lg-hot');
      const k = cancel ? g.prev : nearest(pos + size / 2);
      if (k >= 0) moveTo(k); else { pill.classList.remove('lg-ready'); mark(-1, 'lg-sel'); }
      suppressUntil = Date.now() + 450;
      if (!cancel) {
        const it = all()[k];
        allowNext = true;
        it.click();
        allowNext = false;
      }
    }

    track.addEventListener('pointerdown', e => {
      if (e.button !== 0 || glide) return;
      const it = e.target.closest(o.item);
      if (!it || it.parentElement !== track) return;
      const prev = idx, s = { v: client(e), x: e.clientX, y: e.clientY, id: e.pointerId, mouse: e.pointerType === 'mouse' };
      moveTo(all().indexOf(it));
      const holdT = setTimeout(() => { if (!glide) begin(s.v, prev); }, o.hold);
      const mv = ev => {
        if (ev.pointerId !== s.id) return;
        if (glide) { ev.preventDefault(); follow(client(ev)); return; }
        const da = Math.abs(client(ev) - s.v), dx = Math.abs(ev.clientX - s.x), dy = Math.abs(ev.clientY - s.y);
        if (s.mouse && da > 6) { clearTimeout(holdT); begin(s.v, prev); follow(client(ev)); }
        else if (!s.mouse && (dx > 10 || dy > 10)) { clearTimeout(holdT); off(); }
      };
      const up = ev => {
        if (ev.pointerId !== s.id) return;
        clearTimeout(holdT); off();
        if (glide) end(ev.type === 'pointercancel');
      };
      const key = ev => { if (ev.key === 'Escape' && glide) { ev.preventDefault(); ev.stopPropagation(); clearTimeout(holdT); off(); end(true); } };
      const off = () => {
        window.removeEventListener('pointermove', mv);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        window.removeEventListener('keydown', key, true);
      };
      window.addEventListener('pointermove', mv, { passive: false });
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
      window.addEventListener('keydown', key, true);
    });
    // Taps and keyboard activation slide the pill; clicks that end a glide are swallowed
    // so the item the glide landed on is the one that fires.
    track.addEventListener('click', e => {
      if (allowNext) return;
      if (Date.now() < suppressUntil) { e.stopImmediatePropagation(); e.preventDefault(); return; }
      const it = e.target.closest(o.item);
      if (it && it.parentElement === track) moveTo(all().indexOf(it));
    }, true);
    if (o.hover) {
      track.addEventListener('pointermove', e => {
        if (glide || e.buttons) return;
        const it = e.target.closest(o.item);
        if (it && it.parentElement === track) { const i = all().indexOf(it); if (i !== idx) moveTo(i); }
      });
      track.addEventListener('focusin', e => {
        const it = e.target.closest(o.item);
        if (it && it.parentElement === track && !glide) moveTo(all().indexOf(it));
      });
    }
    track.addEventListener('contextmenu', e => { if (glide || e.pointerType === 'touch') e.preventDefault(); });
    track.addEventListener('dragstart', e => e.preventDefault());

    let roRaf = 0;
    const ro = new ResizeObserver(() => { cancelAnimationFrame(roRaf); roRaf = requestAnimationFrame(() => { if (!glide && idx >= 0) moveTo(idx, false); }); });
    ro.observe(track);
    all().forEach(b => ro.observe(b));
    live.add({ track, ro });
    requestAnimationFrame(() => { if (idx >= 0) moveTo(idx, false); });
    return { set: (i, animate) => moveTo(i, animate), get index() { return idx; } };
  }
  return { attach };
})();
