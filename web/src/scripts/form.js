export function validateForm(d) {
  const errors = [];
  if (!d.name?.trim()) errors.push('name');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email ?? '')) errors.push('email');
  if (!d.need?.trim()) errors.push('need');
  return errors;   // org & wa optional
}

if (typeof window !== 'undefined') {
  const form = document.getElementById('contact-form');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(form);
    if (fd.get('botcheck')) return;                       // honeypot
    const data = Object.fromEntries(fd.entries());
    const errors = validateForm(data);
    form.querySelectorAll('.err').forEach(el => el.classList.remove('err'));
    const status = form.querySelector('.form-status');
    if (!form.dataset.key) {
      status.textContent = 'Form belum dikonfigurasi — hubungi kami via email.';
      return;
    }
    if (errors.length) {
      errors.forEach(n => form.querySelector(`[name=${n}]`)?.classList.add('err'));
      status.textContent = 'Mohon lengkapi kolom yang ditandai.';
      return;
    }
    status.textContent = 'Mengirim…';
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: form.dataset.key, subject: 'Kolaborasi baru dari situs LINKAR', ...data })
      });
      status.textContent = res.ok ? 'Terima kasih! Pesan Anda sudah kami terima — tim LINKAR akan segera menghubungi Anda.' : 'Maaf, terjadi kendala. Silakan coba lagi.';
      if (res.ok) form.reset();
    } catch { status.textContent = 'Maaf, terjadi kendala jaringan. Silakan coba lagi.'; }
  });
}
