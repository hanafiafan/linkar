import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'post',
  title: 'Artikel',
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
    defineField({
      name: 'excerpt',
      title: 'Ringkasan',
      type: 'text',
      description: 'Ringkasan singkat artikel — maks 200 karakter',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'cover',
      title: 'Sampul',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'body',
      title: 'Konten',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image' }],
    }),
    defineField({ name: 'author', title: 'Penulis', type: 'string' }),
    defineField({
      name: 'date',
      title: 'Tanggal',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'tags',
      title: 'Tag',
      type: 'array',
      of: [{ type: 'string' }],
    }),
  ],
})
