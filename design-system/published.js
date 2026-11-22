// Галерея готових постів: читає window.POSTS (posts/posts.js), картинки — posts/export/<id>.png
(() => {
  const grid = document.getElementById('pub-grid');
  const posts = window.POSTS || [];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const png = p => `posts/export/${p.id}.png`;
  const name = (p, ext) => `andretan_${p.id}_${p.w}x${p.h}.${ext}`;

  if (!posts.length) { grid.innerHTML = '<p class="pub-empty">Поки немає готових постів.</p>'; return; }

  grid.innerHTML = posts.map((p, i) => `
    <article class="pub-card">
      <a class="pub-card__img" href="${png(p)}" target="_blank" rel="noopener" style="aspect-ratio:${p.w}/${p.h}">
        <img src="${png(p)}?v=${encodeURIComponent(p.date || '')}" alt="${esc(p.title)}" width="${p.w}" height="${p.h}" loading="lazy">
      </a>
      <div class="pub-card__meta"><b>${esc(p.campaign || '')}</b><span>${esc(p.template)}</span><span>${p.w}×${p.h}</span><span>${esc(p.date || '')}</span></div>
      <h3>${esc(p.title)}</h3>
      <div class="pub-card__actions">
        <a class="pub-btn pub-btn--dark" href="${png(p)}" download="${name(p, 'png')}">PNG ↓</a>
        <button class="pub-btn" data-jpg="${i}">JPG ↓</button>
        ${p.caption ? `<button class="pub-btn" data-copy="${i}">Копіювати підпис</button>` : ''}
        <a class="pub-btn" href="posts/${p.id}.html" target="_blank" rel="noopener">HTML</a>
      </div>
    </article>`).join('');

  const save = (href, filename) => {
    const a = document.createElement('a');
    a.href = href; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
  };

  // JPG робимо з PNG прямо в браузері (якість 92%)
  const toJpg = p => new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = p.w; c.height = p.h;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob(b => b ? res(b) : rej(new Error('toBlob')), 'image/jpeg', 0.92);
    };
    img.onerror = rej;
    img.src = png(p);
  });

  grid.addEventListener('click', async e => {
    const jpg = e.target.closest('[data-jpg]');
    const copy = e.target.closest('[data-copy]');
    if (jpg) {
      const p = posts[+jpg.dataset.jpg];
      const label = jpg.textContent; jpg.textContent = '…';
      try { const url = URL.createObjectURL(await toJpg(p)); save(url, name(p, 'jpg')); setTimeout(() => URL.revokeObjectURL(url), 2000); }
      finally { jpg.textContent = label; }
    }
    if (copy) {
      const label = copy.textContent;
      try { await navigator.clipboard.writeText(posts[+copy.dataset.copy].caption); copy.textContent = 'Скопійовано'; }
      catch { copy.textContent = 'Не вдалося'; }
      setTimeout(() => copy.textContent = label, 1600);
    }
  });

  document.getElementById('dl-all').addEventListener('click', () => {
    posts.forEach((p, i) => setTimeout(() => save(png(p), name(p, 'png')), i * 400));
  });
})();
