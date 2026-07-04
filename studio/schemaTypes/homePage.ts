import { defineField, defineType } from 'sanity'

const statField = () =>
  defineField({
    name: 'stat',
    title: 'Statistik',
    type: 'object',
    fields: [
      defineField({ name: 'value', title: 'Nilai', type: 'string', description: 'Angka statistik — maks 8 karakter', validation: (Rule) => Rule.max(8) }),
      defineField({ name: 'label', title: 'Label', type: 'string', description: 'Label statistik — maks 40 karakter', validation: (Rule) => Rule.max(40) }),
    ],
  })

export default defineType({
  name: 'homePage',
  title: 'Halaman Utama',
  type: 'document',
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      fields: [
        defineField({ name: 'badge', title: 'Badge', type: 'string', description: 'Teks badge kecil di atas judul' }),
        defineField({ name: 'title', title: 'Judul', type: 'string', description: 'Judul utama hero — maks 90 karakter', validation: (Rule) => Rule.required().max(90) }),
        defineField({ name: 'highlight', title: 'Kata Sorot', type: 'string', description: 'Kata dalam judul yang diberi warna sorot' }),
        defineField({ name: 'subEn', title: 'Subjudul (EN)', type: 'string', description: 'Subjudul singkat berbahasa Inggris' }),
        defineField({ name: 'subId', title: 'Subjudul (ID)', type: 'text', description: 'Subjudul penjelas berbahasa Indonesia — maks 220 karakter', validation: (Rule) => Rule.max(220) }),
        defineField({ name: 'primaryCta', title: 'CTA Utama', type: 'string' }),
        defineField({ name: 'secondaryCta', title: 'CTA Sekunder', type: 'string' }),
        defineField({
          name: 'miniStats',
          title: 'Statistik Mini',
          type: 'array',
          of: [statField()],
        }),
      ],
    }),
    defineField({
      name: 'marquee',
      title: 'Marquee',
      type: 'object',
      fields: [
        defineField({ name: 'kicker', title: 'Kicker', type: 'string', description: 'Label kecil di atas judul — maks 40 karakter', validation: (Rule) => Rule.max(40) }),
        defineField({ name: 'title', title: 'Judul', type: 'string' }),
      ],
    }),
    defineField({
      name: 'about',
      title: 'Tentang Kami',
      type: 'object',
      fields: [
        defineField({ name: 'kicker', title: 'Kicker', type: 'string', description: 'Label kecil di atas judul — maks 40 karakter', validation: (Rule) => Rule.max(40) }),
        defineField({ name: 'title', title: 'Judul', type: 'string', description: 'Judul bagian tentang kami — maks 90 karakter', validation: (Rule) => Rule.max(90) }),
        defineField({
          name: 'paragraphs',
          title: 'Paragraf',
          type: 'array',
          description: 'Setiap paragraf maks 300 karakter',
          of: [{ type: 'text', validation: (Rule) => Rule.max(300) }],
        }),
      ],
    }),
    defineField({
      name: 'portfolio',
      title: 'Portofolio',
      type: 'object',
      fields: [
        defineField({ name: 'titlePart1', title: 'Judul Bagian 1', type: 'string', description: 'Bagian judul raksasa — maks 12 karakter agar komposisinya tidak rusak', validation: (Rule) => Rule.max(12) }),
        defineField({ name: 'titlePart2', title: 'Judul Bagian 2', type: 'string', description: 'Bagian judul raksasa — maks 12 karakter agar komposisinya tidak rusak', validation: (Rule) => Rule.max(12) }),
        defineField({ name: 'intro', title: 'Intro', type: 'text' }),
      ],
    }),
    defineField({
      name: 'services',
      title: 'Layanan',
      type: 'object',
      fields: [
        defineField({ name: 'kicker', title: 'Kicker', type: 'string', description: 'Label kecil di atas judul — maks 40 karakter', validation: (Rule) => Rule.max(40) }),
        defineField({ name: 'title', title: 'Judul', type: 'string' }),
        defineField({
          name: 'cards',
          title: 'Kartu Layanan',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'serviceCard',
              fields: [
                defineField({ name: 'no', title: 'Nomor', type: 'string' }),
                defineField({ name: 'title', title: 'Judul', type: 'string' }),
                defineField({ name: 'who', title: 'Pelaksana', type: 'string' }),
                defineField({ name: 'body', title: 'Deskripsi', type: 'text', description: 'Deskripsi kartu layanan — maks 200 karakter', validation: (Rule) => Rule.max(200) }),
                defineField({ name: 'target', title: 'Target', type: 'string' }),
              ],
            },
          ],
        }),
        defineField({ name: 'differentiator', title: 'Diferensiator', type: 'text', description: 'Pernyataan pembeda LINKAR — maks 220 karakter', validation: (Rule) => Rule.max(220) }),
      ],
    }),
    defineField({
      name: 'linkarStats',
      title: 'Statistik LINKAR',
      type: 'object',
      fields: [
        defineField({ name: 'kicker', title: 'Kicker', type: 'string', description: 'Label kecil di atas judul — maks 40 karakter', validation: (Rule) => Rule.max(40) }),
        defineField({
          name: 'items',
          title: 'Item Statistik',
          type: 'array',
          of: [statField()],
        }),
      ],
    }),
    defineField({
      name: 'industry',
      title: 'Industri',
      type: 'object',
      fields: [
        defineField({ name: 'kicker', title: 'Kicker', type: 'string', description: 'Label kecil di atas judul — maks 40 karakter', validation: (Rule) => Rule.max(40) }),
        defineField({ name: 'title', title: 'Judul', type: 'string' }),
        defineField({
          name: 'items',
          title: 'Item Statistik',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'industryStat',
              fields: [
                defineField({ name: 'value', title: 'Nilai', type: 'string', description: 'Angka statistik — maks 8 karakter', validation: (Rule) => Rule.max(8) }),
                defineField({ name: 'label', title: 'Label', type: 'string', description: 'Label statistik — maks 40 karakter', validation: (Rule) => Rule.max(40) }),
                defineField({ name: 'note', title: 'Catatan', type: 'string' }),
              ],
            },
          ],
        }),
        defineField({ name: 'closing', title: 'Penutup', type: 'text' }),
      ],
    }),
    defineField({
      name: 'commitments',
      title: 'Komitmen',
      type: 'object',
      fields: [
        defineField({ name: 'title', title: 'Judul', type: 'string' }),
        defineField({
          name: 'cards',
          title: 'Kartu Komitmen',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'commitmentCard',
              fields: [
                defineField({ name: 'title', title: 'Judul', type: 'string' }),
                defineField({ name: 'body', title: 'Deskripsi', type: 'text' }),
              ],
            },
          ],
        }),
      ],
    }),
    defineField({
      name: 'cta',
      title: 'CTA Penutup',
      type: 'object',
      fields: [
        defineField({ name: 'title', title: 'Judul', type: 'string', description: 'Judul ajakan bertindak — maks 60 karakter', validation: (Rule) => Rule.max(60) }),
        defineField({ name: 'subEn', title: 'Subjudul (EN)', type: 'string' }),
        defineField({ name: 'subId', title: 'Subjudul (ID)', type: 'text' }),
        defineField({ name: 'submitLabel', title: 'Label Kirim', type: 'string' }),
      ],
    }),
  ],
})
