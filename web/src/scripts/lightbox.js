const items = [...document.querySelectorAll('[data-lb-index]')];
if (items.length) {
  const dlg = document.createElement('dialog');
  dlg.id = 'lb';
  dlg.innerHTML = `
    <button class="lb-x" aria-label="Tutup">✕</button>
    <button class="lb-prev" aria-label="Sebelumnya">‹</button>
    <figure><img alt=""><figcaption></figcaption></figure>
    <button class="lb-next" aria-label="Berikutnya">›</button>
    <p class="lb-count" aria-live="polite"></p>`;
  document.body.appendChild(dlg);
  const img = dlg.querySelector('img'), cap = dlg.querySelector('figcaption'), count = dlg.querySelector('.lb-count');
  let cur = 0;
  const show = i => {
    cur = (i + items.length) % items.length;
    img.src = items[cur].dataset.lbSrc;
    img.alt = items[cur].dataset.lbCap;
    cap.textContent = items[cur].dataset.lbCap;
    count.textContent = `${cur + 1} / ${items.length}`;
  };
  items.forEach((el, i) => el.addEventListener('click', () => { show(i); dlg.showModal(); }));
  dlg.querySelector('.lb-x').addEventListener('click', () => dlg.close());
  dlg.querySelector('.lb-prev').addEventListener('click', () => show(cur - 1));
  dlg.querySelector('.lb-next').addEventListener('click', () => show(cur + 1));
  dlg.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
}
