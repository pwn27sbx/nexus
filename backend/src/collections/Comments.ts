import { CollectionConfig } from 'payload'

export const Comments: CollectionConfig = {
  slug: 'comments',
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    { name: 'discussion', type: 'relationship', relationTo: 'discussions', required: true },
    { name: 'author', type: 'relationship', relationTo: 'users', required: true },
    { name: 'text', type: 'textarea', required: true },
    { name: 'likes', type: 'number', defaultValue: 0 },
  ],
}
