import type { CollectionConfig } from 'payload'
import algoliasearch from 'algoliasearch'
import * as cheerio from 'cheerio'

let algoliaIndex: any = null;
const getAlgoliaIndex = () => {
  if (algoliaIndex) return algoliaIndex;
  const appId = process.env.ALGOLIA_APP_ID;
  const apiKey = process.env.ALGOLIA_API_KEY;
  if (!appId || !apiKey) return null;
  const client = algoliasearch(appId, apiKey);
  algoliaIndex = client.initIndex('tools');
  return algoliaIndex;
};

export const Tools: CollectionConfig = {
  slug: 'tools',
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  endpoints: [
    {
      path: '/:id/track-click',
      method: 'post',
      handler: async (req) => {
        const id = req.routeParams?.id as string;
        try {
          const tool = await req.payload.findByID({ collection: 'tools', id });
          await req.payload.update({
            collection: 'tools',
            id,
            overrideAccess: true,
            data: {
              clicks: (tool.clicks || 0) + 1,
            }
          });
          return new Response(JSON.stringify({ success: true }), { status: 200 });
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Failed' }), { status: 500 });
        }
      }
    }
  ],
  fields: [
    { name: 'name', type: 'text', required: true },
    { 
      name: 'slug', 
      type: 'text', 
      unique: true, 
      admin: { position: 'sidebar', description: 'URL amigable (generado auto)' } 
    },
    { name: 'url', type: 'text', required: true },

    {
      name: 'description',
      type: 'text',
      required: false,
      defaultValue: 'High-performance platform for creators.',
      maxLength: 100,
      admin: { description: 'Breve descripción de la herramienta (Máx 100 caracteres).' }
    },

    {
      name: 'tags',
      type: 'text',
      required: false,
      defaultValue: '[]',
      admin: {
        description: 'Etiquetas en formato JSON array (ej: ["diseño", "ui", "gratis"]). O también separado por comas: diseño, ui, gratis'
      }
    },

    { name: 'category', type: 'select', options: ['Design', 'Development', 'AI Tools', 'Productivity'], required: true },
    { name: 'gridHeight', type: 'select', options: ['normal', 'tall'], defaultValue: 'normal' },
    { name: 'screenshotUrl', type: 'text', admin: { readOnly: true } },

    {
      name: 'status',
      type: 'select',
      options: ['pending', 'approved', 'rejected'],
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
    {
      name: 'clicks',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true, position: 'sidebar' }
    },
    {
      name: 'averageRating',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true, position: 'sidebar' }
    },
    {
      name: 'reviewCount',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true, position: 'sidebar' }
    },
  ],
  hooks: {
    afterRead: [
      // Normalizar tags: intenta parsear JSON; si falla, asume CSV legacy ("tag1, tag2") → array
      ({ doc }: { doc: Record<string, any> }) => {
        if (doc && typeof doc.tags === 'string' && doc.tags) {
          try {
            const parsed = JSON.parse(doc.tags);
            if (Array.isArray(parsed)) {
              doc.tags = parsed.map((t: any) => String(t).trim()).filter(Boolean);
            } else {
              doc.tags = [String(parsed).trim()];
            }
          } catch {
            // No es JSON válido → tratar como CSV legacy
            doc.tags = doc.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
          }
        } else if (doc && (doc.tags === '' || doc.tags === null || doc.tags === undefined)) {
          doc.tags = [];
        }
        return doc;
      },
    ],
    beforeChange: [
      async ({ data, operation }) => {
        // Generar slug si no existe y tenemos nombre
        if (data.name && (!data.slug || data.slug.trim() === '')) {
          data.slug = data.name
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
            .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with dash
            .replace(/^-+|-+$/g, ''); // remove leading/trailing dashes
          
          // Añadir random string corto para evitar colisiones comunes
          if (operation === 'create') {
            data.slug += '-' + Math.random().toString(36).substring(2, 6);
          }
        }

        // Normalizar tags: siempre guardar como JSON string para consistencia
        if (data.tags !== undefined && data.tags !== null) {
          if (Array.isArray(data.tags)) {
            data.tags = JSON.stringify(data.tags.map((t: any) => String(t).trim()).filter(Boolean));
          } else if (typeof data.tags === 'string') {
            if (!data.tags) {
              data.tags = '[]';
            } else {
              // Si ya es string, verificar si es JSON válido; si no, convertir CSV → JSON
              try {
                const parsed = JSON.parse(data.tags);
                if (!Array.isArray(parsed)) {
                  data.tags = JSON.stringify([String(parsed).trim()]);
                }
              } catch {
                // No es JSON → asumir CSV legacy y convertir a JSON array
                data.tags = JSON.stringify(data.tags.split(',').map((t: string) => t.trim()).filter(Boolean));
              }
            }
          }
        }

        if (data.url && (operation === 'create' || operation === 'update')) {
          // Obtener descripcion de la pagina si no la tiene o es la por defecto
          if (!data.description || data.description === 'High-performance platform for creators.') {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
              const htmlRes = await fetch(data.url, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                signal: controller.signal
              });
              clearTimeout(timeoutId);
              
              if (htmlRes.ok) {
                const html = await htmlRes.text();
                const $ = cheerio.load(html);
                let desc = $('meta[name="description"]').attr('content') || 
                           $('meta[property="og:description"]').attr('content') ||
                           $('title').text();
                
                if (desc) {
                  desc = desc.trim();
                  // Max length is 100 in the schema
                  data.description = desc.length > 100 ? desc.substring(0, 97) + '...' : desc;
                }
              }
            } catch (e) {
              console.warn(`[Scraper timeout/error] No se pudo obtener la descripcion de ${data.url}`);
            }
          }

          // Obtener screenshot via Microlink
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
            const response = await fetch(
              `https://api.microlink.io/?url=${encodeURIComponent(data.url)}&screenshot=true&meta=false`,
              { signal: controller.signal }
            );
            clearTimeout(timeoutId);
            const json = await response.json();
            if (json.status === 'success' && json.data?.screenshot?.url) {
              data.screenshotUrl = json.data.screenshot.url;
            }
          } catch {
            console.warn(`[Microlink timeout/error] No se pudo obtener screenshot para ${data.url}`);
          }
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, req, previousDoc, operation }) => {
        if (doc.status === 'approved') {
          try {
            // Normalizar tags: beforeChange garantiza que es JSON string, pero soportamos CSV legacy por si hay datos antiguos
            let tags: string[] = [];
            if (typeof doc.tags === 'string' && doc.tags) {
              try {
                const parsed = JSON.parse(doc.tags);
                if (Array.isArray(parsed)) {
                  tags = parsed.map((t: any) => String(t).trim()).filter(Boolean);
                } else {
                  tags = [String(parsed).trim()];
                }
              } catch {
                tags = doc.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
              }
            }
            const algoliaRecord = {
              objectID: doc.id.toString(),
              name: doc.name,
              slug: doc.slug,
              category: doc.category,
              url: doc.url,
              screenshotUrl: doc.screenshotUrl,
              gridHeight: doc.gridHeight,
              description: doc.description,
              tags,
              clicks: doc.clicks || 0,
              averageRating: doc.averageRating || 0,
              reviewCount: doc.reviewCount || 0
            };
            const idx = getAlgoliaIndex();
            if (idx) await idx.saveObject(algoliaRecord);
            console.log(`🚀 ¡Sugerencia ${doc.name} aprobada y en vivo!`);
          } catch (error) { console.error("Error Algolia:", error); }
        } else if (operation === 'update' && doc.status === 'pending') {
            try {
              const idx = getAlgoliaIndex();
              if (idx) await idx.deleteObject(doc.id.toString());
            } catch {}
        }

        if (doc.status === 'approved' && doc.submittedBy && (!previousDoc || doc.status !== previousDoc.status)) {
          try {
            const userId = typeof doc.submittedBy === 'object' ? doc.submittedBy.id : doc.submittedBy;
            const userTools = await req.payload.find({ collection: 'tools', where: { and: [ { submittedBy: { equals: userId } }, { status: { equals: 'approved' } } ] }, depth: 0, limit: 1 });
            const totalApproved = userTools.totalDocs;
            let newLevel: 'Explorer' | 'Contributor' | 'Expert Curator' | 'Master Curator' = 'Explorer';
            if (totalApproved >= 30) newLevel = 'Master Curator'; else if (totalApproved >= 15) newLevel = 'Expert Curator'; else if (totalApproved >= 5) newLevel = 'Contributor';
            await req.payload.update({ collection: 'users', id: userId, data: { level: newLevel, approvedCount: totalApproved } as any });
          } catch {}
        }
        return doc;
      },
    ],
  },
};
