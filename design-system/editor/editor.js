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
  const LAYOUT = [['--at-margin-feed', 'Поле поста', 24, 160], ['--at-margin-story', 'Поле Stories', 24, 160]];

  // Лише шрифти дизайн-системи (tokens.css): Cormorant Garamond Regular, Montserrat Bold,
  // Manrope, Vela Sans, Ballet, Imperial Script. Усі OFL; ліцензію, ваги та кирилицю
  // звірено з google/fonts METADATA.pb (2026-11-22). Vela Sans — не з Google Fonts,
  // тому окремо не обирається: це база Heading, що показується як Manrope.
  const FONTS = [
    { n: 'Montserrat', cat: 'sans', w: [700], cyr: 1 },               // лише Bold
    { n: 'Manrope', cat: 'sans', w: [200, 800], cyr: 1 },
    { n: 'Cormorant Garamond', cat: 'serif', w: [400], cyr: 1 },      // лише Regular
    { n: 'Ballet', cat: 'script', w: [400], cyr: 0, axis: 'opsz@16..72' },
    { n: 'Imperial Script', cat: 'script', w: [400], cyr: 0 },
  ];
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
  const PLAIN_VARS = [...COLOR_VARS, ...SIZE_VARS, ...LAYOUT_VARS, '--at-post-display-case'];

  /* ── Стан ── */
  const fontMeta = n => FONTS.find(f => f.n === n);
  const firstFamily = stack => stack.split(',')[0].trim().replace(/^["']|["']$/g, '');
  const secondFamily = stack => (stack.split(',')[1] || '').trim().replace(/^["']|["']$/g, '');
  const clampW = (m, w) => m.w.length === 1 ? m.w[0] : Math.min(m.w[1], Math.max(m.w[0], Math.round(w / 100) * 100));
  const roleDefault = r => {
    const fam = firstFamily(def(r.v));
    return { family: fontMeta(fam) ? fam : '', weight: r.weight ? +def(r.weight) : 400 };
  };

  let state = { vars: {}, fonts: {} };
  let saved = '';
  const sortObj = o => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
  const norm = s => JSON.stringify({ vars: sortObj(s.vars), fonts: sortObj(s.fonts) });
  const dirty = () => norm(state) !== saved;
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
  function stackFor(fam) {
    const m = fontMeta(fam);
    const p = [`"${fam}"`];
    if (!m.cyr) p.push(`"${CYR_FALLBACK[m.cat]}"`);
    return `${p.join(', ')}, ${GENERIC[m.cat]}`;
  }
  function importUrl(entries) { // [[role, {family, weight}]]
    const need = new Map();
    const add = (fam, ws) => {
      const m = fontMeta(fam); if (!m) return;
      if (!need.has(fam)) need.set(fam, new Set());
      ws.forEach(w => need.get(fam).add(clampW(m, w)));
      if (!m.cyr) add(CYR_FALLBACK[m.cat], ws);
    };
    entries.forEach(([r, v]) => v.family && add(v.family, r.weight ? [v.weight] : (r.need || [400])));
    if (!need.size) return '';
    const fams = [...need].map(([fam, ws]) => {
      const m = fontMeta(fam), e = fam.replace(/ /g, '+');
      if (m.axis) return `family=${e}:${m.axis}`;
      if (m.w.length === 1 && m.w[0] === 400) return `family=${e}`;
      return `family=${e}:wght@${[...ws].sort((a, b) => a - b).join(';')}`;
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
      if (r.weight) { if (o) vars[r.weight] = String(o.weight); else if (full) vars[r.weight] = def(r.weight); }
    });
    const url = importUrl(ROLES.filter(r => state.fonts[r.id]).map(r => [r, state.fonts[r.id]]));
    let css = '';
    if (!full) css += `/* ANDRE TAN — тема з редактора. Порожня = все як у tokens.css.\n   Файл генерує редактор (editor/), вручну не редагуйте.\n   editor-state: ${JSON.stringify({ vars: sortObj(state.vars), fonts: sortObj(state.fonts) })} */\n`;
    if (url) css += `@import url("${url}");\n`;
    const keys = Object.keys(vars);
    if (keys.length) css += `:root {\n${keys.map(k => `  ${k}: ${vars[k]};`).join('\n')}\n}\n`;
    return css;
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
  function rangeCtl(n, label, min, max) {
    const v = parseFloat(cur(n));
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
      return setVar(n, `${Math.round(+t.value)}px`);
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
    ...(window.POSTS || []).map(p => ({ label: `Пост · ${p.title}`, src: `../posts/${p.id}.html`, w: p.w, h: p.h })),
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
  }
  frame.addEventListener('load', () => { applyPreview(); syncSamples(); });
  pv.addEventListener('change', showPreview);
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
  $('#btn-reset').addEventListener('click', () => { state = { vars: {}, fonts: {} }; renderPanel(); changed(); });
  addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); run(save)(); } });
  addEventListener('beforeunload', e => { if (dirty()) { e.preventDefault(); e.returnValue = ''; } });

  /* ── Старт: читаємо збережений стан із theme.css ── */
  (async () => {
    try {
      const t = await (await fetch('../theme.css', { cache: 'no-store' })).text();
      const m = t.match(/editor-state:\s*(\{.*\})\s*\*\//);
      const s = m ? JSON.parse(m[1]) : {};
      state = { vars: s.vars || {}, fonts: s.fonts || {} };
    } catch { state = { vars: {}, fonts: {} }; }
    saved = norm(state);
    renderPanel();
    showPreview();
    changed();
  })();
})();
