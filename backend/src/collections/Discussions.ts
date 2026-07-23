import { CollectionConfig } from 'payload'

export const Discussions: CollectionConfig = {
  slug: 'discussions',
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'summary', type: 'text' },
    { name: 'content', type: 'richText' },
    { name: 'category', type: 'text' },
    { name: 'author', type: 'relationship', relationTo: 'users', required: true },
    { name: 'upvotes', type: 'number', defaultValue: 0 },
  ],
}
