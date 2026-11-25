// ANDRE TAN — приватний редактор теми.
// Базові значення беруться з tokens.css, зміни зберігаються в theme.css
// (лише відмінності + стан редактора в коментарі). tokens.css редактор не чіпає.
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const rootCss = getComputedStyle(document.documentElement);
  const def = n => rootCss.getPropertyValue(n).trim();

  /* ── Що можна редагувати ── */
  const COLOR_GROUPS = [
    ['Основні', ['black', 'white']],
    ['Нейтральні', ['ink-900', 'stone-600', 'stone-300', 'stone-100']],
    ['Бежевий', ['beige-400', 'beige-200', 'beige-50']],
    ['Акценти', ['red-600', 'pink-300', 'pink-100', 'mint-300', 'mint-100', 'turquoise-600']],
  ];
  const SIZES = [ // [ключ, назва, мін, макс, класи, на які діє цей розмір]
    ['display-xl', 'Display XL', 60, 260, '.t-display-xl'], ['display-l', 'Display L', 48, 180, '.t-display-l, .disc-circle'],
    ['h1', 'H1', 40, 140, '.t-h1'], ['h2', 'H2', 28, 100, '.t-h2'], ['h3', 'H3', 22, 80, '.t-h3'],
    ['script', 'Script-акцент', 40, 180, '.t-h2-italic'], ['script-l', 'Script L', 60, 260, '.t-script-l'],
    ['body-l', 'Body L', 18, 48, '.t-body-l'], ['body-m', 'Body M', 16, 40, '.t-body-m'],
    ['caps-l', 'Caps L', 12, 60, '.t-caps-l'], ['caps-m', 'Caps M', 10, 48, '.t-caps-m, .price__name, .btn'], ['caps-s', 'Caps S', 10, 40, '.t-caps-s, .meta-row span, .badge, .counter'],
    ['price', 'Ціна', 16, 72, '.t-price, .price__value, .price-chip, .price__old'],
    ['logo', 'Логотип і назви хайлайтів', 16, 120, '.logo, .hl-cover__title'],
  ];
  // трекінг — у сотих частках em (8 = 0.08em); 0 = літери без додаткового відступу
  const TRACKS = [['--at-post-track-caps-l', 'Caps L — назви', 0, 40], ['--at-post-track-caption', 'Caps M / S, мітки, кнопки', 0, 40], ['--at-post-track-logo', 'Логотип і сайт', 0, 40]];
  const LAYOUT = [['--at-margin-feed', 'Поле поста', 24, 160], ['--at-margin-story', 'Поле Stories', 24, 160]];

  // Лише шрифти дизайн-системи (tokens.css): Cormorant Garamond Regular + Italic, Montserrat Bold, Petit Formal Script,
  // Manrope, Vela Sans, Ballet, Imperial Script. Усі OFL; ліцензію, ваги та кирилицю
  // звірено з google/fonts METADATA.pb (2026-11-22). Vela Sans — не з Google Fonts,
  // тому окремо не обирається: це база Heading, що показується як Manrope.
  const FONTS = [
    { n: 'Montserrat', cat: 'sans', w: [700], cyr: 1 },               // лише Bold
    { n: 'Manrope', cat: 'sans', w: [200, 800], cyr: 1 },
    { n: 'Cormorant Garamond', cat: 'serif', w: [400], cyr: 1 },      // лише Regular
    // накреслення: той самий файл Google Fonts, але курсив (fam — справжня назва шрифту)
    { n: 'Cormorant Garamond Italic', fam: 'Cormorant Garamond', ital: 1, cat: 'serif', w: [400, 700], cyr: 1 }, // курсив 400–700 (2026-11-23)
    { n: 'Ballet', cat: 'script', w: [400], cyr: 0, axis: 'opsz@16..72' },
    { n: 'Imperial Script', cat: 'script', w: [400], cyr: 0 },
    { n: 'Petit Formal Script', cat: 'script', w: [400], cyr: 0 },     // OFL, лише латиниця (2026-11-23)
  ];
  const famOf = m => m.fam || m.n;
  const CATS = { sans: 'Гротески', serif: 'Антиква', script: 'Рукописні' };
  const CYR_FALLBACK = { sans: 'Manrope', serif: 'Cormorant Garamond', script: 'Cormorant Garamond' };
  const GENERIC = { sans: '"Helvetica Neue", Arial, sans-serif', serif: '"Times New Roman", serif', script: 'cursive' };
  const ROLES = [
    { id: 'display', v: '--at-post-display', label: 'Display — великі заголовки', weight: '--at-post-display-weight', sample: 'Нова колекція', sel: '.t-display-xl, .t-display-l, .disc-circle' },
    { id: 'heading', v: '--at-post-heading', label: 'Heading — H1–H3', weight: '--at-post-heading-weight', sample: 'Елегантність у деталях', sel: '.t-h1, .t-h2, .t-h3' },
    { id: 'body', v: '--at-post-body', label: 'Body — основний текст', need: [400, 500], sample: 'Опис товару', sel: '.t-body-l, .t-body-m' },
    { id: 'capsl', v: '--at-post-caps-l', label: 'Caps L — назви великими літерами', weight: '--at-post-caps-l-weight', sample: 'НАЗВА', sel: '.t-caps-l' },
    { id: 'caption', v: '--at-post-caption', label: 'Caps M / S — підписи, назви товарів, мітки', weight: '--at-post-caption-weight', sample: 'ПІДПИС', sel: '.t-caps-m, .t-caps-s, .price__name, .meta-row span, .badge, .counter, .btn' },
    { id: 'price', v: '--at-post-price', label: 'Ціна', weight: '--at-post-price-weight', sample: '12 999 ₴', sel: '.t-price, .price__value, .price-chip, .price__old' },
    { id: 'script', v: '--at-post-script', label: 'Script — рукописний акцент', sample: 'new arrival', sel: '.t-script-l, .t-h2-italic, .italic' },
    { id: 'logo', v: '--at-font-logo', label: 'Логотип і назви хайлайтів', sample: 'ANDRE TAN', sel: '.logo, .hl-cover__title' },
  ];

  const COLOR_VARS = COLOR_GROUPS.flatMap(([, ks]) => ks.map(k => `--at-${k}`));
  const SIZE_VARS = SIZES.map(([k]) => `--at-post-size-${k}`);
  const LAYOUT_VARS = LAYOUT.map(([n]) => n);
  const TRACK_VARS = TRACKS.map(([n]) => n);
  const PLAIN_VARS = [...COLOR_VARS, ...SIZE_VARS, ...LAYOUT_VARS, ...TRACK_VARS, '--at-post-display-case'];

  /* ── Стан ── */
  const fontMeta = n => FONTS.find(f => f.n === n);
  const firstFamily = stack => stack.split(',')[0].trim().replace(/^["']|["']$/g, '');
  const secondFamily = stack => (stack.split(',')[1] || '').trim().replace(/^["']|["']$/g, '');
  const clampW = (m, w) => m.w.length === 1 ? m.w[0] : Math.min(m.w[1], Math.max(m.w[0], Math.round(w / 100) * 100));
  const roleDefault = r => {
    const fam = firstFamily(def(r.v));
    return { family: fontMeta(fam) ? fam : '', weight: r.weight ? +def(r.weight) : 400 };
  };

  // texts: кольори окремих текстів готових постів { "<id поста>": { "<data-t>": "#HEX" } }
  let state = { vars: {}, fonts: {}, texts: {} };
  let saved = '';
  const sortObj = o => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
  const sortTexts = t => Object.fromEntries(Object.entries(t || {}).filter(([, o]) => Object.keys(o).length).sort(([a], [b]) => a.localeCompare(b)).map(([k, o]) => [k, sortObj(o)]));
  const norm = s => JSON.stringify({ vars: sortObj(s.vars), fonts: sortObj(s.fonts), texts: sortTexts(s.texts) });
  // тексти поста, змінені прямо в прев'ю (зберігаються в posts/<id>.html)
  const postEdit = { dirty: false, id: null, canvas: null };
  const dirty = () => norm(state) !== saved || postEdit.dirty;
  const cur = n => state.vars[n] ?? def(n);
  const roleCur = r => state.fonts[r.id] || roleDefault(r);

  function setVar(n, v) {
    if (v === def(n)) delete state.vars[n]; else state.vars[n] = v;
    changed();
  }
  function setRole(r, patch) {
    const next = { ...roleCur(r), ...patch };
    const m = fontMeta(next.family);
    if (m && r.weight) next.weight = clampW(m, next.weight);
    const d = roleDefault(r);
    if (next.family === d.family && (!r.weight || next.weight === d.weight)) delete state.fonts[r.id];
    else state.fonts[r.id] = next;
    changed();
  }

  /* ── CSS ── */
  function stackFor(name) {
    const m = fontMeta(name);
    const p = [`"${famOf(m)}"`];
    if (!m.cyr) p.push(`"${CYR_FALLBACK[m.cat]}"`);
    return `${p.join(', ')}, ${GENERIC[m.cat]}`;
  }
  const styleOf = name => { const m = fontMeta(name); return m && m.ital ? 'italic' : 'normal'; };
  function importUrl(entries) { // [[role, {family, weight}]]
    const need = new Map(); // справжня назва → { m, ws: Set ваг, it: Set(0|1) }
    const add = (name, ws) => {
      const m = fontMeta(name); if (!m) return;
      const fam = famOf(m);
      if (!need.has(fam)) need.set(fam, { m: fontMeta(fam) || m, ws: new Set(), it: new Set() });
      const e = need.get(fam);
      ws.forEach(w => e.ws.add(clampW(m, w))); e.it.add(m.ital ? 1 : 0);
      if (!m.cyr) add(CYR_FALLBACK[m.cat], ws);
    };
    entries.forEach(([r, v]) => v.family && add(v.family, r.weight ? [v.weight] : (r.need || [400])));
    if (!need.size) return '';
    const fams = [...need].map(([fam, { m, ws, it }]) => {
      const e = fam.replace(/ /g, '+'), wl = [...ws].sort((a, b) => a - b);
      if (m.axis) return `family=${e}:${m.axis}`;
      if (it.has(1)) return `family=${e}:ital,wght@${[...it].sort().flatMap(i => wl.map(w => `${i},${w}`)).join(';')}`;
      if (m.w.length === 1 && m.w[0] === 400) return `family=${e}`;
      return `family=${e}:wght@${wl.join(';')}`;
    });
    return `https://fonts.googleapis.com/css2?${fams.join('&')}&display=swap`;
  }
  // full=true — для прев'ю: усі змінні явно (щоб перекрити збережений theme.css)
  function buildCss(full) {
    const vars = {};
    if (full) PLAIN_VARS.forEach(n => { vars[n] = cur(n); });
    else Object.assign(vars, sortObj(state.vars));
    ROLES.forEach(r => {
      const o = state.fonts[r.id];
      if (o && o.family) vars[r.v] = stackFor(o.family); else if (full) vars[r.v] = def(r.v);
      // накреслення (прямий / курсив); 'initial' = змінна не задана → у CSS діє значення за замовчуванням
      if (o && o.family) vars[r.v + '-style'] = styleOf(o.family); else if (full) vars[r.v + '-style'] = 'initial';
      if (r.weight) { if (o) vars[r.weight] = String(o.weight); else if (full) vars[r.weight] = def(r.weight); }
    });
    const url = importUrl(ROLES.filter(r => state.fonts[r.id]).map(r => [r, state.fonts[r.id]]));
    let css = '';
    if (!full) css += `/* ANDRE TAN — тема з редактора. Порожня = все як у tokens.css.\n   Файл генерує редактор (editor/), вручну не редагуйте.\n   editor-state: ${JSON.stringify({ vars: sortObj(state.vars), fonts: sortObj(state.fonts), texts: sortTexts(state.texts) })} */\n`;
    if (url) css += `@import url("${url}");\n`;
    const keys = Object.keys(vars);
    if (keys.length) css += `:root {\n${keys.map(k => `  ${k}: ${vars[k]};`).join('\n')}\n}\n`;
    // кольори окремих текстів: діють лише у «своєму» пості (canvas з data-post)
    Object.entries(sortTexts(state.texts)).forEach(([post, o]) => Object.entries(o).forEach(([k, c]) => {
      css += `.canvas[data-post="${post}"] [data-t="${k}"] { color: ${c}; }\n`;
    }));
    return css;
  }

  /* ── Кольори окремих текстів поста ── */
  const toHex = c => { const m = c.match(/\d+(\.\d+)?/g); return m ? '#' + m.slice(0, 3).map(x => (+x).toString(16).padStart(2, '0')).join('').toUpperCase() : '#000000'; };
  function setText(post, key, hex, base) {
    state.texts[post] = state.texts[post] || {};
    if (!hex || hex === base) delete state.texts[post][key]; else state.texts[post][key] = hex;
    if (!Object.keys(state.texts[post]).length) delete state.texts[post];
    changed();
  }
  // таблиця кольорів для текстів поста, відкритого в прев'ю (елементи з data-t)
  function renderTextColors() {
    const box = $('#textcolors'); if (!box) return;
    const p = previews[+pv.value], doc = frame.contentDocument;
    const canvas = p && p.id && doc && doc.querySelector(`.canvas[data-post="${p.id}"]`);
    const items = canvas ? [...canvas.querySelectorAll('[data-t]')] : [];
    if (!items.length) {
      box.innerHTML = `<p class="ed-hint">${p && p.id ? 'У цьому пості тексти ще не позначені для окремого фарбування.' : 'Оберіть у прев\'ю готовий пост — тут з\'являться його тексти.'}</p>`;
      return;
    }
    const own = state.texts[p.id] || {};
    box.innerHTML = items.map(el => {
      const k = el.dataset.t, label = el.dataset.label || k;
      const sample = el.innerText.replace(/\s+/g, ' ').trim();
      // базовий колір = колір без окремого правила: на мить знімаємо data-t і читаємо колір
      el.removeAttribute('data-t'); const base = toHex(getComputedStyle(el).color); el.setAttribute('data-t', k);
      const v = own[k] || base;
      return `<div class="ctl tcl${own[k] ? ' is-changed' : ''}" data-key="${k}" data-base="${base}" title="${sample.replace(/"/g, '&quot;')}">
        <input type="color" value="${v.toLowerCase()}" aria-label="${label}"><input type="text" class="hex" value="${v}" maxlength="7" spellcheck="false" aria-label="${label} HEX">
        <span class="lbl">${label}<small>${sample}</small></span>${undoBtn}</div>`;
    }).join('');
  }
  const tcBox = $('#textcolors');
  if (tcBox) {
    tcBox.addEventListener('input', e => {
      e.stopPropagation();
      const t = e.target, row = t.closest('.tcl'); if (!row) return;
      const p = previews[+pv.value]; if (!p || !p.id) return;
      let v = t.type === 'color' ? t.value.toUpperCase() : t.value.trim().toUpperCase();
      if (v && v[0] !== '#') v = '#' + v;
      const ok = /^#[0-9A-F]{6}$/.test(v);
      if (t.classList.contains('hex')) { t.classList.toggle('is-bad', !ok); if (!ok) return; row.querySelector('input[type=color]').value = v.toLowerCase(); }
      else row.querySelector('.hex').value = v;
      setText(p.id, row.dataset.key, v, row.dataset.base);
      row.classList.toggle('is-changed', v !== row.dataset.base);
    });
    tcBox.addEventListener('click', e => {
      const b = e.target.closest('.undo'); if (!b) return;
      e.stopPropagation();
      const p = previews[+pv.value], row = b.closest('.tcl');
      setText(p.id, row.dataset.key, null, row.dataset.base);
      renderTextColors();
    });
  }

  /* ── Панель ── */
  const undoBtn = '<button class="undo" type="button" title="Повернути як у базі" aria-label="Повернути як у базі">↺</button>';
  function renderPanel() {
    $('#colors').innerHTML = COLOR_GROUPS.map(([g, keys]) => `<h3>${g}</h3>` + keys.map(k => {
      const n = `--at-${k}`, v = cur(n).toUpperCase();
      return `<div class="ctl" data-var="${n}"><input type="color" value="${v.toLowerCase()}" aria-label="${k}"><input type="text" class="hex" value="${v}" maxlength="7" spellcheck="false" aria-label="${k} HEX"><span class="lbl">${k.replace('-', ' / ')}</span>${undoBtn}</div>`;
    }).join('')).join('');

    $('#fonts').innerHTML = ROLES.map(r => {
      const v = roleCur(r), d = roleDefault(r), base = def(r.v);
      const baseOpt = d.family ? '' : `<option value="">${firstFamily(base)} → ${secondFamily(base)} (база)</option>`;
      const groups = Object.entries(CATS).map(([cat, title]) => `<optgroup label="${title}">${FONTS.filter(f => f.cat === cat).map(f =>
        `<option value="${f.n}" ${f.n === v.family ? 'selected' : ''}>${f.n}${f.n === d.family ? ' (база)' : ''}${f.cyr ? '' : ' · без кирилиці'}</option>`).join('')}</optgroup>`).join('');
      return `<div class="role" data-role="${r.id}">
        <div class="role__head"><span class="lbl">${r.label}</span>${undoBtn}</div>
        <div class="role__row"><select class="fam" aria-label="${r.label}">${baseOpt}${groups}</select>${r.weight ? `<select class="w" aria-label="Товщина">${weightOpts(v)}</select>` : ''}</div>
        <div class="role__sample">${r.sample}</div><div class="role__note"></div></div>`;
    }).join('');

    $('#sizes').innerHTML = SIZES.map(([k, label, min, max]) => rangeCtl(`--at-post-size-${k}`, label, min, max)).join('');
    $('#layout').innerHTML = LAYOUT.map(([n, label, min, max]) => rangeCtl(n, label, min, max)).join('');
    $('#tracking').innerHTML = TRACKS.map(([n, label, min, max]) => rangeCtl(n, label, min, max, 'em')).join('');
    $('#caps').checked = cur('--at-post-display-case') !== 'none';
    ROLES.forEach(r => { const w = document.querySelector(`.role[data-role="${r.id}"] select.w`); if (w) w.disabled = !roleCur(r).family; });
    marks();
    try { syncSamples(); } catch {} // панель перебудовано — повертаємо тексти з поточного поста
  }
  function weightOpts(v) {
    const m = fontMeta(v.family);
    const ws = !m ? [v.weight] : m.w.length === 1 ? [m.w[0]] : Array.from({ length: (m.w[1] - m.w[0]) / 100 + 1 }, (_, i) => m.w[0] + i * 100);
    return ws.map(w => `<option value="${w}" ${w === v.weight ? 'selected' : ''}>${w}</option>`).join('');
  }
  function rangeCtl(n, label, min, max, unit = 'px') {
    const v = unit === 'em' ? Math.round(parseFloat(cur(n)) * 100) : parseFloat(cur(n));
    if (unit === 'em') return `<div class="ctl ctl--range" data-var="${n}" data-unit="em"><span class="lbl">${label}</span><input type="range" min="${min}" max="${max}" step="1" value="${v}" aria-label="${label}"><input type="number" min="${min}" max="${max}" value="${v}" aria-label="${label}, сотих em"><span class="unit">%</span>${undoBtn}</div>`;
    return `<div class="ctl ctl--range" data-var="${n}"><span class="lbl">${label}</span><input type="range" min="${min}" max="${max}" step="1" value="${v}" aria-label="${label}"><input type="number" min="${min}" max="${max}" value="${v}" aria-label="${label}, px"><span class="unit">px</span>${undoBtn}</div>`;
  }
  function marks() {
    document.querySelectorAll('.ctl[data-var]').forEach(c => c.classList.toggle('is-changed', c.dataset.var in state.vars));
    ROLES.forEach(r => {
      const el = document.querySelector(`.role[data-role="${r.id}"]`); if (!el) return;
      const v = roleCur(r), m = fontMeta(v.family);
      el.classList.toggle('is-changed', !!state.fonts[r.id]);
      const sample = el.querySelector('.role__sample');
      sample.style.fontFamily = v.family ? stackFor(v.family) : def(r.v);
      sample.style.fontWeight = r.weight ? v.weight : 400;
      sample.style.fontStyle = v.family ? styleOf(v.family) : '';
      if (r.id === 'display') sample.style.textTransform = cur('--at-post-display-case');
      if (r.id === 'script') sample.style.fontVariationSettings = '"opsz" 36';
      // Підказки: (1) роль не використовується у відкритому пості; (2) у тексті є кирилиця, якої немає у шрифті
      const notes = [];
      if (el.dataset.unused) notes.push('У цьому пості такого тексту немає — зміна шрифту тут не буде видна. Зразок вище — текст поста для порівняння.');
      if (m && !m.cyr && /[Ѐ-ӿ]/.test(sample.textContent)) notes.push(`Кирилиці у шрифті немає — українські літери показуються ${CYR_FALLBACK[m.cat]}.`);
      el.querySelector('.role__note').textContent = notes.join(' ');
      el.classList.toggle('is-unused', !!el.dataset.unused);
    });
  }

  /* ── Події панелі ── */
  const panel = $('#panel');
  panel.addEventListener('input', e => {
    const t = e.target, ctl = t.closest('.ctl[data-var]');
    if (t.id === 'caps') return setVar('--at-post-display-case', t.checked ? 'uppercase' : 'none');
    if (!ctl) return;
    const n = ctl.dataset.var;
    if (t.type === 'color') { ctl.querySelector('.hex').value = t.value.toUpperCase(); ctl.querySelector('.hex').classList.remove('is-bad'); return setVar(n, t.value.toUpperCase()); }
    if (t.classList.contains('hex')) {
      let v = t.value.trim().toUpperCase(); if (v && v[0] !== '#') v = '#' + v;
      const ok = /^#[0-9A-F]{6}$/.test(v); t.classList.toggle('is-bad', !ok);
      if (ok) { ctl.querySelector('input[type=color]').value = v.toLowerCase(); setVar(n, v); }
      return;
    }
    if (t.type === 'range' || t.type === 'number') {
      if (t.value === '') return;
      const other = ctl.querySelector(t.type === 'range' ? 'input[type=number]' : 'input[type=range]');
      other.value = t.value;
      return setVar(n, ctl.dataset.unit === 'em' ? `${+(Math.round(+t.value) / 100).toFixed(2)}em` : `${Math.round(+t.value)}px`);
    }
  });
  panel.addEventListener('change', e => {
    const t = e.target, role = t.closest('.role'); if (!role) return;
    const r = ROLES.find(x => x.id === role.dataset.role);
    if (t.classList.contains('fam')) {
      if (!t.value) { delete state.fonts[r.id]; changed(); } else setRole(r, { family: t.value });
      const w = role.querySelector('select.w'); if (w) { w.innerHTML = weightOpts(roleCur(r)); w.disabled = !roleCur(r).family; }
    }
    if (t.classList.contains('w')) setRole(r, { weight: +t.value });
  });
  panel.addEventListener('click', e => {
    const b = e.target.closest('.undo'); if (!b) return;
    const role = b.closest('.role');
    if (role) delete state.fonts[role.dataset.role];
    else delete state.vars[b.closest('[data-var]').dataset.var];
    renderPanel(); changed();
  });

  /* ── Прев'ю ── */
  const frame = $('#frame'), stage = $('#stage'), pv = $('#pv');
  const previews = [
    ...(window.POSTS || []).map(p => ({ label: `Пост · ${p.title}`, src: `../posts/${p.id}.html`, w: p.w, h: p.h, id: p.id })),
    { label: 'Дизайн-система · Пости', src: '../index.html#posts' },
    { label: 'Дизайн-система · Карусель', src: '../index.html#carousel' },
    { label: 'Дизайн-система · Stories', src: '../index.html#stories' },
    { label: 'Дизайн-система · Типографіка', src: '../index.html#type' },
    { label: 'Дизайн-система · Колір', src: '../index.html#colors' },
    { label: 'Дизайн-система · Компоненти', src: '../index.html#components' },
  ];
  pv.innerHTML = previews.map((p, i) => `<option value="${i}">${p.label}</option>`).join('');
  try { const saved = sessionStorage.getItem('ed-pv'); if (saved && previews[+saved]) pv.value = saved; } catch {}
  function showPreview() {
    const p = previews[+pv.value];
    try { sessionStorage.setItem('ed-pv', pv.value); } catch {}
    frame.src = p.src; fit();
  }
  function fit() {
    const p = previews[+pv.value];
    if (!p.w) { frame.classList.remove('is-post'); frame.removeAttribute('style'); return; }
    const W = stage.clientWidth, H = stage.clientHeight, pad = 32;
    const s = Math.min((W - pad * 2) / p.w, (H - pad * 2) / p.h);
    frame.classList.add('is-post');
    frame.style.cssText = `width:${p.w}px;height:${p.h}px;left:${(W - p.w * s) / 2}px;top:${(H - p.h * s) / 2}px;transform:scale(${s})`;
  }
  function applyPreview() {
    const doc = frame.contentDocument; if (!doc || !doc.head) return;
    let st = doc.getElementById('ed-live');
    if (!st) { st = doc.createElement('style'); st.id = 'ed-live'; doc.head.appendChild(st); }
    st.textContent = buildCss(true);
  }
  /* ── Редагування текстів прямо в прев'ю ──
     У готовому пості кожен текст стає редагованим: клік — і пишіть. «Зберегти» записує
     полотно (.canvas) у posts/<id>.html. Шаблони дизайн-системи так не редагуються. */
  function enableEditing() {
    const p = previews[+pv.value], doc = frame.contentDocument;
    postEdit.id = null; postEdit.canvas = null; postEdit.dirty = false;
    if (!p || !p.id || !doc) return;
    const canvas = doc.querySelector('.canvas'); if (!canvas) return;
    postEdit.id = p.id; postEdit.canvas = canvas;
    const st = doc.createElement('style'); st.id = 'ed-edit';
    st.textContent = '[data-edit]{cursor:text;outline:none}[data-edit]:hover{outline:3px dashed rgba(179,18,29,.6);outline-offset:8px}[data-edit]:focus{outline:3px solid #B3121D;outline-offset:8px}.ed-move [data-edit]{cursor:move;user-select:none}.ed-move [data-edit]:focus{outline:none}.ed-move [data-edit].ed-sel{outline:3px solid #B3121D;outline-offset:8px;background:rgba(179,18,29,.08)}';
    doc.head.appendChild(st);
    // напис = елемент із власним текстом (або зі шматками .ff усередині); вкладені .ff — частина напису, не окремий
    canvas.querySelectorAll('*').forEach(el => {
      if (el.matches('[data-ff]') || (el.parentElement && el.parentElement.closest('[data-edit]'))) return;
      if (![...el.childNodes].some(n => (n.nodeType === 3 && n.textContent.trim()) || (n.nodeType === 1 && n.matches('[data-ff]')))) return;
      el.setAttribute('contenteditable', 'plaintext-only'); el.setAttribute('data-edit', ''); el.spellcheck = false;
    });
    doc.addEventListener('selectionchange', placeFfBar);
    canvas.addEventListener('input', () => { postEdit.dirty = true; setStatus('Є незбережені зміни', true); });
    setupMove(doc, canvas);
    applyMode();
    canvas.addEventListener('focusout', () => syncSamples());
    // вставка — лише простий текст
    canvas.addEventListener('paste', e => { e.preventDefault(); doc.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain')); });
  }
  /* ── Переміщення текстів ──
     Режим «✥ Переміщення»: клік — виділити напис, Shift+клік — додати/прибрати з виділення,
     тягнути мишкою — рухати всі виділені; стрілки — на 1 px, Shift+стрілки — на 10 px; Esc — зняти виділення.
     Зсув зберігається в пості як CSS translate (верстка шаблону лишається, текст лише зміщується). */
  let editMode = 'text';
  const sel = new Set();
  const getXY = el => { const p = (el.style.translate || '').match(/-?\d+(\.\d+)?/g) || []; return [+(p[0] || 0), +(p[1] || 0)]; };
  const setXY = (el, x, y) => { x = Math.round(x); y = Math.round(y); el.style.translate = (x || y) ? `${x}px ${y}px` : ''; if (!el.getAttribute('style')) el.removeAttribute('style'); };
  const markMoved = () => { postEdit.dirty = true; setStatus('Є незбережені зміни', true); updateMoveInfo(); };
  function clearSel() { sel.forEach(el => el.classList.remove('ed-sel')); sel.clear(); updateMoveInfo(); }
  function updateMoveInfo() {
    const info = $('#move-info'); if (!info) return;
    if (editMode !== 'move') { info.textContent = ''; return; }
    if (!sel.size) { info.textContent = 'Клікніть на напис у прев\'ю, щоб виділити. Shift+клік — кілька.'; return; }
    const [x, y] = getXY([...sel][0]);
    info.textContent = `Виділено: ${sel.size}` + (sel.size === 1 ? ` · зсув ${x}, ${y} px` : '');
  }
  function setupMove(doc, canvas) {
    sel.clear();
    let drag = null;
    canvas.addEventListener('mousedown', e => {
      if (editMode !== 'move') return;
      const el = e.target.closest('[data-edit]');
      e.preventDefault();
      if (!el) { if (!e.shiftKey) clearSel(); return; }
      if (e.shiftKey) { if (sel.has(el)) { sel.delete(el); el.classList.remove('ed-sel'); } else { sel.add(el); el.classList.add('ed-sel'); } updateMoveInfo(); if (!sel.has(el)) return; }
      else if (!sel.has(el)) { clearSel(); sel.add(el); el.classList.add('ed-sel'); updateMoveInfo(); }
      drag = { x: e.clientX, y: e.clientY, start: [...sel].map(n => [n, ...getXY(n)]), moved: false };
      // фокус клавіатури — у прев'ю, щоб одразу працювали стрілки
      if (document.activeElement && document.activeElement !== frame && document.activeElement.blur) document.activeElement.blur();
      try { frame.contentWindow.focus(); } catch {}
    }, true);
    doc.addEventListener('mousemove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 3) return;
      drag.moved = true;
      drag.start.forEach(([n, x, y]) => setXY(n, x + dx, y + dy));
      updateMoveInfo();
    });
    doc.addEventListener('mouseup', () => { if (drag && drag.moved) markMoved(); drag = null; });
    // стрілки працюють і коли фокус у прев'ю, і коли на сторінці редактора
    doc.addEventListener('keydown', nudgeKey);
  }
  function nudgeKey(e) {
    if (editMode !== 'move' || !sel.size) return;
    // у полях панелі (HEX, числа, коміт) стрілки лишаємо полям
    const t = e.target; if (t && t.ownerDocument === document && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (e.key === 'Escape') { clearSel(); return; }
    const step = e.shiftKey ? 10 : 1;
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (!d) return;
    e.preventDefault();
    sel.forEach(n => { const [x, y] = getXY(n); setXY(n, x + d[0], y + d[1]); });
    markMoved();
  }
  document.addEventListener('keydown', nudgeKey);

  /* ── Шрифт виділених слів або літер ──
     Режим «✎ Текст»: виділіть мишкою частину напису — над нею з'явиться панель шрифтів.
     Шматок стає <span class="ff ff-<ключ>" data-ff="<ключ>"> (класи — у components.css);
     розмір, колір і трекінг лишаються від напису. «↺ Як у тексті» прибирає окремий шрифт. */
  const FF = [ // [ключ → клас ff-<ключ>, назва з FONTS]
    ['montserrat', 'Montserrat'], ['manrope', 'Manrope'], ['cormorant', 'Cormorant Garamond'], ['cormorant-italic', 'Cormorant Garamond Italic'],
    ['ballet', 'Ballet'], ['imperial', 'Imperial Script'], ['petit', 'Petit Formal Script'],
  ];
  const ffBar = document.createElement('div'); ffBar.className = 'ed-ffbar'; ffBar.hidden = true;
  ffBar.innerHTML = '<span class="ed-ffbar__t">Шрифт виділеного</span>' + FF.map(([k, n]) => {
    const m = fontMeta(n);
    return `<button type="button" data-ff="${k}" title="${n}" style="font-family:'${famOf(m)}';font-style:${m.ital ? 'italic' : 'normal'};font-weight:${m.w[0] === 700 ? 700 : 400}">${n.replace('Cormorant Garamond', 'Cormorant')}</button>`;
  }).join('') + '<button type="button" data-ff="" class="ed-ffbar__reset" title="Прибрати окремий шрифт — як у всьому написі">↺ Як у тексті</button>';
  document.body.appendChild(ffBar);
  ffBar.addEventListener('mousedown', e => e.preventDefault()); // не знімати виділення в прев'ю
  ffBar.addEventListener('click', e => { const b = e.target.closest('button'); if (b) applyFf(b.dataset.ff); });
  let ffRange = null;
  const elOf = n => n && (n.nodeType === 1 ? n : n.parentElement);
  function ffHost() {
    const doc = frame.contentDocument; if (!doc || !postEdit.canvas || editMode !== 'text') return null;
    const s = doc.getSelection(); if (!s || !s.rangeCount || s.isCollapsed) return null;
    const r = s.getRangeAt(0);
    const a = elOf(r.startContainer)?.closest('[data-edit]'), b = elOf(r.endContainer)?.closest('[data-edit]');
    return a && a === b && postEdit.canvas.contains(a) && r.toString().trim() ? { host: a, range: r } : null;
  }
  function placeFfBar() {
    const h = ffHost();
    if (!h) { ffBar.hidden = true; ffRange = null; return; }
    ffRange = h.range.cloneRange();
    const rr = h.range.getBoundingClientRect(), fr = frame.getBoundingClientRect(), s = fr.width / frame.offsetWidth;
    ffBar.hidden = false;
    const bw = ffBar.offsetWidth, bh = ffBar.offsetHeight;
    let x = fr.left + (rr.left + rr.width / 2) * s - bw / 2, y = fr.top + rr.top * s - bh - 12;
    if (y < 8) y = fr.top + rr.bottom * s + 12;
    ffBar.style.left = Math.max(8, Math.min(innerWidth - bw - 8, x)) + 'px'; ffBar.style.top = y + 'px';
  }
  // позиції в тексті напису (лише текстові вузли) ↔ Range — щоб після перебудови знову виділити той самий шматок
  const textNodes = host => { const w = host.ownerDocument.createTreeWalker(host, 4), a = []; while (w.nextNode()) a.push(w.currentNode); return a; };
  function rangeAt(host, from, to) {
    const r = host.ownerDocument.createRange(); let pos = 0, started = false;
    for (const n of textNodes(host)) {
      const len = n.nodeValue.length;
      if (!started && from <= pos + len) { r.setStart(n, from - pos); started = true; }
      if (started && to <= pos + len) { r.setEnd(n, to - pos); return r; }
      pos += len;
    }
    return null;
  }
  // напис → рівна послідовність: текст і <br> поза шматками, сусідні шматки з однаковим шрифтом зливаються
  function flattenFf(host) {
    const doc = host.ownerDocument, runs = [];
    const w = doc.createTreeWalker(host, 1 | 4);
    while (w.nextNode()) {
      const n = w.currentNode;
      if (n.nodeType === 1 && n.tagName !== 'BR') continue;
      if (n.nodeType === 3 && !n.nodeValue) continue;
      const f = n.parentElement.closest('[data-ff]'), k = f && host.contains(f) ? f.getAttribute('data-ff') : '';
      const last = runs[runs.length - 1];
      if (last && last.k === k) last.nodes.push(n); else runs.push({ k, nodes: [n] });
    }
    const out = [];
    runs.forEach(({ k, nodes }) => {
      const copy = nodes.map(n => n.nodeType === 3 ? doc.createTextNode(n.nodeValue) : doc.createElement('br'));
      if (!k) { out.push(...copy); return; }
      const s = doc.createElement('span'); s.className = `ff ff-${k}`; s.setAttribute('data-ff', k); s.append(...copy); out.push(s);
    });
    host.replaceChildren(...out); host.normalize();
  }
  function applyFf(key) {
    const doc = frame.contentDocument, r = ffRange; if (!doc || !r) return;
    const host = elOf(r.startContainer)?.closest('[data-edit]'); if (!host) return;
    const pre = doc.createRange(); pre.setStart(host, 0); pre.setEnd(r.startContainer, r.startOffset);
    const from = pre.toString().length, to = from + r.toString().length;
    const frag = r.extractContents();
    frag.querySelectorAll('[data-ff]').forEach(s => s.replaceWith(...s.childNodes));
    const wrap = doc.createElement('span'); wrap.setAttribute('data-ff', key); wrap.appendChild(frag);
    r.insertNode(wrap);
    // у написі є інша розмітка (не текст/br/шрифтові шматки) — не перебудовуємо, лише чистимо обгортку
    if ([...host.querySelectorAll('*')].some(n => n.tagName !== 'BR' && !n.matches('span[data-ff]'))) {
      if (key) wrap.className = `ff ff-${key}`; else wrap.replaceWith(...wrap.childNodes);
    } else flattenFf(host);
    const back = rangeAt(host, from, to);
    if (back) { const s = doc.getSelection(); s.removeAllRanges(); s.addRange(back); }
    postEdit.dirty = true; setStatus('Є незбережені зміни', true);
    syncSamples(); placeFfBar();
  }
  addEventListener('resize', () => { ffBar.hidden = true; });

  function applyMode() {
    if (editMode !== 'text') ffBar.hidden = true;
    const doc = frame.contentDocument;
    document.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('is-on', b.dataset.mode === editMode));
    if (doc && postEdit.canvas) {
      doc.documentElement.classList.toggle('ed-move', editMode === 'move');
      postEdit.canvas.querySelectorAll('[data-edit]').forEach(el => el.setAttribute('contenteditable', editMode === 'text' ? 'plaintext-only' : 'false'));
      if (editMode === 'text') clearSel(); else { doc.getSelection().removeAllRanges(); doc.activeElement && doc.activeElement.blur && doc.activeElement.blur(); frame.focus(); }
    }
    updateMoveInfo();
  }
  document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { editMode = b.dataset.mode; applyMode(); }));
  const resetBtn = $('#move-reset');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    const list = sel.size ? [...sel] : (postEdit.canvas ? [...postEdit.canvas.querySelectorAll('[data-edit]')] : []);
    let any = false; list.forEach(n => { if (n.style.translate) { setXY(n, 0, 0); any = true; } });
    if (any) markMoved();
  });
  // чисте полотно для збереження: без службових атрибутів; переноси рядка → <br>
  function postHtml() {
    const c = postEdit.canvas.cloneNode(true);
    c.querySelectorAll('.ed-sel').forEach(el => { el.classList.remove('ed-sel'); if (!el.className) el.removeAttribute('class'); });
    c.querySelectorAll('[class=""]').forEach(el => el.removeAttribute('class')); // після зняття виділення лишається порожній class
    c.querySelectorAll('[data-edit]').forEach(el => {
      el.removeAttribute('contenteditable'); el.removeAttribute('data-edit'); el.removeAttribute('spellcheck');
      const w = el.ownerDocument.createTreeWalker(el, 4), tn = []; while (w.nextNode()) tn.push(w.currentNode);
      tn.forEach(n => {
        if (!n.nodeValue.includes('\n')) return;
        const parts = n.nodeValue.split('\n'), frag = n.ownerDocument.createDocumentFragment();
        parts.forEach((s, i) => { if (i) frag.appendChild(n.ownerDocument.createElement('br')); frag.appendChild(n.ownerDocument.createTextNode(s)); });
        n.replaceWith(frag);
      });
    });
    return c.outerHTML;
  }
  async function savePost() {
    if (!postEdit.id || !postEdit.canvas) return;
    await api('/api/post', JSON.stringify({ id: postEdit.id, html: postHtml() }));
    postEdit.dirty = false;
  }
  /* Зразки шрифтів = справжні тексти з поста в прев'ю (оновлюються при кожному відкритті).
     Для сторінок дизайн-системи — тексти з розділу за якорем; чого немає — базовий зразок. */
  function syncSamples() {
    const doc = frame.contentDocument; if (!doc) return;
    const hash = (previews[+pv.value].src.split('#')[1] || '');
    const root = (hash && doc.getElementById(hash)) || doc;
    const scope = root.querySelector('.canvas') ? root : doc;
    const txt = n => n.innerText.replace(/\s+/g, ' ').trim();
    // усі різні тексти поста для селектора (у порядку появи)
    const texts = (sel, max) => [...new Set([...scope.querySelectorAll(`.canvas :is(${sel})`)].map(txt).filter(Boolean))].slice(0, max);
    const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const ANY = '.t-display-xl, .t-display-l, .t-h1, .t-h2, .t-h3, .t-body-l, .t-body-m, .t-caps-l, .t-caps-m, .t-caps-s, .t-price, .price__value';
    ROLES.forEach(r => {
      const el = document.querySelector(`.role[data-role="${r.id}"] .role__sample`); if (!el) return;
      // кожен текст цієї ролі — окремим рядком; якщо ролі в пості немає — інший текст цього ж поста
      const own = texts(r.sel, 4);
      const list = own.length ? own : (r.id !== 'logo' ? texts(ANY, 1) : []);
      const shown = list.length ? list : [r.sample];
      el.innerHTML = shown.map(t => `<div title="${esc(t)}">${esc(t)}</div>`).join('');
      el.closest('.role').dataset.unused = own.length ? '' : '1';
    });
    marks(); // оновити підказки під новий пост
    // повзунки розмірів: під кожним — текст поста, який він змінює; яких немає в пості — приглушені
    SIZES.forEach(([k, , , , sel]) => {
      const ctl = document.querySelector(`.ctl[data-var="--at-post-size-${k}"]`); if (!ctl) return;
      const list = texts(sel, 3);
      ctl.classList.toggle('is-unused', !list.length);
      ctl.title = list.length ? '' : 'У відкритому пості немає тексту цього розміру — змініть прев\'ю, щоб побачити ефект';
      let ex = ctl.querySelector('.ex');
      if (!ex) { ex = document.createElement('span'); ex.className = 'ex'; ctl.appendChild(ex); }
      ex.textContent = list.length ? list.join(' · ') : 'у цьому пості немає — видно в шаблонах';
      ex.title = ex.textContent;
    });
    renderTextColors();
  }
  frame.addEventListener('load', () => { ffBar.hidden = true; ffRange = null; applyPreview(); enableEditing(); syncSamples(); });
  pv.addEventListener('change', async () => {
    // перед перемиканням прев'ю зберігаємо змінені тексти поточного поста
    if (postEdit.dirty) { try { await savePost(); } catch (err) { show(String(err.message || err)); } }
    showPreview();
  });
  new ResizeObserver(fit).observe(stage);

  /* ── Статус, збереження, рендер, коміт ── */
  const status = $('#status'), log = $('#log');
  const setStatus = (t, isDirty) => { status.textContent = t; status.classList.toggle('is-dirty', !!isDirty); };
  function changed() {
    marks(); applyPreview();
    const url = importUrl(ROLES.filter(r => state.fonts[r.id]).map(r => [r, state.fonts[r.id]]));
    const link = $('#ed-fonts'); const href = url || 'data:text/css,'; if (link.getAttribute('href') !== href) link.setAttribute('href', href);
    setStatus(dirty() ? 'Є незбережені зміни' : 'Усе збережено', dirty());
  }
  async function api(path, body) {
    const r = await fetch(path, { method: 'POST', body, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, credentials: 'same-origin' });
    if (r.status === 404) throw new Error('Сесію редактора втрачено — відкрийте посилання з ключем ще раз');
    if (!r.ok) throw new Error(await r.text());
    return r.text();
  }
  const busy = (on) => document.querySelectorAll('.ed-btn').forEach(b => { b.disabled = on; });
  const show = t => { log.hidden = false; log.textContent = t.trim(); };
  async function save() {
    setStatus('Зберігаю…');
    if (postEdit.dirty) await savePost();
    await api('/api/theme', buildCss(false));
    saved = norm(state);
    setStatus('Збережено ✓');
  }
  const run = fn => async () => { busy(true); try { await fn(); } catch (err) { setStatus('Помилка', true); show(String(err.message || err)); } finally { busy(false); } };

  $('#btn-save').addEventListener('click', run(save));
  $('#btn-render').addEventListener('click', run(async () => {
    if (dirty()) await save();
    setStatus('Оновлюю PNG постів…');
    show(await api('/api/render', ''));
    setStatus('PNG оновлено ✓');
  }));
  $('#btn-commit').addEventListener('click', run(async () => {
    if (dirty()) await save();
    setStatus('Комічу…');
    show(await api('/api/commit', $('#commit-msg').value || 'Theme: update from editor'));
    $('#commit-msg').value = '';
    setStatus('Версію зафіксовано ✓');
  }));
  $('#btn-reset').addEventListener('click', () => { state = { vars: {}, fonts: {}, texts: {} }; renderPanel(); changed(); });
  addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); run(save)(); } });
  addEventListener('beforeunload', e => { if (dirty()) { e.preventDefault(); e.returnValue = ''; } });

  /* ── Старт: читаємо збережений стан із theme.css ── */
  (async () => {
    try {
      const t = await (await fetch('../theme.css', { cache: 'no-store' })).text();
      const m = t.match(/editor-state:\s*(\{.*\})\s*\*\//);
      const s = m ? JSON.parse(m[1]) : {};
      state = { vars: s.vars || {}, fonts: s.fonts || {}, texts: s.texts || {} };
    } catch { state = { vars: {}, fonts: {}, texts: {} }; }
    saved = norm(state);
    renderPanel();
    showPreview();
    changed();
  })();
})();
