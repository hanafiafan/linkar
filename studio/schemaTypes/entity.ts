import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'entity',
  title: 'Entitas',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nama',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
    }),
    defineField({
      name: 'role',
      title: 'Peran',
      type: 'string',
      description: 'Peran entitas dalam ekosistem — maks 40 karakter',
      validation: (Rule) => Rule.max(40),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Tagline singkat entitas — maks 40 karakter',
      validation: (Rule) => Rule.max(40),
    }),
    defineField({
      name: 'orderRank',
      title: 'Urutan',
      type: 'number',
      hidden: false,
      description: 'Angka urutan tampil (kecil tampil lebih dulu)',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'hasProfile',
      title: 'Tampilkan Halaman Profil',
      type: 'boolean',
      description: 'Tampilkan halaman profil & di mega-menu',
      initialValue: true,
    }),
    defineField({
      name: 'heroImage',
      title: 'Gambar Hero',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      title: 'Deskripsi',
      type: 'text',
      description: 'Deskripsi singkat entitas — maks 400 karakter',
      validation: (Rule) => Rule.max(400),
    }),
    defineField({
      name: 'body',
      title: 'Profil Lengkap',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image' }],
    }),
    defineField({
      name: 'website',
      title: 'Situs Web',
      type: 'url',
    }),
  ],
  orderings: [
    {
      title: 'Urutan',
      name: 'orderRankAsc',
      by: [{ field: 'orderRank', direction: 'asc' }],
    },
  ],
})
