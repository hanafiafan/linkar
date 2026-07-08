import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Pengaturan Situs',
  type: 'document',
  fields: [
    defineField({
      name: 'formEmail',
      title: 'Email Formulir',
      type: 'string',
      description: 'Alamat email tujuan pengiriman formulir kontak',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'footerTagline',
      title: 'Tagline Footer',
      type: 'string',
      description: 'Tagline singkat di footer — maks 60 karakter',
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Label CTA',
      type: 'string',
      description: 'Teks tombol ajakan bertindak — maks 30 karakter',
      validation: (Rule) => Rule.required().max(30),
    }),
    defineField({
      name: 'logoColor',
      title: 'Logo Berwarna',
      type: 'image',
      description: 'Logo untuk navbar (latar terang) — PNG transparan',
    }),
    defineField({
      name: 'logoWhite',
      title: 'Logo Putih',
      type: 'image',
      description: 'Logo untuk footer (latar gelap) — PNG transparan putih',
    }),
    defineField({
      name: 'navLabels',
      title: 'Label Menu Navigasi',
      type: 'object',
      description: 'Kosongkan untuk memakai label bawaan',
      fields: [
        defineField({ name: 'about', title: 'Menu: Tentang', type: 'string', validation: (Rule) => Rule.max(20) }),
        defineField({ name: 'services', title: 'Menu: Layanan', type: 'string', validation: (Rule) => Rule.max(20) }),
        defineField({ name: 'portfolio', title: 'Menu: Portofolio', type: 'string', validation: (Rule) => Rule.max(20) }),
        defineField({ name: 'ecosystem', title: 'Menu: Ekosistem', type: 'string', validation: (Rule) => Rule.max(20) }),
        defineField({ name: 'contact', title: 'Menu: Kontak', type: 'string', validation: (Rule) => Rule.max(20) }),
        defineField({ name: 'program', title: 'Menu: Program', type: 'string', validation: (Rule) => Rule.max(20) }),
        defineField({ name: 'blog', title: 'Menu: Blog', type: 'string', validation: (Rule) => Rule.max(20) }),
      ],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Tautan Sosial',
      type: 'array',
      description: 'Daftar tautan media sosial (opsional)',
      of: [
        {
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.max(40) }),
            defineField({ name: 'url', title: 'URL', type: 'url' }),
          ],
        },
      ],
    }),
  ],
})
