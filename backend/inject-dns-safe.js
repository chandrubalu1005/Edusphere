const fs = require('fs');
const glob = require('glob');
glob('services/*/src/server.{js,ts}', (err, files) => {
  if (err) throw err;
  files.forEach(f => {
    let code = fs.readFileSync(f, 'utf8');
    if (!code.includes('fix-dns.js')) {
      // Safely prepend with a genuine newline
      const cleanCode = "require('../../../fix-dns.js');\n" + code;
      fs.writeFileSync(f, cleanCode);
    }
  });
  console.log('Cleanly injected DNS fix into ' + files.length + ' files');
});
