const fs = require('fs');
const glob = require('glob');
glob('services/*/src/server.{js,ts}', (err, files) => {
  if (err) throw err;
  let count = 0;
  files.forEach(f => {
    let lines = fs.readFileSync(f, 'utf8').split('\n');
    // filter out any line containing fix-dns
    lines = lines.filter(line => !line.includes('fix-dns'));
    // add the clean line
    lines.unshift("require('../../../fix-dns.js');");
    fs.writeFileSync(f, lines.join('\n'));
    count++;
  });
  console.log('Fixed syntax and injected properly in ' + count + ' files');
});
