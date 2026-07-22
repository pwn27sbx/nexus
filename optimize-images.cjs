const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(getFiles(file));
    } else { 
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = getFiles('src/components');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  if (content.includes('<img')) {
    content = content.replace(/<img(?![^>]*loading="lazy")/g, '<img loading="lazy" decoding="async"');
    fs.writeFileSync(file, content);
  }
}
console.log("Images optimized.");
