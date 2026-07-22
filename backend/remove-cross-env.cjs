const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

for (let scriptName in pkg.scripts) {
    if (pkg.scripts[scriptName].includes('cross-env ')) {
        pkg.scripts[scriptName] = pkg.scripts[scriptName].replace('cross-env ', '');
    }
}

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
