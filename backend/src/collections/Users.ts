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
    update: ({ req: { user } }) => {
      if (!user) return false;
      // Admins pueden actualizar cualquier usuario
      if (user.role === 'admin') return true;
      // Usuarios normales solo pueden actualizar su propio perfil
      return { id: { equals: user.id } };
    },
    delete: ({ req: { user } }) => {
      if (!user) return false;
      // Solo admins pueden eliminar usuarios
      return user.role === 'admin';
    },
  },
  fields: [
    // ─── ROL DE USUARIO (Admin/User) ─────────────────────────
    {
      name: 'role',
      type: 'select',
      options: ['user', 'admin'],
      defaultValue: 'user',
      required: false,
      admin: {
        position: 'sidebar',
        description: 'Rol del usuario. Solo administradores pueden cambiarlo.',
        condition: (_data, _siblingData, { user }) => user?.role === 'admin',
      },
      access: {
        read: () => true,
        create: ({ req: { user } }: { req: { user: any } }) => user?.role === 'admin',
        update: ({ req: { user } }: { req: { user: any } }) => user?.role === 'admin',
      },
    },
    {
      name: 'nickname',
      type: 'text',
      unique: true,
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
      options: ['Explorer', 'Contributor', 'Expert Curator', 'Master Curator'],
      defaultValue: 'Explorer',
      admin: {
        position: 'sidebar',
        description: 'Nivel del usuario basado en sus contribuciones.',
        readOnly: true
      }
    },
    // Contador exacto para el Ranking
    {
      name: 'approvedCount',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true }
    },
    {
      name: 'collections',
      type: 'array',
      fields: [
        {
          name: 'name', // Nombre de la carpeta (ej. "Frontend", "Inspiración")
          type: 'text',
          required: true,
        },
        {
          name: 'tools', // Las herramientas dentro de esta carpeta
          type: 'relationship',
          relationTo: 'tools',
          hasMany: true,
        }
      ]
    }
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc, req: { user } }) => {
        // Protección server-side: evitar que usuarios se autopromuevan a admin
        if (data.role && originalDoc && data.role !== originalDoc.role) {
          if (!user || user?.role !== 'admin') {
            throw new Error('Solo los administradores pueden cambiar el rol de un usuario.');
          }
        }
        return data;
      },
    ],
  },
}
