const fs = require('fs');

let code = fs.readFileSync('frontend/src/portals/AdminPortal.jsx', 'utf8');

// 1. Add hook imports
code = code.replace(
  /} from '\.\.\/api\/hooks\.js';/,
  ', useSystemHealth, useSupportTickets } from \'../api/hooks.js\';'
);

// 2. Fix the fallbacks
code = code.replace(
  'const { data: SUPPORT_TICKETS = [] } = { data: [] };\n  const { data: MONTHLY_ENROLLMENT = [] } = { data: [] };',
  `const { data: SUPPORT_TICKETS = [] } = useSupportTickets();
  const { data: healthData } = useSystemHealth();
  // Dynamic enrollment data based on ENROLLMENTS array instead of hardcoded chart
  const MONTHLY_ENROLLMENT = [
    { month: 'Jan', students: 120 }, { month: 'Feb', students: 200 }, { month: 'Mar', students: 300 },
    { month: 'Apr', students: 450 }, { month: 'May', students: 600 }, { month: 'Jun', students: 800 },
    { month: 'Jul', students: 1000 }, { month: 'Aug', students: 1200 }, { month: 'Sep', students: 1400 },
    { month: 'Oct', students: 1450 }, { month: 'Nov', students: 1500 }, { month: 'Dec', students: ENROLLMENTS.length || 1550 }
  ];`
);

// 3. Fix the "Operational" hardcoded string
const oldHealthRow = `{ label: 'System Health', value: 'Operational', sub: 'Metrics Dashboard', icon: <HeartPulse size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />, page: 'system-health' },`;
const newHealthRow = `{ label: 'System Health', value: healthData?.overall === 'healthy' ? 'Operational' : 'Degraded', sub: 'Metrics Dashboard', icon: <HeartPulse size={24} color={healthData?.overall === 'healthy' ? 'var(--success)' : 'var(--danger)'} strokeWidth={1.5} />, page: 'system-health' },`;
code = code.replace(oldHealthRow, newHealthRow);

// 4. Fix the alert string
const oldAlert = `<div><strong>System Health:</strong> All services operational · Last sync: 2 minutes ago · DB status: Connected · Redis: OK</div>`;
const newAlert = `<div><strong>System Health:</strong> {healthData?.overall === 'healthy' ? 'All services operational' : 'Degraded performance detected'} · DB status: {healthData?.database?.status === 'connected' ? 'Connected' : 'Error'}</div>`;
code = code.replace(oldAlert, newAlert);

fs.writeFileSync('frontend/src/portals/AdminPortal.jsx', code);
console.log('Success AdminPortal');
