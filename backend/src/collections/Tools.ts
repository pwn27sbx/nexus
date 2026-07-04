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
    create: () => true, // Permite que el formulario público envíe datos
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'url', type: 'text', required: true },
    { name: 'category', type: 'select', options: ['Design', 'Development', 'AI Tools', 'Productivity'], required: true },
    { name: 'gridHeight', type: 'select', options: ['normal', 'tall'], defaultValue: 'normal' },
    { name: 'screenshotUrl', type: 'text', admin: { readOnly: true } },

    // NUEVO: El control de publicación
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'approved'],
      defaultValue: 'pending',
      admin: {
        position: 'sidebar',
        description: 'Cambia a "approved" y guarda para publicarlo en la web.'
      }
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
          } catch (error) {
            console.error("Error Microlink:", error);
          }
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation }) => {
        // La barrera: SOLO se envía a Algolia si tú lo aprobase
        if (doc.status === 'approved') {
          try {
            const algoliaRecord = {
              objectID: doc.id.toString(),
              name: doc.name,
              category: doc.category,
              url: doc.url,
              screenshotUrl: doc.screenshotUrl,
              gridHeight: doc.gridHeight
            };
            await index.saveObject(algoliaRecord);
            console.log(`🚀 ¡Sugerencia ${doc.name} aprobada y en vivo!`);
          } catch (error) {
            console.error("Error Algolia:", error);
          }
        } else if (operation === 'update' && doc.status === 'pending') {
            // Si por alguna razón te arrepientes y lo devuelves a pendiente, lo borra de la web
            try { await index.deleteObject(doc.id.toString()); } catch(e) {}
        }
        return doc;
      },
    ],
  },
};
