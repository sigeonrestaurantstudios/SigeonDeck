/* Sigeon Deck templates — themes, sample content and slide layouts. */
const SDTemplates = (() => {
  const uid = SD.uid;

  /* ---------- Sample content ---------- */
  const TOPICS = {
    pitch: {
      kicker: 'Series A, 2026', title: 'Lumen Grid', ts: 1,
      subtitle: 'Storing daylight so cities can run on it after dark.', byline: 'Ada Moreno, founder',
      agendaTitle: 'What we’ll cover', agenda: ['The evening power gap', 'How Lumen cells work', 'Where we are today', 'What the round unlocks'],
      featTitle: 'Three parts, one grid',
      feats: [['bolt', 'Capture', 'Rooftop panels feed a shared buffer instead of the street.'], ['layers', 'Store', 'Salt-water cells hold a full day of charge at a fifth of lithium cost.'], ['globe', 'Share', 'Neighbors trade surplus power in real time, block by block.']],
      stat: { value: '38%', label: 'cheaper evening power for the first 1,200 homes on the network', items: [['1,200', 'homes connected'], ['14', 'city blocks'], ['4.8×', 'cell lifespan vs. lithium']] },
      chartTitle: 'Revenue is compounding', chart: { kind: 'bar', labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'], series: [{ name: 'Revenue ($k)', values: [120, 180, 260, 390, 560, 780] }] },
      insight: '6.5× in 18 months', insightBody: 'Every block we add makes the next one cheaper to connect.',
      quote: { text: 'Lumen turned our rooftop into the cheapest power plant on the street.', who: 'Rosa Delgado, Elm Street co-op' },
      closing: { title: 'Let’s light the next 100 blocks.', sub: 'Raising $12M to reach 40,000 homes by 2028.', contact: 'ada@lumengrid.example' }
    },
    report: {
      kicker: 'Quarterly review', title: 'Q3 Field Report', ts: .82,
      subtitle: 'Northwind Logistics, delivery and fleet performance', byline: 'Prepared by the Operations team, October 2026',
      agendaTitle: 'In this report', agenda: ['Delivery performance', 'Fleet and fuel', 'Customer satisfaction', 'Priorities for Q4'],
      featTitle: 'What moved this quarter',
      feats: [['trend', 'On-time rate up', 'Route batching lifted on-time delivery in every region.'], ['leaf', 'Fuel spend down', 'Electric vans now cover 41% of urban routes.'], ['smile', 'Happier customers', 'Support tickets fell for the third straight quarter.']],
      stat: { value: '97.2%', label: 'of parcels arrived on time, a record for Northwind', items: [['2.4M', 'parcels shipped'], ['−18%', 'fuel spend'], ['4.7', 'average rating']] }, statScale: .78,
      chartTitle: 'On-time delivery by region', chart: { kind: 'bar', labels: ['North', 'South', 'East', 'West', 'Central'], series: [{ name: 'Q2', values: [91, 88, 93, 90, 94] }, { name: 'Q3', values: [97, 95, 98, 96, 99] }], suffix: '%' },
      insight: 'Every region improved', insightBody: 'The South closed the biggest gap after moving to evening loading.',
      quote: { text: 'The new routing tool gave our drivers an hour back every single day.', who: 'Marcus Hale, regional fleet lead' },
      closing: { title: 'Questions and discussion', sub: 'Full regional data is in the appendix.', contact: 'ops@northwind.example' }
    },
    lecture: {
      kicker: 'Marine Biology 204', title: 'How Coral Reefs Remember', ts: .7,
      subtitle: 'Heat stress, recovery, and the memory written into a reef.', byline: 'Dr. Imani Okafor, lecture 7',
      agendaTitle: 'Today’s path', agenda: ['What a coral actually is', 'Bleaching, step by step', 'Reefs that adapt', 'What we can still do'],
      featTitle: 'A coral is three things at once',
      feats: [['home', 'An animal', 'Tiny polyps build a limestone skeleton, one thin layer each year.'], ['leaf', 'A garden', 'Algae living inside each polyp make most of its food.'], ['users', 'A city', 'A quarter of all ocean species live on or near reefs.']],
      stat: { value: '50%', label: 'of the world’s shallow reefs have been lost since 1950', items: [['0.1%', 'of the ocean floor'], ['25%', 'of marine species'], ['+1 °C', 'over summer peak starts bleaching']] },
      chartTitle: 'Bleaching events keep getting closer', chart: { kind: 'line', labels: ['1980s', '1990s', '2000s', '2010s', '2020s'], series: [{ name: 'Mass bleaching events', values: [1, 2, 3, 5, 7] }] },
      insight: 'Recovery takes 10 to 15 years', insightBody: 'Most reefs now get fewer than six quiet years between heat waves.',
      quote: { text: 'A reef is a library. Every heat wave burns a few shelves.', who: 'Dr. Imani Okafor' },
      closing: { title: 'Next week: restoring reefs in the field', sub: 'Read chapter 9 and bring one question.', contact: 'Office hours Thursday, 2 to 4 pm' }
    },
    launch: {
      kicker: 'Introducing', title: 'Halo One', ts: 1.1,
      subtitle: 'Headphones that hear the room, and quiet only what you ask.', byline: 'Launch keynote, November 2026',
      agendaTitle: 'Today', agenda: ['Meet Halo One', 'Selective silence', 'Forty hours on one charge', 'Price and availability'],
      featTitle: 'Built around your attention',
      feats: [['target', 'Selective silence', 'Mute the coffee grinder, keep your colleague’s voice.'], ['bolt', 'Forty hours', 'A week of commutes on one charge. Ten minutes tops up five hours.'], ['music', 'Studio sound', 'Custom 40 mm drivers tuned with working mix engineers.']],
      stat: { value: '40 h', label: 'of playback on a single charge, with noise control on', items: [['248 g', 'weight'], ['6', 'microphones'], ['10 min', 'for 5 hours of play']] },
      chartTitle: 'Quieter where it counts', chart: { kind: 'hbar', labels: ['Office', 'Train', 'Café', 'Street'], series: [{ name: 'Without Halo', values: [62, 78, 70, 74] }, { name: 'With Halo', values: [28, 34, 30, 33] }], suffix: ' dB' },
      insight: 'Up to 44 dB quieter', insightBody: 'Measured on real commutes, not in a lab.',
      quote: { text: 'It’s the first time I forgot I was wearing headphones.', who: 'Early tester, Berlin' },
      closing: { title: 'Halo One. Available December 4.', sub: 'Pre-order today from $299.', contact: 'halo.example/one' }
    }
  };
  const GENERIC = {
    kicker: 'Your organization', title: 'Presentation title', ts: .9, subtitle: 'A one-line summary of what this deck is about', byline: 'Your name, date',
    agendaTitle: 'Agenda', agenda: ['First topic', 'Second topic', 'Third topic', 'Next steps'],
    featTitle: 'Three things to know',
    feats: [['bolt', 'First point', 'Explain it in a sentence or two.'], ['target', 'Second point', 'Keep it short so people can read it fast.'], ['heart', 'Third point', 'Close with the one people should remember.']],
    stat: { value: '87%', label: 'Describe what this number means', items: [['12', 'First metric'], ['4.5×', 'Second metric'], ['30 d', 'Third metric']] },
    chartTitle: 'Chart title', chart: { kind: 'bar', labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], series: [{ name: 'Series 1', values: [30, 45, 38, 60, 82] }] },
    insight: 'Key takeaway', insightBody: 'Explain what the chart shows in one or two sentences.',
    quote: { text: 'A memorable line from a customer, an expert, or a teammate.', who: 'Name, role' },
    closing: { title: 'Thank you', sub: 'Questions and discussion', contact: 'you@example.com' }
  };

  /* ---------- Element helpers ---------- */
  function txt(t, html, x, y, w, h, o) {
    o = o || {};
    const head = o.role === 'head';
    return Object.assign({
      id: uid(), mid: uid(), type: 'text', x, y, w, h, rot: 0, opacity: 1, html,
      font: head ? t.head : t.body, role: head ? 'head' : 'body',
      size: 40, weight: head ? (t.headW || 700) : (t.bodyW || 400), color: t.text,
      align: 'left', valign: 'top', lh: head ? (t.headLh || 1.05) : 1.3, ls: head ? (t.headLs || 0) : 0,
      italic: head && !!t.headItalic, upper: head && !!t.headUpper, pad: 0
    }, o);
  }
  function shp(t, shape, x, y, w, h, o) {
    return Object.assign({
      id: uid(), mid: uid(), type: 'shape', shape, x, y, w, h, rot: 0, opacity: 1, fill: t.accent, strokeW: 0, stroke: t.text, radius: 0,
      html: '', font: t.body, role: 'body', size: 40, weight: 600, color: t.onAccent || '#FFFFFF', align: 'center', valign: 'middle', lh: 1.2, pad: 24
    }, o);
  }
  function ico(t, name, x, y, s, o) {
    return Object.assign({ id: uid(), mid: uid(), type: 'icon', icon: name, x, y, w: s, h: s, rot: 0, opacity: 1, color: t.accent, sw: 1.6, bg: null, bgShape: 'circle' }, o);
  }
  function ln(t, x, y, w, o) {
    return Object.assign({ id: uid(), mid: uid(), type: 'line', x, y: y - 10, w, h: 20, rot: 0, opacity: 1, stroke: t.line, strokeW: 3, dash: 'solid', arrowStart: false, arrowEnd: false }, o);
  }
  function cht(t, x, y, w, h, data, o) {
    return Object.assign({
      id: uid(), mid: uid(), type: 'chart', x, y, w, h, rot: 0, opacity: 1, font: t.body,
      chart: Object.assign({ colors: [t.accent, t.accent2, t.muted, t.text], text: t.text, grid: t.line, values: true, legend: true, gridlines: true }, JSON.parse(JSON.stringify(data)))
    }, o);
  }
  const hs = (tp, extra) => (tp.hs || 1) * (extra || 1);
  function hd(tp, text, x, y, w) {
    return txt(tp.t, text, x, y, w || 1620, 130, { role: 'head', size: Math.round(84 * hs(tp)), lh: 1.05, valign: 'bottom', mid: 'heading', _b: 'title' });
  }

  /* ---------- Layouts ---------- */
  const L = {
    title(tp, C) {
      const t = tp.t, c = tp.align === 'center', X = c ? 160 : 150, Wd = c ? 1600 : 1360, al = c ? 'center' : 'left';
      return [
        txt(t, C.kicker, X, 150, Wd, 50, { size: 30, weight: 600, color: t.accent, align: al, mid: 'kicker', _b: 'body' }),
        txt(t, C.title, X, 230, Wd, 370, { role: 'head', size: Math.round(150 * hs(tp, C.ts)), align: al, valign: 'bottom', lh: 1, mid: 'title', _b: 'title' }),
        txt(t, C.subtitle, c ? 310 : X, 640, c ? 1300 : 1100, 130, { size: 44, color: t.muted, align: al, lh: 1.3, mid: 'sub', _b: 'body' }),
        txt(t, C.byline, X, 930, Wd, 40, { size: 26, color: t.muted, align: al, mid: 'byline', _b: 'body' })
      ];
    },
    agenda(tp, C) {
      const t = tp.t, els = [hd(tp, C.agendaTitle, 150, 110)];
      C.agenda.forEach((a, i) => {
        const y = 330 + i * 165;
        els.push(ln(t, 150, y, 1620, { stroke: t.line, strokeW: 2, mid: 'aline' + i, _b: 'deco' }));
        els.push(txt(t, String(i + 1).padStart(2, '0'), 150, y + 42, 120, 70, { role: 'head', size: 44, color: t.accent, upper: false, italic: false, mid: 'anum' + i, _b: 'item' }));
        els.push(txt(t, a, 300, y + 36, 1400, 80, { size: 56, weight: Math.max(t.bodyW || 400, 500), mid: 'aitem' + i, _b: 'item' }));
      });
      return els;
    },
    features(tp, C) {
      const t = tp.t, els = [hd(tp, C.featTitle, 150, 110)];
      C.feats.forEach(([ic, ti, bo], i) => {
        const x = 150 + i * 570;
        if (tp.cards) els.push(shp(t, 'rect', x - 40, 320, 530, 620, {
          fill: t.surface, radius: tp.radius == null ? 28 : tp.radius, strokeW: tp.cardStroke || 0, stroke: tp.hard ? t.text : t.line,
          shadow: tp.hard ? { x: 16, y: 16, b: 0, c: t.text } : null, mid: 'card' + i, _b: 'card'
        }));
        els.push(ico(t, ic, x, 375, 120, { bg: tp.iconBg ? t.accent : null, color: tp.iconBg ? (t.onAccent || '#FFFFFF') : t.accent, mid: 'ficon' + i, _b: 'item' }));
        els.push(txt(t, ti, x, 540, 450, 80, { role: 'head', size: Math.round(46 * Math.min(1.1, hs(tp))), upper: !!t.headUpper, lh: 1.1, mid: 'ftitle' + i, _b: 'item' }));
        els.push(txt(t, bo, x, 635, 440, 260, { size: 31, color: t.muted, lh: 1.45, mid: 'fbody' + i, _b: 'item' }));
      });
      return els;
    },
    stat(tp, C) {
      const t = tp.t;
      const els = [
        txt(t, C.stat.value, 150, 140, 1000, 460, { role: 'head', size: Math.round(320 * hs(tp, C.statScale)), color: t.accent, lh: .95, valign: 'bottom', mid: 'statv', _b: 'stat' }),
        txt(t, C.stat.label, 150, 640, 860, 220, { size: 46, lh: 1.3, mid: 'statl', _b: 'body' }),
        shp(t, 'rect', 1120, 200, 3, 680, { fill: t.line, mid: 'vrule', _b: 'deco' })
      ];
      C.stat.items.forEach(([v, l], i) => {
        const y = 200 + i * 235;
        els.push(txt(t, v, 1200, y, 570, 120, { role: 'head', size: Math.round(96 * Math.min(1.1, hs(tp))), lh: 1, mid: 'sv' + i, _b: 'item' }));
        els.push(txt(t, l, 1200, y + 122, 570, 50, { size: 30, color: t.muted, mid: 'sl' + i, _b: 'item' }));
      });
      return els;
    },
    chart(tp, C) {
      const t = tp.t;
      return [
        hd(tp, C.chartTitle, 150, 100),
        cht(t, 150, 290, 1080, 660, C.chart, { mid: 'chart', _b: 'chart' }),
        txt(t, C.insight, 1340, 320, 440, 240, { role: 'head', size: Math.round(58 * Math.min(1.1, hs(tp))), lh: 1.1, color: t.accent, upper: false, valign: 'bottom', mid: 'ins', _b: 'body' }),
        txt(t, C.insightBody, 1340, 600, 430, 300, { size: 30, color: t.muted, lh: 1.45, mid: 'insb', _b: 'body' })
      ];
    },
    quote(tp, C) {
      const t = tp.t;
      return [
        txt(t, '“', 140, 90, 300, 300, { role: 'head', size: 340, color: t.accent, lh: 1, upper: false, italic: false, mid: 'qmark', _b: 'deco' }),
        txt(t, C.quote.text, 150, 360, 1580, 400, { role: 'head', size: Math.round(80 * Math.min(1.15, hs(tp))), lh: 1.15, upper: false, mid: 'qtext', _b: 'quote' }),
        txt(t, '— ' + C.quote.who, 150, 820, 1400, 60, { size: 34, color: t.muted, mid: 'qwho', _b: 'body' })
      ];
    },
    closing(tp, C) {
      const t = tp.t;
      return [
        txt(t, C.closing.title, 160, 200, 1600, 420, { role: 'head', size: Math.round(130 * hs(tp)), align: 'center', valign: 'bottom', lh: 1.02, mid: 'title', _b: 'title' }),
        txt(t, C.closing.sub, 360, 670, 1200, 120, { size: 42, color: t.muted, align: 'center', mid: 'sub', _b: 'body' }),
        txt(t, C.closing.contact, 160, 900, 1600, 50, { size: 30, color: t.accent, align: 'center', weight: 600, mid: 'byline', _b: 'body' })
      ];
    }
  };

  const ORB_POS = {
    title: [[1180, 140, 620], [1600, 660, 240], [1060, 760, 150]],
    agenda: [[1480, -220, 640], [1700, 820, 220], [1360, 560, 110]],
    features: [[-260, 760, 520], [1690, 60, 170], [1780, 900, 110]],
    stat: [[1520, 760, 620], [40, 900, 130], [1800, 90, 150]],
    chart: [[1560, -300, 560], [1720, 840, 210], [40, 40, 70]],
    quote: [[1260, 480, 760], [1180, 120, 170], [70, 900, 100]],
    closing: [[700, -330, 520], [180, 700, 250], [1520, 160, 170]]
  };
  function decorate(tp, kind, els, idx) {
    const t = tp.t, d = tp.decor || [], pre = [], post = [];
    if (d.includes('orbs') && ORB_POS[kind]) ORB_POS[kind].forEach((p, i) => pre.push(shp(t, 'ellipse', p[0], p[1], p[2], p[2], { fill: [t.accent, t.accent2, t.surface][i], opacity: [.95, .85, 1][i], mid: 'orb' + i })));
    if (d.includes('bars')) {
      pre.push(shp(t, 'rect', 0, 0, 28, 1080, { fill: t.accent, mid: 'bar' }));
      if (kind === 'title') pre.push(shp(t, 'rect', 1520, 0, 400, 1080, { fill: t.accent, mid: 'block' }));
    }
    if (d.includes('frame')) pre.push(shp(t, 'rect', 48, 48, 1824, 984, { fill: null, strokeW: 3, stroke: t.accent, mid: 'frame', locked: true }));
    if (d.includes('rules')) {
      post.push(ln(t, 150, 76, 1620, { stroke: t.text, strokeW: 2, mid: 'rule' }));
      post.push(txt(t, tp._title || '', 150, 24, 900, 36, { size: 22, color: t.muted, mid: 'runhead' }));
      post.push(txt(t, String(idx + 1), 1470, 24, 300, 36, { size: 22, color: t.muted, align: 'right', mid: 'runnum' }));
    }
    if (d.includes('underline')) {
      const h = els.find(e => e.mid === 'heading');
      if (h) post.push(shp(t, 'rect', h.x, h.y + h.h + 14, 120, 10, { fill: t.accent, mid: 'uline', _b: 'deco' }));
    }
    if (d.includes('glow')) els.forEach(e => { if (e.role === 'head' && e.type === 'text') e.tshadow = `0 0 40px ${t.accent}AA, 0 0 90px ${t.accent}55`; });
    return [...pre, ...els, ...post];
  }

  const DEFX = { title: 'rise', body: 'fade', item: 'rise', stat: 'pop', chart: 'wipe-right', card: 'rise', deco: 'fade', quote: 'blur' };
  function addBuilds(tp, slide) {
    let k = 0;
    slide.els.forEach(e => {
      if (!e._b) return;
      if (tp.animated) {
        const fx = (tp.fx && tp.fx[e._b]) || DEFX[e._b] || 'fade';
        slide.builds.push({ id: uid(), el: e.id, kind: 'in', fx, dur: e._b === 'title' || e._b === 'stat' ? 1 : .8, delay: k === 0 ? .15 : .12, trigger: k === 0 ? 'after' : 'with' });
        k++;
      }
      delete e._b;
    });
  }
  function bgFor(tp) {
    const t = tp.t, b = { color: t.bg };
    if (t.grad) b.grad = { c1: t.bg, c2: t.bg2, angle: t.gradAngle == null ? 135 : t.gradAngle, radial: !!t.radial };
    if (tp.anim) { b.anim = tp.anim; b.a1 = t.a1 || t.accent; b.a2 = t.a2 || t.accent2; b.a3 = t.a3 || t.accent; }
    if (tp.grain) b.grain = true;
    return b;
  }
  function makeSlide(tp, els, notes) {
    const s = { id: uid(), bg: bgFor(tp), transition: Object.assign({}, tp.trans || { type: 'fade', dur: .6 }), notes: notes || '', els, builds: [], hidden: false };
    addBuilds(tp, s);
    return s;
  }
  function notesFor(k, C) {
    return {
      title: `Introduce yourself, then read the subtitle aloud: “${C.subtitle}”`,
      agenda: `Walk through the ${C.agenda.length} parts so people know where this is headed.`,
      features: `Spend about a minute on each column. Start with “${C.feats[0][1]}”.`,
      stat: `Pause after ${C.stat.value} appears. Let the number land before you explain it.`,
      chart: `Point at the trend first, then give the takeaway: ${C.insight}.`,
      quote: 'Read the quote slowly and name the speaker last.',
      closing: 'End on the ask, then open the floor for questions.'
    }[k];
  }

  /* ---------- Templates ---------- */
  const T = (o) => o;
  const TEMPLATES = [
    T({ id: 'aurora', name: 'Aurora', cat: 'Pitch', animated: true, topic: 'pitch', hs: .72, anim: 'aurora', trans: { type: 'magic', dur: 1 }, cards: true, radius: 28, fx: { title: 'blur' },
      t: { bg: '#04061A', text: '#F2F5FF', muted: '#A3AED0', accent: '#7FA6FF', accent2: '#B18CFF', surface: 'rgba(255,255,255,.06)', line: 'rgba(255,255,255,.16)', head: 'Unbounded', headW: 600, body: 'Onest', a1: '#2B4CFF', a2: '#7A3CFF', a3: '#00B7FF' } }),
    T({ id: 'neon', name: 'Neon Grid', cat: 'Launch', animated: true, topic: 'launch', hs: .95, anim: 'grid', trans: { type: 'zoom', dur: .9 }, align: 'center', decor: ['glow'], cards: true, cardStroke: 2, radius: 20, fx: { title: 'blur', stat: 'elastic', item: 'zoom' },
      t: { bg: '#07010F', text: '#FFFFFF', muted: '#C9B8E8', accent: '#FF2BD6', accent2: '#00F0FF', surface: '#160A2C', line: '#3B2366', head: 'Syne', headW: 800, body: 'Space Grotesk', a1: '#FF2BD6', a2: '#7A1FFF', a3: '#00F0FF' } }),
    T({ id: 'orbit', name: 'Orbit', cat: 'Pitch', animated: true, topic: 'pitch', hs: 1, trans: { type: 'magic', dur: 1.2 }, decor: ['orbs'],
      t: { bg: '#000000', text: '#FFFFFF', muted: '#9AA3B8', accent: '#3D7BFF', accent2: '#00D1FF', surface: '#141C33', line: '#222B44', head: 'Outfit', headW: 700, body: 'Outfit' } }),
    T({ id: 'deepfield', name: 'Deep Field', cat: 'Education', animated: true, topic: 'lecture', hs: 1, anim: 'stars', trans: { type: 'dissolve', dur: 1.2 }, fx: { title: 'blur', item: 'fade', stat: 'blur' },
      t: { bg: '#02030A', text: '#E9ECFF', muted: '#98A2C9', accent: '#FFD27A', accent2: '#8FB8FF', surface: '#0B0F24', line: '#232A4D', head: 'Fraunces', headW: 400, body: 'Manrope', a1: '#BFD4FF', a2: '#8FB8FF', a3: '#FFFFFF' } }),
    T({ id: 'tidal', name: 'Tidal', cat: 'Report', animated: true, topic: 'report', hs: .85, anim: 'waves', trans: { type: 'push', dur: .9 }, cards: true, radius: 24, iconBg: true, decor: ['underline'], fx: { item: 'fly-bottom' },
      t: { bg: '#03192B', text: '#EAF8FF', muted: '#8FB3C9', accent: '#2BD4C9', accent2: '#5AA9FF', surface: '#0A2A42', line: '#1C3F5C', head: 'Sora', headW: 700, body: 'Sora', onAccent: '#03192B', a1: '#2BD4C9', a2: '#2B7FFF', a3: '#5AA9FF' } }),
    T({ id: 'prism', name: 'Prism', cat: 'Launch', animated: true, topic: 'launch', hs: 1, anim: 'shift', trans: { type: 'cube', dur: 1.1 }, align: 'center', cards: true, radius: 36, fx: { title: 'pop', stat: 'pop' },
      t: { bg: '#120B2E', text: '#FFFFFF', muted: '#EEE8FF', accent: '#FFE27A', accent2: '#FF7AC6', surface: 'rgba(255,255,255,.12)', line: 'rgba(255,255,255,.3)', head: 'Bricolage Grotesque', headW: 800, body: 'Onest', a1: '#5B2BFF', a2: '#FF4FA3', a3: '#FF9A3D' } }),
    T({ id: 'blueprint', name: 'Blueprint', cat: 'Report', animated: true, topic: 'report', hs: .95, anim: 'blueprint', trans: { type: 'wipe', dur: .9 }, cards: true, cardStroke: 2, radius: 0, decor: ['underline'], fx: { title: 'typewriter', item: 'wipe-right', card: 'wipe-up' },
      t: { bg: '#0B2A6F', text: '#F2F7FF', muted: '#A9C1F0', accent: '#FFFFFF', accent2: '#7FD1FF', surface: 'rgba(255,255,255,.07)', line: 'rgba(255,255,255,.35)', head: 'Space Grotesk', headW: 600, body: 'IBM Plex Sans', a1: '#8DB4FF', a2: '#BFE0FF' } }),
    T({ id: 'momentum', name: 'Momentum', cat: 'Bold', animated: true, topic: 'launch', hs: 1.2, anim: 'beams', trans: { type: 'push', dur: .7 }, iconBg: true, fx: { title: 'skew', item: 'fly-left', stat: 'elastic', body: 'rise' },
      t: { bg: '#1A2CFF', text: '#FFFFFF', muted: '#C7CEFF', accent: '#FFE14D', accent2: '#FFFFFF', surface: '#0F1ED6', line: 'rgba(255,255,255,.3)', head: 'Anton', headW: 400, headUpper: true, body: 'Archivo', onAccent: '#1A2CFF', a1: '#5A68FF', a2: '#0010B8', a3: '#FFE14D' } }),
    T({ id: 'ember', name: 'Ember', cat: 'Education', animated: true, topic: 'lecture', hs: 1, anim: 'particles', grain: true, trans: { type: 'fade', dur: 1 }, align: 'center', fx: { title: 'blur' },
      t: { bg: '#140806', text: '#FFF1E6', muted: '#D2A894', accent: '#FF8A3D', accent2: '#FFC56B', surface: '#24120D', line: '#3D2219', head: 'Playfair Display', headW: 600, body: 'Lora', a1: '#FF6A2B', a2: '#FFB347', a3: '#FF3D1F' } }),
    T({ id: 'glass', name: 'Glass', cat: 'Pitch', animated: true, topic: 'pitch', hs: 1, anim: 'orbs', trans: { type: 'flip', dur: 1 }, cards: true, cardStroke: 2, radius: 32, fx: { card: 'flip' },
      t: { bg: '#0B1E3F', bg2: '#2A0B3F', grad: true, text: '#FFFFFF', muted: '#C3CCE6', accent: '#8FE3FF', accent2: '#D49BFF', surface: 'rgba(255,255,255,.08)', line: 'rgba(255,255,255,.2)', head: 'Manrope', headW: 800, body: 'Manrope', a1: '#3D7BFF', a2: '#B44CFF', a3: '#00C2FF' } }),
    T({ id: 'signal', name: 'Signal', cat: 'Report', animated: true, topic: 'report', hs: .95, anim: 'pulse', trans: { type: 'iris', dur: 1 }, align: 'center', cards: true, radius: 20, iconBg: true, fx: { stat: 'zoom' },
      t: { bg: '#000814', text: '#EAF2FF', muted: '#8A9BBE', accent: '#2E6BFF', accent2: '#00E0B8', surface: '#0A1530', line: '#1A2850', head: 'Archivo', headW: 800, body: 'Archivo', a1: '#2E6BFF' } }),

    T({ id: 'monolith', name: 'Monolith', cat: 'Minimal', topic: 'pitch', hs: .85, trans: { type: 'fade', dur: .6 },
      t: { bg: '#000000', text: '#FFFFFF', muted: '#8C8C8C', accent: '#FFFFFF', accent2: '#5C5C5C', surface: '#111111', line: '#2A2A2A', head: 'Archivo Black', headW: 400, headLs: -.02, body: 'Inter' } }),
    T({ id: 'editorial', name: 'Editorial', cat: 'Report', topic: 'report', hs: 1.15, decor: ['rules'], trans: { type: 'fade', dur: .6 },
      t: { bg: '#F3EEE4', text: '#1A1A1A', muted: '#6B655C', accent: '#B4362C', accent2: '#1A1A1A', surface: '#E9E2D4', line: '#CFC6B6', head: 'Instrument Serif', headW: 400, body: 'Inter' } }),
    T({ id: 'swiss', name: 'Swiss', cat: 'Minimal', topic: 'report', hs: 1, decor: ['bars'], trans: { type: 'push', dur: .6 },
      t: { bg: '#FFFFFF', text: '#111111', muted: '#6E6E6E', accent: '#E3241B', accent2: '#111111', surface: '#F2F2F2', line: '#DADADA', head: 'Inter', headW: 800, headLs: -.03, body: 'Inter' } }),
    T({ id: 'brutal', name: 'Brutal', cat: 'Bold', topic: 'launch', hs: .85, cards: true, cardStroke: 6, hard: true, radius: 0, iconBg: true, trans: { type: 'none' },
      t: { bg: '#FFE94D', text: '#000000', muted: '#3D3500', accent: '#000000', accent2: '#FF4FA3', surface: '#FFFFFF', line: '#000000', head: 'Archivo Black', headW: 400, headUpper: true, body: 'Space Grotesk', onAccent: '#FFE94D' } }),
    T({ id: 'botanica', name: 'Botanica', cat: 'Education', topic: 'lecture', hs: 1.15, cards: true, radius: 28, trans: { type: 'dissolve', dur: .9 },
      t: { bg: '#0F2A1E', text: '#F1EBDD', muted: '#B4C2A8', accent: '#C9E265', accent2: '#E9A86C', surface: '#163728', line: '#2C4F3C', head: 'Cormorant Garamond', headW: 600, body: 'Manrope' } }),
    T({ id: 'paper', name: 'Paper', cat: 'Minimal', topic: 'lecture', hs: 1, cards: true, radius: 24, iconBg: true, decor: ['underline'], trans: { type: 'fade', dur: .6 },
      t: { bg: '#FAFAF7', text: '#22252B', muted: '#6A7080', accent: '#2E6BFF', accent2: '#FF7A59', surface: '#F0F1F4', line: '#E1E3E8', head: 'Fraunces', headW: 600, body: 'Onest' } }),
    T({ id: 'terminal', name: 'Terminal', cat: 'Bold', topic: 'report', hs: .72, cards: true, cardStroke: 2, radius: 4, trans: { type: 'wipe', dur: .5 },
      t: { bg: '#0B0F0C', text: '#C6F7D0', muted: '#6FA37D', accent: '#39FF88', accent2: '#F7E26B', surface: '#111A14', line: '#1F3326', head: 'JetBrains Mono', headW: 700, body: 'JetBrains Mono' } }),
    T({ id: 'sunset', name: 'Sunset', cat: 'Pitch', topic: 'pitch', hs: .9, cards: true, radius: 28, align: 'center', trans: { type: 'slide', dur: .7 },
      t: { bg: '#FF7A59', bg2: '#7B2FF7', grad: true, text: '#FFFFFF', muted: '#FFE3D6', accent: '#FFE3A3', accent2: '#FFFFFF', surface: 'rgba(255,255,255,.14)', line: 'rgba(255,255,255,.35)', head: 'Poppins', headW: 800, body: 'Poppins' } }),
    T({ id: 'boardroom', name: 'Boardroom', cat: 'Report', topic: 'report', hs: .85, cards: true, radius: 12, iconBg: true, decor: ['underline'], trans: { type: 'push', dur: .6 },
      t: { bg: '#0B1B3A', text: '#FFFFFF', muted: '#9FB0CF', accent: '#3FA9F5', accent2: '#F5B83F', surface: '#13274F', line: '#22396A', head: 'Montserrat', headW: 700, body: 'Montserrat' } }),
    T({ id: 'pastel', name: 'Pastel', cat: 'Education', topic: 'lecture', hs: .95, cards: true, radius: 40, iconBg: true, align: 'center', trans: { type: 'swap', dur: .7 },
      t: { bg: '#F6F1FF', text: '#2B2440', muted: '#6E6590', accent: '#8B6CFF', accent2: '#FF9EC7', surface: '#FFFFFF', line: '#E3DAF7', head: 'Rubik', headW: 700, body: 'Rubik' } }),
    T({ id: 'chalk', name: 'Chalkboard', cat: 'Education', topic: 'lecture', hs: 1.25, grain: true, trans: { type: 'fade', dur: .6 },
      t: { bg: '#22302A', text: '#F4F4EE', muted: '#BFC6BC', accent: '#F7D774', accent2: '#9ED8F0', surface: '#2B3B33', line: '#4A5A51', head: 'Caveat', headW: 700, body: 'Lora' } }),
    T({ id: 'noir', name: 'Noir Lux', cat: 'Launch', topic: 'launch', hs: 1, align: 'center', decor: ['frame'], trans: { type: 'fade', dur: 1 },
      t: { bg: '#0A0A0A', text: '#EDE6D6', muted: '#9C9482', accent: '#C8A55B', accent2: '#EDE6D6', surface: '#141312', line: '#2B2925', head: 'Playfair Display', headW: 500, headItalic: true, body: 'Cormorant Garamond', bodyW: 500 } })
  ];
  TEMPLATES.forEach(tp => { tp.t.name = tp.name; tp.animated = !!tp.animated; });

  const BLANK = {
    night: { id: 'night', name: 'Night', hs: .9, trans: { type: 'fade', dur: .6 }, cards: true, radius: 24,
      t: { name: 'Night', bg: '#000000', text: '#F2F5FF', muted: '#8B97B8', accent: '#2E6BFF', accent2: '#9CC0FF', surface: '#0B1430', line: '#1E2C52', head: 'Bricolage Grotesque', headW: 700, body: 'Onest' } },
    day: { id: 'day', name: 'Day', hs: .9, trans: { type: 'fade', dur: .6 }, cards: true, radius: 24,
      t: { name: 'Day', bg: '#FFFFFF', text: '#0B1020', muted: '#5B6478', accent: '#2E6BFF', accent2: '#0B1020', surface: '#F1F4FA', line: '#DDE3EE', head: 'Bricolage Grotesque', headW: 700, body: 'Onest' } }
  };

  function tpData(tp) {
    const o = JSON.parse(JSON.stringify(tp));
    delete o._title;
    return o;
  }
  const KINDS = ['title', 'agenda', 'features', 'stat', 'chart', 'quote', 'closing'];
  function build(id) {
    const tp = TEMPLATES.find(x => x.id === id) || BLANK[id] || BLANK.night;
    const C = TOPICS[tp.topic] || GENERIC;
    tp._title = C.title;
    const slides = KINDS.map((k, i) => makeSlide(tp, decorate(tp, k, L[k](tp, C), i), notesFor(k, C)));
    return deckFrom(tp, C.title, slides);
  }
  function deckFrom(tp, title, slides) {
    return { id: uid(), title, tpl: tp.id, tp: tpData(tp), theme: JSON.parse(JSON.stringify(tp.t)), slides, numbers: false, created: Date.now(), updated: Date.now() };
  }
  function blank(id) {
    const tp = BLANK[id] || BLANK.night;
    tp._title = 'Untitled presentation';
    const s = layout('title', tp, 0);
    return deckFrom(tp, 'Untitled presentation', [s]);
  }

  const LAYOUTS = [['title', 'Title'], ['content', 'Title and bullets'], ['two', 'Two columns'], ['section', 'Section'], ['statement', 'Statement'],
    ['bignum', 'Big number'], ['imagetext', 'Image and text'], ['features', 'Three features'], ['agenda', 'Agenda'], ['chart', 'Chart'], ['quote', 'Quote'], ['blank', 'Blank']];
  const DECOR_KIND = { title: 'title', section: 'title', statement: 'quote', bignum: 'stat', content: 'agenda', two: 'agenda', imagetext: 'agenda', agenda: 'agenda', features: 'features', chart: 'chart', quote: 'quote', blank: null };
  function layout(kind, tp, idx) {
    tp = tp || BLANK.night;
    const t = tp.t, G = GENERIC;
    let els;
    switch (kind) {
      case 'title': els = L.title(tp, G); break;
      case 'content': els = [hd(tp, 'Slide title', 150, 110), txt(t, '<ul><li>Make one point per line</li><li>Keep each point short</li><li>Use builds to reveal them one at a time</li></ul>', 150, 320, 1400, 560, { size: 50, lh: 1.5, _b: 'body' })]; break;
      case 'two': els = [hd(tp, 'Slide title', 150, 110),
        txt(t, 'First column', 150, 330, 760, 80, { role: 'head', size: Math.round(50 * Math.min(1.1, hs(tp))), upper: false, _b: 'item' }),
        txt(t, 'Use this side for the problem, the before, or option A.', 150, 430, 740, 400, { size: 36, color: t.muted, lh: 1.45, _b: 'item' }),
        txt(t, 'Second column', 1010, 330, 760, 80, { role: 'head', size: Math.round(50 * Math.min(1.1, hs(tp))), upper: false, _b: 'item' }),
        txt(t, 'Use this side for the solution, the after, or option B.', 1010, 430, 740, 400, { size: 36, color: t.muted, lh: 1.45, _b: 'item' })]; break;
      case 'section': els = [txt(t, 'Part two', 150, 360, 1600, 50, { size: 34, weight: 600, color: t.accent, _b: 'body' }),
        txt(t, 'Section title', 150, 430, 1600, 260, { role: 'head', size: Math.round(140 * hs(tp)), lh: 1, _b: 'title', mid: 'title' })]; break;
      case 'statement': els = [txt(t, 'One idea, said plainly.', 160, 240, 1600, 600, { role: 'head', size: Math.round(120 * hs(tp)), align: 'center', valign: 'middle', lh: 1.05, _b: 'title' })]; break;
      case 'bignum': els = [txt(t, G.stat.value, 160, 170, 1600, 480, { role: 'head', size: Math.round(380 * hs(tp)), color: t.accent, align: 'center', valign: 'bottom', lh: .95, _b: 'stat' }),
        txt(t, G.stat.label, 360, 690, 1200, 140, { size: 48, align: 'center', color: t.muted, _b: 'body' })]; break;
      case 'imagetext': els = [{ id: uid(), mid: uid(), type: 'image', x: 0, y: 0, w: 880, h: 1080, rot: 0, opacity: 1, src: '', fit: 'cover', radius: 0, _b: 'card' },
        txt(t, 'Headline for this image', 1000, 260, 780, 300, { role: 'head', size: Math.round(80 * hs(tp)), valign: 'bottom', _b: 'title' }),
        txt(t, 'Two or three sentences that explain the picture and why it matters.', 1000, 600, 760, 300, { size: 36, color: t.muted, lh: 1.45, _b: 'body' })]; break;
      case 'features': els = L.features(tp, G); break;
      case 'agenda': els = L.agenda(tp, G); break;
      case 'chart': els = L.chart(tp, G); break;
      case 'quote': els = L.quote(tp, G); break;
      default: els = [];
    }
    const dk = DECOR_KIND[kind];
    if (dk) els = decorate(tp, dk, els, idx || 0);
    els.forEach(e => { if (!e.mid || e.mid.length < 6) e.mid = e.mid || uid(); });
    return makeSlide(tp, els, '');
  }

  const THEMES = [BLANK.night.t, BLANK.day.t, ...TEMPLATES.map(tp => tp.t)];
  const CATS = ['Pitch', 'Report', 'Education', 'Launch', 'Minimal', 'Bold'];

  return { TEMPLATES, BLANK, THEMES, CATS, LAYOUTS, build, blank, layout, TOPICS };
})();
