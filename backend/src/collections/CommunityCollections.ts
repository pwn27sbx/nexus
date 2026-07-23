import { CollectionConfig } from 'payload'

export const CommunityCollections: CollectionConfig = {
  slug: 'community-collections',
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'author', type: 'relationship', relationTo: 'users', required: true },
    { name: 'tools', type: 'relationship', relationTo: 'tools', hasMany: true },
    { name: 'likes', type: 'number', defaultValue: 0 },
  ],
}
