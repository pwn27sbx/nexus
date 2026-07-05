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
    update: ({ req: { user } }) => Boolean(user), // Solo usuarios logueados pueden aprobar
    delete: ({ req: { user } }) => Boolean(user), // Solo usuarios logueados pueden borrar
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
    // NUEVO: Rastrear quién envió esta herramienta
    {
      name: 'submittedBy',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
      admin: {
        position: 'sidebar',
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
      // Añadimos 'req' a los argumentos para poder usar req.payload
      async ({ doc, req, operation }) => {

        // ----------------------------------------------------
        // 1. LÓGICA DE ALGOLIA (Manejo del motor de búsqueda)
        // ----------------------------------------------------
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

        // ----------------------------------------------------
        // 2. LÓGICA DE GAMIFICACIÓN (Cálculo de niveles)
        // ----------------------------------------------------
        if (doc.status === 'approved' && doc.submittedBy) {
          try {
            // Extraemos el ID del usuario (puede venir poblado como objeto o solo el string)
            const userId = typeof doc.submittedBy === 'object' ? doc.submittedBy.id : doc.submittedBy;

            // Le pedimos a Payload que cuente cuántas herramientas "approved" tiene este usuario
            const userTools = await req.payload.find({
              collection: 'tools',
              where: {
                and: [
                  { submittedBy: { equals: userId } },
                  { status: { equals: 'approved' } }
                ]
              },
              depth: 0,
              limit: 1, // Solo necesitamos el totalDocs, esto lo hace ultrarrápido
            });

            // Calculamos el nuevo nivel basado en sus aportes aprobados
            const totalApproved = userTools.totalDocs;
            let newLevel: 'Explorer' | 'Contributor' | 'Expert Curator' = 'Explorer';

            if (totalApproved >= 5) {
              newLevel = 'Expert Curator';
            } else if (totalApproved >= 1) {
              newLevel = 'Contributor';
            }

            // Actualizamos el perfil del usuario silenciosamente en la base de datos
            await req.payload.update({
              collection: 'users',
              id: userId,
              data: { level: newLevel }
            });

            console.log(`🌟 Nivel del usuario ${userId} actualizado a: ${newLevel}`);

          } catch (error) {
            console.error("Error en gamificación:", error);
          }
        }

        return doc;
      },
    ],
  },
};
