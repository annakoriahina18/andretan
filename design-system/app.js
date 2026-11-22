// ANDRE TAN — Instagram DS · поведінка сторінки документації
(() => {
  const root = document.documentElement;
  const css = getComputedStyle(root);

  /* ── Colors ── */
  const groups = [
    ['Основні', ['black', 'white']],
    ['Нейтральні', ['ink-900', 'stone-600', 'stone-300', 'stone-100']],
    ['Бежевий', ['beige-400', 'beige-200', 'beige-50']],
    ['Акценти', ['red-600', 'pink-300', 'pink-100', 'mint-300', 'mint-100', 'turquoise-600']],
  ];
  document.getElementById('swatches').innerHTML = groups.map(([g, keys]) =>
    `<div class="sw-group"><span>${g}</span><div class="sw-row">${keys.map(k => {
      const v = css.getPropertyValue(`--at-${k}`).trim().toUpperCase();
      return `<div class="sw"><div style="background:var(--at-${k})"></div><b>${k.replace('-', ' / ')}</b><small>${v}</small><br><code>--at-${k}</code></div>`;
    }).join('')}</div></div>`).join('');

  /* ── Type specimen ── */
  const types = [
    ['Display / XL', 't-display-xl', 'Montserrat Bold · 132 / 95% / −2% · CAPS', 'New Drop'],
    ['Display / L', 't-display-l', 'Montserrat Bold · 96 / 98% / −1.5% · CAPS', 'New Collection'],
    ['Heading / H1', 't-h1', 'Vela Sans Light · 80 / 105% / −2%', 'Elegance in Details'],
    ['Heading / H2', 't-h2', 'Vela Sans Light · 56 / 110% / −1%', 'Elegance in Details'],
    ['Heading / H3', 't-h3', 'Vela Sans Light · 40 / 115% / −0.5%', 'Elegance in Details'],
    ['Script / L', 't-script-l', 'Great Vibes · 150 / 100%', 'Sale'],
    ['Script', 't-script', 'Great Vibes · 72 / 110%', 'new capsule'],
    ['Body / L', 't-body-l', 'Inter Regular · 32 / 145%', 'Relaxed silk shirt dress with a belt.'],
    ['Body / M', 't-body-m', 'Inter Regular · 26 / 145%', 'Relaxed silk shirt dress with a belt.'],
    ['Label / Caps L', 't-caps-l', 'Inter Medium · 24 / 120% / 20%', 'New in · SS 2027'],
    ['Label / Caps M', 't-caps-m', 'Inter Medium · 20 / 120% / 22%', 'New in · SS 2027'],
    ['Label / Caps S', 't-caps-s', 'Inter Medium · 16 / 120% / 26%', 'New in · SS 2027'],
    ['Price', 't-price', 'Inter Medium · 30 / 120% / 2%', '12 900 UAH'],
  ];
  document.getElementById('type-specimen').innerHTML = types.map(([n, c, m, s]) =>
    `<div><small>${n}<br>${m}<br><code>.${c}</code></small><div class="sample ${c}">${s}</div></div>`).join('');

  /* ── Обгортання полотен у масштабовані рамки ── */
  document.querySelectorAll('.frames > .canvas').forEach(cv => {
    const frame = document.createElement('div');
    frame.className = 'frame';
    const w = cv.offsetWidth, h = cv.offsetHeight;
    frame.innerHTML = `<div class="frame__label"><span>${cv.dataset.name || ''} · ${w}×${h}</span><a data-open>Відкрити</a></div><div class="frame__box" style="--w:${w}px;--h:${h}px"></div>`;
    cv.before(frame);
    frame.querySelector('.frame__box').appendChild(cv);
    frame.querySelector('[data-open]').addEventListener('click', () => openLightbox(cv));
  });

  /* ── Масштаб і safe zones ── */
  const scale = document.getElementById('scale');
  const setScale = () => root.style.setProperty('--s', scale.value);
  scale.addEventListener('input', setScale); setScale();
  document.getElementById('safe').addEventListener('change', e => document.body.classList.toggle('show-safe', e.target.checked));

  /* ── Клони для сітки профілю та Highlights ── */
  const cloneInto = (box, src) => {
    box.innerHTML = '';
    const c = src.cloneNode(true);
    c.removeAttribute('id');
    c.querySelectorAll('.safe-zones').forEach(n => n.remove());
    const r = box.getBoundingClientRect();
    const s = Math.max(r.width / src.offsetWidth, r.height / src.offsetHeight);
    c.style.transform = `translate(-50%, -50%) scale(${s})`;
    box.appendChild(c);
  };
  const hlIds = ['new', 'looks', 'shop', 'backstage', 'reviews', 'info'];
  const titles = { new: 'New', looks: 'Looks', shop: 'Shop', backstage: 'Backstage', reviews: 'Reviews', info: 'Info' };
  function buildClones() {
    document.querySelectorAll('[data-hl-row]').forEach(row => {
      const size = +row.dataset.hlRow;
      row.innerHTML = hlIds.map(id => `<div class="hl-item"><div class="ring" style="width:${size}px;height:${size}px" data-src="hl-${id}"></div>${titles[id]}</div>`).join('');
      row.querySelectorAll('.ring').forEach(r => cloneInto(r, document.getElementById(r.dataset.src)));
    });
    document.querySelectorAll('.tile[data-clone]').forEach(t => cloneInto(t, document.getElementById(t.dataset.clone)));
  }
  buildClones();
  document.fonts && document.fonts.ready.then(buildClones);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(buildClones, 150); });

  /* ── Drag & drop фото на плейсхолдери ── */
  let hover;
  document.addEventListener('dragover', e => {
    const p = e.target.closest && e.target.closest('.frames .photo, .comp .photo');
    if (hover && hover !== p) hover.classList.remove('drop-hover');
    if (p) { e.preventDefault(); p.classList.add('drop-hover'); hover = p; }
  });
  document.addEventListener('dragleave', e => { if (e.target === hover) { hover.classList.remove('drop-hover'); hover = null; } });
  document.addEventListener('drop', e => {
    const p = e.target.closest && e.target.closest('.frames .photo, .comp .photo');
    if (!p) return;
    e.preventDefault(); p.classList.remove('drop-hover');
    const file = [...e.dataTransfer.files].find(f => f.type.startsWith('image/'));
    if (!file) return;
    const url = URL.createObjectURL(file);
    p.style.backgroundImage = `url("${url}")`;
    p.classList.add('has-image');
    buildClones();
  });

  /* ── Lightbox ── */
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<button aria-label="Закрити">×</button><div class="frame__box"></div>';
  document.body.appendChild(lb);
  const close = () => { lb.classList.remove('open'); lb.querySelector('.frame__box').innerHTML = ''; };
  lb.addEventListener('click', e => { if (e.target === lb || e.target.tagName === 'BUTTON') close(); });
  addEventListener('keydown', e => e.key === 'Escape' && close());
  function openLightbox(cv) {
    const w = cv.offsetWidth, h = cv.offsetHeight;
    const s = Math.min((innerHeight - 80) / h, (innerWidth - 80) / w, 1);
    const box = lb.querySelector('.frame__box');
    box.style.cssText = `--w:${w}px;--h:${h}px;--s:${s}`;
    const c = cv.cloneNode(true); c.removeAttribute('id');
    box.appendChild(c);
    lb.classList.add('open');
  }
})();
