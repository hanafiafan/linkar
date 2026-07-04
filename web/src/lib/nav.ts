export function buildNavLinks(programCount: number, postCount: number) {
  const links = [
    { href: '/#about', label: 'Tentang' },
    { href: '/#services', label: 'Layanan' },
    { href: '/#portfolio', label: 'Portofolio' },
    { href: '/#ecosystem', label: 'Ekosistem' },
  ];
  if (programCount > 0) links.push({ href: '/program', label: 'Program' });
  if (postCount > 0) links.push({ href: '/blog', label: 'Blog' });
  links.push({ href: '/#contact', label: 'Kontak' });
  return links;
}
