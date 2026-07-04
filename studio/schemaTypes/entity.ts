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
  ],
  orderings: [
    {
      title: 'Urutan',
      name: 'orderRankAsc',
      by: [{ field: 'orderRank', direction: 'asc' }],
    },
  ],
})
