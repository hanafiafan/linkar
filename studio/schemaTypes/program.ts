import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'program',
  title: 'Program',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Judul',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'partner', title: 'Mitra', type: 'string' }),
    defineField({ name: 'period', title: 'Periode', type: 'string' }),
    defineField({ name: 'location', title: 'Lokasi', type: 'string' }),
    defineField({
      name: 'summary',
      title: 'Ringkasan',
      type: 'text',
      description: 'Ringkasan singkat program — maks 300 karakter',
      validation: (Rule) => Rule.max(300),
    }),
    defineField({
      name: 'body',
      title: 'Konten',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image' }],
    }),
    defineField({
      name: 'cover',
      title: 'Sampul',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'gallery',
      title: 'Galeri',
      type: 'array',
      of: [{ type: 'image' }],
    }),
    defineField({
      name: 'impact',
      title: 'Dampak',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'impactStat',
          fields: [
            defineField({ name: 'value', title: 'Nilai', type: 'string', validation: (Rule) => Rule.max(8) }),
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.max(40) }),
          ],
        },
      ],
    }),
    defineField({
      name: 'entities',
      title: 'Entitas Terkait',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'entity' }] }],
    }),
  ],
})
