const fs = require('fs');
const path = require('path');
const p = path.resolve('c:/Users/ASUS/Videos/EduSphere/frontend/src/portals/admin/features.jsx');
let content = fs.readFileSync(p, 'utf8');

const target = `      onError: () => {
        // Fallback simulation
        setTimeout(() => {
          setIsBackingUp(false);
          const newBackup = {
            id: \`bk\${backups.length + 1}\`,
            type: 'Manual Backup (Simulated)',
            size: '12.2 GB',
            status: 'completed',
            startedAt: new Date().toISOString().replace('T',' ').substring(0, 16),
            completedAt: new Date().toISOString().replace('T',' ').substring(0, 16),
            triggeredBy: 'sys_admin'
          };
          setLocalBackups([newBackup, ...backups]);
          toast.success("Database Backup successful! Snapshot: edusphere_prod_backup.tar.gz");
        }, 1800);
      }`;

const replacement = `      onError: () => {
        setIsBackingUp(false);
        toast.error("Database Backup failed. Please check system logs.");
      }`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(p, content);
  console.log('Patched admin/features.jsx');
} else {
  console.log('Target string not found in admin/features.jsx');
}
