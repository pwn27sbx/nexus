const fs = require('fs');

let content = fs.readFileSync('backend/src/payload.config.ts', 'utf-8');

// 1. Add import for s3Storage
content = content.replace(
  "import { buildConfig } from 'payload'",
  "import { buildConfig } from 'payload'\nimport { s3Storage } from '@payloadcms/storage-s3'"
);

// 2. Update cors and csrf
const newCors = `  cors: ['https://nexusallinone.vercel.app', process.env.SERVER_URL || ''].filter(Boolean),
  csrf: ['https://nexusallinone.vercel.app', process.env.SERVER_URL || ''].filter(Boolean),`;

content = content.replace(/  cors: \[.*\],/, "  cors: ['https://nexusallinone.vercel.app', process.env.SERVER_URL || ''].filter(Boolean),");
content = content.replace(/  csrf: \[.*\],/, "  csrf: ['https://nexusallinone.vercel.app', process.env.SERVER_URL || ''].filter(Boolean),");

// 3. Add plugin to plugins array
const s3PluginString = `
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || 'auto',
        endpoint: process.env.S3_ENDPOINT || '',
      },
    }),`;

content = content.replace(/plugins: \[\],/, `plugins: [${s3PluginString}\n  ],`);

fs.writeFileSync('backend/src/payload.config.ts', content);
console.log("payload.config.ts updated.");
