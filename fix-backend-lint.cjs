const fs = require('fs');

const replaceInFile = (file, replacements) => {
  let content = fs.readFileSync(file, 'utf-8');
  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }
  fs.writeFileSync(file, content);
};

// 1. src/app/my-route/route.ts
replaceInFile('backend/src/app/my-route/route.ts', [
  { from: 'export const GET = async (request: Request) => {', to: 'export const GET = async (_request: Request) => {' },
  { from: 'const payload = await getPayload({', to: 'const _payload = await getPayload({' }
]);

// 2. src/collections/Tools.ts
replaceInFile('backend/src/collections/Tools.ts', [
  { from: /catch \(error\) \{/g, to: 'catch {' },
  { from: /catch\(e\) \{/g, to: 'catch {' }
]);

console.log("Backend fixes applied.");
