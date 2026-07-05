import { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true, // Esto activa mágicamente todo el sistema de login/signup
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: () => true,
    // Permitimos que cualquiera pueda crear una cuenta (Signup)
    create: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    // Email y password se añaden automáticamente por el "auth: true"
    // Puedes añadir más campos aquí después (ej. nombre, avatar)
  ],
}
