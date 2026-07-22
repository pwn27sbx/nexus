import { getPayload } from 'payload';
import config from './src/payload.config';

async function run() {
  const payload = await getPayload({ config });
  
  const tools = await payload.find({
    collection: 'tools',
    limit: 1000,
  });

  console.log(`Found ${tools.docs.length} tools`);

  for (const tool of tools.docs) {
    if (!tool.slug) {
      // Just triggering an update will run the beforeChange hook
      // and generate the slug automatically
      await payload.update({
        collection: 'tools',
        id: tool.id,
        data: {
          name: tool.name, // dummy update to trigger hooks
        },
      });
      console.log(`Updated ${tool.name} with a slug`);
    } else {
      console.log(`Tool ${tool.name} already has slug: ${tool.slug}`);
    }
  }

  console.log('Done migrating slugs');
  process.exit(0);
}

run();
