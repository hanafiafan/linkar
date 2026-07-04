import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'activationPhoto',
  title: 'Foto Aktivasi',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      title: 'Gambar',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Keterangan',
      type: 'string',
      description: 'Teks alternatif + caption — maks 120 karakter',
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'program',
      title: 'Program',
      type: 'string',
      description: 'Nama program terkait — maks 120 karakter',
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'featured',
      title: 'Unggulan',
      type: 'boolean',
      initialValue: false,
      description: 'Tampil di galeri expandable & strip judul (maks 5)',
    }),
    defineField({
      name: 'orderRank',
      title: 'Urutan',
      type: 'number',
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
