import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemaTypes'

const singletons = ['siteSettings', 'homePage']

export default defineConfig({
  name: 'default',
  title: 'LINKAR',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'placeholder',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list().title('Konten').items([
          S.listItem().title('Pengaturan Situs').id('siteSettings')
            .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
          S.listItem().title('Halaman Utama').id('homePage')
            .child(S.document().schemaType('homePage').documentId('homePage')),
          S.divider(),
          ...S.documentTypeListItems().filter((li) => !singletons.includes(li.getId()!)),
        ]),
    }),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter((t) => !singletons.includes(t.schemaType)),
  },
  document: {
    actions: (actions, ctx) =>
      singletons.includes(ctx.schemaType)
        ? actions.filter((a) => !['unpublish', 'delete', 'duplicate'].includes(a.action!))
        : actions,
  },
})
