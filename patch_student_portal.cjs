const fs = require('fs');

let sp = fs.readFileSync('frontend/src/portals/StudentPortal.jsx', 'utf8');

const oldCode = `        const sessions = await res.json();
        if (sessions && sessions.length > 0) {
          // Just mocking for UI demo. Real implementation would get the LIVE AttendanceSession 
          setActiveSession({ id: 'dummy', courseId: 'CS301', status: 'CHECK_IN_OPEN' });
        }`;

const newCode = `        const sessions = await res.json();
        if (sessions && sessions.length > 0) {
          const active = sessions.find(s => s.status === 'CHECK_IN_OPEN' || s.status === 'IN_PROGRESS' || s.status === 'open') || sessions[0];
          setActiveSession(active);
        } else {
          setActiveSession(null);
        }`;

sp = sp.replace(oldCode, newCode);
fs.writeFileSync('frontend/src/portals/StudentPortal.jsx', sp);
console.log('Success StudentPortal BUG-005 fixed');
