document.querySelectorAll('.xgallery').forEach(g => {
  const items = [...g.querySelectorAll('.xitem')];
  const expand = target => items.forEach(el => el.setAttribute('aria-expanded', String(el === target)));
  items.forEach(el => {
    el.addEventListener('click', () => expand(el));
    el.addEventListener('focus', () => expand(el));
  });
});
