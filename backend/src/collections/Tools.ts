import type { CollectionConfig } from 'payload'
import algoliasearch from 'algoliasearch'

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID || '',
  process.env.ALGOLIA_API_KEY || ''
)
const index = client.initIndex('tools')

export const Tools: CollectionConfig = {
  slug: 'tools',
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
    create: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'url', type: 'text', required: true },

    // NUEVO CAMPO: La descripción real guardada en base de datos
    {
      name: 'description',
      type: 'text',
      required: true,
      defaultValue: 'High-performance platform for creators.',
      maxLength: 100, // Límite para mantener el diseño limpio
      admin: { description: 'Breve descripción de la herramienta (Máx 100 caracteres).' }
    },

    { name: 'category', type: 'select', options: ['Design', 'Development', 'AI Tools', 'Productivity'], required: true },
    { name: 'gridHeight', type: 'select', options: ['normal', 'tall'], defaultValue: 'normal' },
    { name: 'screenshotUrl', type: 'text', admin: { readOnly: true } },

    {
      name: 'status',
      type: 'select',
      options: ['pending', 'approved'],
      defaultValue: 'pending',
      admin: { position: 'sidebar', description: 'Cambia a "approved" y guarda para publicarlo en la web.' }
    },
    {
      name: 'submittedBy',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
      admin: { position: 'sidebar' }
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (data.url && (operation === 'create' || operation === 'update')) {
          try {
            const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(data.url)}&screenshot=true&meta=false`);
            const json = await response.json();
            if (json.status === 'success' && json.data?.screenshot?.url) {
              data.screenshotUrl = json.data.screenshot.url;
            }
          } catch (error) { console.error("Error Microlink:", error); }
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        if (doc.status === 'approved') {
          try {
            const algoliaRecord = {
              objectID: doc.id.toString(),
              name: doc.name,
              category: doc.category,
              url: doc.url,
              screenshotUrl: doc.screenshotUrl,
              gridHeight: doc.gridHeight,
              description: doc.description // <-- NUEVO: Enviamos la descripción a Algolia
            };
            await index.saveObject(algoliaRecord);
            console.log(`🚀 ¡Sugerencia ${doc.name} aprobada y en vivo!`);
          } catch (error) { console.error("Error Algolia:", error); }
        } else if (operation === 'update' && doc.status === 'pending') {
            try { await index.deleteObject(doc.id.toString()); } catch(e) {}
        }

        if (doc.status === 'approved' && doc.submittedBy) {
          try {
            const userId = typeof doc.submittedBy === 'object' ? doc.submittedBy.id : doc.submittedBy;
            const userTools = await req.payload.find({ collection: 'tools', where: { and: [ { submittedBy: { equals: userId } }, { status: { equals: 'approved' } } ] }, depth: 0, limit: 1 });
            const totalApproved = userTools.totalDocs;
            let newLevel: 'Explorer' | 'Contributor' | 'Expert Curator' | 'Master Curator' = 'Explorer';
            if (totalApproved >= 30) newLevel = 'Master Curator'; else if (totalApproved >= 15) newLevel = 'Expert Curator'; else if (totalApproved >= 5) newLevel = 'Contributor';
            await req.payload.update({ collection: 'users', id: userId, data: { level: newLevel, approvedCount: totalApproved } as any });
          } catch (error) {}
        }
        return doc;
      },
    ],
  },
};
