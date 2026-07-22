import { CollectionConfig } from 'payload';

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'id',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'tool',
      type: 'relationship',
      relationTo: 'tools',
      required: true,
      hasMany: false,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
    },
    {
      name: 'comment',
      type: 'text',
      required: false,
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation === 'create' || operation === 'update') {
          // Re-calculate the average rating and review count for the tool
          const toolId = typeof doc.tool === 'object' ? doc.tool.id : doc.tool;
          
          try {
            const allReviews = await req.payload.find({
              collection: 'reviews',
              where: {
                tool: {
                  equals: toolId,
                },
              },
              limit: 0,
            });
            
            const reviewCount = allReviews.totalDocs;
            const totalScore = allReviews.docs.reduce((acc, review) => acc + review.rating, 0);
            const averageRating = reviewCount > 0 ? Number((totalScore / reviewCount).toFixed(1)) : 0;
            
            await req.payload.update({
              collection: 'tools',
              id: toolId,
              data: {
                averageRating,
                reviewCount,
              },
            });
            console.log(`Updated Tool ${toolId} rating to ${averageRating} from ${reviewCount} reviews.`);
          } catch (error) {
            console.error('Error updating tool rating:', error);
          }
        }
        return doc;
      },
    ],
  },
};
