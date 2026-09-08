const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'backend', 'services');
const services = fs.readdirSync(servicesDir).filter(f => fs.statSync(path.join(servicesDir, f)).isDirectory());

services.forEach(service => {
  console.log(`Processing ${service}...`);
  const packageJsonPath = path.join(servicesDir, service, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    let pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (!pkg.dependencies) pkg.dependencies = {};
    pkg.dependencies['@edusphere/shared'] = '*';
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));
  }

  const srcDir = path.join(servicesDir, service, 'src');
  if (!fs.existsSync(srcDir)) return;

  const files = fs.readdirSync(srcDir);
  const serverFile = files.find(f => f === 'server.js' || f === 'app.js' || f === 'index.js' || f === 'server.ts' || f === 'app.ts' || f === 'index.ts');
  
  if (serverFile) {
    const serverPath = path.join(srcDir, serverFile);
    let content = fs.readFileSync(serverPath, 'utf8');

    // Skip if already applied
    if (content.includes('@edusphere/shared')) {
      console.log(`  Skipping ${serverFile} (already applied)`);
      return;
    }

    // Insert import/require
    if (serverFile.endsWith('.ts')) {
       content = content.replace(/(import .* from .*;)/, `import { errorHandler } from '@edusphere/shared';\n$1`);
    } else {
       content = content.replace(/(const .* = require\(.*\);)/, `const { errorHandler } = require('@edusphere/shared');\n$1`);
    }

    // Insert app.use(errorHandler)
    // Find where to put it. Usually right before startServer() or app.listen
    if (content.includes('async function startServer()')) {
      content = content.replace('async function startServer()', 'app.use(errorHandler);\n\nasync function startServer()');
    } else if (content.includes('app.listen(')) {
      content = content.replace('app.listen(', 'app.use(errorHandler);\napp.listen(');
    }

    fs.writeFileSync(serverPath, content);
    console.log(`  Updated ${serverFile}`);
  }
});

console.log('Done patching services.');
