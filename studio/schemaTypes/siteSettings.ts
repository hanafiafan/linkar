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
