import { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: () => true,
    create: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'nickname',
      type: 'text',
      admin: {
        position: 'sidebar',
      }
    },
    // La Bóveda: Guarda las IDs de las herramientas favoritas
    {
      name: 'bookmarks',
      type: 'relationship',
      relationTo: 'tools',
      hasMany: true,
      admin: {
        position: 'sidebar',
      }
    },
    // Gamificación: El título que se mostrará en su perfil
    {
      name: 'level',
      type: 'select',
      options: ['Explorer', 'Contributor', 'Expert Curator'],
      defaultValue: 'Explorer',
      admin: {
        position: 'sidebar',
        description: 'Nivel del usuario basado en sus contribuciones.'
      }
    }
  ],
}
